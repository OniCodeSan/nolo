// hifi-screens-rental.jsx — Area noleggiatori (onboarding + dashboard)

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
  PhoneFrame, BrowserFrame, TabBar } = window;

// ─────────────────────────────────────────────────────────
// ONBOARDING — DESKTOP (wizard 5 step con rail)
// ─────────────────────────────────────────────────────────
function OnboardDesktop({ T }) {
  const steps = [
    { n: 1, l: 'Account', s: 'Email + password', state: 'done' },
    { n: 2, l: 'Attività', s: 'Nome, P. IVA, sede', state: 'active' },
    { n: 3, l: 'Pagamenti', s: 'IBAN per ricevere', state: 'todo' },
    { n: 4, l: 'Primo veicolo', s: 'Foto + dati', state: 'todo' },
    { n: 5, l: 'Verifica', s: 'Controllo veloce', state: 'todo' },
  ];
  return (
    <BrowserFrame T={T} url="noleggio.it/noleggiatori/onboarding">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>
        {/* left rail */}
        <div style={{ background: T.ink1, padding: '48px 40px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ filter: 'invert(0)' }}>
            <Logo T={{ ...T, ink1: '#fff', ink2: 'rgba(255,255,255,0.7)' }} size={22} />
          </div>
          <Txt T={T} size={11} weight={600} color="rgba(255,255,255,0.6)" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginTop: 40 }}>
            Diventa noleggiatore
          </Txt>
          <H T={T} size="h2" style={{ color: '#fff', marginTop: 8 }}>
            5 passi per<br/>iniziare a guadagnare.
          </H>
          <Txt T={T} size={14} color="rgba(255,255,255,0.65)" style={{ display: 'block', marginTop: 12, maxWidth: 280 }}>
            Tempo medio: 12 minuti. Puoi salvare e tornare quando vuoi.
          </Txt>
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {steps.map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{
                  width: 32, height: 32, borderRadius: '50%', flex: 'none',
                  background: s.state === 'done' ? T.accent : s.state === 'active' ? '#fff' : 'transparent',
                  color: s.state === 'todo' ? 'rgba(255,255,255,0.5)' : T.ink1,
                  border: s.state === 'todo' ? `1.5px solid rgba(255,255,255,0.25)` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.fontBody, fontWeight: 700, fontSize: 14,
                }}>
                  {s.state === 'done' ? <Icon name="check" size={15} color={T.ink1} T={T} stroke={2.4} /> : s.n}
                </span>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <Txt T={T} size={14} weight={s.state === 'active' ? 600 : 500} color={s.state === 'todo' ? 'rgba(255,255,255,0.5)' : '#fff'} style={{ display: 'block' }}>{s.l}</Txt>
                  <Txt T={T} size={12} color="rgba(255,255,255,0.6)" style={{ display: 'block', marginTop: 2 }}>{s.s}</Txt>
                </div>
              </div>
            ))}
          </div>
          {/* car deco */}
          <div style={{ position: 'absolute', bottom: -10, right: -20, width: 220, height: 130, opacity: 0.15 }}>
            <CarRender T={T} variant="hatch" tone="dark" />
          </div>
        </div>
        {/* form */}
        <div style={{ background: T.bg, padding: '48px 56px', overflow: 'hidden' }}>
          <Txt T={T} size={12} color={T.ink2}>Step 2 di 5</Txt>
          <H T={T} size="h1" style={{ marginTop: 4 }}>
            Parlaci della tua <span style={{ background: T.accent, padding: '0 8px', borderRadius: 6 }}>attività.</span>
          </H>
          <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 8 }}>
            Queste informazioni appariranno nel tuo profilo pubblico.
          </Txt>
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 640 }}>
            <Input T={T} label="Nome attività" value="AutoLuca s.r.l." />
            <Input T={T} label="P. IVA" value="IT 01234567890" suffix={<Badge T={T} tone="success" icon="check">Ok</Badge>} />
            <Input T={T} label="Telefono" value="+39 02 1234567" />
            <Input T={T} label="Email" value="info@autoluca.it" />
            <Input T={T} label="Sede operativa" icon="pin" value="Via Milano 12, Sesto S.G., 20099" style={{ gridColumn: 'span 2' }} />
          </div>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginTop: 26, marginBottom: 8 }}>
            Quanti veicoli pensi di caricare?
          </Txt>
          <div style={{ display: 'flex', gap: 8 }}>
            <Chip T={T}>1-5 auto</Chip>
            <Chip T={T} active>6-15 auto</Chip>
            <Chip T={T}>16-50 auto</Chip>
            <Chip T={T}>Più di 50</Chip>
          </div>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginTop: 26, marginBottom: 8 }}>
            Logo (opzionale)
          </Txt>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: 16, background: T.surface, border: `1.5px dashed ${T.line}`,
            borderRadius: T.r.md, maxWidth: 320,
          }}>
            <span style={{ width: 44, height: 44, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="upload" size={20} color={T.ink2} T={T} />
            </span>
            <div style={{ flex: 1 }}>
              <Txt T={T} size={13} weight={600}>Trascina o clicca</Txt>
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>PNG / SVG · max 2MB</Txt>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 40, alignItems: 'center' }}>
            <Button T={T} variant="ghost" icon="chevronLeft">Indietro</Button>
            <Button T={T} variant="accent" iconRight="arrowRight">Continua</Button>
            <div style={{ flex: 1 }} />
            <Button T={T} variant="ghost" size="sm">Salva e continua dopo</Button>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────
