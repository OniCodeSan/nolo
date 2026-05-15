// hifi-screens-listing.jsx — Listing V2 + V1 toggle + stato iniziale

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
  PhoneFrame, BrowserFrame, TabBar, NavBar } = window;

// ─────────────────────────────────────────────────────────
// MapBg — sfondo mappa hi-fi
// ─────────────────────────────────────────────────────────
function MapBg({ T, density = 'normal' }) {
  const bg = T.name === 'Lustro' ? '#F0EEE8' : '#EFEAD8';
  const road = T.name === 'Lustro' ? '#FFFFFF' : '#FFFCF2';
  const roadStroke = T.name === 'Lustro' ? '#D5D2CB' : '#D8D0B6';
  const park = T.name === 'Lustro' ? '#D7DEC7' : '#C8D4B0';
  const water = T.name === 'Lustro' ? '#D6E1ED' : '#CFDDE9';
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        {/* parks */}
        <path d="M 540 60 Q 640 70 660 160 Q 640 230 540 220 L 510 180 Z" fill={park} />
        <circle cx="220" cy="450" r="60" fill={park} />
        {/* water */}
        <path d="M 0 500 Q 200 480 380 510 T 800 480 L 800 600 L 0 600 Z" fill={water} />
        {/* main roads */}
        <g stroke={roadStroke} fill={road}>
          <path d="M 0 200 Q 200 180 380 220 T 800 190" strokeWidth="14" fill="none" stroke={road} />
          <path d="M 0 200 Q 200 180 380 220 T 800 190" strokeWidth="15" fill="none" stroke={roadStroke} opacity="0.4" />
          <path d="M 0 380 Q 250 360 460 390 T 800 360" strokeWidth="14" fill="none" stroke={road} />
          <path d="M 0 380 Q 250 360 460 390 T 800 360" strokeWidth="15" fill="none" stroke={roadStroke} opacity="0.4" />
          <path d="M 200 0 Q 220 200 240 380 T 220 600" strokeWidth="10" fill="none" stroke={road} />
          <path d="M 200 0 Q 220 200 240 380 T 220 600" strokeWidth="11" fill="none" stroke={roadStroke} opacity="0.4" />
          <path d="M 500 0 Q 530 200 560 400 T 540 600" strokeWidth="10" fill="none" stroke={road} />
          <path d="M 500 0 Q 530 200 560 400 T 540 600" strokeWidth="11" fill="none" stroke={roadStroke} opacity="0.4" />
        </g>
        {/* small streets */}
        <g stroke={roadStroke} strokeWidth="3" fill="none" opacity="0.6">
          <path d="M 80 100 L 320 130" />
          <path d="M 380 280 L 600 300" />
          <path d="M 420 80 L 480 320" />
          <path d="M 100 280 L 280 470" />
          <path d="M 600 460 L 780 440" />
        </g>
        {/* buildings (subtle) */}
        <g fill={T.name === 'Lustro' ? '#E5E2D9' : '#E0D7B8'} opacity="0.7">
          <rect x="80" y="240" width="60" height="60" />
          <rect x="150" y="260" width="40" height="40" />
          <rect x="320" y="280" width="50" height="50" />
          <rect x="380" y="430" width="60" height="40" />
          <rect x="600" y="280" width="50" height="60" />
          <rect x="660" y="240" width="40" height="80" />
        </g>
      </svg>
    </div>
  );
}

function MapPin({ T, x, y, price, hot, big, host }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)' }}>
      <div style={{
        background: hot ? T.ink1 : T.surface,
        color: hot ? '#fff' : T.ink1,
        border: `1.4px solid ${hot ? T.ink1 : T.line}`,
        borderRadius: T.r.pill,
        padding: big ? '6px 14px' : '4px 10px',
        fontFamily: T.fontBody, fontWeight: 600, fontSize: big ? 14 : 12,
        boxShadow: T.sh.raised,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}>
        {price}€
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%) rotate(45deg)',
        width: 8, height: 8, background: hot ? T.ink1 : T.surface,
        borderRight: `1.4px solid ${hot ? T.ink1 : T.line}`,
        borderBottom: `1.4px solid ${hot ? T.ink1 : T.line}`,
        marginTop: -4,
      }} />
    </div>
  );
}

