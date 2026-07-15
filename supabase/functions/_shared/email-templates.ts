// Template HTML + text per le email transazionali MoviQ.
// Stile minimale brand-coerente: bianco/giallo MoviQ, font system, layout single-column.
// I template usano placeholder {{var}} → renderTemplate() sostituisce dalle vars passate.

export type TemplateKey =
  | 'magic_link'
  | 'booking_request_host'
  | 'booking_confirmed_user'
  | 'booking_rejected_user'
  | 'booking_reminder_24h'
  | 'review_request'
  | 'host_subscription_trial_ending'
  | 'host_subscription_payment_failed'
  | 'host_subscription_canceled'
  | 'host_trial_ended_success'
  | 'host_subscription_suspended'
  | 'host_kyc_approved'
  | 'host_kyc_rejected'
  | 'host_suspended'
  | 'host_reactivated'
  | 'host_no_subscription_suspended'
  | 'host_welcome'
  | 'host_lead_received';

export interface EmailTemplate {
  subject: (vars: Record<string, unknown>) => string;
  html: string;
  text: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout wrapper condiviso. {{content}} viene sostituito col body.
// ─────────────────────────────────────────────────────────────────────────────
const LAYOUT_HTML = `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{subject}}</title>
<style>
  body { margin:0; padding:0; background:#FAF7F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#15110A; }
  .wrap { max-width:600px; margin:0 auto; background:#FFFFFF; }
  .header { padding:32px 32px 0; }
  .logo { font-family: 'Montserrat', system-ui, sans-serif; font-weight:700; font-size:28px; letter-spacing:-0.02em; }
  .logo .q { color:#F5C518; }
  .content { padding:24px 32px 32px; line-height:1.55; font-size:15px; }
  .content h1 { font-size:22px; font-weight:700; margin:0 0 12px; letter-spacing:-0.01em; }
  .content p { margin:0 0 14px; }
  .btn { display:inline-block; background:#15110A; color:#FFFFFF !important; text-decoration:none; padding:13px 22px; border-radius:10px; font-weight:600; font-size:15px; }
  .btn-secondary { background:#F5C518; color:#15110A !important; }
  .meta { background:#F5F0E5; border-radius:10px; padding:14px 18px; margin:18px 0; font-size:14px; }
  .meta dt { font-weight:600; color:#5B5246; }
  .meta dd { margin:2px 0 10px; color:#15110A; }
  .footer { padding:20px 32px 30px; font-size:12px; color:#8C8273; border-top:1px solid #F0EBDF; }
  .footer a { color:#5B5246; }
  @media (max-width:480px) { .header, .content, .footer { padding-left:20px; padding-right:20px; } }
</style></head>
<body><div class="wrap">
  <div class="header"><div class="logo">Movi<span class="q">Q</span></div></div>
  <div class="content">{{content}}</div>
  <div class="footer">
    {{footer_extra}}
    Hai ricevuto questa email perché hai un account su <a href="https://moviq.it">moviq.it</a>.<br>
    Domande? Scrivi a <a href="mailto:support@moviq.it">support@moviq.it</a>.<br>
    MoviQ · L'auto giusta vicino a te.
  </div>
</div></body></html>`;

const LAYOUT_TEXT = `{{content}}

—
MoviQ — L'auto giusta vicino a te.
{{footer_extra}}Domande? Scrivi a support@moviq.it
https://moviq.it`;

// HTML-escaping (M3): i valori delle variabili sono dati non fidati (es.
// decline_reason scritto dall'host, nomi). Senza escaping si poteva iniettare
// HTML/link di phishing nelle email transazionali firmate DKIM da moviq.it.
function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ─────────────────────────────────────────────────────────────────────────────
// Render: sostituisce {{var}} con vars[var]. Annida content nel layout.
// `html=true` applica l'escaping HTML ai valori (ramo HTML); il ramo text
// resta non-escaped per non corrompere il plaintext.
// ─────────────────────────────────────────────────────────────────────────────
export function renderTemplate(template: string, vars: Record<string, unknown>, html = false): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    const raw = v == null ? '' : String(v);
    const val = html ? escapeHtml(raw) : raw;
    out = out.replaceAll(`{{${k}}}`, val);
  }
  // Rimuove eventuali variabili non sostituite
  out = out.replaceAll(/\{\{[a-z_]+\}\}/gi, '');
  return out;
}

