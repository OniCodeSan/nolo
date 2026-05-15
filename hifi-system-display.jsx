// hifi-system-display.jsx — Artboard per mostrare il sistema di design

const { Icon, CarRender, Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo } = window;

// ─────────────────────────────────────────────────────────
// LOGO SHOWCASE
// ─────────────────────────────────────────────────────────
function LogoOption({ T, kind, label, desc }) {
  // kind: 'mark', 'wordmark', 'monogram'
  let mark;
  if (kind === 'mark') {
    // Circle with car + ruota
    mark =
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="26" fill={T.accent} stroke={T.ink1} strokeWidth="2" />
          <path d="M16 33l1.6-5.4c.4-1.3 1.6-2.3 3-2.3h14.8c1.4 0 2.6 1 3 2.3L40 33v5h-3v-2H19v2h-3z" fill={T.ink1} />
          <circle cx="21" cy="34" r="2.5" fill={T.ink1} />
          <circle cx="35" cy="34" r="2.5" fill={T.ink1} />
        </svg>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', color: T.ink1 }}>noleggio.it</span>
      </div>;

  } else if (kind === 'wordmark') {
    // Just bold wordmark with subtle dot accent
    mark =
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', color: T.ink1 }}>noleggio</span>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', color: T.accent }}>.it</span>
      </span>;

  } else if (kind === 'monogram') {
    // Stacked monogram
    mark =
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
        <div style={{
        width: 56, height: 56, background: T.ink1, color: T.accent,
        borderRadius: T.r.md, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em'
      }}>n.</div>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: T.ink1, lineHeight: 1 }}>
          noleggio<br /><span style={{ fontSize: 16, color: T.ink2 }}>.it</span>
        </span>
      </div>;

  } else if (kind === 'editorial') {
    // Editorial serif wordmark with rule
    mark =
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 44, fontStyle: 'italic', color: T.ink1, lineHeight: 0.9 }}>noleggio.it</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 1, background: T.ink1 }} />
          <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.16em' }}>Aggregatore · IT</Txt>
        </div>
      </div>;

  } else if (kind === 'minimal') {
    // tiny dot mark + sans
    mark =
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: T.accent, border: `2px solid ${T.ink1}`, display: 'inline-block' }} />
        <span style={{ fontFamily: T.fontDisplay, fontSize: 30, fontWeight: 600, letterSpacing: '-0.04em', color: T.ink1 }}>noleggio</span>
      </div>;

  }
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: T.r.lg, padding: '30px 28px',
      boxShadow: T.sh.soft,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18
    }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</Txt>
      <div style={{ minHeight: 60, display: 'flex', alignItems: 'center' }}>{mark}</div>
      <Txt T={T} size={12} color={T.ink2} style={{ lineHeight: 1.5 }}>{desc}</Txt>
    </div>);

}