// Vehicle card for listings
function VehicleCard({ T, name, year, host, loc, price, kw = [], hot, layout = 'grid', tone, variant = 'hatch' }) {
  const photo = (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: layout === 'list' ? T.r.md : `${T.r.lg}px ${T.r.lg}px 0 0`, border: `1px solid ${T.line}`, borderBottom: layout === 'list' ? `1px solid ${T.line}` : 'none', aspectRatio: layout === 'list' ? '1.4 / 1' : '1.5 / 1' }}>
      <CarRender T={T} variant={variant} tone={tone} />
      <button style={{
        position: 'absolute', top: 8, right: 8, border: 'none', cursor: 'pointer',
        width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: T.sh.soft,
      }}>
        <Icon name="heart" size={15} color={T.ink1} T={T} />
      </button>
      {hot && (
        <span style={{ position: 'absolute', top: 8, left: 8 }}>
          <Badge T={T} tone="dark" icon="bolt">Disp. ora</Badge>
        </span>
      )}
    </div>
  );
  const body = (
    <div style={{ padding: layout === 'list' ? 12 : 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name} · {year}</Txt>
          <Txt T={T} size={12} color={T.ink2}>{host} · {loc}</Txt>
        </div>
        <Rating T={T} value={4.8} size={12} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {kw.slice(0, 3).map(k => <Chip T={T} key={k} size="sm">{k}</Chip>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
        <Price T={T} value={price} unit="/giorno" size="md" weight={700} />
      </div>
    </div>
  );
  if (layout === 'list') {
    return (
      <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, padding: 10, display: 'flex', gap: 10, boxShadow: T.sh.soft }}>
        <div style={{ width: 120, flex: 'none' }}>{photo}</div>
        <div style={{ flex: 1, padding: '4px 4px 4px 0' }}>{body}</div>
      </div>
    );
  }
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, overflow: 'hidden', boxShadow: T.sh.soft, cursor: 'pointer' }}>
      {photo}
      {body}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILTER BAR (chip row)
// ─────────────────────────────────────────────────────────
function FilterBar({ T }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflow: 'hidden' }}>
      <Button T={T} variant="outline" size="sm" icon="sliders">Filtri · 2</Button>
      <Chip T={T} active onClose>Sotto 50€</Chip>
      <Chip T={T} active onClose>Cambio auto.</Chip>
      <Chip T={T}>Elettrica</Chip>
      <Chip T={T}>SUV</Chip>
      <Chip T={T}>5+ posti</Chip>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LISTING — DESKTOP (state: 'split' | 'list' | 'initial')
