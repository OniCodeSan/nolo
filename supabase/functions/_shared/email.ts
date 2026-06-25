// Mail helper condiviso: render template + invio via SMTP2GO + log su email_log.
// Le Edge Functions chiamano `sendMail(...)` con uno slug e le variabili.

import { getServiceClient } from './stripe.ts';
import { renderTemplate, EMAIL_TEMPLATES, type TemplateKey } from './email-templates.ts';

const SMTP2GO_API_URL = 'https://api.smtp2go.com/v3/email/send';

const DEFAULT_FROM    = Deno.env.get('EMAIL_FROM')      ?? 'MoviQ <hello@moviq.it>';
const DEFAULT_REPLY   = Deno.env.get('EMAIL_REPLY_TO')  ?? 'support@moviq.it';
const SMTP2GO_API_KEY = Deno.env.get('SMTP2GO_API_KEY') ?? '';

export interface SendMailInput {
  to: string;
  to_user_id?: string | null;
  template: TemplateKey;
  vars: Record<string, unknown>;
  // Override opzionali
  from?: string;
  reply_to?: string;
  subject?: string;
}

export async function sendMail(input: SendMailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const admin = getServiceClient();
  const tpl = EMAIL_TEMPLATES[input.template];
  if (!tpl) {
    return { ok: false, error: `template sconosciuto: ${input.template}` };
  }

  const subject = input.subject ?? tpl.subject(input.vars);
  const html    = renderTemplate(tpl.html, input.vars, true);  // M3: escape HTML
  const text    = renderTemplate(tpl.text, input.vars, false);

  // 1. Riga in email_log (status: queued)
  const { data: logRow, error: logErr } = await admin
    .from('email_log')
    .insert({
      to_email:   input.to,
      to_user_id: input.to_user_id ?? null,
      from_email: input.from     ?? DEFAULT_FROM,
      reply_to:   input.reply_to ?? DEFAULT_REPLY,
      template:   input.template,
      subject,
      payload:    sanitizePayload(input.vars),
      status:     'queued',
    })
    .select()
    .single();

  if (logErr || !logRow) {
    console.error('[sendMail] log insert failed:', logErr);
    return { ok: false, error: logErr?.message ?? 'log insert failed' };
  }

  // 2. Manda via SMTP2GO
  if (!SMTP2GO_API_KEY) {
    await admin.from('email_log').update({
      status: 'failed', error: 'SMTP2GO_API_KEY non configurata',
    }).eq('id', logRow.id);
    return { ok: false, error: 'SMTP2GO_API_KEY non configurata' };
  }

  try {
    const res = await fetch(SMTP2GO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': SMTP2GO_API_KEY,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender:    input.from     ?? DEFAULT_FROM,
        to:        [input.to],
        reply_to:  input.reply_to ?? DEFAULT_REPLY,
        subject,
        html_body: html,
        text_body: text,
        custom_headers: [
          { header: 'X-MoviQ-Template', value: input.template },
          { header: 'X-MoviQ-LogId',    value: logRow.id },
        ],
      }),
    });

    const json: Record<string, unknown> = await res.json().catch(() => ({}));
    const data = (json.data as Record<string, unknown>) ?? {};
    const success = res.ok && (data.succeeded as number) === 1;

    await admin.from('email_log').update({
      status:              success ? 'sent' : 'failed',
      sent_at:             success ? new Date().toISOString() : null,
      provider_message_id: (data.email_id as string) ?? null,
      provider_response:   json,
      error:               success ? null : (typeof json.error === 'string' ? json.error : `HTTP ${res.status}`),
    }).eq('id', logRow.id);

    return { ok: success, id: logRow.id, error: success ? undefined : `HTTP ${res.status}` };
  } catch (err) {
    const msg = (err as Error).message;
    await admin.from('email_log').update({ status: 'failed', error: msg }).eq('id', logRow.id);
    return { ok: false, error: msg };
  }
}

// Pulisce dati sensibili dal payload prima del log (es. token magic-link).
function sanitizePayload(p: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE = ['token', 'magic_link', 'password', 'card', 'iban'];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) {
    if (SENSITIVE.some(s => k.toLowerCase().includes(s))) {
      out[k] = typeof v === 'string' && v.length > 12 ? `${v.slice(0,6)}…${v.slice(-2)}` : '[redacted]';
    } else {
      out[k] = v;
    }
  }
  return out;
}