function wrap(content: string, footer_extra = '', subject = ''): string {
  return LAYOUT_HTML.replace('{{content}}', content)
    .replace('{{footer_extra}}', footer_extra)
    .replace('{{subject}}', subject);
}
function wrapText(content: string, footer_extra = ''): string {
  return LAYOUT_TEXT.replace('{{content}}', content).replace('{{footer_extra}}', footer_extra);
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────────────────────
export const EMAIL_TEMPLATES: Record<TemplateKey, EmailTemplate> = {

  magic_link: {
    subject: () => 'Il tuo link di accesso a MoviQ',
    html: wrap(`
      <h1>Accedi a MoviQ</h1>
      <p>Ciao{{name_prefix}}, clicca il pulsante qui sotto per accedere al tuo account. Il link scade tra <strong>{{expires_in_minutes}} minuti</strong>.</p>
      <p style="margin:22px 0;"><a class="btn" href="{{magic_link}}">Accedi a MoviQ</a></p>
      <p style="font-size:13px;color:#5B5246;">Se non hai richiesto tu questo accesso, ignora pure questa email — nessuno entrerà nel tuo account.</p>
    `, 'Sicurezza account: <a href="https://moviq.it/sicurezza">moviq.it/sicurezza</a><br>'),
    text: wrapText(`Accedi a MoviQ

Clicca il link per entrare nel tuo account (scade tra {{expires_in_minutes}} minuti):
{{magic_link}}

Se non hai richiesto tu questo accesso, ignora questa email.`),
  },

  booking_request_host: {
    subject: (v) => `Nuova richiesta di prenotazione: ${v.vehicle_name}`,
    html: wrap(`
      <h1>Nuova richiesta di prenotazione</h1>
      <p>Hai ricevuto una richiesta di prenotazione su MoviQ. Hai <strong>24 ore</strong> per confermare o rifiutare dal tuo backoffice.</p>
      <dl class="meta">
        <dt>Veicolo</dt><dd>{{vehicle_name}}</dd>
        <dt>Ritiro</dt><dd>{{pickup_when}}</dd>
        <dt>Riconsegna</dt><dd>{{return_when}}</dd>
        <dt>Cliente</dt><dd>{{customer_name}} · {{customer_email}}</dd>
        <dt>Importo concordato</dt><dd>€ {{total_eur}}</dd>
      </dl>
      <p><a class="btn" href="{{action_url}}">Apri la richiesta</a></p>
    `),
    text: wrapText(`Nuova richiesta di prenotazione MoviQ

Veicolo: {{vehicle_name}}
Ritiro: {{pickup_when}}
Riconsegna: {{return_when}}
Cliente: {{customer_name}} ({{customer_email}})
Importo: € {{total_eur}}

Hai 24h per rispondere: {{action_url}}`),
  },

  booking_confirmed_user: {
    subject: (v) => `Prenotazione confermata: ${v.vehicle_name}`,
    html: wrap(`
      <h1>Prenotazione confermata 🎉</h1>
      <p>Il noleggiatore <strong>{{host_name}}</strong> ha confermato la tua prenotazione su MoviQ.</p>
      <dl class="meta">
        <dt>Veicolo</dt><dd>{{vehicle_name}}</dd>
        <dt>Ritiro</dt><dd>{{pickup_when}}</dd>
        <dt>Indirizzo ritiro</dt><dd>{{pickup_address}}</dd>
        <dt>Telefono noleggiatore</dt><dd>{{host_phone}}</dd>
      </dl>
      <p><strong>Per il ritiro porta con te:</strong> documento d'identità, patente di guida e carta di credito intestata a te.</p>
      <p><a class="btn" href="{{booking_url}}">Vedi la prenotazione</a></p>
    `),
    text: wrapText(`Prenotazione confermata!

{{host_name}} ha confermato la tua prenotazione:
- {{vehicle_name}}
- Ritiro: {{pickup_when}} presso {{pickup_address}}
- Tel noleggiatore: {{host_phone}}

Porta con te: documento, patente, carta di credito.
Dettagli: {{booking_url}}`),
  },

  booking_rejected_user: {
    subject: (v) => `Prenotazione non confermata: ${v.vehicle_name}`,
    html: wrap(`
      <h1>Prenotazione non confermata</h1>
      <p>Purtroppo il noleggiatore non ha potuto confermare la tua richiesta per <strong>{{vehicle_name}}</strong> nelle date {{pickup_when}} → {{return_when}}.</p>
      <p>{{reason_or_default}}</p>
      <p><a class="btn" href="{{alternatives_url}}">Cerca un'auto alternativa</a></p>
    `),
    text: wrapText(`Prenotazione non confermata

Il noleggiatore non ha potuto confermare {{vehicle_name}} nelle date {{pickup_when}} → {{return_when}}.
{{reason_or_default}}

Cerca un'alternativa: {{alternatives_url}}`),
  },

  booking_reminder_24h: {
    subject: (v) => `Domani ritiri l'auto: ${v.vehicle_name}`,
    html: wrap(`
      <h1>Domani ritiri la tua auto</h1>
      <p>Promemoria: hai un appuntamento di ritiro fissato per <strong>{{pickup_when}}</strong>.</p>
      <dl class="meta">
        <dt>Veicolo</dt><dd>{{vehicle_name}}</dd>
        <dt>Indirizzo</dt><dd>{{pickup_address}}</dd>
        <dt>Telefono noleggiatore</dt><dd>{{host_phone}}</dd>
      </dl>
      <p>Porta con te documento, patente e carta di credito. Per annullare gratuitamente hai tempo fino a 24h dall'orario di ritiro.</p>
    `),
    text: wrapText(`Promemoria ritiro

Domani {{pickup_when}} ritiri {{vehicle_name}}.
Indirizzo: {{pickup_address}}
Telefono noleggiatore: {{host_phone}}

Porta con te documento, patente e carta di credito.`),
  },

  review_request: {
    subject: () => 'Com\'è andata? Lascia una recensione',
    html: wrap(`
      <h1>Com'è andata?</h1>
      <p>Hai terminato il noleggio con <strong>{{host_name}}</strong>. La tua opinione aiuta gli altri viaggiatori a scegliere.</p>
      <p><a class="btn btn-secondary" href="{{review_url}}">Lascia una recensione</a></p>
      <p style="font-size:13px;color:#5B5246;">Richiede meno di un minuto. Puoi anche solo dare le stelle.</p>
    `),
    text: wrapText(`Com'è andata con {{host_name}}?

Lascia una recensione (1 minuto): {{review_url}}`),
  },

  host_welcome: {
    subject: () => 'Benvenuto su MoviQ — 30 giorni gratis per iniziare',
    html: wrap(`
      <h1>Benvenuto su MoviQ, {{host_name}}</h1>
      <p>Il tuo account noleggiatore è attivo. I prossimi 30 giorni sono gratuiti — usali per caricare la flotta, impostare prezzi e calendario.</p>
      <p>Tre cose da fare ora:</p>
      <ol>
        <li>Carica le prime 3-5 auto con foto buone (sezione "I miei veicoli")</li>
        <li>Imposta condizioni di noleggio e metodi di pagamento accettati (sezione "Profilo aziendale")</li>
        <li>Attiva il metodo di pagamento per l'abbonamento (49 € + IVA al mese al termine della prova)</li>
      </ol>
      <p><a class="btn" href="{{backoffice_url}}">Apri il backoffice</a></p>
    `),
    text: wrapText(`Benvenuto su MoviQ, {{host_name}}!

I prossimi 30 giorni sono gratis. Inizia da qui:
1. Carica auto: {{backoffice_url}}/veicoli
2. Condizioni e pagamenti: {{backoffice_url}}/profilo
3. Attiva metodo pagamento: {{backoffice_url}}/abbonamento`),
  },

  host_lead_received: {
    subject: () => 'Richiesta ricevuta — grazie per l\'interesse in MoviQ',
    html: wrap(`
      <h1>Grazie, {{greeting_name}}!</h1>
      <p>Abbiamo ricevuto la tua richiesta di attivazione come noleggiatore su MoviQ per <strong>{{business_name}}</strong>.</p>
      <p>Il nostro team la sta esaminando e ti ricontatterà a breve a questo indirizzo per completare l'attivazione del profilo e la verifica.</p>
      <p>Nel frattempo puoi vedere come funziona MoviQ per i noleggiatori:</p>
      <p style="margin:22px 0;"><a class="btn" href="https://moviq.it/per-noleggiatori">Scopri come funziona</a></p>
      <p style="font-size:13px;color:#5B5246;">Se non hai inviato tu questa richiesta, ignora pure questa email.</p>
    `),
    text: wrapText(`Grazie, {{greeting_name}}!

Abbiamo ricevuto la tua richiesta di attivazione come noleggiatore su MoviQ per {{business_name}}.
Il nostro team ti ricontatterà a breve a questo indirizzo per completare l'attivazione.

Come funziona per i noleggiatori: https://moviq.it/per-noleggiatori

Se non hai inviato tu questa richiesta, ignora questa email.`),
  },

  host_subscription_trial_ending: {
    subject: () => 'Il tuo periodo di prova MoviQ termina tra 3 giorni',
    html: wrap(`
      <h1>Il periodo di prova sta per terminare</h1>
      <p>Ciao {{host_name}}, il tuo periodo di prova MoviQ termina il <strong>{{trial_end_date}}</strong>. Da quel giorno partirà l'addebito automatico di {{price_eur}} € + IVA al mese.</p>
      <p>Verifica che la carta sia ancora valida o aggiornala dal portale.</p>
      <p><a class="btn" href="{{billing_url}}">Verifica metodo di pagamento</a></p>
      <p style="font-size:13px;color:#5B5246;">Non vuoi continuare? Puoi disattivare ora — il tuo account resta operativo fino al {{trial_end_date}} senza addebiti.</p>
    `),
    text: wrapText(`Periodo di prova in scadenza

Il tuo trial MoviQ termina il {{trial_end_date}}.
Da quel giorno: addebito automatico di {{price_eur}} € + IVA / mese.

Verifica la carta: {{billing_url}}`),
  },

  host_subscription_payment_failed: {
    subject: () => 'Pagamento non riuscito — aggiorna la carta',
    html: wrap(`
      <h1>Pagamento non riuscito</h1>
      <p>L'addebito di {{price_eur}} € + IVA per l'abbonamento MoviQ è fallito. Motivo: <em>{{error_reason}}</em></p>
      <p>Stripe riproverà nei prossimi 4 giorni. Per evitare la sospensione, aggiorna il metodo di pagamento ora.</p>
      <p><a class="btn" href="{{billing_url}}">Aggiorna metodo di pagamento</a></p>
    `),
    text: wrapText(`Pagamento non riuscito

Addebito di {{price_eur}} € + IVA fallito ({{error_reason}}).
Stripe riproverà nei prossimi 4 giorni. Aggiorna la carta per evitare la sospensione.

Portale: {{billing_url}}`),
  },

  host_subscription_canceled: {
    subject: () => 'Abbonamento MoviQ disattivato — inserzioni oscurate',
    html: wrap(`
      <h1>Abbonamento disattivato</h1>
      <p>Il tuo abbonamento MoviQ è stato disattivato. <strong>Da questo momento le tue auto non sono più visibili nei risultati di ricerca su moviq.it</strong> e l'account è in modalità "oscurato".</p>
      <p>Puoi riattivare in qualsiasi momento dal pannello — appena rinnovi, le inserzioni tornano online entro pochi secondi. I tuoi dati, foto, condizioni e calendario restano salvati per 24 mesi.</p>
      <p><a class="btn" href="{{billing_url}}">Riattiva ora</a></p>
    `),
    text: wrapText(`Abbonamento disattivato — inserzioni oscurate

Le tue auto non sono più pubblicate su MoviQ.
Riattiva quando vuoi: {{billing_url}}
I tuoi dati restano salvati per 24 mesi.`),
  },

  host_trial_ended_success: {
    subject: () => 'Abbonamento MoviQ ora attivo — primo addebito riuscito',
    html: wrap(`
      <h1>Abbonamento ora attivo 🎉</h1>
      <p>Ciao {{host_name}}, i 30 giorni di prova sono terminati e il primo addebito è andato a buon fine.</p>
      <dl class="meta">
        <dt>Importo addebitato</dt><dd>{{amount_eur}} €</dd>
        <dt>Periodo coperto</dt><dd>{{period_start}} → {{period_end}}</dd>
        <dt>Prossimo rinnovo</dt><dd>{{period_end}}</dd>
      </dl>
      <p>La tua flotta resta pubblicata, le prenotazioni continuano ad arrivare. Puoi scaricare la fattura dal portale di fatturazione.</p>
      <p><a class="btn" href="{{billing_url}}">Apri il portale fatture</a></p>
    `),
    text: wrapText(`Abbonamento MoviQ ora attivo

Il primo addebito di {{amount_eur}} € è andato a buon fine.
Periodo: {{period_start}} → {{period_end}}
Prossimo rinnovo: {{period_end}}

Fatture: {{billing_url}}`),
  },

  host_subscription_suspended: {
    subject: () => 'Account sospeso — inserzioni oscurate',
    html: wrap(`
      <h1>Account sospeso</h1>
      <p>Più tentativi di addebito sono falliti negli ultimi giorni. Per questo abbiamo dovuto sospendere il tuo account MoviQ.</p>
      <p><strong>Le tue auto non sono più visibili nei risultati di ricerca.</strong> Le prenotazioni in corso restano valide, ma non ne arriveranno di nuove finché non aggiorni il metodo di pagamento.</p>
      <p><a class="btn" href="{{billing_url}}">Riattiva ora</a></p>
      <p style="font-size:13px;color:#5B5246;">Se hai bisogno di aiuto scrivici a support@moviq.it.</p>
    `),
    text: wrapText(`Account sospeso — inserzioni oscurate

Più tentativi di addebito falliti. Le tue auto non sono visibili su MoviQ.
Aggiorna il metodo di pagamento: {{billing_url}}
Supporto: support@moviq.it`),
  },

  host_kyc_approved: {
    subject: () => 'Verifica approvata — ora puoi pubblicare la flotta',
    html: wrap(`
      <h1>Verifica approvata ✓</h1>
      <p>Ciao {{host_name}}, abbiamo verificato i tuoi dati. L'account è ora abilitato a pubblicare veicoli su MoviQ.</p>
      <p>Per andare online basta:</p>
      <ol>
        <li>Caricare le auto con foto buone (sezione "I miei veicoli")</li>
        <li>Attivare l'abbonamento (30 giorni gratuiti)</li>
      </ol>
      <p><a class="btn" href="{{backoffice_url}}">Apri il backoffice</a></p>
    `),
    text: wrapText(`Verifica approvata!

Puoi pubblicare la tua flotta su MoviQ.
Backoffice: {{backoffice_url}}`),
  },

  host_suspended: {
    subject: () => 'Il tuo account MoviQ è stato sospeso',
    html: wrap(`
      <h1>Account sospeso</h1>
      <p>Ciao {{host_name}},</p>
      <p>ti informiamo che il tuo account noleggiatore su MoviQ è stato <strong>temporaneamente sospeso</strong>. Da questo momento i tuoi veicoli <strong>non sono più visibili</strong> sul marketplace e non possono ricevere nuove prenotazioni.</p>
      <div class="meta">
        <dl>
          <dt>Motivo della sospensione</dt>
          <dd>{{reason}}</dd>
        </dl>
      </div>
      <p>Le prenotazioni eventualmente già in corso restano valide e vanno onorate normalmente.</p>
      <p>Vuoi chiarire la situazione e riattivare l'account? Rispondi a questa email o scrivici: troviamo insieme una soluzione.</p>
      <p><a class="btn btn-secondary" href="mailto:support@moviq.it">Contatta il supporto</a></p>
    `, '', 'Il tuo account MoviQ è stato sospeso'),
    text: wrapText(`Account sospeso

Ciao {{host_name}},
il tuo account noleggiatore su MoviQ è stato temporaneamente sospeso. I tuoi veicoli non sono più visibili sul marketplace e non possono ricevere nuove prenotazioni.

Motivo: {{reason}}

Le prenotazioni già in corso restano valide.
Per chiarire e riattivare l'account scrivi a support@moviq.it`),
  },

  host_no_subscription_suspended: {
    subject: () => 'Account sospeso — attiva l\'abbonamento entro 60 giorni',
    html: wrap(`
      <h1>Account sospeso</h1>
      <p>Ciao {{host_name}},</p>
      <p>il tuo account noleggiatore su MoviQ è stato <strong>sospeso</strong> perché non risulta attivo alcun abbonamento. Da adesso i tuoi veicoli <strong>non sono più visibili</strong> sul marketplace e non possono ricevere prenotazioni.</p>
      <div class="meta">
        <dl>
          <dt>Attiva entro il</dt>
          <dd>{{delete_date}}</dd>
        </dl>
      </div>
      <p>Hai <strong>60 giorni</strong> per attivare l'abbonamento e riportare online la tua flotta. Trascorso questo termine <strong>l'account e tutti i dati collegati verranno eliminati definitivamente</strong> e dovrai registrarti da capo.</p>
      <p><a class="btn btn-secondary" href="{{billing_url}}">Attiva l'abbonamento</a></p>
      <p style="font-size:13px;color:#5B5246;">Serve aiuto o pensi sia un errore? Scrivici a support@moviq.it.</p>
    `, '', 'Account sospeso — attiva l\'abbonamento entro 60 giorni'),
    text: wrapText(`Account sospeso — attiva l'abbonamento entro 60 giorni

Ciao {{host_name}},
il tuo account noleggiatore su MoviQ è stato sospeso perché non hai attivato alcun abbonamento. I tuoi veicoli non sono più visibili sul marketplace.

Hai tempo fino al {{delete_date}} (60 giorni) per attivare l'abbonamento. Trascorso questo termine l'account e tutti i dati verranno eliminati definitivamente.

Attiva l'abbonamento: {{billing_url}}
Aiuto: support@moviq.it`),
  },

  host_reactivated: {
    subject: () => 'Il tuo account MoviQ è di nuovo attivo',
    html: wrap(`
      <h1>Account riattivato</h1>
      <p>Ciao {{host_name}},</p>
      <p>buone notizie: il tuo account noleggiatore è stato <strong>riattivato</strong>. I tuoi veicoli sono di nuovo visibili sul marketplace e possono ricevere prenotazioni.</p>
      <p><a class="btn" href="https://moviq.it/noleggia">Vai al backoffice</a></p>
    `, '', 'Il tuo account MoviQ è di nuovo attivo'),
    text: wrapText(`Account riattivato

Ciao {{host_name}},
il tuo account noleggiatore è stato riattivato: i tuoi veicoli sono di nuovo visibili e prenotabili.

Backoffice: https://moviq.it/noleggia`),
  },

  host_kyc_rejected: {
    subject: () => 'Verifica da correggere',
    html: wrap(`
      <h1>Verifica da correggere</h1>
      <p>Abbiamo controllato i dati che hai inviato. C'è qualcosa da sistemare prima di poter approvare l'account.</p>
      <p><strong>Motivo:</strong> {{reason}}</p>
      <p>Apri il backoffice, correggi i campi indicati e reinvia la verifica. Ci risponderemo entro 48h.</p>
      <p><a class="btn" href="{{verify_url}}">Correggi e reinvia</a></p>
    `),
    text: wrapText(`Verifica da correggere

Motivo: {{reason}}

Correggi e reinvia: {{verify_url}}`),
  },
};
