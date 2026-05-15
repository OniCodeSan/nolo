// proto-screens-2.jsx — Scheda veicolo, prenotazione, conferma

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo, TabBar } = window;
const { HOSTS, CARS, REVIEWS } = window;
const { formatDates, daysBetween, toggleSet } = window;

// ─────────────────────────────────────────────────────────
// VEHICLE DETAIL
// ─────────────────────────────────────────────────────────
function VehicleScreen({ T, state, nav, set }) {
  const car = CARS.find(c => c.id === state.vehicleId);
  const [photoIdx, setPhotoIdx] = React.useState(0);
  const host = HOSTS[car.host];
  const days = daysBetween(state.search.from, state.search.to);
  const total = car.pricePerDay * days;

  const photos = [
    { variant: car.variant, tone: 'colored' },
    { variant: car.variant, tone: 'neutral' },
    { variant: car.variant, tone: 'colored' },
    { variant: car.variant, tone: 'neutral' },
    { variant: car.variant, tone: 'colored' },
  ];

  return (
    <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 110 }}>
        {/* Gallery */}
        <div style={{ position: 'relative', height: 250 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
            <div style={{ display: 'flex', transition: 'transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1)', transform: `translateX(-${photoIdx * 100}%)`, width: '100%' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ minWidth: '100%', height: 250, flex: 'none' }}>
                  <CarRender T={T} variant={p.variant} tone={p.tone} height={250} />
                </div>
              ))}
            </div>
          </div>

          {/* Top bar */}
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
            <button onClick={() => nav('back')} style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.sh.soft,
            }}>
              <Icon name="chevronLeft" size={18} color={T.ink1} T={T} />
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft }}>
                <Icon name="share" size={15} color={T.ink1} T={T} />
              </button>
              <button onClick={() => set({ saved: toggleSet(state.saved, car.id) })} style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft,
              }}>
                <Icon name={state.saved.has(car.id) ? 'heartFill' : 'heart'} size={15} color={state.saved.has(car.id) ? T.coral : T.ink1} T={T} />
              </button>
            </div>
          </div>

          {/* Dots + counter */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: '5px 12px', background: 'rgba(20,15,5,0.6)', borderRadius: T.r.pill }}>
            {photos.map((_, i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'background 200ms' }} />
            ))}
            <Txt T={T} size={11} color="#fff" weight={500} style={{ marginLeft: 6 }}>{photoIdx + 1}/{photos.length}</Txt>
          </div>

          {/* Tap-to-advance overlay */}
          <button
            onClick={() => setPhotoIdx((photoIdx + 1) % photos.length)}
            style={{ position: 'absolute', right: 0, top: 50, bottom: 50, width: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="next"
          />
          <button
            onClick={() => setPhotoIdx((photoIdx - 1 + photos.length) % photos.length)}
            style={{ position: 'absolute', left: 0, top: 50, bottom: 50, width: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            aria-label="prev"
          />
        </div>

        {/* Title */}
        <div style={{ padding: '20px 18px 8px' }}>
          <H T={T} size="h2" style={{ lineHeight: 1 }}>{car.brand} {car.model}<br/><span style={{ color: T.ink2, fontWeight: 500 }}>{car.year}</span></H>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <Rating T={T} value={host.rating} count={host.reviews} size={12} />
            <Txt T={T} size={11} color={T.ink2}>·</Txt>
            <Txt T={T} size={12} color={T.ink2}><Icon name="pin" size={12} color={T.ink2} T={T} /> {host.city}</Txt>
          </div>
          <div style={{ marginTop: 10 }}>
            <Badge T={T} tone="success" icon="check">Disponibile ora</Badge>
          </div>
        </div>

        {/* Specs grid */}
        <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { i: 'fuel', l: car.fuel.slice(0, 8) },
            { i: 'transmission', l: car.transmission.slice(0, 8) + '.' },
            { i: 'seat', l: `${car.seats} posti` },
            { i: 'gauge', l: car.km.split('.')[0] + 'k km' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '12px 6px', background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.md, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <Icon name={s.i} size={18} color={T.ink1} T={T} />
              <Txt T={T} size={11} weight={600}>{s.l}</Txt>
            </div>
          ))}
        </div>

        {/* Host card */}
        <div style={{ padding: '6px 18px' }}>
          <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12, boxShadow: T.sh.soft }}>
            <Avatar T={T} name={host.n} size={44} tone={host.id === 'greencar' ? 'accent' : undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Txt T={T} size={14} weight={600}>{host.n}</Txt>
                {host.verified && <Icon name="check" size={12} color={T.ok} T={T} />}
              </div>
              <Txt T={T} size={11} color={T.ink2}>★ {host.rating} · {host.reviews} noleggi · risponde {host.responseTime}</Txt>
            </div>
            <Icon name="chat" size={18} color={T.ink1} T={T} />
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '14px 18px 4px' }}>
          <H T={T} size="h5">Descrizione</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, lineHeight: 1.55 }}>
            {car.description}
          </Txt>
        </div>

        {/* Accessories */}
        <div style={{ padding: '14px 18px 4px' }}>
          <H T={T} size="h5">Accessori · {car.accessories.length}</H>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            {car.accessories.slice(0, 6).map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={14} color={T.ok} T={T} />
                <Txt T={T} size={12}>{a}</Txt>
              </div>
            ))}
          </div>
          {car.accessories.length > 6 && (
            <Txt T={T} size={12} color={T.ink1} style={{ display: 'inline-block', marginTop: 8, textDecoration: 'underline', fontWeight: 600 }}>
              +{car.accessories.length - 6} altri →
            </Txt>
          )}
        </div>

        {/* Reviews */}
        <div style={{ padding: '14px 18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <H T={T} size="h5">Recensioni</H>
            <Txt T={T} size={12} color={T.ink2}>vedi tutte →</Txt>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REVIEWS.slice(0, 2).map((r, i) => (
              <div key={i} style={{ padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar T={T} name={r.avatar} size={28} />
                  <div style={{ flex: 1 }}>
                    <Txt T={T} size={12} weight={600} style={{ display: 'block' }}>{r.n}</Txt>
                    <Txt T={T} size={10} color={T.ink2}>{r.date}</Txt>
                  </div>
                  <Rating T={T} value={r.stars} size={11} />
                </div>
                <Txt T={T} size={12} color={T.ink1} style={{ display: 'block', marginTop: 8, lineHeight: 1.5 }}>{r.text}</Txt>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: '12px 16px 28px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: T.sh.deep,
      }}>
        <div style={{ minWidth: 0 }}>
          <Price T={T} value={car.pricePerDay} unit="/giorno" size="lg" weight={700} />
          {state.search.from && state.search.to ? (
            <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>Tot. {total}€ · {days} giorni</Txt>
          ) : (
            <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>scegli date per il totale</Txt>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button style={{
          border: `1px solid ${T.line}`, background: T.surface, width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="chat" size={18} color={T.ink1} T={T} />
        </button>
        <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={() => {
          if (!state.search.from || !state.search.to) {
            nav('searchDate');
          } else {
            nav('booking');
          }
        }}>{(state.search.from && state.search.to) ? 'Prenota' : 'Scegli date'}</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// BOOKING — review
// ─────────────────────────────────────────────────────────
function BookingScreen({ T, state, nav, set }) {
  const car = CARS.find(c => c.id === state.vehicleId);
  const host = HOSTS[car.host];
  const days = daysBetween(state.search.from, state.search.to);
  const subtotal = car.pricePerDay * days;
  const deposit = 200;
  const total = subtotal + deposit;

  return (
    <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <ScreenHeader T={T} title="Conferma prenotazione" onBack={() => nav('back')} sticky />
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 100, overflow: 'auto', padding: '14px 18px' }}>
        {/* Vehicle card */}
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', gap: 12, boxShadow: T.sh.soft }}>
          <div style={{ width: 100, flex: 'none' }}>
            <div style={{ borderRadius: T.r.md, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.4 / 1' }}>
              <CarRender T={T} variant={car.variant} tone={car.tone} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{car.brand} {car.model} · {car.year}</Txt>
            <Txt T={T} size={11} color={T.ink2}>{host.n} · {car.city}</Txt>
            <Rating T={T} value={host.rating} count={host.reviews} size={11} />
          </div>
        </div>

        <H T={T} size="h5" style={{ marginTop: 20, marginBottom: 8 }}>Le tue date</H>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', overflow: 'hidden' }}>
          <DateBlock T={T} label="Ritiro" date={state.search.from} time="10:00" onClick={() => nav('searchDate')} />
          <div style={{ width: 1, background: T.line }} />
          <DateBlock T={T} label="Riconsegna" date={state.search.to} time="18:00" onClick={() => nav('searchDate')} />
        </div>

        <H T={T} size="h5" style={{ marginTop: 20, marginBottom: 8 }}>Ritiro presso</H>
        <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="pin" size={20} color={T.ink1} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>Via Milano 12, Sesto S.G.</Txt>
            <Txt T={T} size={11} color={T.ink2}>20099 Milano · a {car.distance}</Txt>
          </div>
          <Icon name="map" size={20} color={T.ink2} T={T} />
        </div>

        <H T={T} size="h5" style={{ marginTop: 20, marginBottom: 8 }}>Riepilogo costi</H>
        <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CostRow T={T} label={`${car.pricePerDay}€ × ${days} giorni`} value={`${subtotal}€`} />
          <CostRow T={T} label="Cauzione" value={`${deposit}€`} hint="rimborsata alla riconsegna" />
          <CostRow T={T} label="Servizio piattaforma" value="—" hint="incluso" />
          <div style={{ height: 1, background: T.line, margin: '4px 0' }} />
          <CostRow T={T} label="Totale" value={`${total}€`} bold />
        </div>

        <div style={{ marginTop: 16, padding: 12, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="sparkle" size={16} color={T.accentDeep} T={T} />
          <Txt T={T} size={12} color={T.ink1} style={{ flex: 1, lineHeight: 1.5 }}>
            <strong>Non ti viene addebitato nulla ora.</strong> AutoLuca conferma la richiesta entro 24h. Il pagamento avviene al ritiro.
          </Txt>
        </div>

        <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 8 }}>Messaggio a {host.n} <Txt T={T} size={11} color={T.ink2}>(opzionale)</Txt></H>
        <div style={{
          padding: '12px 14px', background: T.surface, border: `1px solid ${T.line}`,
          borderRadius: T.r.md, minHeight: 60,
        }}>
          <Txt T={T} size={13} color={T.ink3}>Es. orario di ritiro previsto, domande, …</Txt>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: '12px 18px 28px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div>
          <Price T={T} value={total} unit="" size="lg" weight={700} />
          <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>tutto incluso</Txt>
        </div>
        <div style={{ flex: 1 }} />
        <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={() => {
          set({ booking: { car, host, days, subtotal, deposit, total, from: state.search.from, to: state.search.to } });
          nav('confirmation');
        }}>Conferma e invia</Button>
      </div>
    </div>
  );
}

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
        }}>
          <Icon name="chevronLeft" size={22} color={T.ink1} T={T} />
        </button>
      )}
      {title && <H T={T} size="h5" style={{ flex: 1 }}>{title}</H>}
      {right}
    </div>
  );
}

function DateBlock({ T, label, date, time, onClick }) {
  const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  return (
    <div onClick={onClick} style={{ flex: 1, padding: '14px 16px', cursor: 'pointer' }}>
      <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{label}</Txt>
      <Txt T={T} size={15} weight={600} style={{ display: 'block', marginTop: 4 }}>
        {date ? `${date.d} ${months[date.m]}` : 'scegli data'}
      </Txt>
      <Txt T={T} size={12} color={T.ink2}>{time}</Txt>
    </div>
  );
}

function CostRow({ T, label, value, hint, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <Txt T={T} size={bold ? 15 : 13} weight={bold ? 700 : 400} color={bold ? T.ink1 : T.ink2}>{label}</Txt>
        {hint && <Txt T={T} size={10} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{hint}</Txt>}
      </div>
      <Txt T={T} size={bold ? 18 : 14} weight={bold ? 700 : 500} color={bold ? T.ink1 : T.ink1} style={bold ? { fontFamily: T.fontDisplay } : {}}>{value}</Txt>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CONFIRMATION
// ─────────────────────────────────────────────────────────
function ConfirmationScreen({ T, state, nav, set }) {
  const b = state.booking;
  if (!b) {
    return (
      <div style={{ height: '100%', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Txt T={T} size={14}>Nessuna prenotazione</Txt>
      </div>
    );
  }
  const car = b.car;
  const host = b.host;
  const [animateIn, setAnimateIn] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* hero */}
      <div style={{
        background: T.accent, padding: '40px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: T.ink1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: animateIn ? 'scale(1)' : 'scale(0.2)',
          opacity: animateIn ? 1 : 0,
          transition: 'all 500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          <Icon name="check" size={36} color={T.accent} T={T} stroke={3} />
        </div>
        <H T={T} size="h1" style={{
          color: T.ink1, marginTop: 24, lineHeight: 1,
          opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 400ms 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          Richiesta inviata!
        </H>
        <Txt T={T} size={15} color={T.ink1} style={{
          display: 'block', marginTop: 10, opacity: 0.78,
          transition: 'opacity 400ms 300ms', opacity: animateIn ? 0.78 : 0,
        }}>
          {host.n} ti risponde entro 24h. Ti notifichiamo quando conferma.
        </Txt>
      </div>

      <div style={{
        flex: 1, padding: '0 18px 100px',
        marginTop: -50, overflow: 'auto',
        opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 400ms 400ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg,
          padding: 18, boxShadow: T.sh.deep,
        }}>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Riepilogo</Txt>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 80, height: 56, borderRadius: T.r.md, overflow: 'hidden' }}>
              <CarRender T={T} variant={car.variant} tone={car.tone} />
            </div>
            <div style={{ flex: 1 }}>
              <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{car.brand} {car.model} · {car.year}</Txt>
              <Txt T={T} size={11} color={T.ink2}>{host.n}</Txt>
            </div>
          </div>
          <div style={{ height: 1, background: T.line, margin: '14px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SummaryRow T={T} icon="calendar" label="Date" value={formatDates(b.from, b.to) + ` · ${b.days} giorni`} />
            <SummaryRow T={T} icon="pin" label="Ritiro" value={`Via Milano 12, Sesto S.G.`} />
            <SummaryRow T={T} icon="euro" label="Totale" value={`${b.total}€ (al ritiro)`} />
          </div>
        </div>

        <div style={{ marginTop: 14, padding: 14, background: T.accentSoft, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="bell" size={16} color={T.accentDeep} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={13} weight={600}>Ti aggiorniamo via push</Txt>
            <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 2, lineHeight: 1.5 }}>
              Tipicamente {host.n} risponde entro {host.responseTime}. Trovi la richiesta in "Prenotazioni".
            </Txt>
          </div>
        </div>

        <H T={T} size="h5" style={{ marginTop: 22, marginBottom: 10 }}>Cosa fare dopo</H>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NextStep T={T} icon="chat" l="Scrivi a {host.n}" sub="Domande sul ritiro? Saluta." action={() => {}} />
          <NextStep T={T} icon="heart" l="Salva auto simili" sub="Ti diamo idee per i prossimi viaggi" />
          <NextStep T={T} icon="user" l="Completa il profilo" sub="Carica la patente per velocizzare" />
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: '12px 18px 28px',
        display: 'flex', gap: 10,
      }}>
        <Button T={T} variant="outline" onClick={() => { set({ booking: null, vehicleId: null, screen: 'home' }); nav('home'); }}>Home</Button>
        <Button T={T} variant="accent" iconRight="arrowRight" full>Vai alle prenotazioni</Button>
      </div>
    </div>
  );
}

function SummaryRow({ T, icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={14} color={T.ink2} T={T} />
      <Txt T={T} size={12} color={T.ink2} style={{ width: 70 }}>{label}</Txt>
      <Txt T={T} size={13} weight={500} style={{ flex: 1 }}>{value}</Txt>
    </div>
  );
}

function NextStep({ T, icon, l, sub, action }) {
  return (
    <div onClick={action} style={{
      padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md,
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', background: T.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={T.ink1} T={T} />
      </span>
      <div style={{ flex: 1 }}>
        <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{l}</Txt>
        <Txt T={T} size={11} color={T.ink2}>{sub}</Txt>
      </div>
      <Icon name="chevron" size={16} color={T.ink2} T={T} />
    </div>
  );
}

Object.assign(window, { VehicleScreen, BookingScreen, ConfirmationScreen });