// ONBOARDING — MOBILE
// ─────────────────────────────────────────────────────────
function OnboardMobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, padding: '18px 20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
          <Txt T={T} size={12} color={T.ink2}>Step 2 di 5</Txt>
          <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>esci</Txt>
        </div>
        {/* progress */}
        <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= 2 ? T.ink1 : T.line }} />
          ))}
        </div>
        <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 22 }}>Attività</Txt>
        <H T={T} size="h2" style={{ marginTop: 6, lineHeight: 1.05 }}>
          Parlaci della tua <span style={{ background: T.accent, padding: '0 6px', borderRadius: 4 }}>attività.</span>
        </H>
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 8 }}>
          Questi dati appariranno nel profilo pubblico.
        </Txt>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input T={T} label="Nome attività" value="AutoLuca" />
          <Input T={T} label="P. IVA" value="IT 01234567890" suffix={<Badge T={T} tone="success" icon="check">Ok</Badge>} />
          <Input T={T} label="Sede operativa" icon="pin" placeholder="Via, città" />
          <div>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Dimensione</Txt>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Chip T={T} active size="sm">1-5 auto</Chip>
              <Chip T={T} size="sm">6-15</Chip>
              <Chip T={T} size="sm">16-50</Chip>
              <Chip T={T} size="sm">50+</Chip>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <Button T={T} variant="ghost" icon="chevronLeft" style={{ flex: 1 }}>Indietro</Button>
          <Button T={T} variant="accent" iconRight="arrowRight" style={{ flex: 2 }}>Avanti</Button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────