// ─────────────────────────────────────────────────────────
function ListingDesktop({ T, state = 'split' }) {
  return (
    <BrowserFrame T={T} url={state === 'initial' ? 'noleggio.it/cerca' : 'noleggio.it/cerca?l=milano&d=18-22giu'}>
      <div style={{ background: T.bg, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <NavBar T={T} active="Esplora" />
        {/* search ribbon */}
        <div style={{ padding: '14px 40px', borderBottom: `1px solid ${T.line}`, background: T.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'stretch', flex: 1, maxWidth: 720,
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.lg, padding: 4, boxShadow: T.sh.soft,
          }}>
            <SearchFieldCompact T={T} value="Milano" icon="pin" />
            <span style={{ width: 1, alignSelf: 'stretch', background: T.line, margin: '4px 0' }} />
            <SearchFieldCompact T={T} value="18 — 22 giu" icon="calendar" />
            <span style={{ width: 1, alignSelf: 'stretch', background: T.line, margin: '4px 0' }} />
            <SearchFieldCompact T={T} value="Tutte" suffix="▾" />
            <Button T={T} variant="primary" size="sm" icon="search" style={{ marginLeft: 4 }}>Cerca</Button>
          </div>
          <div style={{ flex: 1 }} />
          <Txt T={T} size={13} color={T.ink2}>
            {state === 'initial' ? 'imposta date e luogo' : '183 risultati'}
          </Txt>
          <div style={{ display: 'flex', background: T.surfaceAlt, padding: 3, borderRadius: T.r.pill, border: `1px solid ${T.line}` }}>
            <ToggleBtn T={T} icon="grid" active={state === 'list'} label="Lista" />
            <ToggleBtn T={T} icon="map" active={state === 'split'} label="Lista + Mappa" />
          </div>
        </div>
        {/* filter row */}
        {state !== 'initial' && (
          <div style={{ padding: '12px 40px', borderBottom: `1px solid ${T.line}` }}>
            <FilterBar T={T} />
          </div>
        )}

        {state === 'initial' ? (
          <InitialState T={T} layout="desktop" />
        ) : state === 'list' ? (
          <ListLayoutDesktop T={T} />
        ) : (
          <SplitLayoutDesktop T={T} />
        )}
      </div>
    </BrowserFrame>
  );
}

function SearchFieldCompact({ T, value, icon, suffix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', minWidth: 0 }}>
      {icon && <Icon name={icon} size={14} color={T.ink2} T={T} />}
      <Txt T={T} size={13} weight={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</Txt>
      {suffix && <Txt T={T} size={11} color={T.ink3}>{suffix}</Txt>}
    </div>
  );
}

function ToggleBtn({ T, icon, active, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
      background: active ? T.surface : 'transparent',
      color: active ? T.ink1 : T.ink2,
      border: active ? `1px solid ${T.line}` : '1px solid transparent',
      borderRadius: T.r.pill,
      boxShadow: active ? T.sh.soft : 'none',
      cursor: 'pointer',
    }}>
      <Icon name={icon} size={13} T={T} color="currentColor" /> {label}
    </span>
  );
}

// SPLIT layout (V2): list + map
function SplitLayoutDesktop({ T }) {
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ overflow: 'hidden', padding: '20px 24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <Txt T={T} size={13} color={T.ink2}>Ordinati per <span style={{ color: T.ink1, fontWeight: 600 }}>prezzo crescente</span> ▾</Txt>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { n: 'VW Polo', y: 2022, h: 'AutoLuca', l: 'Sesto S.G.', p: 32, k: ['1.0 TSI', 'Manuale'], hot: true, v: 'hatch', tone: 'neutral' },
            { n: 'Fiat 500e', y: 2023, h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica', 'Auto'], v: 'hatch', tone: 'colored' },
            { n: 'Renault Clio', y: 2023, h: 'CarHub MI', l: 'Centrale', p: 42, k: ['Hybrid'], hot: true, v: 'hatch', tone: 'neutral' },
            { n: 'Citroën C3', y: 2021, h: 'AutoLuca', l: 'Sesto', p: 28, k: ['Diesel'], v: 'hatch', tone: 'neutral' },
          ].map((c, i) => <VehicleCard T={T} key={i} {...c} kw={c.k} />)}
        </div>
      </div>
      <div style={{ position: 'relative', overflow: 'hidden', borderLeft: `1px solid ${T.line}` }}>
        <MapBg T={T} />
        <MapPin T={T} x={170} y={150} price={32} hot big />
        <MapPin T={T} x={320} y={200} price={39} />
        <MapPin T={T} x={250} y={300} price={42} />
        <MapPin T={T} x={380} y={260} price={28} />
        <MapPin T={T} x={460} y={400} price={55} />
        <MapPin T={T} x={300} y={420} price={44} />
        <MapPin T={T} x={500} y={150} price={36} />
        <MapPin T={T} x={550} y={350} price={89} />
        {/* zoom controls */}
        <div style={{ position: 'absolute', top: 16, right: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, boxShadow: T.sh.soft, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <button style={{ width: 36, height: 36, border: 'none', borderBottom: `1px solid ${T.line}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={14} T={T} /></button>
          <button style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ width: 12, height: 1.5, background: T.ink1 }} /></button>
        </div>
        {/* search-this-area floating */}
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}>
          <Button T={T} variant="secondary" size="sm" icon="search">Cerca in questa area</Button>
        </div>
      </div>
    </div>
  );
}

// LIST layout (V1)
function ListLayoutDesktop({ T }) {
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 0, overflow: 'hidden' }}>
      {/* sidebar filters */}
      <div style={{ padding: '20px 24px', borderRight: `1px solid ${T.line}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <H T={T} size="h4">Filtri</H>
          <Txt T={T} size={12} color={T.ink2} style={{ textDecoration: 'underline' }}>azzera</Txt>
        </div>
        <FilterGroup T={T} title="Prezzo / giorno">
          <div style={{ position: 'relative', height: 26, marginTop: 6 }}>
            <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: T.line, borderRadius: 1 }} />
            <div style={{ position: 'absolute', top: 12, left: '20%', right: '40%', height: 2, background: T.ink1, borderRadius: 1 }} />
            <div style={{ position: 'absolute', top: 5, left: '20%', width: 16, height: 16, borderRadius: 8, background: T.surface, border: `1.5px solid ${T.ink1}`, boxShadow: T.sh.soft }} />
            <div style={{ position: 'absolute', top: 5, left: '60%', width: 16, height: 16, borderRadius: 8, background: T.surface, border: `1.5px solid ${T.ink1}`, boxShadow: T.sh.soft }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <Txt T={T} size={11} color={T.ink2}>25€</Txt>
            <Txt T={T} size={11} color={T.ink2}>80€</Txt>
          </div>
        </FilterGroup>
        <FilterGroup T={T} title="Carburante">
          {['Benzina', 'Diesel', 'Hybrid', 'Elettrica', 'GPL'].map((f, i) => (
            <CheckRow T={T} key={f} label={f} count={[42, 31, 28, 12, 8][i]} checked={i === 2 || i === 3} />
          ))}
        </FilterGroup>
        <FilterGroup T={T} title="Cambio">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip T={T} active size="sm">Tutti</Chip>
            <Chip T={T} size="sm">Manuale</Chip>
            <Chip T={T} size="sm">Auto</Chip>
          </div>
        </FilterGroup>
      </div>
      {/* grid */}
      <div style={{ overflow: 'hidden', padding: '20px 40px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <Txt T={T} size={13} color={T.ink2}>Ordinati per <span style={{ color: T.ink1, fontWeight: 600 }}>prezzo crescente</span> ▾</Txt>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { n: 'VW Polo', y: 2022, h: 'AutoLuca', l: 'Sesto S.G.', p: 32, k: ['1.0 TSI', 'Manuale'], hot: true, v: 'hatch', tone: 'neutral' },
            { n: 'Fiat 500e', y: 2023, h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica', 'Auto'], v: 'hatch', tone: 'colored' },
            { n: 'Renault Clio', y: 2023, h: 'CarHub MI', l: 'Centrale', p: 42, k: ['Hybrid'], hot: true, v: 'hatch', tone: 'neutral' },
            { n: 'Citroën C3', y: 2021, h: 'AutoLuca', l: 'Sesto', p: 28, k: ['Diesel'], v: 'hatch', tone: 'neutral' },
            { n: 'Audi A1', y: 2022, h: 'PremiumDrive', l: 'Brera', p: 55, k: ['Auto', 'Benz'], v: 'sedan', tone: 'neutral' },
            { n: 'Peugeot 208', y: 2023, h: 'CarHub MI', l: 'Centrale', p: 36, k: ['Hybrid'], hot: true, v: 'hatch', tone: 'neutral' },
          ].map((c, i) => <VehicleCard T={T} key={i} {...c} kw={c.k} />)}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ T, title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>{title}</Txt>
      {children}
    </div>
  );
}

function CheckRow({ T, label, count, checked }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <span style={{
        width: 16, height: 16, borderRadius: T.r.sm / 2,
        border: `1.5px solid ${checked ? T.ink1 : T.line}`,
        background: checked ? T.ink1 : T.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
      }}>
        {checked && <Icon name="check" size={11} color="#fff" T={T} stroke={2} />}
      </span>
      <Txt T={T} size={13} style={{ flex: 1 }}>{label}</Txt>
      <Txt T={T} size={11} color={T.ink3}>{count}</Txt>
    </div>
  );
}

// INITIAL STATE — nearest rentals shown
function InitialState({ T, layout = 'desktop' }) {
  const nearestHosts = [
    { n: 'AutoLuca', cars: 12, dist: '1.4 km', rating: 4.9 },
    { n: 'GreenCar MI', cars: 8, dist: '2.1 km', rating: 4.8 },
    { n: 'CarHub Milano', cars: 24, dist: '2.8 km', rating: 4.7 },
    { n: 'PremiumDrive', cars: 6, dist: '3.5 km', rating: 4.9 },
  ];
  const cars = [
    { n: 'VW Polo', y: 2022, h: 'AutoLuca', l: '1.4 km', p: 32, k: ['1.0 TSI'], v: 'hatch', tone: 'neutral' },
    { n: 'Fiat 500e', y: 2023, h: 'GreenCar', l: '2.1 km', p: 39, k: ['Elettrica'], hot: true, v: 'hatch', tone: 'colored' },
    { n: 'Renault Clio', y: 2023, h: 'CarHub', l: '2.8 km', p: 42, k: ['Hybrid'], v: 'hatch', tone: 'neutral' },
    { n: 'Audi A1', y: 2022, h: 'PremiumDrive', l: '3.5 km', p: 55, k: ['Auto'], v: 'sedan', tone: 'neutral' },
  ];
  if (layout === 'mobile') {
    return (
      <div style={{ flex: 1, overflow: 'hidden', padding: '8px 0 0' }}>
        <div style={{ padding: '0 18px 12px' }}>
          <Badge T={T} tone="accent" icon="pin">Posizione attuale · Milano</Badge>
          <H T={T} size="h3" style={{ marginTop: 8, lineHeight: 1.1 }}>
            {T.name === 'Lustro' ? <em style={{ color: T.accent, fontStyle: 'italic' }}>Noleggiatori</em> : 'Noleggiatori'} vicino a te
          </H>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
            Imposta date e città per cercare. Intanto, ecco chi è qui vicino.
          </Txt>
        </div>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearestHosts.slice(0, 2).map((h, i) => (
            <HostMiniCard T={T} key={i} host={h} />
          ))}
        </div>
        <div style={{ padding: '18px 18px 8px' }}>
          <H T={T} size="h4">Auto vicine</H>
        </div>
        <div style={{ padding: '0 0 0 18px', display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18, paddingBottom: 6 }}>
          {cars.map((c, i) => (
            <div key={i} style={{ minWidth: 200, flex: 'none' }}>
              <VehicleCard T={T} {...c} kw={c.k} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: '24px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      <div>
        <Badge T={T} tone="accent" icon="pin">Posizione attuale · Milano</Badge>
        <H T={T} size="h2" style={{ marginTop: 12 }}>
          {T.name === 'Lustro' ? <em style={{ color: T.accent, fontStyle: 'italic' }}>Noleggiatori</em> : 'Noleggiatori'} vicino a te
        </H>
        <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 8, maxWidth: 460 }}>
          Imposta date e città per cercare. Intanto, ecco chi opera vicino a te — pronto a darti un'auto quando ti serve.
        </Txt>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {nearestHosts.map((h, i) => <HostMiniCard T={T} key={i} host={h} />)}
        </div>
      </div>
      <div>
        <Txt T={T} size={13} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>Auto disponibili oggi</Txt>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {cars.map((c, i) => <VehicleCard T={T} key={i} {...c} kw={c.k} />)}
        </div>
      </div>
    </div>
  );
}

function HostMiniCard({ T, host }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 14, background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, boxShadow: T.sh.soft, cursor: 'pointer',
    }}>
      <Avatar T={T} name={host.n} size={48} tone={host.n.includes('Green') ? 'accent' : undefined} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Txt T={T} size={15} weight={600} style={{ display: 'block' }}>{host.n}</Txt>
        <Txt T={T} size={12} color={T.ink2}>
          <Rating T={T} value={host.rating} size={11} color={T.ink2} /> · {host.cars} auto · a {host.dist}
        </Txt>
      </div>
      <Icon name="chevron" size={18} color={T.ink2} T={T} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LISTING — MOBILE (state: 'split' | 'list' | 'initial')
// ─────────────────────────────────────────────────────────
function ListingMobile({ T, state = 'split' }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        {/* Header with search */}
        <div style={{ padding: '8px 14px 10px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
              <Icon name="chevronLeft" size={20} color={T.ink1} T={T} />
            </button>
            <div style={{
              flex: 1, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.pill, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: T.sh.soft,
            }}>
              <Icon name="search" size={14} color={T.ink2} T={T} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Txt T={T} size={13} weight={600} style={{ display: 'block', lineHeight: 1 }}>
                  {state === 'initial' ? 'Cerca…' : 'Milano · 18-22 giu'}
                </Txt>
                {state !== 'initial' && (
                  <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1 }}>
                    Tutte le auto
                  </Txt>
                )}
              </div>
              <Icon name="sliders" size={16} color={T.ink1} T={T} />
            </div>
          </div>
          {state !== 'initial' && (
            <>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, overflow: 'auto', paddingBottom: 2 }}>
                <Chip T={T} active size="sm" icon="check">Sotto 50€</Chip>
                <Chip T={T} size="sm">Elettrica</Chip>
                <Chip T={T} size="sm">Auto.</Chip>
                <Chip T={T} size="sm">SUV</Chip>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Txt T={T} size={12} weight={600}>183 risultati</Txt>
                <div style={{ display: 'flex', background: T.surfaceAlt, padding: 3, borderRadius: T.r.pill }}>
                  <ToggleBtn T={T} icon="grid" active={state === 'list'} label="Lista" />
                  <ToggleBtn T={T} icon="map" active={state === 'split'} label="Mappa" />
                </div>
              </div>
            </>
          )}
        </div>

        {state === 'initial' ? (
          <InitialState T={T} layout="mobile" />
        ) : state === 'list' ? (
          <div style={{ overflow: 'hidden', padding: '14px 14px 64px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { n: 'VW Polo', y: 2022, h: 'AutoLuca', l: 'Sesto S.G.', p: 32, k: ['1.0 TSI', 'Manuale'], hot: true, v: 'hatch', tone: 'neutral' },
              { n: 'Fiat 500e', y: 2023, h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica'], v: 'hatch', tone: 'colored' },
              { n: 'Renault Clio', y: 2023, h: 'CarHub MI', l: 'Centrale', p: 42, k: ['Hybrid'], hot: true, v: 'hatch', tone: 'neutral' },
            ].map((c, i) => <VehicleCard T={T} key={i} {...c} kw={c.k} layout="list" />)}
          </div>
        ) : (
          <SplitMobileLayout T={T} />
        )}
        <TabBar T={T} active="search" />
      </div>
    </PhoneFrame>
  );
}

