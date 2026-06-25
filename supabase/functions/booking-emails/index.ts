// POST /functions/v1/booking-emails
// Chiamata da trigger Postgres su bookings (INSERT/UPDATE) per spedire le email.
// Body: { event: 'created'|'confirmed'|'rejected'|'reminder24h'|'review_request', booking_id: uuid }
//
// Auth: service_role (chiamata server-to-server da pg_net).

import { handlePreflight, jsonResponse, internalError } from '../_shared/cors.ts';
import { getServiceClient, APP_URL } from '../_shared/stripe.ts';
import { sendMail } from '../_shared/email.ts';

function fmtRange(from: string, to: string, timeFrom?: string | null, timeTo?: string | null): { pickup: string; ret: string } {
  const f = new Date(from);
  const t = new Date(to);
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  const pickup = f.toLocaleDateString('it-IT', opts) + (timeFrom ? ` · ore ${timeFrom}` : '');
  const ret    = t.toLocaleDateString('it-IT', opts) + (timeTo   ? ` · ore ${timeTo}`   : '');
  return { pickup, ret };
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const auth = req.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    if (payload.role !== 'service_role') {
      return jsonResponse({ error: 'forbidden — service role required' }, 403);
    }
  } catch {
    return jsonResponse({ error: 'invalid token' }, 401);
  }

  try {
    const { event, booking_id } = await req.json();
    if (!event || !booking_id) return jsonResponse({ error: 'event e booking_id richiesti' }, 400);

    const admin = getServiceClient();

    // Carica booking + car + host insieme
    const { data: booking, error } = await admin
      .from('bookings')
      .select(`
        id, user_id, car_id, host_id, date_from, date_to, time_from, time_to, total, message, status, decline_reason,
        cars:car_id ( name, brand, model ),
        hosts:host_id ( name, business_email, business_phone, owner_user_id, legal_address, legal_city )
      `)
      .eq('id', booking_id)
      .maybeSingle();
    if (error || !booking) return jsonResponse({ error: 'booking non trovato' }, 404);

    // Dati derivati
    const car  = booking.cars  as { name?: string; brand?: string; model?: string } | null;
    const host = booking.hosts as { name?: string; business_email?: string; business_phone?: string; owner_user_id?: string; legal_address?: string; legal_city?: string } | null;
    const vehicleName = car?.name || (`${car?.brand ?? ''} ${car?.model ?? ''}`.trim() || 'Veicolo');
    const { pickup, ret } = fmtRange(booking.date_from, booking.date_to, (booking as { time_from?: string }).time_from, (booking as { time_to?: string }).time_to);

    // ─── EVENT: created → notifica al noleggiatore ───────────────────
    if (event === 'created') {
      let hostEmail = host?.business_email;
      if (!hostEmail && host?.owner_user_id) {
        const { data: u } = await admin.auth.admin.getUserById(host.owner_user_id);
        hostEmail = u?.user?.email ?? undefined;
      }
      if (!hostEmail) return jsonResponse({ skipped: 'host senza email' });

      const { data: customer } = booking.user_id
        ? await admin.auth.admin.getUserById(booking.user_id)
        : { data: { user: null } };

      const result = await sendMail({
        to: hostEmail, to_user_id: host?.owner_user_id,
        template: 'booking_request_host',
        vars: {
          vehicle_name:   vehicleName,
          pickup_when:    pickup,
          return_when:    ret,
          customer_name:  customer?.user?.user_metadata?.name ?? customer?.user?.email ?? '—',
          customer_email: customer?.user?.email ?? '—',
          total_eur:      (booking.total / 100).toFixed(2),
          action_url:     `${APP_URL()}/noleggia/richieste`,
        },
      });
      return jsonResponse(result);
    }

    // ─── EVENT: confirmed → notifica al cliente ──────────────────────
    if (event === 'confirmed') {
      const { data: u } = await admin.auth.admin.getUserById(booking.user_id);
      const customerEmail = u?.user?.email;
      if (!customerEmail) return jsonResponse({ skipped: 'cliente senza email' });

      const result = await sendMail({
        to: customerEmail, to_user_id: booking.user_id,
        template: 'booking_confirmed_user',
        vars: {
          vehicle_name:    vehicleName,
          host_name:       host?.name ?? 'il noleggiatore',
          pickup_when:     pickup,
          pickup_address: [host?.legal_address, host?.legal_city].filter(Boolean).join(', ') || 'come da scheda noleggiatore',
          host_phone:      host?.business_phone ?? '—',
          booking_url:     `${APP_URL()}/prenotazioni/${booking.id}`,
        },
      });
      return jsonResponse(result);
    }

    // ─── EVENT: rejected → notifica al cliente ───────────────────────
    if (event === 'rejected') {
      const { data: u } = await admin.auth.admin.getUserById(booking.user_id);
      const customerEmail = u?.user?.email;
      if (!customerEmail) return jsonResponse({ skipped: 'cliente senza email' });

      const result = await sendMail({
        to: customerEmail, to_user_id: booking.user_id,
        template: 'booking_rejected_user',
        vars: {
          vehicle_name:     vehicleName,
          pickup_when:      pickup,
          return_when:      ret,
          reason_or_default: booking.decline_reason
            ? `Motivo: ${booking.decline_reason}`
            : 'Il noleggiatore non ha fornito un motivo specifico.',
          alternatives_url: `${APP_URL()}/cerca`,
        },
      });
      return jsonResponse(result);
    }

    // ─── EVENT: reminder24h → promemoria al cliente ──────────────────
    if (event === 'reminder24h') {
      const { data: u } = await admin.auth.admin.getUserById(booking.user_id);
      const customerEmail = u?.user?.email;
      if (!customerEmail) return jsonResponse({ skipped: 'cliente senza email' });

      const result = await sendMail({
        to: customerEmail, to_user_id: booking.user_id,
        template: 'booking_reminder_24h',
        vars: {
          vehicle_name:   vehicleName,
          pickup_when:    pickup,
          pickup_address: [host?.legal_address, host?.legal_city].filter(Boolean).join(', ') || 'come da scheda noleggiatore',
          host_phone:     host?.business_phone ?? '—',
        },
      });
      return jsonResponse(result);
    }

    // ─── EVENT: review_request ───────────────────────────────────────
    if (event === 'review_request') {
      const { data: u } = await admin.auth.admin.getUserById(booking.user_id);
      const customerEmail = u?.user?.email;
      if (!customerEmail) return jsonResponse({ skipped: 'cliente senza email' });

      const result = await sendMail({
        to: customerEmail, to_user_id: booking.user_id,
        template: 'review_request',
        vars: {
          host_name:  host?.name ?? 'il noleggiatore',
          review_url: `${APP_URL()}/prenotazioni/${booking.id}#recensione`,
        },
      });
      return jsonResponse(result);
    }

    return jsonResponse({ error: 'event sconosciuto' }, 400);
  } catch (err) {
    return internalError('booking-emails', err);
  }
});