// RENTAL SIDEBAR
// ─────────────────────────────────────────────────────────
function RentalSidebar({ T, active = 'dashboard' }) {
  const items = [
    { id: 'dashboard', l: 'Dashboard', i: 'home' },
    { id: 'veicoli', l: 'I miei veicoli', i: 'car', b: '6' },
    { id: 'prenotazioni', l: 'Prenotazioni', i: 'calendar', b: '3' },
    { id: 'richieste', l: 'Richieste', i: 'chat', b: '5', urgent: true },
    { id: 'pagamenti', l: 'Pagamenti', i: 'euro' },
    { id: 'statistiche', l: 'Statistiche', i: 'eye' },
    { id: 'profilo', l: 'Profilo aziendale', i: 'user' },
    { id: 'impostazioni', l: 'Impostazioni', i: 'settings' },
  ];
  return (
    <div style={{ background: T.ink1, padding: '24px 18px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' }}>
      <Logo T={{ ...T, ink1: '#fff', ink2: 'rgba(255,255,255,0.7)' }} size={22} />
      <Txt T={T} size={10} weight={600} color="rgba(255,255,255,0.5)" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 36, marginTop: 2, marginBottom: 28 }}>
        per noleggiatori
      </Txt>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {items.map(it => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: it.id === active ? T.accent : 'transparent',
            color: it.id === active ? T.ink1 : '#fff',
            borderRadius: T.r.md, cursor: 'pointer',
            fontWeight: it.id === active ? 600 : 500,
          }}>
            <Icon name={it.i} size={17} color="currentColor" T={T} />
            <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 14 }}>{it.l}</span>
            {it.b && (
              <span style={{
                padding: '1px 7px', borderRadius: 10,
                background: it.urgent ? T.coral : it.id === active ? T.ink1 : 'rgba(255,255,255,0.15)',
                color: it.urgent ? '#fff' : it.id === active ? '#fff' : 'rgba(255,255,255,0.9)',
                fontSize: 11, fontWeight: 700,
              }}>{it.b}</span>
            )}
          </div>
        ))}
      </div>
      <Button T={T} variant="accent" size="md" icon="plus" full style={{ marginTop: 14 }}>Nuovo veicolo</Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RENTAL DASHBOARD — DESKTOP
