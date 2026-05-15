// proto-screens.jsx — Screens del prototipo (mobile-first)
// Tutti gli screen ricevono { T, state, nav, set } via props.

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
  PhoneFrame, TabBar, NavBar } = window;
const { CATEGORIES, HOSTS, CARS, NEAREST_HOSTS, LOCATIONS, RECENT_LOCATIONS, REVIEWS } = window;

// ─────────────────────────────────────────────────────────
// HEADER — riusabile
// ─────────────────────────────────────────────────────────
function ScreenHeader({ T, title, onBack, right, sticky }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px',
      background: T.bg,
      borderBottom: sticky ? `1px solid ${T.line}` : 'none',
      position: sticky ? 'sticky' : 'static',
      top: 0, zIndex: 5,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 6,
          margin: '-6px 0 -6px -6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
        </button>
      )}
      {title && <H T={T} size="h5" style={{ flex: 1 }}>{title}</H>}
      {right}
    </div>
  );
}

// Format a date range as "18 — 22 giu"
function formatDates(from, to) {
  if (!from || !to) return null;
  const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  if (from.m === to.m) return `${from.d} — ${to.d} ${months[from.m]}`;
  return `${from.d} ${months[from.m]} — ${to.d} ${months[to.m]}`;
}

function daysBetween(a, b) {
  // simple — same month assumption mostly; fallback to 1
  if (!a || !b) return 1;
  if (a.m === b.m) return Math.max(1, b.d - a.d);
  // hack: ~30 days per month difference
  return Math.max(1, (b.m - a.m) * 30 + b.d - a.d);
}

// ─────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────
function HomeScreen({ T, state, nav, set }) {
  const dateLabel = formatDates(state.search.from, state.search.to);
  return (
    <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo T={T} size={18} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Icon name="bell" size={22} color={T.ink1} T={T} />
          <Avatar T={T} name="L" size={32} tone="accent" />
        </div>
      </div>

      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 60, overflow: 'auto' }}>
        <div style={{ padding: '18px 18px 4px' }}>
          <Badge T={T} tone="accent" icon="sparkle">183 auto vicino a te</Badge>
          <H T={T} size="h2" style={{ marginTop: 10 }}>
            L'auto giusta.<br/>
            <span style={{ background: T.accent, padding: '0 8px', borderRadius: 6 }}>Vicino a te.</span>
          </H>
        </div>

        {/* Search card */}
        <div style={{ padding: 18 }}>
          <div style={{
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.lg, padding: 10, boxShadow: T.sh.soft,
          }}>
            <SearchRow T={T} icon="pin" label="Dove" value={state.search.location || 'Aggiungi destinazione'} onClick={() => nav('searchLocation')} placeholder={!state.search.location} />
            <div style={{ height: 1, background: T.line, margin: '0 12px' }} />
            <SearchRow T={T} icon="calendar" label="Quando" value={dateLabel || 'Aggiungi date'} onClick={() => nav('searchDate')} placeholder={!dateLabel} />
            <Button
              T={T}
              variant="accent"
              size="lg"
              icon="search"
              full
              style={{ marginTop: 8 }}
              onClick={() => nav('listing')}
            >
              {state.search.location || dateLabel ? 'Cerca auto' : 'Esplora vicino a te'}
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div style={{ padding: '4px 0 12px 18px' }}>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Categorie</H>
          <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18, paddingBottom: 4 }}>
            {CATEGORIES.map(c => (
              <div key={c.id}
                onClick={() => { set({ search: { ...state.search, category: c.id } }); nav('listing'); }}
                style={{ minWidth: 110, flex: 'none', cursor: 'pointer' }}
              >
                <div style={{ width: 110, height: 80, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                  <CarRender T={T} variant={c.id === 'suv' ? 'suv' : c.id === 'cabrio' ? 'sedan' : 'hatch'} tone={c.tone} />
                </div>
                <Txt T={T} size={12} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.l}</Txt>
                <Txt T={T} size={11} color={T.ink2}>da {[25,45,38,65,55,590][CATEGORIES.indexOf(c)]}€/g</Txt>
              </div>
            ))}
          </div>
        </div>

        {/* Vicino a te */}
        <div style={{ padding: '8px 0 16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: 18 }}>
            <H T={T} size="h4">Vicino a te · Milano</H>
            <Txt T={T} size={12} color={T.ink2} onClick={() => nav('listing')} style={{ cursor: 'pointer' }}>vedi tutte</Txt>
          </div>
          <div style={{ display: 'flex', gap: 12, overflow: 'auto', marginTop: 10, paddingRight: 18, paddingBottom: 4 }}>
            {CARS.slice(0, 4).map(c => (
              <div key={c.id} onClick={() => { set({ vehicleId: c.id }); nav('vehicle'); }}
                style={{ minWidth: 160, flex: 'none', cursor: 'pointer' }}>
                <div style={{ width: 160, height: 100, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
                  <CarRender T={T} variant={c.variant} tone={c.tone} />
                  <HeartButton T={T} active={state.saved.has(c.id)} onClick={(e) => { e.stopPropagation(); set({ saved: toggleSet(state.saved, c.id) }); }} />
                </div>
                <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.brand} {c.model}</Txt>
                <Price T={T} value={c.pricePerDay} unit="/giorno" size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar T={T} active="home" />
    </div>
  );
}

function SearchRow({ T, icon, label, value, placeholder, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      cursor: 'pointer', borderRadius: T.r.md,
    }}>
      <span style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <Icon name={icon} size={14} color={T.ink2} T={T} />}
        <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: 500, color: placeholder ? T.ink3 : T.ink1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      </span>
    </div>
  );
}

function HeartButton({ T, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', top: 8, right: 8, border: 'none', cursor: 'pointer',
      width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: T.sh.soft,
    }}>
      <Icon name={active ? 'heartFill' : 'heart'} size={15} color={active ? T.coral : T.ink1} T={T} />
    </button>
  );
}

