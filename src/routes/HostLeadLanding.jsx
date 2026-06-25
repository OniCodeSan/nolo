import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H, Txt, Button, Badge, Logo } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';
import { useSeo, organizationJsonLd } from '../lib/seo.js';
import { useToast } from '../state/ToastContext.jsx';
import { events as analyticsEvents } from '../lib/analytics.js';
import { submitHostLead } from '../services/leads.js';
import { PROVINCE_IT } from '../services/kyc.js';

// ─── Input nativo allineato al design system ────────────────────────────────
// La <Input> di ui.jsx è display-only (mostra valori, non li gestisce): per il
// form lead servono campi editabili reali, quindi li definiamo qui.
function Field({ T, label, required, children, hint }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}{required && <span style={{ color: T.coral }}> *</span>}
      </span>
      {children}
      {hint && <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.ink3 }}>{hint}</span>}
    </label>
  );
}

const inputStyle = (T) => ({
  width: '100%', padding: '11px 12px',
  background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.sm,
  fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
});

function Benefit({ T, icon, title, body }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: 18, background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, boxShadow: T.sh.soft,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: T.r.md,
        background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={20} color={T.ink1} T={T} />
      </div>
      <H T={T} size="h4">{title}</H>
      <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.5 }}>{body}</Txt>
    </div>
  );
}

function Step({ T, n, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        flex: 'none', width: 32, height: 32, borderRadius: '50%',
        background: T.ink1, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 600,
      }}>{n}</div>
      <div>
        <H T={T} size="h4" style={{ marginBottom: 4 }}>{title}</H>
        <Txt T={T} size={13} color={T.ink2} style={{ lineHeight: 1.5 }}>{body}</Txt>
      </div>
    </div>
  );
}

