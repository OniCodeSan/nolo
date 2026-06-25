// Service lead noleggiatori — landing campagne /benvenuti.
// submit_host_lead è SECURITY DEFINER ed eseguibile da anon (la landing è
// pre-login). Aggancia automaticamente UTM (first-touch, da sessionStorage)
// e gli id di sessione/anonimo già tracciati da useSessionTracking.

import { supabase, hasSupabase } from '../lib/supabase.js';
import { getSessionAnonIds } from '../hooks/useSessionTracking.js';

const UTM_KEY = 'moviq:utm:v1';

// Legge gli UTM catturati al landing (stessa chiave di useSessionTracking).
function readUtms() {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    const utm = raw ? JSON.parse(raw) : {};
    return {
      utm_source:   utm.utm_source   || null,
      utm_medium:   utm.utm_medium   || null,
      utm_campaign: utm.utm_campaign || null,
      utm_term:     utm.utm_term     || null,
      utm_content:  utm.utm_content  || null,
      landing_path: utm.landing_path
        || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : null),
    };
  } catch {
    return {};
  }
}

// Invia un lead noleggiatore. `fields` = { businessName, email, contactName,
// phone, city, province, fleetSize, vehicleTypes, website, message }.
// Ritorna l'id del lead creato.
export async function submitHostLead(fields) {
  const utm = readUtms();
  const { sessionId, anonId } = getSessionAnonIds();

  const args = {
    p_business_name: fields.businessName ?? '',
    p_email:         fields.email ?? '',
    p_contact_name:  fields.contactName || null,
    p_phone:         fields.phone || null,
    p_city:          fields.city || null,
    p_province:      fields.province || null,
    p_fleet_size:    Number.isFinite(fields.fleetSize) ? fields.fleetSize : null,
    p_vehicle_types: fields.vehicleTypes || null,
    p_website:       fields.website || null,
    p_message:       fields.message || null,
    p_utm_source:    utm.utm_source,
    p_utm_medium:    utm.utm_medium,
    p_utm_campaign:  utm.utm_campaign,
    p_utm_term:      utm.utm_term,
    p_utm_content:   utm.utm_content,
    p_landing_path:  utm.landing_path,
    p_referrer:      typeof document !== 'undefined' ? (document.referrer || null) : null,
    p_session_id:    sessionId || null,
    p_anon_id:       anonId || null,
  };

  if (!hasSupabase) {
    // Dev senza Supabase: log e id finto così la UI mostra il successo.
    if (import.meta.env.DEV) console.debug('[leads] submitHostLead (mock)', args);
    return 'mock-lead-id';
  }

  const { data, error } = await supabase.rpc('submit_host_lead', args);
  if (error) throw error;
  return data;
}

// ─── Admin ────────────────────────────────────────────────────────────────
export async function adminListHostLeads({ status = null, limit = 200, offset = 0 } = {}) {
  if (!hasSupabase) return [];
  const { data, error } = await supabase.rpc('admin_list_host_leads', {
    p_status: status, p_limit: limit, p_offset: offset,
  });
  if (error) throw error;
  return data || [];
}

export async function adminSetLeadStatus(id, status, notes = null) {
  if (!hasSupabase) throw new Error('Supabase non configurato');
  const { data, error } = await supabase.rpc('admin_set_lead_status', {
    p_id: id, p_status: status, p_notes: notes,
  });
  if (error) throw error;
  return data;
}

export const LEAD_STATUSES = [
  { id: 'new',       l: 'Nuovo',       tone: 'accent'  },
  { id: 'contacted', l: 'Contattato',  tone: 'neutral' },
  { id: 'qualified', l: 'Qualificato', tone: 'dark'    },
  { id: 'converted', l: 'Convertito',  tone: 'success' },
  { id: 'rejected',  l: 'Scartato',    tone: 'alert'   },
];