function toggleSet(s, v) {
  const n = new Set(s);
  if (n.has(v)) n.delete(v); else n.add(v);
  return n;
}

// ─────────────────────────────────────────────────────────
// LOCATION PICKER (overlay)
// ─────────────────────────────────────────────────────────
function LocationPicker({ T, state, nav, set }) {
  const [query, setQuery] = React.useState(state.search.location || '');
  const filtered = LOCATIONS.filter(l => l.l.toLowerCase().includes(query.toLowerCase()));
  const choose = (l) => {
    set({ search: { ...state.search, location: l } });
    nav('back');
  };
  return (
    <div style={{ height: '100%', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader T={T} title="Dove vai?" onBack={() => nav('back')} sticky />
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: T.surface, border: `1.5px solid ${T.ink1}`,
          borderRadius: T.r.pill, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: T.sh.soft,
        }}>
          <Icon name="search" size={16} color={T.ink1} T={T} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Città, quartiere, aeroporto…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: T.fontBody, fontSize: 15, fontWeight: 500, color: T.ink1,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
              <Icon name="x" size={14} color={T.ink2} T={T} />
            </button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px' }}>
        {/* Posizione attuale */}
        <button onClick={() => choose('Milano · vicino a me')} style={{
          width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
          padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${T.line}`,
        }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pin" size={18} color={T.accentDeep} T={T} />
          </span>
          <div style={{ textAlign: 'left' }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>Usa posizione attuale</Txt>
            <Txt T={T} size={12} color={T.ink2}>Milano · 183 auto a 5 km</Txt>
          </div>
        </button>

        {filtered.length > 0 && (
          <>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ display: 'block', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suggeriti</Txt>
            {filtered.map(l => (
              <button key={l.id} onClick={() => choose(l.l)} style={{
                width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
                borderBottom: `1px solid ${T.line}`,
              }}>
                <Icon name={l.icon} size={18} color={T.ink2} T={T} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <Txt T={T} size={14} weight={500} style={{ display: 'block' }}>{l.l}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{l.sub}</Txt>
                </div>
              </button>
            ))}
          </>
        )}

        {!query && (
          <>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ display: 'block', marginTop: 18, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cercati di recente</Txt>
            {RECENT_LOCATIONS.map((l, i) => (
              <button key={i} onClick={() => choose(l.l)} style={{
                width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '12px 4px', display: 'flex', alignItems: 'center', gap: 14,
                borderBottom: `1px solid ${T.line}`,
              }}>
                <Icon name="calendar" size={18} color={T.ink3} T={T} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <Txt T={T} size={14} weight={500} style={{ display: 'block' }}>{l.l}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{l.sub}</Txt>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DATE PICKER (overlay)
// ─────────────────────────────────────────────────────────
function DatePicker({ T, state, nav, set }) {
  const [from, setFrom] = React.useState(state.search.from);
  const [to, setTo] = React.useState(state.search.to);

  const onTap = (d, m) => {
    const date = { d, m };
    if (!from || (from && to)) {
      setFrom(date);
      setTo(null);
    } else if (from && !to) {
      // ensure to >= from
      if (m < from.m || (m === from.m && d < from.d)) {
        setFrom(date);
        setTo(null);
      } else {
        setTo(date);
      }
    }
  };

  const confirm = () => {
    set({ search: { ...state.search, from, to } });
    nav('back');
  };

  return (
    <div style={{ height: '100%', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <ScreenHeader T={T} title="Quando ti serve?" onBack={() => nav('back')} sticky right={
        <button onClick={() => { setFrom(null); setTo(null); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <Txt T={T} size={13} color={T.ink2} style={{ textDecoration: 'underline' }}>Azzera</Txt>
        </button>
      } />
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px 100px' }}>
        <CalendarMonth T={T} monthIndex={5} year={2026} from={from} to={to} onTap={(d) => onTap(d, 5)} />
        <CalendarMonth T={T} monthIndex={6} year={2026} from={from} to={to} onTap={(d) => onTap(d, 6)} />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px 28px', background: T.bg, borderTop: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {from && to ? (
            <>
              <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{formatDates(from, to)}</Txt>
              <Txt T={T} size={11} color={T.ink2}>{daysBetween(from, to)} giorni</Txt>
            </>
          ) : from ? (
            <Txt T={T} size={13} color={T.ink2}>Scegli quando riconsegni</Txt>
          ) : (
            <Txt T={T} size={13} color={T.ink2}>Scegli la data di ritiro</Txt>
          )}
        </div>
        <Button T={T} variant="accent" size="lg" disabled={!from || !to} onClick={confirm} iconRight="check"
          style={!(from && to) ? { opacity: 0.45, pointerEvents: 'none' } : {}}>Conferma</Button>
      </div>
    </div>
  );
}

function CalendarMonth({ T, monthIndex, year, from, to, onTap }) {
  const months = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay(); // 0=sun
  const startOffset = (firstDay + 6) % 7; // make monday=0
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const today = 13;
  const isPast = (d) => monthIndex === 5 && d < today;

  const isInRange = (d) => {
    if (!from || !to) return false;
    if (from.m === to.m && from.m === monthIndex) return d >= from.d && d <= to.d;
    if (monthIndex === from.m) return d >= from.d;
    if (monthIndex === to.m) return d <= to.d;
    if (monthIndex > from.m && monthIndex < to.m) return true;
    return false;
  };
  const isStart = (d) => from && from.m === monthIndex && from.d === d;
  const isEnd = (d) => to && to.m === monthIndex && to.d === d;

  return (
    <div style={{ marginBottom: 24 }}>
      <H T={T} size="h5" style={{ marginBottom: 12, textTransform: 'capitalize' }}>{months[monthIndex]} {year}</H>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 6 }}>
        {['L','M','M','G','V','S','D'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600, color: T.ink3, padding: '4px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const inRange = isInRange(d);
          const start = isStart(d);
          const end = isEnd(d);
          const past = isPast(d);
          return (
            <button
              key={i}
              disabled={past}
              onClick={() => !past && onTap(d)}
              style={{
                border: 'none', background: 'transparent', cursor: past ? 'default' : 'pointer',
                padding: 0, height: 42,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                opacity: past ? 0.3 : 1,
              }}
            >
              {/* range bg */}
              {inRange && !start && !end && (
                <span style={{ position: 'absolute', inset: '4px 0', background: T.accentSoft, borderRadius: 0 }} />
              )}
              {start && (
                <span style={{ position: 'absolute', inset: '4px 0 4px 50%', background: to ? T.accentSoft : 'transparent' }} />
              )}
              {end && (
                <span style={{ position: 'absolute', inset: '4px 50% 4px 0', background: T.accentSoft }} />
              )}
              {/* circle for endpoints */}
              {(start || end) && (
                <span style={{ position: 'absolute', width: 36, height: 36, borderRadius: '50%', background: T.ink1 }} />
              )}
              <span style={{
                position: 'relative', zIndex: 1,
                fontFamily: T.fontBody, fontSize: 14, fontWeight: (start || end) ? 700 : 500,
                color: (start || end) ? '#fff' : T.ink1,
              }}>{d}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LISTING (split mappa+lista, con filtri sheet)
// ─────────────────────────────────────────────────────────
function ListingScreen({ T, state, nav, set }) {
  const [view, setView] = React.useState('split'); // split | list | map
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Apply filters
  const cars = React.useMemo(() => {
    let list = CARS;
    if (state.search.category) list = list.filter(c => c.category === state.search.category);
    if (state.filters.priceMax < 100) list = list.filter(c => c.pricePerDay <= state.filters.priceMax);
    if (state.filters.fuels.size) list = list.filter(c => state.filters.fuels.has(c.fuel));
    if (state.filters.transmission && state.filters.transmission !== 'all') {
      list = list.filter(c => c.transmission.startsWith(state.filters.transmission));
    }
    return list;
  }, [state.search.category, state.filters]);

  const dateLabel = formatDates(state.search.from, state.search.to);
  const hasSearch = state.search.location || dateLabel;

  // INITIAL state — nessuna ricerca → mostra "vicino a te"
  if (!hasSearch && !state.search.category) {
    return <ListingInitial T={T} state={state} nav={nav} set={set} />;
  }

  return (
    <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px 12px', borderBottom: `1px solid ${T.line}`, background: T.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => nav('home')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="chevronLeft" size={20} color={T.ink1} T={T} />
          </button>
          <div
            onClick={() => nav('searchLocation')}
            style={{
              flex: 1, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.pill, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: T.sh.soft, cursor: 'pointer',
            }}
          >
            <Icon name="search" size={14} color={T.ink2} T={T} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Txt T={T} size={13} weight={600} style={{ display: 'block', lineHeight: 1 }}>
                {state.search.location || 'Tutte le città'}
              </Txt>
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1 }}>
                {dateLabel || 'Date flessibili'} · {cars.length} auto
              </Txt>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFiltersOpen(true); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
              <Icon name="sliders" size={16} color={T.ink1} T={T} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflow: 'auto', paddingBottom: 2 }}>
          <Chip T={T} size="sm" active={state.filters.priceMax < 100} icon={state.filters.priceMax < 100 ? 'check' : undefined}
            onClose={state.filters.priceMax < 100 ? () => set({ filters: { ...state.filters, priceMax: 100 } }) : undefined}>
            {state.filters.priceMax < 100 ? `Sotto ${state.filters.priceMax}€` : 'Prezzo'}
          </Chip>
          {['Benzina','Hybrid','Elettrica','Diesel'].map(f => (
            <Chip key={f} T={T} size="sm" active={state.filters.fuels.has(f)}
              onClose={state.filters.fuels.has(f) ? () => set({ filters: { ...state.filters, fuels: toggleSet(state.filters.fuels, f) } }) : undefined}
              icon={state.filters.fuels.has(f) ? 'check' : undefined}>
              {f}
            </Chip>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <Txt T={T} size={12} weight={600}>{cars.length} risultati</Txt>
          <div style={{ display: 'flex', background: T.surfaceAlt, padding: 3, borderRadius: T.r.pill, gap: 0 }}>
            <ViewTab T={T} icon="list" active={view === 'list'} onClick={() => setView('list')} label="Lista" />
            <ViewTab T={T} icon="map" active={view === 'split'} onClick={() => setView('split')} label="Mappa" />
          </div>
        </div>
      </div>

      {view === 'split' && <SplitView T={T} cars={cars} state={state} nav={nav} set={set} />}
      {view === 'list' && <ListView T={T} cars={cars} state={state} nav={nav} set={set} />}

      {/* Filter sheet */}
      {filtersOpen && <FiltersSheet T={T} state={state} set={set} close={() => setFiltersOpen(false)} count={cars.length} />}

      <TabBar T={T} active="search" />
    </div>
  );
}

function ViewTab({ T, icon, active, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none',
      padding: '5px 11px', fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
      background: active ? T.surface : 'transparent',
      color: active ? T.ink1 : T.ink2,
      borderRadius: T.r.pill,
      boxShadow: active ? T.sh.soft : 'none',
      cursor: 'pointer',
    }}>
      <Icon name={icon} size={13} color="currentColor" T={T} /> {label}
    </button>
  );
}

function ListingInitial({ T, state, nav, set }) {
  return (
    <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px 14px', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => nav('home')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <Icon name="chevronLeft" size={20} color={T.ink1} T={T} />
          </button>
          <div onClick={() => nav('searchLocation')} style={{
            flex: 1, background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.pill, padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            boxShadow: T.sh.soft,
          }}>
            <Icon name="search" size={14} color={T.ink2} T={T} />
            <Txt T={T} size={13} color={T.ink3}>Aggiungi destinazione…</Txt>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, bottom: 60, overflow: 'auto' }}>
        <div style={{ padding: '16px 18px 8px' }}>
          <Badge T={T} tone="accent" icon="pin">Posizione attuale · Milano</Badge>
          <H T={T} size="h3" style={{ marginTop: 10, lineHeight: 1.1 }}>Noleggiatori vicino a te</H>
          <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
            Imposta date e città per cercare. Intanto, ecco chi è qui vicino.
          </Txt>
        </div>
        <div style={{ padding: '8px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {NEAREST_HOSTS.map((h, i) => {
            const host = HOSTS[h.host];
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 14, background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: T.r.lg, boxShadow: T.sh.soft, cursor: 'pointer',
              }}>
                <Avatar T={T} name={host.n} size={48} tone={host.id === 'greencar' ? 'accent' : undefined} />
                <div style={{ flex: 1 }}>
                  <Txt T={T} size={15} weight={600} style={{ display: 'block' }}>{host.n}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>
                    <Rating T={T} value={host.rating} size={11} color={T.ink2} /> · {h.cars} auto · a {h.distance}
                  </Txt>
                </div>
                <Icon name="chevron" size={18} color={T.ink2} T={T} />
              </div>
            );
          })}
        </div>
        <div style={{ padding: '0 18px 4px' }}>
          <H T={T} size="h4">Auto disponibili oggi</H>
        </div>
        <div style={{ padding: '12px 0 16px 18px', display: 'flex', gap: 12, overflow: 'auto', paddingRight: 18 }}>
          {CARS.slice(0, 4).map(c => (
            <div key={c.id} onClick={() => { set({ vehicleId: c.id }); nav('vehicle'); }}
              style={{ minWidth: 180, flex: 'none', cursor: 'pointer' }}>
              <div style={{ width: 180, height: 110, borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
                <CarRender T={T} variant={c.variant} tone={c.tone} />
                <HeartButton T={T} active={state.saved.has(c.id)} onClick={(e) => { e.stopPropagation(); set({ saved: toggleSet(state.saved, c.id) }); }} />
              </div>
              <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.brand} {c.model}</Txt>
              <Txt T={T} size={11} color={T.ink2}>{c.distance}</Txt>
              <Price T={T} value={c.pricePerDay} unit="/giorno" size="sm" />
            </div>
          ))}
        </div>
      </div>
      <TabBar T={T} active="search" />
    </div>
  );
}

function ListView({ T, cars, state, nav, set }) {
  if (cars.length === 0) {
    return (
      <div style={{ position: 'absolute', top: 168, left: 0, right: 0, bottom: 60, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8 }}>
        <Icon name="search" size={32} color={T.ink3} T={T} />
        <H T={T} size="h4">Nessun risultato</H>
        <Txt T={T} size={13} color={T.ink2}>Prova ad allargare i filtri o cambia date.</Txt>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', top: 168, left: 0, right: 0, bottom: 60, overflow: 'auto', padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cars.map(c => (
        <VehicleListCard key={c.id} T={T} car={c} state={state} nav={nav} set={set} />
      ))}
    </div>
  );
}

function SplitView({ T, cars, state, nav, set }) {
  const [pinned, setPinned] = React.useState(cars[0]?.id);
  React.useEffect(() => { setPinned(cars[0]?.id); }, [cars.length]);
  const pinnedCar = cars.find(c => c.id === pinned) || cars[0];
  return (
    <div style={{ position: 'absolute', top: 168, left: 0, right: 0, bottom: 60, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', overflow: 'hidden' }}>
        <MiniMap T={T} cars={cars} pinned={pinned} onPin={setPinned} />
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, top: '48%',
        background: T.bg, borderTop: `1px solid ${T.line}`,
        borderTopLeftRadius: T.r.xl, borderTopRightRadius: T.r.xl,
        padding: '8px 14px 12px', boxShadow: T.sh.deep, overflow: 'hidden',
      }}>
        <div style={{ width: 40, height: 4, background: T.line, borderRadius: 2, margin: '0 auto 10px' }} />
        {pinnedCar ? (
          <>
            <VehicleListCard T={T} car={pinnedCar} state={state} nav={nav} set={set} />
            <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
              tocca un pin sulla mappa per cambiarlo · {cars.length} auto totali
            </Txt>
          </>
        ) : (
          <Txt T={T} size={13} color={T.ink2}>Nessuna auto</Txt>
        )}
      </div>
    </div>
  );
}

function VehicleListCard({ T, car, state, nav, set }) {
  const host = HOSTS[car.host];
  return (
    <div onClick={() => { set({ vehicleId: car.id }); nav('vehicle'); }} style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, padding: 10, display: 'flex', gap: 10,
      boxShadow: T.sh.soft, cursor: 'pointer',
    }}>
      <div style={{ width: 110, flex: 'none' }}>
        <div style={{ position: 'relative', borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
          <CarRender T={T} variant={car.variant} tone={car.tone} />
          <HeartButton T={T} active={state.saved.has(car.id)} onClick={(e) => { e.stopPropagation(); set({ saved: toggleSet(state.saved, car.id) }); }} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
          <div style={{ minWidth: 0 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.brand} {car.model} · {car.year}</Txt>
            <Txt T={T} size={11} color={T.ink2}>{host.n} · {car.distance}</Txt>
          </div>
          <Rating T={T} value={host.rating} size={11} />
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
          <Chip T={T} size="sm">{car.fuel}</Chip>
          <Chip T={T} size="sm">{car.transmission.slice(0,4)}.</Chip>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
          <Price T={T} value={car.pricePerDay} unit="/g" size="md" weight={700} />
          {car.hot && <Badge T={T} tone="success" icon="bolt">Oggi</Badge>}
        </div>
      </div>
    </div>
  );
}

function MiniMap({ T, cars, pinned, onPin }) {
  const water = T.name === 'Lustro' ? '#D6E1ED' : '#CFDDE9';
  const park = T.name === 'Lustro' ? '#D7DEC7' : '#C8D4B0';
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#EFEAD8', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <path d="M 280 30 Q 340 40 350 100 Q 340 150 280 140 Z" fill={park} />
        <path d="M 0 240 Q 100 230 200 250 T 400 230 L 400 300 L 0 300 Z" fill={water} opacity="0.6" />
        <g stroke="#FFFCF2" strokeWidth="10" fill="none">
          <path d="M -20 110 Q 100 100 220 130 T 420 110" />
          <path d="M -20 200 Q 130 180 260 210 T 420 190" />
          <path d="M 110 -20 Q 130 100 140 200 T 120 320" />
          <path d="M 270 -20 Q 290 120 310 220 T 290 320" />
        </g>
        <g stroke="#D8D0B6" strokeWidth="11" fill="none" opacity="0.4">
          <path d="M -20 110 Q 100 100 220 130 T 420 110" />
          <path d="M -20 200 Q 130 180 260 210 T 420 190" />
        </g>
      </svg>
      {cars.slice(0, 8).map((c, i) => {
        const [x, y] = c.coords || [60 + (i * 50) % 320, 60 + Math.floor(i / 6) * 80];
        const isPinned = c.id === pinned;
        return (
          <div key={c.id} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)', zIndex: isPinned ? 10 : 1 }}
            onClick={() => onPin(c.id)}>
            <div style={{
              background: isPinned ? T.ink1 : T.surface,
              color: isPinned ? '#fff' : T.ink1,
              border: `1.4px solid ${isPinned ? T.ink1 : T.line}`,
              borderRadius: T.r.pill,
              padding: isPinned ? '6px 14px' : '4px 10px',
              fontFamily: T.fontBody, fontWeight: 700, fontSize: isPinned ? 14 : 12,
              boxShadow: T.sh.raised,
              whiteSpace: 'nowrap', cursor: 'pointer',
            }}>{c.pricePerDay}€</div>
            <div style={{
              position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%) rotate(45deg)',
              width: 8, height: 8, background: isPinned ? T.ink1 : T.surface,
              borderRight: `1.4px solid ${isPinned ? T.ink1 : T.line}`,
              borderBottom: `1.4px solid ${isPinned ? T.ink1 : T.line}`,
              marginTop: -4,
            }} />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILTERS SHEET
// ─────────────────────────────────────────────────────────
function FiltersSheet({ T, state, set, close, count }) {
  const [draft, setDraft] = React.useState(state.filters);
  React.useEffect(() => { setDraft(state.filters); }, []);
  const apply = () => { set({ filters: draft }); close(); };
  const reset = () => setDraft({ priceMax: 100, fuels: new Set(), transmission: 'all' });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,5,0.4)' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '88%',
        background: T.bg, borderTopLeftRadius: T.r.xl, borderTopRightRadius: T.r.xl,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ width: 40, height: 4, background: T.line, borderRadius: 2, margin: '8px auto 0' }} />
        <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.line}` }}>
          <H T={T} size="h3">Filtri</H>
          <button onClick={reset} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <Txt T={T} size={13} color={T.ink2} style={{ textDecoration: 'underline' }}>azzera</Txt>
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Prezzo massimo / giorno</Txt>
          <div style={{ padding: '8px 4px 16px' }}>
            <input type="range" min={20} max={100} step={5} value={draft.priceMax}
              onChange={(e) => setDraft({ ...draft, priceMax: +e.target.value })}
              style={{ width: '100%', accentColor: T.ink1 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Txt T={T} size={11} color={T.ink2}>20€</Txt>
              <Txt T={T} size={13} weight={700}>fino a {draft.priceMax}€/g</Txt>
              <Txt T={T} size={11} color={T.ink2}>100€</Txt>
            </div>
          </div>

          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, marginTop: 20 }}>Carburante</Txt>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Benzina','Diesel','Hybrid','Elettrica','GPL'].map(f => (
              <span key={f} onClick={() => setDraft({ ...draft, fuels: toggleSet(draft.fuels, f) })}>
                <Chip T={T} active={draft.fuels.has(f)} icon={draft.fuels.has(f) ? 'check' : undefined}>{f}</Chip>
              </span>
            ))}
          </div>

          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10, marginTop: 20 }}>Cambio</Txt>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { v: 'all', l: 'Tutti' },
              { v: 'Manuale', l: 'Manuale' },
              { v: 'Automatico', l: 'Automatico' },
            ].map(o => (
              <span key={o.v} onClick={() => setDraft({ ...draft, transmission: o.v })}>
                <Chip T={T} active={draft.transmission === o.v}>{o.l}</Chip>
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 18px 24px', borderTop: `1px solid ${T.line}`, display: 'flex', gap: 10 }}>
          <Button T={T} variant="ghost" onClick={close} style={{ flex: 1 }}>Annulla</Button>
          <Button T={T} variant="accent" onClick={apply} iconRight="check" style={{ flex: 2 }}>Mostra {count} auto</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, LocationPicker, DatePicker, ListingScreen, formatDates, daysBetween, toggleSet });