// ─────────────────────────────────────────────────────────
// LOGO ARTBOARD
// ─────────────────────────────────────────────────────────
function LogoBoard({ T }) {
  return (
    <div style={{ background: T.bg, height: '100%', padding: '40px 48px', boxSizing: 'border-box', overflow: 'hidden', fontFamily: T.fontBody, color: T.ink1 }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
        Direzione {T.name}
      </Txt>
      <H T={T} size="h1" style={{ marginTop: 8 }}>Logo · 3 opzioni</H>
      <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 8, maxWidth: 620 }}>
        Tre direzioni con la stessa famiglia: simbolo + parola, parola sola con accento colore, marchio editoriale.
      </Txt>

      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        <LogoOption T={T} kind={T.name === 'Casa' ? 'mark' : 'editorial'} label="Opzione A · Simbolo + parola"
        desc={T.name === 'Casa' ?
        'Cerchio giallo + sagoma stilizzata auto. Riconoscibile a piccola scala, ottimo per icona app.' :
        'Wordmark serif in corsivo con rule e sottotitolo. Tono editoriale, premium.'} />
        <LogoOption T={T} kind="wordmark" label="Opzione B · Parola con accento"
        desc="Wordmark pieno con .it colorato. Versatile, immediata leggibilità. Funziona in dark mode invertendo il colore." />
        <LogoOption T={T} kind={T.name === 'Casa' ? 'minimal' : 'monogram'} label="Opzione C · Minimalista"
        desc={T.name === 'Casa' ?
        'Punto colorato + parola. Più discreto, ottimo per contesti densi (header con molte voci).' :
        'Blocco solido con monogramma. Modulare, funziona come avatar/favicon.'} />
      </div>

      <div style={{ marginTop: 40 }}>
        <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14 }}>
          Variazioni dell'opzione A
        </Txt>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* small */}
          <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Logo T={T} size={16} />
            <Txt T={T} size={10} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>nav / footer</Txt>
          </div>
          {/* medium */}
          <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Logo T={T} size={22} />
            <Txt T={T} size={10} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>default</Txt>
          </div>
          {/* large */}
          <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Logo T={T} size={30} />
            <Txt T={T} size={10} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>hero / splash</Txt>
          </div>
          {/* dark */}
          <div style={{ padding: 14, background: T.ink1, borderRadius: T.r.md }}>
            <div style={{ filter: T.name === 'Casa' ? 'none' : 'invert(1)' }}>
              <Logo T={{ ...T, ink1: '#fff', ink2: 'rgba(255,255,255,0.7)' }} size={22} />
            </div>
            <Txt T={T} size={10} color="rgba(255,255,255,0.6)" style={{ display: 'block', marginTop: 6 }}>su scuro</Txt>
          </div>
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────
// PALETTE ARTBOARD
// ─────────────────────────────────────────────────────────
function PaletteBoard({ T }) {
  const accents = T.name === 'Casa' ?
  [
  { name: 'Giallo', hex: T.accent, soft: T.accentSoft, isPrimary: true, role: 'Consigliato — caldo, amichevole, riconoscibile' },
  { name: 'Corallo', hex: T.coral, soft: T.coralSoft, role: 'Alternativa energia / urgency' },
  { name: 'Verde', hex: T.green, soft: T.greenSoft, role: 'Alternativa eco / elettrico' }] :

  [
  { name: 'Rosso bruciato', hex: T.accent, soft: T.accentSoft, isPrimary: true, role: 'Consigliato — italian-bold' },
  { name: 'Navy', hex: T.navy, soft: T.navySoft, role: 'Alternativa fiducia / istituzionale' },
  { name: 'Salvia', hex: T.sage, soft: T.sageSoft, role: 'Alternativa raffinata / eco' }];


  return (
    <div style={{ background: T.bg, height: '100%', padding: '40px 48px', boxSizing: 'border-box', overflow: 'hidden', fontFamily: T.fontBody, color: T.ink1 }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
        Direzione {T.name} · Palette
      </Txt>
      <H T={T} size="h1" style={{ marginTop: 8 }}>3 varianti colore</H>
      <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 8, maxWidth: 620 }}>
        Base neutra invariata; cambia solo l'accento primario.
      </Txt>

      {/* Neutral row */}
      <div style={{ marginTop: 36 }}>
        <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Base neutra</Txt>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {[
          { n: 'BG', hex: T.bg },
          { n: 'Surface', hex: T.surface },
          { n: 'Surface alt', hex: T.surfaceAlt },
          { n: 'Ink 1', hex: T.ink1 },
          { n: 'Ink 2', hex: T.ink2 },
          { n: 'Ink 3', hex: T.ink3 }].
          map((c) => <ColorSwatch T={T} key={c.n} {...c} />)}
        </div>
      </div>

      {/* Accent cards */}
      <div style={{ marginTop: 30 }}>
        <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Accento primario · 3 varianti</Txt>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {accents.map((a, i) =>
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.lg, padding: 18,
            boxShadow: T.sh.soft,
            position: 'relative'
          }}>
              {a.isPrimary &&
            <div style={{ position: 'absolute', top: -10, right: 12 }}>
                  <Badge T={T} tone="dark" icon="check">Default</Badge>
                </div>
            }
              <div style={{
              width: '100%', aspectRatio: '2.4 / 1', background: a.hex,
              borderRadius: T.r.md, marginBottom: 14
            }} />
              <Txt T={T} size={15} weight={600} style={{ display: 'block' }}>{a.name}</Txt>
              <Txt T={T} size={11} mono color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{a.hex.toUpperCase()}</Txt>
              <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 8, lineHeight: 1.45 }}>{a.role}</Txt>
              <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
                <div style={{ flex: 2, height: 10, background: a.hex, borderRadius: 2 }} />
                <div style={{ flex: 1, height: 10, background: a.soft, borderRadius: 2 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Semantic */}
      <div style={{ marginTop: 30 }}>
        <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Semantici</Txt>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <ColorSwatch T={T} n="OK" hex={T.ok} />
          <ColorSwatch T={T} n="Alert" hex={T.alert} />
          <ColorSwatch T={T} n="Line" hex={T.line} />
          <ColorSwatch T={T} n="Line strong" hex={T.lineStrong} />
        </div>
      </div>
    </div>);

}