function SplitMobileLayout({ T }) {
  return (
    <div style={{ position: 'absolute', top: 140, left: 0, right: 0, bottom: 60, overflow: 'hidden' }}>
      {/* map top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '46%', overflow: 'hidden' }}>
        <MapBg T={T} />
        <MapPin T={T} x={80} y={60} price={32} />
        <MapPin T={T} x={180} y={100} price={49} hot big />
        <MapPin T={T} x={260} y={70} price={55} />
        <MapPin T={T} x={120} y={160} price={38} />
        <MapPin T={T} x={220} y={180} price={42} />
        <MapPin T={T} x={300} y={200} price={36} />
      </div>
      {/* sheet bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, top: '44%',
        background: T.bg,
        borderTop: `1px solid ${T.line}`,
        borderTopLeftRadius: T.r.xl, borderTopRightRadius: T.r.xl,
        padding: '8px 14px 12px',
        boxShadow: T.sh.deep,
        overflow: 'hidden',
      }}>
        <div style={{ width: 40, height: 4, background: T.line, borderRadius: 2, margin: '0 auto 10px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { n: 'VW Polo', y: 2022, h: 'AutoLuca', l: 'Sesto', p: 32, k: ['1.0 TSI'], hot: true, v: 'hatch', tone: 'neutral' },
            { n: 'Fiat 500e', y: 2023, h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica'], v: 'hatch', tone: 'colored' },
          ].map((c, i) => <VehicleCard T={T} key={i} {...c} kw={c.k} layout="list" />)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ListingDesktop, ListingMobile, MapBg, MapPin, VehicleCard });
