// hifi-screens-user.jsx — Area personale utente

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
  PhoneFrame, BrowserFrame, TabBar, NavBar } = window;

// ─────────────────────────────────────────────────────────
// LOGIN — MOBILE
// ─────────────────────────────────────────────────────────
function LoginMobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, padding: '20px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
          </button>
          <Txt T={T} size={12} color={T.ink2}>Aiuto</Txt>
        </div>
        <Logo T={T} size={26} />
        <div style={{ marginTop: 36 }}>
          <H T={T} size="h1" style={{ lineHeight: 1 }}>
            Ciao,<br/>
            <span style={{ background: T.accent, padding: '0 8px', borderRadius: 6 }}>bentornato.</span>
          </H>
          <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 10 }}>
            Entra per gestire prenotazioni, salvati e messaggi.
          </Txt>
        </div>
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input T={T} label="Email" value="luca@email.it" icon="user" />
          <Input T={T} label="Password" value="••••••••" icon="settings" suffix={<Icon name="eye" size={15} color={T.ink2} T={T} />} />
          <div style={{ textAlign: 'right' }}>
            <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>password dimenticata?</Txt>
          </div>
          <Button T={T} variant="accent" size="lg" iconRight="arrowRight" full>Accedi</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: T.line }} />
          <Txt T={T} size={11} color={T.ink3}>oppure</Txt>
          <div style={{ flex: 1, height: 1, background: T.line }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button T={T} variant="outline" full icon="google">Continua con Google</Button>
          <Button T={T} variant="outline" full icon="apple">Continua con Apple</Button>
        </div>
        <div style={{ flex: 1 }} />
        <Txt T={T} size={13} style={{ textAlign: 'center', marginTop: 14 }} color={T.ink2}>
          Non hai un account? <span style={{ color: T.ink1, fontWeight: 600, textDecoration: 'underline' }}>Registrati</span>
        </Txt>
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────
// LOGIN — DESKTOP (split-screen)
// ─────────────────────────────────────────────────────────
function LoginDesktop({ T }) {
  return (
    <BrowserFrame T={T} url="noleggio.it/accedi">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        {/* Left: hero */}
        <div style={{
          background: T.accent, padding: '56px 56px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <Logo T={T} size={26} />
          <div>
            <H T={T} size="display" style={{ color: T.ink1, lineHeight: 0.95 }}>
              Bentornato.<br/>L'auto giusta ti aspetta.
            </H>
            <Txt T={T} size={16} color={T.ink1} style={{ display: 'block', marginTop: 18, opacity: 0.75, maxWidth: 380 }}>
              Riprendi le tue prenotazioni o trova qualcosa di nuovo da provare.
            </Txt>
          </div>
          {/* decoration: car silhouette */}
          <div style={{ position: 'absolute', bottom: -10, right: -40, width: 380, height: 220, opacity: 0.18 }}>
            <CarRender T={T} variant="hatch" tone="dark" />
          </div>
        </div>
        {/* Right: form */}
        <div style={{ padding: '56px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: T.bg }}>
          <div style={{ maxWidth: 380 }}>
            <H T={T} size="h2">Accedi</H>
            <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 8 }}>
              Nuovo qui? <span style={{ color: T.ink1, fontWeight: 600, textDecoration: 'underline' }}>Crea un account</span>
            </Txt>
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input T={T} label="Email" value="luca@email.it" icon="user" />
              <Input T={T} label="Password" value="••••••••" icon="settings" suffix={<Icon name="eye" size={15} color={T.ink2} T={T} />} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 16, height: 16, borderRadius: T.r.sm / 2, background: T.ink1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={11} color="#fff" T={T} stroke={2} />
                  </span>
                  <Txt T={T} size={12}>Resta connesso</Txt>
                </label>
                <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>Password dimenticata?</Txt>
              </div>
              <Button T={T} variant="primary" size="lg" iconRight="arrowRight" full>Accedi</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: T.line }} />
              <Txt T={T} size={11} color={T.ink3} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>oppure</Txt>
              <div style={{ flex: 1, height: 1, background: T.line }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button T={T} variant="outline" icon="google" style={{ flex: 1 }}>Google</Button>
              <Button T={T} variant="outline" icon="apple" style={{ flex: 1 }}>Apple</Button>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────
// USER DASHBOARD — MOBILE
// ─────────────────────────────────────────────────────────
function UserDashboardMobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Txt T={T} size={13} color={T.ink2}>Ciao,</Txt>
            <H T={T} size="h2" style={{ lineHeight: 1 }}>Luca 👋</H>
          </div>
          <Icon name="bell" size={22} color={T.ink1} T={T} />
        </div>

        <div style={{ position: 'absolute', top: 70, left: 0, right: 0, bottom: 60, overflow: 'hidden' }}>
          {/* Active booking hero */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{
              background: T.accent, borderRadius: T.r.xl,
              padding: 18, boxShadow: T.sh.raised,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -20, top: 10, width: 160, height: 110, opacity: 0.35 }}>
                <CarRender T={T} variant="hatch" tone="dark" />
              </div>
              <Badge T={T} tone="dark">In arrivo · 5 giorni</Badge>
              <H T={T} size="h3" style={{ marginTop: 10, color: T.ink1 }}>VW Polo · 2022</H>
              <Txt T={T} size={12} color={T.ink1} style={{ display: 'block', marginTop: 4, opacity: 0.85 }}>
                Mer 18 giu — Dom 22 giu · AutoLuca
              </Txt>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Button T={T} variant="primary" size="sm" iconRight="arrowRight">Dettagli</Button>
                <Button T={T} variant="outline" size="sm" icon="chat">Chat</Button>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {[
                { i: 'search', l: 'Cerca' },
                { i: 'heart', l: 'Salvati', c: 4 },
                { i: 'calendar', l: 'Storico' },
                { i: 'chat', l: 'Messaggi', c: 1 },
              ].map((q, i) => (
                <div key={i} style={{
                  padding: '14px 6px', background: T.surface,
                  border: `1px solid ${T.line}`, borderRadius: T.r.md,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  position: 'relative',
                }}>
                  <Icon name={q.i} size={20} color={T.ink1} T={T} />
                  <Txt T={T} size={11} weight={500}>{q.l}</Txt>
                  {q.c && <span style={{ position: 'absolute', top: 8, right: 14, background: T.coral, color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 9, fontWeight: 700, lineHeight: 1.5 }}>{q.c}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Visti di recente */}
          <div style={{ padding: '20px 0 0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 20 }}>
              <H T={T} size="h4">Visti di recente</H>
              <Txt T={T} size={12} color={T.ink2}>tutti →</Txt>
            </div>
            <div style={{ display: 'flex', gap: 12, overflow: 'auto', marginTop: 10, paddingRight: 20, paddingBottom: 4 }}>
              {[
                { n: 'Fiat 500e', p: 39, v: 'hatch', tone: 'colored' },
                { n: 'Audi A1', p: 55, v: 'sedan', tone: 'neutral' },
                { n: 'Mini', p: 58, v: 'hatch', tone: 'neutral' },
              ].map((c, i) => (
                <div key={i} style={{ minWidth: 130, flex: 'none' }}>
                  <div style={{ width: 130, height: 80, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                    <CarRender T={T} variant={c.v} tone={c.tone} />
                  </div>
                  <Txt T={T} size={12} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.n}</Txt>
                  <Price T={T} value={c.p} unit="/g" size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Suggerimento basato su città */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{
              padding: 14, background: T.surface,
              border: `1px solid ${T.line}`, borderRadius: T.r.md,
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: T.sh.soft,
            }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sparkle" size={18} color={T.green} T={T} />
              </span>
              <div style={{ flex: 1 }}>
                <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>Prova un'elettrica</Txt>
                <Txt T={T} size={11} color={T.ink2}>5 disponibili oggi a Milano</Txt>
              </div>
              <Icon name="chevron" size={16} color={T.ink2} T={T} />
            </div>
          </div>
        </div>
        <TabBar T={T} active="user" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────
// USER SIDEBAR (desktop reusable)
// ─────────────────────────────────────────────────────────
function UserSideNav({ T, active = 'panoramica' }) {
  const items = [
    { id: 'panoramica', l: 'Panoramica', i: 'home' },
    { id: 'prenotazioni', l: 'Prenotazioni', i: 'calendar', b: '2' },
    { id: 'salvati', l: 'Salvati', i: 'heart', b: '4' },
    { id: 'messaggi', l: 'Messaggi', i: 'chat', b: '1' },
    { id: 'profilo', l: 'Profilo', i: 'user' },
    { id: 'notifiche', l: 'Notifiche', i: 'bell' },
    { id: 'impostazioni', l: 'Impostazioni', i: 'settings' },
  ];
  return (
    <div style={{ padding: '24px 16px', borderRight: `1px solid ${T.line}`, background: T.surfaceAlt, height: '100%', boxSizing: 'border-box' }}>
      <div style={{
        padding: 14, background: T.surface, border: `1px solid ${T.line}`,
        borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12, boxShadow: T.sh.soft,
      }}>
        <Avatar T={T} name="Luca" size={42} tone="accent" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>Luca Bianchi</Txt>
          <Txt T={T} size={11} color={T.ink2}>membro da feb '25</Txt>
        </div>
      </div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: it.id === active ? T.accent : 'transparent',
            color: it.id === active ? T.ink1 : T.ink1,
            borderRadius: T.r.md, cursor: 'pointer',
            fontWeight: it.id === active ? 600 : 500,
          }}>
            <Icon name={it.i} size={17} color={T.ink1} T={T} />
            <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 14 }}>{it.l}</span>
            {it.b && <Badge T={T} tone={it.id === active ? 'dark' : 'neutral'}>{it.b}</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// USER DASHBOARD — DESKTOP
// ─────────────────────────────────────────────────────────
function UserDashboardDesktop({ T }) {
  return (
    <BrowserFrame T={T} url="noleggio.it/account">
      <div style={{ background: T.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <NavBar T={T} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden' }}>
          <UserSideNav T={T} active="panoramica" />
          <div style={{ padding: '28px 36px', overflow: 'hidden' }}>
            <Txt T={T} size={13} color={T.ink2}>Ciao,</Txt>
            <H T={T} size="h1" style={{ lineHeight: 1, marginTop: 2 }}>Luca 👋</H>

            {/* Active booking */}
            <div style={{
              marginTop: 24, background: T.accent, borderRadius: T.r.xl, padding: 24,
              boxShadow: T.sh.raised, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div style={{ width: 220, height: 140, borderRadius: T.r.lg, overflow: 'hidden' }}>
                <CarRender T={T} variant="hatch" tone="dark" />
              </div>
              <div style={{ flex: 1 }}>
                <Badge T={T} tone="dark">In arrivo · 5 giorni</Badge>
                <H T={T} size="h2" style={{ marginTop: 8, color: T.ink1 }}>VW Polo · 2022</H>
                <Txt T={T} size={14} color={T.ink1} style={{ display: 'block', marginTop: 4, opacity: 0.78 }}>
                  AutoLuca · Mer 18 giu — Dom 22 giu · 128€
                </Txt>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Button T={T} variant="primary" size="md" iconRight="arrowRight">Vedi dettagli</Button>
                  <Button T={T} variant="outline" size="md" icon="chat">Scrivi a AutoLuca</Button>
                  <Button T={T} variant="ghost" size="md" icon="pin">Ritiro: Sesto S.G.</Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 24 }}>
              {[
                { l: 'Prenotazioni', v: 9, s: 'totali' },
                { l: 'In arrivo', v: 2, s: 'prossimi 30 giorni' },
                { l: 'Auto salvate', v: 4, s: 'in 2 liste' },
                { l: 'Messaggi', v: 1, s: 'non letti' },
              ].map((s, i) => (
                <div key={i} style={{ padding: 18, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg }}>
                  <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Txt>
                  <Txt T={T} size={32} weight={600} style={{ display: 'block', marginTop: 6, fontFamily: T.fontDisplay, letterSpacing: '-0.02em' }}>{s.v}</Txt>
                  <Txt T={T} size={11} color={T.ink2}>{s.s}</Txt>
                </div>
              ))}
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22, marginTop: 24 }}>
              {/* Visti di recente */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <H T={T} size="h4">Visti di recente</H>
                  <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>tutti</Txt>
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { n: 'Fiat 500e', y: 2023, h: 'GreenCar', p: 39, v: 'hatch', tone: 'colored' },
                    { n: 'Audi A1', y: 2022, h: 'PremiumDrive', p: 55, v: 'sedan', tone: 'neutral' },
                    { n: 'Mini Cooper', y: 2023, h: 'PremiumDrive', p: 58, v: 'hatch', tone: 'neutral' },
                  ].map((r, i) => (
                    <div key={i} style={{ padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 100, height: 60, borderRadius: T.r.md, overflow: 'hidden' }}>
                        <CarRender T={T} variant={r.v} tone={r.tone} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{r.n} · {r.y}</Txt>
                        <Txt T={T} size={12} color={T.ink2}>{r.h}</Txt>
                      </div>
                      <Price T={T} value={r.p} unit="/g" size="md" weight={700} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Messages */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <H T={T} size="h4">Messaggi</H>
                  <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>chat</Txt>
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { f: 'AutoLuca', m: 'Ciao Luca, confermo per le 10:00. A presto!', t: '2h fa', b: true, tone: 'accent' },
                    { f: 'GreenCar', m: 'Tutto ok, ti aspetto giovedì. Porta solo la patente.', t: 'ieri', tone: undefined },
                  ].map((m, i) => (
                    <div key={i} style={{
                      padding: 14, background: m.b ? T.accentSoft : T.surface,
                      border: `1px solid ${m.b ? T.accent : T.line}`, borderRadius: T.r.lg,
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}>
                      <Avatar T={T} name={m.f} size={36} tone={m.tone} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Txt T={T} size={13} weight={600}>{m.f}</Txt>
                          <Txt T={T} size={11} color={T.ink2}>{m.t}</Txt>
                        </div>
                        <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.m}</Txt>
                      </div>
                      {m.b && <span style={{ width: 8, height: 8, borderRadius: 4, background: T.coral, marginTop: 6 }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────
// PRENOTAZIONI — MOBILE
// ─────────────────────────────────────────────────────────
function BookingsMobile({ T }) {
  const Status = ({ tone, children }) => <Badge T={T} tone={tone}>{children}</Badge>;
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 0' }}>
          <H T={T} size="h2">Prenotazioni</H>
        </div>
        <div style={{ padding: '18px 20px 0', display: 'flex', gap: 22, borderBottom: `1px solid ${T.line}` }}>
          {[
            { l: 'In arrivo', b: '2' },
            { l: 'In corso', b: '1' },
            { l: 'Storico', b: '7' },
          ].map((t, i) => (
            <div key={t.l} style={{
              padding: '0 0 12px', borderBottom: i === 0 ? `2px solid ${T.ink1}` : 'none', marginBottom: -1,
              display: 'inline-flex', gap: 6, alignItems: 'baseline',
            }}>
              <Txt T={T} size={14} weight={i === 0 ? 600 : 500} color={i === 0 ? T.ink1 : T.ink2}>{t.l}</Txt>
              <Txt T={T} size={11} color={T.ink3}>· {t.b}</Txt>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, bottom: 60, padding: '14px 20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { n: 'VW Polo', y: 2022, h: 'AutoLuca', d: 'Mer 18 — Dom 22 giu', dist: 'tra 5 giorni', s: 'Confermata', tone: 'success', p: 128, v: 'hatch', t: 'neutral', hot: true },
            { n: 'Fiat 500e', y: 2023, h: 'GreenCar', d: 'Ven 5 — Dom 7 lug', dist: 'tra 22 giorni', s: 'In attesa', tone: 'accent', p: 78, v: 'hatch', t: 'colored' },
          ].map((b, i) => (
            <div key={i} style={{ padding: 12, background: T.surface, border: `1px solid ${b.hot ? T.line : T.line}`, borderRadius: T.r.lg, boxShadow: T.sh.soft }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 110, flex: 'none' }}>
                  <div style={{ width: 110, height: 75, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                    <CarRender T={T} variant={b.v} tone={b.t} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.n} · {b.y}</Txt>
                      <Txt T={T} size={11} color={T.ink2}>{b.h}</Txt>
                    </div>
                    <Status tone={b.tone}>{b.s}</Status>
                  </div>
                  <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>{b.d}</Txt>
                  <Txt T={T} size={11} color={T.ink3} style={{ display: 'block' }}>{b.dist}</Txt>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}` }}>
                <Price T={T} value={b.p} unit="" size="md" weight={700} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button T={T} variant="ghost" size="sm" icon="chat" />
                  <Button T={T} variant="outline" size="sm" iconRight="chevron">Dettagli</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <TabBar T={T} active="book" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────
// SALVATI — MOBILE
// ─────────────────────────────────────────────────────────
function SavedMobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px 4px' }}>
          <H T={T} size="h2">Salvati</H>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>4 auto · 2 liste</Txt>
        </div>
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, overflow: 'auto' }}>
          <Chip T={T} active size="sm">Tutte · 4</Chip>
          <Chip T={T} size="sm">Milano weekend · 2</Chip>
          <Chip T={T} size="sm">Per Roma · 2</Chip>
          <Chip T={T} size="sm" icon="plus">Nuova lista</Chip>
        </div>
        <div style={{ position: 'absolute', top: 130, left: 0, right: 0, bottom: 60, overflow: 'hidden', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'flex-start' }}>
          {[
            { n: 'Fiat 500e', y: 2023, p: 39, v: 'hatch', t: 'colored' },
            { n: 'VW Polo', y: 2022, p: 32, v: 'hatch', t: 'neutral' },
            { n: 'Mini Cooper', y: 2023, p: 58, v: 'hatch', t: 'neutral' },
            { n: 'Tesla M3', y: 2024, p: 89, v: 'sedan', t: 'neutral' },
          ].map((c, i) => (
            <div key={i}>
              <div style={{ position: 'relative', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.3 / 1' }}>
                <CarRender T={T} variant={c.v} tone={c.t} />
                <button style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 26, height: 26, borderRadius: '50%', background: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: T.sh.soft,
                }}>
                  <Icon name="heartFill" size={13} color={T.coral} T={T} />
                </button>
              </div>
              <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.n} · {c.y}</Txt>
              <Price T={T} value={c.p} unit="/g" size="sm" />
            </div>
          ))}
        </div>
        <TabBar T={T} active="fav" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────
// PROFILO — DESKTOP
// ─────────────────────────────────────────────────────────
function ProfileDesktop({ T }) {
  return (
    <BrowserFrame T={T} url="noleggio.it/account/profilo">
      <div style={{ background: T.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <NavBar T={T} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden' }}>
          <UserSideNav T={T} active="profilo" />
          <div style={{ padding: '28px 36px', overflow: 'hidden' }}>
            <H T={T} size="h1">Il tuo profilo</H>
            <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>Tieni i dati aggiornati per prenotare più velocemente.</Txt>

            {/* Avatar + name */}
            <div style={{ marginTop: 26, padding: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 20, boxShadow: T.sh.soft }}>
              <Avatar T={T} name="Luca" size={72} tone="accent" />
              <div style={{ flex: 1 }}>
                <H T={T} size="h3">Luca Bianchi</H>
                <Txt T={T} size={13} color={T.ink2}>luca@email.it · membro da febbraio 2025</Txt>
              </div>
              <Button T={T} variant="outline" size="sm" icon="upload">Cambia foto</Button>
            </div>

            <H T={T} size="h4" style={{ marginTop: 32 }}>Dati personali</H>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <Input T={T} label="Nome" value="Luca" />
              <Input T={T} label="Cognome" value="Bianchi" />
              <Input T={T} label="Email" value="luca@email.it" suffix={<Badge T={T} tone="success" icon="check">Verif.</Badge>} />
              <Input T={T} label="Telefono" value="+39 333 1234567" suffix="non verif." />
              <Input T={T} label="Data di nascita" value="14/03/1992" icon="calendar" />
              <Input T={T} label="Città" value="Milano" icon="pin" />
            </div>

            <H T={T} size="h4" style={{ marginTop: 28 }}>Patente</H>
            <div style={{
              marginTop: 12, padding: 16, background: T.surface,
              border: `1px solid ${T.line}`, borderRadius: T.r.lg,
              display: 'flex', alignItems: 'center', gap: 16, boxShadow: T.sh.soft,
            }}>
              <div style={{ width: 120, height: 76, borderRadius: T.r.md, background: T.surfaceAlt, border: `1px solid ${T.line}`, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 76" preserveAspectRatio="xMidYMid meet">
                  <rect x="6" y="6" width="108" height="64" rx="6" fill={T.surface} stroke={T.line} strokeWidth="1"/>
                  <circle cx="24" cy="32" r="10" fill={T.accentSoft} />
                  <rect x="42" y="22" width="60" height="3" fill={T.ink2} opacity="0.4"/>
                  <rect x="42" y="30" width="40" height="2" fill={T.ink2} opacity="0.3"/>
                  <rect x="42" y="36" width="50" height="2" fill={T.ink2} opacity="0.3"/>
                  <rect x="14" y="56" width="80" height="6" fill={T.accent} rx="1"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>Categoria B · scade 03/2032</Txt>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Badge T={T} tone="accent" icon="check">In verifica</Badge>
                  <Txt T={T} size={11} color={T.ink2}>caricata feb '25</Txt>
                </div>
              </div>
              <Button T={T} variant="outline" size="sm" icon="upload">Sostituisci</Button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <Button T={T} variant="primary" size="md">Salva modifiche</Button>
              <Button T={T} variant="ghost" size="md">Annulla</Button>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

Object.assign(window, {
  LoginMobile, LoginDesktop,
  UserDashboardMobile, UserDashboardDesktop,
  BookingsMobile, SavedMobile, ProfileDesktop,
  UserSideNav,
});