function ColorSwatch({ T, n, hex }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, overflow: 'hidden' }}>
      <div style={{ width: '100%', aspectRatio: '2 / 1', background: hex, borderBottom: `1px solid ${T.line}` }} />
      <div style={{ padding: '8px 10px' }}>
        <Txt T={T} size={12} weight={600} style={{ display: 'block' }}>{n}</Txt>
        <Txt T={T} size={10} mono color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{(hex || '').toUpperCase()}</Txt>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────
// TYPE BOARD
// ─────────────────────────────────────────────────────────
function TypeBoard({ T }) {
  return (
    <div style={{ background: T.bg, height: '100%', padding: '40px 48px', boxSizing: 'border-box', overflow: 'hidden', fontFamily: T.fontBody, color: T.ink1 }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
        Direzione {T.name} · Tipografia
      </Txt>
      <H T={T} size="h1" style={{ marginTop: 8 }}>
        {T.name === 'Casa' ? 'Bricolage Grotesque + Inter' : 'Instrument Serif + Inter'}
      </H>
      <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 8, maxWidth: 620 }}>
        {T.name === 'Casa' ?
        'Display geometrico-grotesque, italiano confidente. Body Inter per UI densa.' :
        'Serif editoriale per titoli, sans neutro per UI. Contrasto magazine.'}
      </Txt>

      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
        {/* Scale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
          { name: 'Display · 64/0.95', size: 'display' },
          { name: 'H1 · 44/1', size: 'h1' },
          { name: 'H2 · 32/1.05', size: 'h2' },
          { name: 'H3 · 22/1.15', size: 'h3' },
          { name: 'H4 · 17/1.2', size: 'h4' }].
          map((s) =>
          <div key={s.size} style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
              <Txt T={T} size={10} mono color={T.ink3} style={{ width: 130, flex: 'none' }}>{s.name}</Txt>
              <H T={T} size={s.size}>L'auto giusta vicino a te.</H>
            </div>
          )}
          {/* Body sizes */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
            <Txt T={T} size={10} mono color={T.ink3} style={{ width: 130, flex: 'none' }}>Body · 16/1.5</Txt>
            <Txt T={T} size={16}>Aggregatore di noleggiatori privati in tutta Italia, senza intermediari.</Txt>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
            <Txt T={T} size={10} mono color={T.ink3} style={{ width: 130, flex: 'none' }}>Body · 14/1.5</Txt>
            <Txt T={T} size={14}>Polo del 2022 in ottime condizioni, ideale per la città.</Txt>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, borderBottom: `1px solid ${T.line}`, paddingBottom: 12 }}>
            <Txt T={T} size={10} mono color={T.ink3} style={{ width: 130, flex: 'none' }}>Caption · 12/1.4</Txt>
            <Txt T={T} size={12} color={T.ink2}>Sesto S.G. · 1.4 km da te · Disponibile oggi</Txt>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <Txt T={T} size={10} mono color={T.ink3} style={{ width: 130, flex: 'none' }}>Mono · 12</Txt>
            <Txt T={T} mono size={12} color={T.ink2}>Marca: VW · Modello: Polo · Anno: 2022</Txt>
          </div>
        </div>
        {/* Right column: details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Display</Txt>
            <Txt T={T} size={20} weight={600} style={{ fontFamily: T.fontDisplay, display: 'block', marginTop: 8 }}>
              {T.name === 'Casa' ? 'Bricolage Grotesque' : 'Instrument Serif'}
            </Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
              {T.name === 'Casa' ? 'Weights: 400, 500, 600, 700' : 'Weights: 400 (regular + italic)'}
            </Txt>
          </div>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Body</Txt>
            <Txt T={T} size={20} weight={500} style={{ display: 'block', marginTop: 8 }}>Inter</Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>Weights: 400, 500, 600, 700</Txt>
          </div>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Mono</Txt>
            <Txt T={T} mono size={20} weight={500} style={{ display: 'block', marginTop: 8 }}>JetBrains Mono</Txt>
            <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>per dati tecnici / specifiche</Txt>
          </div>
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────
// COMPONENTS BOARD
// ─────────────────────────────────────────────────────────
function ComponentsBoard({ T }) {
  return (
    <div style={{ background: T.bg, height: '100%', padding: '40px 48px', boxSizing: 'border-box', overflow: 'hidden', fontFamily: T.fontBody, color: T.ink1 }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>
        Direzione {T.name} · Componenti
      </Txt>
      <H T={T} size="h1" style={{ marginTop: 8 }}>Sistema base</H>

      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Buttons */}
        <div>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Bottoni</Txt>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
            <Button T={T} variant="primary" size="lg">Primario lg</Button>
            <Button T={T} variant="primary">Primario</Button>
            <Button T={T} variant="primary" size="sm">Primario sm</Button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
            <Button T={T} variant="accent" icon="search">Accent</Button>
            <Button T={T} variant="outline">Outline</Button>
            <Button T={T} variant="secondary">Secondary</Button>
            <Button T={T} variant="ghost" iconRight="chevron">Ghost</Button>
          </div>
        </div>
        {/* Chips */}
        <div>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Chips & Badge</Txt>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <Chip T={T} active>Active</Chip>
            <Chip T={T}>Default</Chip>
            <Chip T={T} icon="check">Con icona</Chip>
            <Chip T={T} active onClose>Removable</Chip>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Badge T={T} tone="accent" icon="sparkle">Accent</Badge>
            <Badge T={T} tone="success" icon="check">Success</Badge>
            <Badge T={T} tone="alert">Alert</Badge>
            <Badge T={T} tone="dark">Dark</Badge>
            <Badge T={T} tone="neutral">Neutral</Badge>
          </div>
        </div>
        {/* Inputs */}
        <div>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Input</Txt>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Input T={T} label="Email" value="luca@email.it" />
            <Input T={T} label="Località" icon="pin" placeholder="Inizia a digitare…" />
            <Input T={T} label="Date" icon="calendar" value="18-22 giugno" suffix="▾" />
          </div>
        </div>
        {/* Price + rating + avatars */}
        <div>
          <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Prezzi & Rating</Txt>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', marginBottom: 10 }}>
            <Price T={T} value={32} size="lg" weight={700} />
            <Price T={T} value={690} unit="/mese" size="md" />
            <Price T={T} value={120} unit="" size="sm" />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
            <Rating T={T} value={4.8} count={142} />
            <Rating T={T} value={5.0} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Avatar T={T} name="Luca" size={32} />
            <Avatar T={T} name="GreenCar" size={36} tone="accent" />
            <Avatar T={T} name="AutoLuca" size={42} tone="accent" />
            <Avatar T={T} name="Marta" size={48} />
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, { LogoBoard, PaletteBoard, TypeBoard, ComponentsBoard });