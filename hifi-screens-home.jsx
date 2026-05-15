// hifi-screens-home.jsx — Home V1 hi-fi, theme-aware

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
  PhoneFrame, BrowserFrame, TabBar } = window;

// ─────────────────────────────────────────────────────────
// HEADER DESKTOP
// ─────────────────────────────────────────────────────────
function NavBar({ T, active = 'Esplora' }) {
  const items = ['Esplora', 'Mappa', 'Per noleggiatori', 'Aiuto'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 40px',
      borderBottom: `1px solid ${T.line}`,
      background: T.bg,
    }}>
      <Logo T={T} size={22} />
      <div style={{ display: 'flex', gap: 28 }}>
        {items.map(i => (
          <span key={i} style={{
            fontFamily: T.fontBody, fontSize: 14,
            fontWeight: i === active ? 600 : 500,
            color: i === active ? T.ink1 : T.ink2,
            position: 'relative', paddingBottom: 4,
            borderBottom: i === active && T.name === 'Lustro' ? `2px solid ${T.ink1}` : 'none',
          }}>{i}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Txt T={T} size={14} weight={500}>Accedi</Txt>
        <Button T={T} variant="primary" size="sm">Registrati</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HOME V1 — DESKTOP
// ─────────────────────────────────────────────────────────
function HomeV1Desktop({ T }) {
  return (
    <BrowserFrame T={T} url="noleggio.it">
      <div style={{ background: T.bg, height: '100%', overflow: 'hidden' }}>
        <NavBar T={T} active="Esplora" />
        <div style={{ padding: '56px 40px 40px', position: 'relative' }}>
          {/* Hero headline */}
          <div style={{ maxWidth: 780 }}>
            <Badge T={T} tone="accent" icon="sparkle">183 auto disponibili a Milano</Badge>
            <H T={T} size="display" style={{ marginTop: 16 }}>
              {T.name === 'Lustro' ? (
                <>L'auto giusta. <span style={{ fontStyle: 'italic', color: T.accent }}>Vicino a te.</span></>
              ) : (
                <>L'auto giusta. <span style={{ background: T.accent, padding: '0 12px', borderRadius: 8 }}>Vicino a te.</span></>
              )}
            </H>
            <Txt T={T} size={16} color={T.ink2} style={{ marginTop: 14, display: 'block', maxWidth: 560 }}>
              Aggregatore di noleggiatori privati indipendenti in tutta Italia. Senza intermediari, senza sovrapprezzi.
            </Txt>
          </div>

          {/* Search bar */}
          <div style={{
            marginTop: 36, background: T.surface,
            border: `1px solid ${T.line}`,
            borderRadius: T.r.lg, padding: 8,
            boxShadow: T.sh.raised,
            display: 'flex', alignItems: 'stretch', gap: 0,
            maxWidth: 980,
          }}>
            <SearchField T={T} label="Dove" value="Milano, MI" icon="pin" flex={1.5} />
            <Divider T={T} />
            <SearchField T={T} label="Ritiro" value="Mer 18 giu · 10:00" icon="calendar" flex={1.3} />
            <Divider T={T} />
            <SearchField T={T} label="Riconsegna" value="Dom 22 giu · 18:00" icon="calendar" flex={1.3} />
            <Divider T={T} />
            <SearchField T={T} label="Tipo" value="Tutte le categorie" suffix="▾" flex={1.1} />
            <Button T={T} variant="accent" size="lg" icon="search" style={{ marginLeft: 8 }}>Cerca</Button>
          </div>
          <Txt T={T} size={13} color={T.ink3} style={{ marginTop: 14, display: 'block' }}>
            Cercato spesso: <span style={{ color: T.ink1, fontWeight: 500, textDecoration: 'underline' }}>Roma centro</span> · <span style={{ color: T.ink1, fontWeight: 500, textDecoration: 'underline' }}>Catania aeroporto</span> · <span style={{ color: T.ink1, fontWeight: 500, textDecoration: 'underline' }}>Bolzano</span> · <span style={{ color: T.ink1, fontWeight: 500, textDecoration: 'underline' }}>Bari</span>
          </Txt>

          {/* Categories */}
          <div style={{ marginTop: 52 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <H T={T} size="h3">Esplora per categoria</H>
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>vedi tutte <Icon name="chevron" size={13} color={T.ink2} T={T} /></Txt>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginTop: 20 }}>
              {[
                { l: 'Citycar', from: 25, v: 'hatch', tone: 'colored' },
                { l: 'SUV', from: 45, v: 'suv', tone: 'neutral' },
                { l: 'Elettrica', from: 38, v: 'hatch', tone: 'colored' },
                { l: 'Cabrio', from: 65, v: 'sedan', tone: 'neutral' },
                { l: 'Furgone', from: 55, v: 'suv', tone: 'neutral' },
                { l: 'Lungo termine', from: 590, v: 'sedan', tone: 'neutral', unit: '/mese' },
              ].map((c, i) => (
                <div key={c.l} style={{ cursor: 'pointer' }}>
                  <div style={{ borderRadius: T.r.md, overflow: 'hidden', aspectRatio: '1.3 / 1', border: `1px solid ${T.line}` }}>
                    <CarRender T={T} variant={c.v} tone={c.tone} height="100%" />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Txt T={T} size={14} weight={600}>{c.l}</Txt>
                    <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>da {c.from}€{c.unit || '/giorno'}</Txt>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

function SearchField({ T, label, value, icon, suffix, flex = 1 }) {
  return (
    <div style={{ flex, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', borderRadius: T.r.md, minWidth: 0 }}>
      <span style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <Icon name={icon} size={14} color={T.ink2} T={T} />}
        <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: T.ink1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        {suffix && <span style={{ fontSize: 11, color: T.ink3 }}>{suffix}</span>}
      </span>
    </div>
  );
}

function Divider({ T }) {
  return <span style={{ width: 1, alignSelf: 'stretch', background: T.line, margin: '6px 0' }} />;
}

// ─────────────────────────────────────────────────────────
// HOME V1 — MOBILE
// ─────────────────────────────────────────────────────────
function HomeV1Mobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 8px' }}>
          <Logo T={T} size={18} />
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Icon name="bell" size={22} color={T.ink1} T={T} />
            <Avatar T={T} name="L" size={32} tone="accent" />
          </div>
        </div>

        <div style={{ overflow: 'hidden', height: 'calc(100% - 116px)' }}>
          {/* Hero */}
          <div style={{ padding: '18px 18px 4px' }}>
            <Badge T={T} tone="accent" icon="sparkle">183 auto vicino a te</Badge>
            <H T={T} size="h2" style={{ marginTop: 10 }}>
              {T.name === 'Lustro' ? (
                <>L'auto giusta. <span style={{ fontStyle: 'italic', color: T.accent }}>Vicino a te.</span></>
              ) : (
                <>L'auto giusta.<br/><span style={{ background: T.accent, padding: '0 8px', borderRadius: 6 }}>Vicino a te.</span></>
              )}
            </H>
          </div>

          {/* Search card */}
          <div style={{ padding: '18px' }}>
            <div style={{
              background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.lg, padding: 10, boxShadow: T.sh.soft,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <SearchField T={T} label="Dove" value="Milano" icon="pin" />
              <div style={{ height: 1, background: T.line, margin: '0 14px' }} />
              <SearchField T={T} label="Quando" value="18 — 22 giugno" icon="calendar" />
              <Button T={T} variant="accent" size="lg" icon="search" full style={{ marginTop: 4 }}>Trova un'auto</Button>
            </div>
          </div>

          {/* Categories */}
          <div style={{ padding: '4px 0 12px 18px' }}>
            <H T={T} size="h4" style={{ marginBottom: 12 }}>Categorie</H>
            <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18, paddingBottom: 4 }}>
              {[
                { l: 'Citycar', from: 25, v: 'hatch', tone: 'colored' },
                { l: 'SUV', from: 45, v: 'suv', tone: 'neutral' },
                { l: 'Elettrica', from: 38, v: 'hatch', tone: 'colored' },
                { l: 'Cabrio', from: 65, v: 'sedan', tone: 'neutral' },
                { l: 'Furgone', from: 55, v: 'suv', tone: 'neutral' },
              ].map((c, i) => (
                <div key={c.l} style={{ minWidth: 110, flex: 'none' }}>
                  <div style={{ width: 110, height: 80, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                    <CarRender T={T} variant={c.v} tone={c.tone} />
                  </div>
                  <Txt T={T} size={12} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.l}</Txt>
                  <Txt T={T} size={11} color={T.ink2}>da {c.from}€/g</Txt>
                </div>
              ))}
            </div>
          </div>

          {/* Vicino a te */}
          <div style={{ padding: '8px 0 16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 18 }}>
              <H T={T} size="h4">Vicino a te · Milano</H>
              <Txt T={T} size={12} color={T.ink2}>vedi tutte</Txt>
            </div>
            <div style={{ display: 'flex', gap: 12, overflow: 'auto', marginTop: 10, paddingRight: 18, paddingBottom: 4 }}>
              {[
                { n: 'VW Polo', y: 2022, p: 32, v: 'hatch', tone: 'neutral' },
                { n: 'Fiat 500e', y: 2023, p: 39, v: 'hatch', tone: 'colored' },
                { n: 'Renault Clio', y: 2023, p: 42, v: 'hatch', tone: 'neutral' },
              ].map((c, i) => (
                <div key={i} style={{ minWidth: 150, flex: 'none' }}>
                  <div style={{ width: 150, height: 100, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
                    <CarRender T={T} variant={c.v} tone={c.tone} />
                    <button style={{
                      position: 'absolute', top: 6, right: 6, border: 'none',
                      width: 26, height: 26, borderRadius: '50%', background: T.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                      <Icon name="heart" size={14} color={T.ink1} T={T} />
                    </button>
                  </div>
                  <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.n} · {c.y}</Txt>
                  <Price T={T} value={c.p} unit="/giorno" size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <TabBar T={T} active="home" />
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, { HomeV1Desktop, HomeV1Mobile, NavBar });
