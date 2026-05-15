// hifi-screens-vehicle.jsx — Scheda veicolo V1 (galleria + sticky CTA / sidebar)

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
  PhoneFrame, BrowserFrame, TabBar, NavBar } = window;

// ─────────────────────────────────────────────────────────
// VEHICLE — DESKTOP (galleria + sticky sidebar prezzo)
// ─────────────────────────────────────────────────────────
function VehicleV1Desktop({ T }) {
  const accessories = ['Apple CarPlay', 'Android Auto', 'Bluetooth', 'Cruise control', 'Sensori parcheggio', 'Telecamera retro', 'Aria condizionata', 'Specchi rip. elett.', 'USB', 'Vivavoce', 'Cerchi lega', 'Fendinebbia'];
  const reviews = [
    { n: 'Marta R.', d: 'maggio 2026', s: 5, t: 'Polo perfetta per Milano, Marco super disponibile. Ritiro veloce.' },
    { n: 'Stefano G.', d: 'aprile 2026', s: 5, t: 'Auto pulita, esattamente come nelle foto. Consigliato.' },
  ];
  return (
    <BrowserFrame T={T} url="noleggio.it/auto/vw-polo-2022">
      <div style={{ background: T.bg, height: '100%', overflow: 'hidden' }}>
        <NavBar T={T} />
        {/* breadcrumb */}
        <div style={{ padding: '12px 40px 0' }}>
          <Txt T={T} size={12} color={T.ink2}>
            <span>Esplora</span> <span style={{ margin: '0 6px', color: T.ink3 }}>›</span>
            <span>Milano</span> <span style={{ margin: '0 6px', color: T.ink3 }}>›</span>
            <span style={{ color: T.ink1, fontWeight: 500 }}>VW Polo · 2022</span>
          </Txt>
        </div>

        <div style={{ padding: '12px 40px 24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, overflow: 'hidden' }}>
          {/* LEFT: gallery + content */}
          <div>
            {/* gallery */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 360, borderRadius: T.r.lg, overflow: 'hidden', border: `1px solid ${T.line}` }}>
              <div style={{ gridRow: 'span 2', position: 'relative' }}>
                <CarRender T={T} variant="hatch" tone="colored" />
                <button style={{
                  position: 'absolute', top: 14, left: 14, border: 'none', cursor: 'pointer',
                  padding: '8px 14px', background: 'rgba(255,255,255,0.92)', borderRadius: T.r.pill,
                  fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.ink1,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon name="grid" size={14} T={T} /> 8 foto
                </button>
              </div>
              <CarRender T={T} variant="hatch" tone="neutral" />
              <CarRender T={T} variant="hatch" tone="colored" label="interno" />
              <CarRender T={T} variant="hatch" tone="neutral" label="cruscotto" />
              <div style={{ position: 'relative' }}>
                <CarRender T={T} variant="hatch" tone="neutral" />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,5,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 600 }}>+4</div>
              </div>
            </div>

            {/* Title + actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 22, gap: 20 }}>
              <div>
                <H T={T} size="h1" style={{ lineHeight: 1 }}>
                  {T.name === 'Lustro' ? <>VW Polo <em style={{ fontStyle: 'italic', fontWeight: 400, color: T.ink2 }}>· 2022</em></> : <>VW Polo · 2022</>}
                </H>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                  <Rating T={T} value={4.8} count={142} size={13} />
                  <Txt T={T} size={13} color={T.ink2} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={13} color={T.ink2} T={T} /> Sesto San Giovanni, Milano
                  </Txt>
                  <Badge T={T} tone="success" icon="check">Disponibile ora</Badge>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button T={T} variant="ghost" size="sm" icon="share">Condividi</Button>
                <Button T={T} variant="ghost" size="sm" icon="heart">Salva</Button>
              </div>
            </div>

            {/* Spec strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
              {[
                { i: 'fuel', l: '1.0 TSI · 95cv', s: 'Benzina' },
                { i: 'transmission', l: 'Manuale', s: '6 marce' },
                { i: 'seat', l: '5 posti', s: '4 porte' },
                { i: 'gauge', l: '40.000 km', s: 'Rev. 2024' },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: 16, background: T.surface, border: `1px solid ${T.line}`,
                  borderRadius: T.r.md, display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  <Icon name={s.i} size={22} color={T.ink1} T={T} />
                  <Txt T={T} size={15} weight={600} style={{ marginTop: 6 }}>{s.l}</Txt>
                  <Txt T={T} size={12} color={T.ink2}>{s.s}</Txt>
                </div>
              ))}
            </div>

            {/* Description */}
            <H T={T} size="h3" style={{ marginTop: 30 }}>Descrizione</H>
            <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 10, lineHeight: 1.65 }}>
              Polo del 2022 in ottime condizioni, ideale per la città e brevi spostamenti extraurbani.
              Tenuta come nuova, sempre in box. Aria condizionata, sensori posteriori, Android Auto e
              Bluetooth.
              <Txt T={T} size={14} color={T.ink2} weight={500} style={{ display: 'block', marginTop: 8, textDecoration: 'underline' }}>leggi tutto</Txt>
            </Txt>

            {/* Accessories */}
            <H T={T} size="h3" style={{ marginTop: 30 }}>Accessori e dotazione</H>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
              {accessories.slice(0, 9).map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="check" size={16} color={T.ok} T={T} />
                  <Txt T={T} size={14}>{a}</Txt>
                </div>
              ))}
            </div>
            <Button T={T} variant="outline" size="sm" iconRight="chevronDown" style={{ marginTop: 14 }}>Mostra tutti i 14 accessori</Button>

            {/* Host */}
            <H T={T} size="h3" style={{ marginTop: 36 }}>Il noleggiatore</H>
            <div style={{ marginTop: 14, padding: 18, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 16, boxShadow: T.sh.soft }}>
              <Avatar T={T} name="AutoLuca" size={64} tone="accent" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Txt T={T} size={17} weight={600}>AutoLuca</Txt>
                  <Badge T={T} tone="success" icon="check">Verificato</Badge>
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                  <Rating T={T} value={4.9} count={142} size={12} />
                  <Txt T={T} size={12} color={T.ink2}>Risponde in ~2 ore</Txt>
                  <Txt T={T} size={12} color={T.ink2}>Noleggia da feb '23</Txt>
                </div>
              </div>
              <Button T={T} variant="outline" size="sm" icon="chat">Scrivi</Button>
              <Button T={T} variant="outline" size="sm" icon="user">Profilo</Button>
            </div>

            {/* Reviews */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <H T={T} size="h3">Recensioni</H>
                <Txt T={T} size={14} color={T.ink2}><Rating T={T} value={4.8} count={142} /> </Txt>
              </div>
              <Button T={T} variant="ghost" size="sm" iconRight="chevron">vedi tutte</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, boxShadow: T.sh.soft }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar T={T} name={r.n} size={36} />
                    <div style={{ flex: 1 }}>
                      <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{r.n}</Txt>
                      <Txt T={T} size={11} color={T.ink2}>{r.d}</Txt>
                    </div>
                    <Rating T={T} value={r.s} size={12} />
                  </div>
                  <Txt T={T} size={13} color={T.ink1} style={{ display: 'block', marginTop: 10, lineHeight: 1.55 }}>{r.t}</Txt>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: sticky price sidebar */}
          <div>
            <div style={{
              position: 'sticky', top: 16,
              background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.lg, padding: 22,
              boxShadow: T.sh.raised,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Price T={T} value={32} unit="/giorno" size="xl" weight={600} />
                <Badge T={T} tone="success" icon="bolt">Conferma ora</Badge>
              </div>
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
                o <strong style={{ color: T.ink1 }}>690€/mese</strong> · 28% di sconto
              </Txt>
              <div style={{ height: 1, background: T.line, margin: '20px 0' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${T.line}`, borderRadius: T.r.md, overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderRight: `1px solid ${T.line}` }}>
                  <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Ritiro</Txt>
                  <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 2 }}>Mer 18 giu</Txt>
                  <Txt T={T} size={11} color={T.ink2}>10:00</Txt>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Riconsegna</Txt>
                  <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 2 }}>Dom 22 giu</Txt>
                  <Txt T={T} size={11} color={T.ink2}>18:00</Txt>
                </div>
              </div>
              <div style={{ marginTop: 14, padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.r.md }}>
                <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Ritiro presso</Txt>
                <Txt T={T} size={13} weight={500} style={{ display: 'block', marginTop: 4 }}>
                  <Icon name="pin" size={12} color={T.ink2} T={T} /> Via Milano 12, Sesto S.G.
                </Txt>
              </div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Txt T={T} size={13} color={T.ink2}>32€ × 4 giorni</Txt>
                  <Txt T={T} size={13}>128€</Txt>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Txt T={T} size={13} color={T.ink2}>Cauzione (rimborsata)</Txt>
                  <Txt T={T} size={13}>200€</Txt>
                </div>
              </div>
              <div style={{ height: 1, background: T.line, margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Txt T={T} size={15} weight={600}>Totale</Txt>
                <Price T={T} value={328} unit="" size="lg" weight={600} />
              </div>
              <Button T={T} variant="accent" size="lg" full iconRight="arrowRight" style={{ marginTop: 18 }}>Richiedi prenotazione</Button>
              <Button T={T} variant="outline" size="md" full icon="chat" style={{ marginTop: 8 }}>Contatta AutoLuca</Button>
              <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>
                Non ti viene addebitato nulla. Il noleggiatore conferma entro 24h.
              </Txt>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────
// VEHICLE — MOBILE (galleria + sticky CTA in basso)
// ─────────────────────────────────────────────────────────
function VehicleV1Mobile({ T }) {
  return (
    <PhoneFrame T={T}>
      <div style={{ height: '100%', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        <div style={{ overflow: 'hidden', height: '100%', paddingBottom: 152 }}>
          {/* Gallery */}
          <div style={{ position: 'relative', height: 240 }}>
            <CarRender T={T} variant="hatch" tone="colored" height={240} />
            {/* top bar overlay */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
              <button style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: T.sh.soft,
              }}>
                <Icon name="chevronLeft" size={18} color={T.ink1} T={T} />
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft }}>
                  <Icon name="share" size={15} color={T.ink1} T={T} />
                </button>
                <button style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft }}>
                  <Icon name="heart" size={15} color={T.ink1} T={T} />
                </button>
              </div>
            </div>
            {/* dots */}
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: '5px 10px', background: 'rgba(20,15,5,0.55)', borderRadius: T.r.pill }}>
              {[0,1,2,3,4].map(i => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
              ))}
              <Txt T={T} size={11} color="#fff" weight={500} style={{ marginLeft: 6 }}>1/8</Txt>
            </div>
          </div>

          <div style={{ padding: '18px 18px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <H T={T} size="h3" style={{ flex: 1 }}>VW Polo · 2022</H>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <Rating T={T} value={4.8} count={142} size={12} />
              <Txt T={T} size={11} color={T.ink2}>·</Txt>
              <Txt T={T} size={12} color={T.ink2}>Sesto S. Giovanni</Txt>
            </div>
            <div style={{ marginTop: 10 }}>
              <Badge T={T} tone="success" icon="check">Disponibile ora</Badge>
            </div>
          </div>

          {/* Spec strip */}
          <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { i: 'fuel', l: 'Benzina' },
              { i: 'transmission', l: 'Manuale' },
              { i: 'seat', l: '5 posti' },
              { i: 'gauge', l: '40k km' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '10px 6px', background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: T.r.md, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <Icon name={s.i} size={18} color={T.ink1} T={T} />
                <Txt T={T} size={11} weight={600}>{s.l}</Txt>
              </div>
            ))}
          </div>

          {/* Host */}
          <div style={{ padding: '6px 18px' }}>
            <div style={{ padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12, boxShadow: T.sh.soft }}>
              <Avatar T={T} name="AutoLuca" size={42} tone="accent" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>AutoLuca</Txt>
                <Txt T={T} size={11} color={T.ink2}>★ 4.9 · 142 noleggi · ~2h</Txt>
              </div>
              <Icon name="chevron" size={18} color={T.ink2} T={T} />
            </div>
          </div>

          {/* Description preview */}
          <div style={{ padding: '14px 18px 4px' }}>
            <H T={T} size="h5">Descrizione</H>
            <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, lineHeight: 1.55 }}>
              Polo del 2022 in ottime condizioni, ideale per la città. Aria condizionata, sensori, Android Auto…
              <Txt T={T} size={13} color={T.ink1} weight={500} style={{ marginLeft: 4, textDecoration: 'underline' }}>leggi tutto</Txt>
            </Txt>
          </div>

          {/* Accessories preview */}
          <div style={{ padding: '12px 18px 16px' }}>
            <H T={T} size="h5">Accessori · 14</H>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
              {['Apple CarPlay', 'Android Auto', 'Bluetooth', 'Sens. parcheggio'].map(a => (
                <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={14} color={T.ok} T={T} />
                  <Txt T={T} size={12}>{a}</Txt>
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
            <Price T={T} value={32} unit="/giorno" size="lg" weight={700} />
            <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>Tot. 128€ · 4 giorni</Txt>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{
            border: `1px solid ${T.line}`, background: T.surface, width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon name="chat" size={18} color={T.ink1} T={T} />
          </button>
          <Button T={T} variant="accent" size="lg" iconRight="arrowRight">Prenota</Button>
        </div>
      </div>
    </PhoneFrame>
  );
}

Object.assign(window, { VehicleV1Desktop, VehicleV1Mobile });