export function HostLeadLanding({ T, isDesktop }) {
  const navigate = useNavigate();
  const toast = useToast();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    city: '', province: '', fleetSize: '', vehicleTypes: '', message: '',
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useSeo({
    title: 'Diventa noleggiatore — pubblica i tuoi veicoli su MoviQ',
    description: 'Sei un autonoleggio indipendente? Entra su MoviQ: ricevi richieste di noleggio dirette, gestisci la tua flotta e incassi senza commissioni nascoste. Lascia i tuoi dati, ti contattiamo noi.',
    path: '/benvenuti',
    jsonLd: organizationJsonLd(),
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const scrollToForm = () => {
    analyticsEvents.ctaClick({ location: 'host_lead_landing', cta: 'hero' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) { toast.error('Inserisci il nome dell\'attività.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) { toast.error('Inserisci un\'email valida.'); return; }
    setSending(true);
    try {
      await submitHostLead({
        ...form,
        fleetSize: form.fleetSize === '' ? undefined : parseInt(form.fleetSize, 10),
      });
      analyticsEvents.ctaClick({ location: 'host_lead_landing', cta: 'submit_lead' });
      setDone(true);
    } catch (err) {
      toast.error(err?.message || 'Invio non riuscito. Riprova.');
    } finally {
      setSending(false);
    }
  };

  const PAD = isDesktop ? '0 40px' : '0 20px';
  const SECTION_MAX = 980;

  return (
    <div style={{ flex: 1, background: T.bg }}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(180deg, ${T.accentSoft} 0%, ${T.bg} 100%)`,
        padding: isDesktop ? '56px 40px 64px' : '36px 20px 44px',
      }}>
        <div style={{ maxWidth: SECTION_MAX, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', marginBottom: 18 }}>
            <Logo T={T} size={26} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Badge T={T} tone="dark" icon="car">Per noleggiatori</Badge>
          </div>
          <H T={T} size={isDesktop ? 'display' : 'h1'} style={{ maxWidth: 720, margin: '0 auto' }}>
            La tua flotta, davanti a chi cerca un'auto adesso.
          </H>
          <Txt T={T} size={isDesktop ? 17 : 15} color={T.ink2} style={{ display: 'block', maxWidth: 600, margin: '18px auto 0', lineHeight: 1.6 }}>
            MoviQ è l'aggregatore degli autonoleggi indipendenti italiani. Pubblichi i tuoi
            veicoli, ricevi richieste dirette dai clienti e incassi tu, senza commissioni
            nascoste. Lascia i tuoi dati: ti ricontattiamo per l'attivazione.
          </Txt>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
            <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={scrollToForm}>
              Richiedi l'attivazione
            </Button>
            <Button T={T} variant="outline" size="lg" onClick={() => navigate('/per-noleggiatori')}>
              Come funziona
            </Button>
          </div>
        </div>
      </section>

      {/* ── Trust stats ──────────────────────────────────────────────────── */}
      <section style={{ padding: PAD }}>
        <div style={{
          maxWidth: SECTION_MAX, margin: '0 auto', transform: 'translateY(-24px)',
          display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 12,
        }}>
          {[
            { k: '0%', v: 'commissioni sul noleggio — incassi direttamente tu' },
            { k: 'Diretto', v: 'il cliente prenota e paga te, senza intermediari' },
            { k: 'Tutta Italia', v: 'visibilità su chi cerca auto nella tua zona' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: 18, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.lg, boxShadow: T.sh.soft, textAlign: 'center',
            }}>
              <H T={T} size="h2" color={T.ink1}>{s.k}</H>
              <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 6, lineHeight: 1.4 }}>{s.v}</Txt>
            </div>
          ))}
        </div>
      </section>

      {/* ── Benefici ─────────────────────────────────────────────────────── */}
      <section style={{ padding: PAD }}>
        <div style={{ maxWidth: SECTION_MAX, margin: '0 auto' }}>
          <H T={T} size="h2" style={{ marginBottom: 6 }}>Perché entrare su MoviQ</H>
          <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginBottom: 22 }}>
            Uno strumento pensato per gli autonoleggi indipendenti, non per le grandi catene.
          </Txt>
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 14 }}>
            <Benefit T={T} icon="euro"       title="Zero commissioni nascoste" body="Il cliente paga direttamente a te. Nessuna percentuale a sorpresa sul noleggio." />
            <Benefit T={T} icon="bell"       title="Richieste dirette"        body="Ricevi le richieste di prenotazione e le gestisci dal tuo backoffice, accetti o rifiuti tu." />
            <Benefit T={T} icon="car"        title="La tua flotta in vetrina" body="Carichi foto, prezzi e disponibilità di ogni veicolo. Aggiorni tutto quando vuoi." />
            <Benefit T={T} icon="search"     title="Trovato da chi cerca"     body="Compari quando un cliente cerca un'auto nella tua città, per categoria e date." />
            <Benefit T={T} icon="check"      title="Profilo verificato"       body="La verifica KYC dà fiducia ai clienti e mette in risalto la tua attività." />
            <Benefit T={T} icon="creditCard" title="Pagamenti tuoi"           body="Gestisci cauzioni e incassi con le tue regole: MoviQ porta i clienti, non si mette in mezzo." />
          </div>
        </div>
      </section>

      {/* ── Come funziona ────────────────────────────────────────────────── */}
      <section style={{ padding: PAD, marginTop: 36 }}>
        <div style={{ maxWidth: SECTION_MAX, margin: '0 auto' }}>
          <H T={T} size="h2" style={{ marginBottom: 22 }}>Come si parte</H>
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 22 }}>
            <Step T={T} n={1} title="Lasci i tuoi dati" body="Compili il modulo qui sotto con i dati della tua attività. Ci vuole meno di un minuto." />
            <Step T={T} n={2} title="Ti contattiamo"   body="Verifichiamo i requisiti e ti guidiamo nell'attivazione del profilo noleggiatore e nel KYC." />
            <Step T={T} n={3} title="Pubblichi e noleggi" body="Carichi i tuoi veicoli e inizi a ricevere richieste di noleggio dai clienti MoviQ." />
          </div>
        </div>
      </section>

      {/* ── Form lead ────────────────────────────────────────────────────── */}
      <section ref={formRef} style={{ padding: PAD, marginTop: 48, paddingBottom: 64, scrollMarginTop: 16 }}>
        <div style={{
          maxWidth: 620, margin: '0 auto',
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.xl,
          boxShadow: T.sh.raised, padding: isDesktop ? 32 : 22,
        }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
                background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={30} color={T.green} T={T} />
              </div>
              <H T={T} size="h2">Richiesta ricevuta!</H>
              <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', maxWidth: 420, margin: '12px auto 24px', lineHeight: 1.6 }}>
                Grazie. Il nostro team ti contatterà a breve all'indirizzo che hai indicato per
                completare l'attivazione del tuo profilo noleggiatore.
              </Txt>
              <Button T={T} variant="secondary" onClick={() => navigate('/')}>Torna alla home</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <H T={T} size="h3" style={{ marginBottom: 4 }}>Richiedi l'attivazione</H>
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 20 }}>
                Compila i campi: ti ricontattiamo noi. I campi con <span style={{ color: T.coral }}>*</span> sono obbligatori.
              </Txt>

              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 14 }}>
                <Field T={T} label="Nome attività" required>
                  <input style={inputStyle(T)} value={form.businessName} onChange={set('businessName')} placeholder="Es. Autonoleggi Rossi srl" autoComplete="organization" />
                </Field>
                <Field T={T} label="Referente">
                  <input style={inputStyle(T)} value={form.contactName} onChange={set('contactName')} placeholder="Nome e cognome" autoComplete="name" />
                </Field>
                <Field T={T} label="Email" required>
                  <input style={inputStyle(T)} type="email" value={form.email} onChange={set('email')} placeholder="nome@azienda.it" autoComplete="email" />
                </Field>
                <Field T={T} label="Telefono">
                  <input style={inputStyle(T)} type="tel" value={form.phone} onChange={set('phone')} placeholder="+39 ..." autoComplete="tel" />
                </Field>
                <Field T={T} label="Città">
                  <input style={inputStyle(T)} value={form.city} onChange={set('city')} placeholder="Es. Milano" autoComplete="address-level2" />
                </Field>
                <Field T={T} label="Provincia">
                  <select style={inputStyle(T)} value={form.province} onChange={set('province')}>
                    <option value="">—</option>
                    {PROVINCE_IT.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field T={T} label="Veicoli in flotta">
                  <input style={inputStyle(T)} type="number" min="0" value={form.fleetSize} onChange={set('fleetSize')} placeholder="Es. 12" />
                </Field>
                <Field T={T} label="Tipi di veicolo">
                  <input style={inputStyle(T)} value={form.vehicleTypes} onChange={set('vehicleTypes')} placeholder="Es. citycar, SUV, furgoni" />
                </Field>
              </div>

              <div style={{ marginTop: 14 }}>
                <Field T={T} label="Messaggio (facoltativo)">
                  <textarea
                    style={{ ...inputStyle(T), minHeight: 88, resize: 'vertical', lineHeight: 1.5 }}
                    value={form.message} onChange={set('message')}
                    placeholder="Raccontaci della tua attività o di cosa hai bisogno."
                  />
                </Field>
              </div>

              <Button T={T} variant="accent" size="lg" full type="submit" iconRight={sending ? undefined : 'arrowRight'} disabled={sending} style={{ marginTop: 22, opacity: sending ? 0.7 : 1 }}>
                {sending ? 'Invio in corso…' : 'Invia richiesta'}
              </Button>
              <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                Inviando accetti di essere contattato da MoviQ. Vedi la <a href="/privacy" style={{ color: T.ink2, textDecoration: 'underline' }}>privacy policy</a>.
              </Txt>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