// ─────────────────────────────────────────────────────────
function RentalDashboardDesktop({ T }) {
  return (
    <BrowserFrame T={T} url="noleggio.it/dashboard">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden' }}>
        <RentalSidebar T={T} active="dashboard" />
        <div style={{ background: T.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ padding: '20px 32px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Txt T={T} size={12} color={T.ink2}>Buongiorno,</Txt>
              <H T={T} size="h3" style={{ lineHeight: 1, marginTop: 2 }}>AutoLuca</H>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Input T={T} icon="search" placeholder="Cerca veicoli, prenotazioni…" size="sm" style={{ width: 240 }} />
              <Icon name="bell" size={20} color={T.ink1} T={T} />
              <Avatar T={T} name="AutoLuca" size={32} tone="accent" />
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '24px 32px', overflow: 'hidden' }}>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                { l: 'Veicoli attivi', v: 6, sub: '/8 totali', trend: undefined, tone: 'neutral' },
                { l: 'Prenotazioni in corso', v: 3, sub: 'ricavi 386€', tone: 'accent' },
                { l: 'Richieste da gestire', v: 5, sub: '2 nuove', tone: 'alert', urgent: true },
                { l: 'Visite (7gg)', v: '1.2k', sub: '+18%', tone: 'success' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: 18,
                  background: s.tone === 'accent' ? T.accent : s.tone === 'alert' ? T.coralSoft : s.tone === 'success' ? T.greenSoft : T.surface,
                  border: `1px solid ${T.line}`, borderRadius: T.r.lg,
                  position: 'relative',
                }}>
                  <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Txt>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                    <Txt T={T} size={32} weight={600} style={{ fontFamily: T.fontDisplay, letterSpacing: '-0.02em' }}>{s.v}</Txt>
                    {s.urgent && <span style={{ width: 8, height: 8, borderRadius: 4, background: T.coral }} />}
                  </div>
                  <Txt T={T} size={11} color={T.ink2}>{s.sub}</Txt>
                </div>
              ))}
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, marginTop: 22 }}>
              {/* Recent requests */}
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 0, boxShadow: T.sh.soft, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <H T={T} size="h4">Richieste recenti</H>
                  <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>tutte (5)</Txt>
                </div>
                {[
                  { u: 'Luca Bianchi', a: 'VW Polo · 2022', d: 'Mer 18 → Dom 22 giu', dur: '4 giorni', p: 128, s: 'Nuova', new: true },
                  { u: 'Marta Rossi', a: 'Fiat Tipo · 2021', d: 'Ven 5 → Ven 12 lug', dur: '7 giorni', p: 224, s: 'In attesa' },
                  { u: 'Stefano G.', a: 'Audi A1 · 2022', d: 'Sab 24 → Dom 25 giu', dur: '1 giorno', p: 55, s: 'In attesa' },
                ].map((r, i) => (
                  <div key={i} style={{
                    padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    borderBottom: i < 2 ? `1px solid ${T.line}` : 'none',
                    background: r.new ? T.accentSoft : 'transparent',
                  }}>
                    <Avatar T={T} name={r.u} size={40} tone={i === 0 ? 'accent' : undefined} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Txt T={T} size={14} weight={600}>{r.u}</Txt>
                        {r.new && <Badge T={T} tone="dark">Nuova</Badge>}
                      </div>
                      <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{r.a} · {r.d} · {r.dur}</Txt>
                    </div>
                    <Price T={T} value={r.p} unit="" size="md" weight={700} />
                    <Button T={T} variant="primary" size="sm" iconRight="arrowRight">Vedi</Button>
                  </div>
                ))}
              </div>

              {/* Upcoming pickups */}
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 0, boxShadow: T.sh.soft, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <H T={T} size="h4">Prossimi ritiri</H>
                  <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>calendario</Txt>
                </div>
                {[
                  { d: '17', m: 'giu', dow: 'mar', t: '15:00', n: 'Stefano G.', a: 'Fiat Tipo' },
                  { d: '18', m: 'giu', dow: 'mer', t: '10:00', n: 'Luca B.', a: 'VW Polo' },
                  { d: '19', m: 'giu', dow: 'gio', t: '09:30', n: 'Marta R.', a: 'Mini' },
                ].map((u, i) => (
                  <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < 2 ? `1px solid ${T.line}` : 'none' }}>
                    <div style={{ width: 50, flex: 'none', padding: '6px 0', background: T.surfaceAlt, borderRadius: T.r.sm, textAlign: 'center' }}>
                      <Txt T={T} size={10} color={T.ink2} style={{ display: 'block', textTransform: 'uppercase' }}>{u.dow}</Txt>
                      <Txt T={T} size={18} weight={600} style={{ display: 'block', fontFamily: T.fontDisplay, lineHeight: 1 }}>{u.d}</Txt>
                      <Txt T={T} size={9} color={T.ink2} style={{ display: 'block' }}>{u.m}</Txt>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{u.n}</Txt>
                      <Txt T={T} size={11} color={T.ink2}>{u.a} · ritiro {u.t}</Txt>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────
// RENTAL DASHBOARD — MOBILE
// ─────────────────────────────────────────────────────────
function RentalDashboardMobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>NOLEGGIATORE</Txt>
            <H T={T} size="h3" style={{ lineHeight: 1 }}>AutoLuca</H>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Icon name="bell" size={22} color={T.ink1} T={T} />
            <Avatar T={T} name="A" size={32} tone="accent" />
          </div>
        </div>

        <div style={{ position: 'absolute', top: 76, left: 0, right: 0, bottom: 60, overflow: 'hidden' }}>
          {/* Urgent alert */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{
              padding: 12, background: T.coralSoft, border: `1px solid ${T.coral}`,
              borderRadius: T.r.md, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: T.coral, flex: 'none' }} />
              <Txt T={T} size={12} weight={600} style={{ flex: 1 }}>5 richieste da gestire</Txt>
              <Icon name="chevron" size={16} color={T.ink1} T={T} />
            </div>
          </div>

          {/* Stat grid */}
          <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: 'Veicoli attivi', v: 6, sub: '/8', tone: 'neutral' },
              { l: 'In corso', v: 3, sub: '386€', tone: 'accent' },
              { l: 'Visite 7gg', v: '1.2k', sub: '+18%', tone: 'success' },
              { l: 'Conversione', v: '12%', sub: '+2 pp', tone: 'neutral' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 12,
                background: s.tone === 'accent' ? T.accent : s.tone === 'success' ? T.greenSoft : T.surface,
                border: `1px solid ${T.line}`, borderRadius: T.r.md,
              }}>
                <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Txt>
                <Txt T={T} size={22} weight={600} style={{ display: 'block', marginTop: 4, fontFamily: T.fontDisplay, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</Txt>
                <Txt T={T} size={10} color={T.ink2}>{s.sub}</Txt>
              </div>
            ))}
          </div>

          {/* Quick add */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{
              padding: 14, background: T.accent, borderRadius: T.r.lg,
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              boxShadow: T.sh.soft,
            }}>
              <span style={{
                width: 40, height: 40, borderRadius: '50%', background: T.ink1, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              }}><Icon name="plus" size={20} color="#fff" T={T} /></span>
              <div style={{ flex: 1 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>Aggiungi un veicolo</Txt>
                <Txt T={T} size={11} color={T.ink1} style={{ opacity: 0.75, display: 'block' }}>circa 3 minuti</Txt>
              </div>
              <Icon name="chevron" size={18} color={T.ink1} T={T} />
            </div>
          </div>

          {/* Upcoming */}
          <div style={{ padding: '20px 20px 0' }}>
            <H T={T} size="h4">Prossimi ritiri</H>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { d: '17', m: 'giu', t: '15:00', n: 'Stefano G.', a: 'Fiat Tipo' },
                { d: '18', m: 'giu', t: '10:00', n: 'Luca B.', a: 'VW Polo', soon: true },
              ].map((u, i) => (
                <div key={i} style={{
                  padding: 12, background: u.soon ? T.accent : T.surface,
                  border: `1px solid ${T.line}`, borderRadius: T.r.md,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 42, textAlign: 'center', flex: 'none' }}>
                    <Txt T={T} size={9} color={T.ink2} style={{ display: 'block', textTransform: 'uppercase' }}>{u.m}</Txt>
                    <Txt T={T} size={18} weight={600} style={{ display: 'block', fontFamily: T.fontDisplay, lineHeight: 1 }}>{u.d}</Txt>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{u.n}</Txt>
                    <Txt T={T} size={11} color={T.ink2}>{u.a} · {u.t}</Txt>
                  </div>
                  <Icon name="chevron" size={16} color={T.ink2} T={T} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav rental-specific */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 14, background: T.bg, borderTop: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-around', padding: '8px 4px 14px' }}>
          {[
            { i: 'home', l: 'Home', a: true },
            { i: 'car', l: 'Veicoli' },
            { i: 'calendar', l: 'Prenot.' },
            { i: 'chat', l: 'Richieste', b: '5' },
            { i: 'user', l: 'Profilo' },
          ].map(t => (
            <div key={t.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: t.a ? T.ink1 : T.ink3, position: 'relative' }}>
              <Icon name={t.i} size={22} color="currentColor" T={T} />
              <span style={{ fontSize: 10, fontWeight: t.a ? 600 : 500, fontFamily: T.fontBody }}>{t.l}</span>
              {t.b && <span style={{ position: 'absolute', top: -2, right: -6, background: T.coral, color: '#fff', borderRadius: 8, padding: '0 4px', fontSize: 9, fontWeight: 700, lineHeight: 1.5 }}>{t.b}</span>}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────
// LISTA VEICOLI — DESKTOP
// ─────────────────────────────────────────────────────────
function VehiclesListDesktop({ T }) {
  const rows = [
    { n: 'VW Polo', y: 2022, s: 'Attivo', p: 32, b: 4, v: 134, tone: 'neutral', sub: '1.0 TSI · Manuale · 5 posti', vt: 'hatch' },
    { n: 'Fiat Tipo', y: 2021, s: 'Attivo', p: 35, b: 2, v: 89, tone: 'neutral', sub: '1.6 Diesel · Manuale · 5 posti', vt: 'sedan' },
    { n: 'Audi A1', y: 2022, s: 'Attivo', p: 55, b: 1, v: 76, tone: 'accent', sub: '1.0 TFSI · Auto. · 5 posti', vt: 'hatch' },
    { n: 'Mini Cooper', y: 2023, s: 'Attivo', p: 58, b: 0, v: 42, tone: 'neutral', sub: '1.5 Hybrid · Auto. · 4 posti', vt: 'hatch' },
    { n: 'Renault Clio', y: 2023, s: 'Attivo', p: 42, b: 3, v: 162, tone: 'success', sub: '1.0 Hybrid · Auto. · 5 posti', vt: 'hatch' },
    { n: 'Tesla Model 3', y: 2024, s: 'Bozza', p: null, b: 0, v: 0, tone: 'draft', sub: 'Elettrica · Auto. · 5 posti', vt: 'sedan' },
  ];
  return (
    <BrowserFrame T={T} url="noleggio.it/dashboard/veicoli">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden' }}>
        <RentalSidebar T={T} active="veicoli" />
        <div style={{ background: T.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 32px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <H T={T} size="h2">I miei veicoli</H>
              <Txt T={T} size={13} color={T.ink2}>6 attivi · 2 bozze · 0 fuori catalogo</Txt>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Input T={T} icon="search" placeholder="Cerca" size="sm" style={{ width: 200 }} />
              <Button T={T} variant="outline" size="md" icon="filter">Filtri</Button>
              <Button T={T} variant="accent" size="md" icon="plus">Nuovo veicolo</Button>
            </div>
          </div>
          {/* tabs */}
          <div style={{ padding: '0 32px', borderBottom: `1px solid ${T.line}`, display: 'flex', gap: 28 }}>
            {['Tutti · 8', 'Attivi · 6', 'Bozze · 2', 'Fuori catalogo · 0'].map((t, i) => (
              <div key={t} style={{ padding: '12px 0', borderBottom: i === 0 ? `2px solid ${T.ink1}` : 'none', marginBottom: -1 }}>
                <Txt T={T} size={13} weight={i === 0 ? 600 : 500} color={i === 0 ? T.ink1 : T.ink2}>{t}</Txt>
              </div>
            ))}
          </div>
          {/* table */}
          <div style={{ flex: 1, padding: '0 32px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1.8fr 1fr 0.8fr 0.8fr 0.8fr 80px', padding: '14px 0', borderBottom: `1px solid ${T.line}`, gap: 16, alignItems: 'center' }}>
              {[' ', 'Veicolo', 'Stato', 'Prezzo / giorno', 'Prenotaz.', 'Visite (7gg)', '  '].map(h => (
                <Txt T={T} key={h} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Txt>
              ))}
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1.8fr 1fr 0.8fr 0.8fr 0.8fr 80px', padding: '12px 0', borderBottom: `1px solid ${T.line}`, gap: 16, alignItems: 'center' }}>
                <div style={{ width: 60, height: 38, borderRadius: T.r.sm, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                  <CarRender T={T} variant={r.vt} tone={r.tone === 'accent' ? 'colored' : 'neutral'} />
                </div>
                <div>
                  <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{r.n} · {r.y}</Txt>
                  <Txt T={T} size={11} color={T.ink2}>{r.sub}</Txt>
                </div>
                <Badge T={T} tone={r.tone === 'draft' ? 'neutral' : 'success'} icon={r.tone === 'draft' ? 'edit' : 'check'}>{r.s}</Badge>
                <Txt T={T} size={14} weight={600} style={{ fontFamily: T.fontDisplay, letterSpacing: '-0.02em' }}>{r.p ? r.p + '€' : '—'}</Txt>
                <Txt T={T} size={14}>{r.b}</Txt>
                <Txt T={T} size={14}>{r.v}</Txt>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: T.r.sm }}>
                    <Icon name="edit" size={15} color={T.ink2} T={T} />
                  </button>
                  <button style={{ padding: 6, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: T.r.sm }}>
                    <Icon name="settings" size={15} color={T.ink2} T={T} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────
// AGGIUNGI VEICOLO — DESKTOP
// ─────────────────────────────────────────────────────────
function AddVehicleDesktop({ T }) {
  return (
    <BrowserFrame T={T} url="noleggio.it/dashboard/veicoli/nuovo">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden' }}>
        <RentalSidebar T={T} active="veicoli" />
        <div style={{ background: T.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ padding: '18px 32px', borderBottom: `1px solid ${T.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Txt T={T} size={12} color={T.ink2}>I miei veicoli › <span style={{ color: T.ink1, fontWeight: 600 }}>Nuovo veicolo</span></Txt>
              <H T={T} size="h3" style={{ lineHeight: 1, marginTop: 4 }}>Aggiungi un veicolo</H>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Txt T={T} size={11} color={T.ink2}><Icon name="check" size={11} color={T.ok} T={T} /> Bozza salvata 2 min fa</Txt>
              <Button T={T} variant="outline" size="md">Salva bozza</Button>
              <Button T={T} variant="accent" size="md" iconRight="arrowRight">Pubblica veicolo</Button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, overflow: 'hidden' }}>
            {/* main form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
              <FormSection T={T} n={1} title="Identificazione" desc="Campi obbligatori per pubblicare" status="active">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Input T={T} label="Marchio *" value="Volkswagen" suffix="▾" />
                  <Input T={T} label="Modello *" value="Polo" />
                  <Input T={T} label="Motorizzazione *" value="1.0 TSI 95cv Manuale" />
                  <Input T={T} label="Carburante *" value="Benzina" suffix="▾" />
                  <Input T={T} label="Anno" value="2022" />
                  <Input T={T} label="Targa" value="AB123CD" suffix="solo te" />
                </div>
              </FormSection>

              <FormSection T={T} n={2} title="Dettagli tecnici" desc="Aiutano l'utente a filtrare" status="active">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <Input T={T} label="Posti" value="5" />
                  <Input T={T} label="Porte" value="5" />
                  <Input T={T} label="Cambio" value="Manuale" suffix="▾" />
                  <Input T={T} label="Trazione" value="FWD" suffix="▾" />
                  <Input T={T} label="Cavalli" value="95" />
                  <Input T={T} label="Km" value="40.000" />
                </div>
              </FormSection>

              <FormSection T={T} n={3} title="Accessori e dotazione" desc="Selezione multipla" status="active">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Apple CarPlay', 'Android Auto', 'Bluetooth', 'Sens. parcheggio', 'Telecamera', 'Cruise control', 'Aria cond.', 'Navigatore', 'Tetto panor.', 'USB', 'Vivavoce', 'Cerchi lega'].map((a, i) => (
                    <Chip T={T} key={a} active={[0, 1, 2, 3, 5, 6].includes(i)} icon={[0, 1, 2, 3, 5, 6].includes(i) ? 'check' : undefined}>{a}</Chip>
                  ))}
                </div>
              </FormSection>

              <FormSection T={T} n={4} title="Descrizione" desc="Racconta cos'ha di speciale" status="active">
                <div style={{
                  padding: '14px 16px', background: T.surface,
                  border: `1px solid ${T.line}`, borderRadius: T.r.md, minHeight: 90,
                }}>
                  <Txt T={T} size={13} color={T.ink1}>
                    Polo del 2022 in ottime condizioni, ideale per la città e brevi spostamenti.
                    Aria condizionata, sensori posteriori, Android Auto.
                  </Txt>
                </div>
                <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>128/500 caratteri</Txt>
              </FormSection>
            </div>

            {/* sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 16, boxShadow: T.sh.soft }}>
                <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Foto · max 8</Txt>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ position: 'relative', borderRadius: T.r.sm, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
                    <CarRender T={T} variant="hatch" tone="colored" />
                    <Badge T={T} tone="dark" style={{ position: 'absolute', top: 4, left: 4 }}>Cover</Badge>
                  </div>
                  <div style={{ borderRadius: T.r.sm, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
                    <CarRender T={T} variant="hatch" tone="neutral" />
                  </div>
                  <div style={{ borderRadius: T.r.sm, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
                    <CarRender T={T} variant="hatch" tone="colored" />
                  </div>
                  <div style={{
                    aspectRatio: '1.3 / 1', borderRadius: T.r.sm,
                    border: `1.5px dashed ${T.line}`, background: T.bg,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer',
                  }}>
                    <Icon name="upload" size={16} color={T.ink2} T={T} />
                    <Txt T={T} size={10} color={T.ink2}>aggiungi</Txt>
                  </div>
                </div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 16, boxShadow: T.sh.soft }}>
                <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Prezzi</Txt>
                <Input T={T} label="Giornaliero" value="32" suffix="€" />
                <Input T={T} label="Settimanale" placeholder="opzionale" suffix="€" style={{ marginTop: 8 }} />
                <Input T={T} label="Mensile" value="690" suffix="€" style={{ marginTop: 8 }} />
                <div style={{ marginTop: 10, padding: '8px 10px', background: T.accentSoft, borderRadius: T.r.sm, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="sparkle" size={14} color={T.accentDeep} T={T} />
                  <Txt T={T} size={11} color={T.ink1}>Auto simili in zona: <strong>30—36€/g</strong></Txt>
                </div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 16, boxShadow: T.sh.soft }}>
                <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Disponibilità</Txt>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Chip T={T} active>Sempre disponibile</Chip>
                  <Chip T={T}>Usa calendario</Chip>
                </div>
                <Input T={T} label="Località ritiro" icon="pin" value="Sesto S.G." style={{ marginTop: 10 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function FormSection({ T, n, title, desc, children, status = 'active' }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 20, boxShadow: T.sh.soft }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', background: status === 'done' ? T.ok : T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, color: T.ink1, flex: 'none',
        }}>{status === 'done' ? <Icon name="check" size={14} color="#fff" T={T} /> : n}</span>
        <div style={{ flex: 1 }}>
          <H T={T} size="h4">{title}</H>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{desc}</Txt>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AGGIUNGI VEICOLO — MOBILE (Step 3 di 5: Foto)
// ─────────────────────────────────────────────────────────
function AddVehicleMobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="x" size={20} color={T.ink1} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>Nuovo veicolo</Txt>
            <Txt T={T} size={10} color={T.ink2}>Step 3 di 5 · Foto</Txt>
          </div>
          <Txt T={T} size={11} color={T.ink2} style={{ textDecoration: 'underline' }}>bozza</Txt>
        </div>
        <div style={{ display: 'flex', gap: 3, padding: '8px 20px' }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= 3 ? T.ink1 : T.line }} />
          ))}
        </div>
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, bottom: 88, padding: '14px 20px', overflow: 'hidden' }}>
          <H T={T} size="h3" style={{ lineHeight: 1.1 }}>Aggiungi delle foto.</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
            La prima foto è quella che vedono tutti — curala.
          </Txt>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ position: 'relative', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
              <CarRender T={T} variant="hatch" tone="colored" />
              <Badge T={T} tone="dark" style={{ position: 'absolute', top: 6, left: 6 }}>Cover</Badge>
              <button style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="x" size={11} color={T.ink1} T={T} />
              </button>
            </div>
            <div style={{ borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
              <CarRender T={T} variant="hatch" tone="neutral" />
            </div>
            <div style={{ borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
              <CarRender T={T} variant="hatch" tone="colored" />
            </div>
            <div style={{
              aspectRatio: '1.3 / 1', borderRadius: T.r.md, background: T.surface,
              border: `1.5px dashed ${T.line}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="plus" size={20} color={T.ink2} T={T} />
              <Txt T={T} size={11} color={T.ink2}>aggiungi</Txt>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Icon name="sparkle" size={16} color={T.accentDeep} T={T} />
            <Txt T={T} size={12} color={T.ink1} style={{ flex: 1, lineHeight: 1.5 }}>
              Auto pulita, sfondo neutro, luce naturale. <strong>3-4 foto bastano</strong>.
            </Txt>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 24px', background: T.bg, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 10 }}>
          <Button T={T} variant="ghost" icon="chevronLeft" style={{ flex: 1 }}>Indietro</Button>
          <Button T={T} variant="accent" iconRight="arrowRight" style={{ flex: 2 }}>Avanti</Button>
        </div>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, {
  OnboardDesktop, OnboardMobile,
  RentalDashboardDesktop, RentalDashboardMobile,
  VehiclesListDesktop, AddVehicleDesktop, AddVehicleMobile,
});
