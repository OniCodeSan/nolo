// Schermate pubbliche: Home / Risultati / Scheda veicolo
// Tre varianti per ciascuna, mobile + desktop affiancati.

const { INK, INK_SOFT, PAPER, PAPER_2, YELLOW, YELLOW_DEEP, RED, BLUE, GREEN,
  HAND, DISPLAY, MONO,
  SkBox, SkLine, SkText, SkBtn, SkChip, SkInput, SkImg, SkCarPlaceholder, SkIcon,
  Anno, Squiggle, Frame, MobileStatus, MobileTabBar } = window;

// ─────────────────────────────────────────────────────────────
// HEADER (riusabile)
// ─────────────────────────────────────────────────────────────
function MobileHeader({ title, back, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px 12px' }}>
      {back ? <SkIcon name="chevronLeft" size={20} /> : <SkIcon name="menu" size={20} />}
      {title && <SkText size={15} weight={700} font={DISPLAY}>{title}</SkText>}
      {action || <SkIcon name="user" size={20} />}
    </div>
  );
}

function Logo({ size = 22 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={YELLOW} stroke={INK} strokeWidth="1.5" />
          <path d="M 6 14 L 7 11 Q 7.5 10 8.5 10 L 15.5 10 Q 16.5 10 17 11 L 18 14 M 6 14 L 18 14 L 18 16 L 16 16 L 16 15 M 6 14 L 6 16 L 8 16 L 8 15" fill="none" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="9" cy="14.5" r="1" fill={INK} />
          <circle cx="15" cy="14.5" r="1" fill={INK} />
        </svg>
      </span>
      <SkText size={size * 0.85} weight={700} font={DISPLAY} style={{ letterSpacing: -0.3 }}>noleggio.it</SkText>
    </div>
  );
}

function DesktopNav({ active }) {
  const items = ['Esplora', 'Mappa', 'Per noleggiatori', 'Aiuto'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: `1.3px solid ${INK}` }}>
      <Logo size={26} />
      <div style={{ display: 'flex', gap: 22 }}>
        {items.map(i => (
          <SkText key={i} size={14} weight={i === active ? 700 : 400} style={{ borderBottom: i === active ? `1.5px solid ${INK}` : 'none', paddingBottom: 2 }}>{i}</SkText>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SkText size={13} color={INK_SOFT}>Accedi</SkText>
        <SkBtn variant="solid" size="sm" fill={INK} seed="signup">Registrati</SkBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — V1: Search bar prominente (motore di ricerca-like)
// ─────────────────────────────────────────────────────────────
function HomeV1Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative', paddingBottom: 60 }}>
        <div style={{ padding: '4px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Logo size={20} />
            <SkIcon name="menu" size={20} />
          </div>
          <SkText size={26} weight={700} font={DISPLAY} style={{ lineHeight: 1.05, display: 'block' }}>
            Trova l'auto giusta.<br />
            <span style={{ background: YELLOW, padding: '0 4px' }}>Vicino a te.</span>
          </SkText>
          <SkText size={13} color={INK_SOFT} style={{ display: 'block', marginTop: 8 }}>
            Da noleggiatori privati indipendenti.
          </SkText>
          <SkBox seed="search1" fill="#fff" style={{ marginTop: 18, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkInput seed="loc1" icon={<SkIcon name="pin" size={16} />} value="Milano" />
            <SkInput seed="dt1" icon={<SkIcon name="calendar" size={16} />} placeholder="Quando ti serve?" />
            <SkBtn full size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="cta1">
              <SkIcon name="search" size={16} /> Cerca auto
            </SkBtn>
          </SkBox>

          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkText size={15} weight={700} font={DISPLAY}>Categorie</SkText>
            <SkText size={11} color={INK_SOFT}>vedi tutte →</SkText>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
            {[
              { l: 'Citycar', t: 'yellow' },
              { l: 'SUV', t: 'paper' },
              { l: 'Elettrica', t: 'green' },
              { l: 'Cabrio', t: 'red' },
              { l: 'Furgone', t: 'blue' },
              { l: 'Lungo termine', t: 'paper' },
            ].map((c, i) => (
              <div key={c.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <SkCarPlaceholder seed={'cat' + i} height={50} label="" tone={c.t} />
                <SkText size={11} weight={600}>{c.l}</SkText>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <SkText size={15} weight={700} font={DISPLAY}>Vicino a Milano</SkText>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, overflow: 'hidden' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ minWidth: 140, flex: 'none' }}>
                  <SkCarPlaceholder seed={'near' + i} height={80} label="" />
                  <SkText size={12} weight={600} style={{ display: 'block', marginTop: 4 }}>Fiat 500</SkText>
                  <SkText size={11} color={INK_SOFT}>da 35€/giorno</SkText>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MobileTabBar active="home" />
        <Anno top={86} right={-4} width={130} rotate={6} color={YELLOW}>
          1 search<br/>—&gt; 1 obiettivo
        </Anno>
        <Anno top={272} right={-8} width={120} rotate={-4} color="#cfe4d4">
          chip categorie<br/>visive
        </Anno>
      </div>
    </Frame>
  );
}

function HomeV1Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/">
      <DesktopNav active="Esplora" />
      <div style={{ padding: '40px 64px', position: 'relative' }}>
        <SkText size={56} weight={700} font={DISPLAY} style={{ lineHeight: 1, display: 'block', maxWidth: 720 }}>
          Trova l'auto giusta. <span style={{ background: YELLOW, padding: '0 6px' }}>Vicino a te.</span>
        </SkText>
        <SkText size={16} color={INK_SOFT} style={{ display: 'block', marginTop: 14 }}>
          Aggregatore di noleggiatori privati in tutta Italia. Nessun intermediario.
        </SkText>

        <SkBox seed="search1d" fill="#fff" style={{ marginTop: 28, padding: 14, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 880 }}>
          <SkInput seed="loc1d" label="Dove" icon={<SkIcon name="pin" size={16} />} value="Milano, MI" style={{ flex: 1.4 }} />
          <SkInput seed="dt1d" label="Ritiro" icon={<SkIcon name="calendar" size={16} />} value="Mer 18 giu" style={{ flex: 1 }} />
          <SkInput seed="dt1dr" label="Riconsegna" icon={<SkIcon name="calendar" size={16} />} value="Dom 22 giu" style={{ flex: 1 }} />
          <SkInput seed="cat1d" label="Tipo" value="Tutte" suffix="▾" style={{ flex: 0.9 }} />
          <SkBtn size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="ctad">
            <SkIcon name="search" size={18} /> Cerca
          </SkBtn>
        </SkBox>

        <SkText size={14} color={INK_SOFT} style={{ display: 'block', marginTop: 14 }}>
          Cercato spesso: <span style={{ textDecoration: 'underline' }}>Roma centro</span> · <span style={{ textDecoration: 'underline' }}>Catania aeroporto</span> · <span style={{ textDecoration: 'underline' }}>Bolzano</span>
        </SkText>

        <div style={{ marginTop: 36 }}>
          <SkText size={24} weight={700} font={DISPLAY}>Esplora per categoria</SkText>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginTop: 14 }}>
            {[
              { l: 'Citycar', t: 'yellow' },
              { l: 'SUV', t: 'paper' },
              { l: 'Elettrica', t: 'green' },
              { l: 'Cabrio', t: 'red' },
              { l: 'Furgone', t: 'blue' },
              { l: 'Lungo termine', t: 'paper' },
            ].map((c, i) => (
              <div key={c.l}>
                <SkCarPlaceholder seed={'catd' + i} height={90} label="" tone={c.t} />
                <SkText size={13} weight={600} style={{ display: 'block', marginTop: 6 }}>{c.l}</SkText>
                <SkText size={11} color={INK_SOFT}>da {25 + i * 8}€/giorno</SkText>
              </div>
            ))}
          </div>
        </div>

        <Anno top={120} right={32} width={180} rotate={4} color={YELLOW}>
          search bar = 1° schermata.<br/>tutto inline, no step
        </Anno>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — V2: Form a step (location → date → tipo)
// ─────────────────────────────────────────────────────────────
function HomeV2Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ height: '100%', position: 'relative', paddingBottom: 60 }}>
        <div style={{ padding: '4px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Logo size={20} />
            <SkIcon name="menu" size={20} />
          </div>
          <div style={{ height: 130, position: 'relative', marginTop: 8 }}>
            <SkImg seed="hero2" height={130} label="hero photo" tone="yellow" />
            <div style={{ position: 'absolute', left: 12, bottom: 10 }}>
              <SkText size={22} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>3 passi.</SkText>
              <SkText size={14} font={HAND} style={{ display: 'block' }}>e hai la tua auto.</SkText>
            </div>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
            {[1, 2, 3].map((n, i) => (
              <React.Fragment key={n}>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${INK}`, background: n === 1 ? YELLOW : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SkText size={11} weight={700}>{n}</SkText>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, borderTop: `1.4px dashed ${INK}` }} />}
              </React.Fragment>
            ))}
          </div>
          <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginTop: 4 }}>
            Step 1 di 3 — Dove ti serve?
          </SkText>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SkInput seed="locv2" label="Città o aeroporto" icon={<SkIcon name="pin" size={16} />} placeholder="Es. Milano centro" />
            <SkBox seed="sugg" fill={PAPER_2} style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkText size={11} color={INK_SOFT}>Suggeriti</SkText>
              {['Milano Centrale', 'Milano Linate', 'Milano Malpensa', 'Bergamo Orio'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SkIcon name="pin" size={14} color={INK_SOFT} />
                  <SkText size={13}>{s}</SkText>
                </div>
              ))}
            </SkBox>
            <SkBtn full size="lg" fill={INK} seed="next2">Avanti →</SkBtn>
          </div>
        </div>
        <MobileTabBar active="search" />
        <Anno top={232} right={-4} width={130} rotate={-5} color={YELLOW}>
          un campo per<br/>schermata. ZERO distrazioni.
        </Anno>
      </div>
    </Frame>
  );
}

function HomeV2Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/cerca">
      <DesktopNav active="Esplora" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 580 }}>
        <SkImg seed="herod" width="100%" height="100%" label="big photo: auto in città" tone="paper" style={{ borderRadius: 0, border: 'none', borderRight: `1.4px solid ${INK}` }} />
        <div style={{ padding: '54px 56px' }}>
          <SkText size={42} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>
            3 passi.<br/>e hai la tua auto.
          </SkText>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26 }}>
            {[
              { n: 1, l: 'Dove', a: true },
              { n: 2, l: 'Quando' },
              { n: 3, l: 'Che tipo' },
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 14, border: `1.5px solid ${INK}`, background: s.a ? YELLOW : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SkText size={13} weight={700}>{s.n}</SkText>
                  </div>
                  <SkText size={14} weight={s.a ? 700 : 400}>{s.l}</SkText>
                </div>
                {i < 2 && <div style={{ flex: 1, borderTop: `1.4px dashed ${INK}` }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SkInput seed="locv2d" label="Città o aeroporto" icon={<SkIcon name="pin" size={16} />} placeholder="Inizia a digitare…" />
            <SkBox seed="suggd" fill={PAPER_2} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkText size={11} color={INK_SOFT}>Suggeriti</SkText>
              {[
                { n: 'Milano Centrale', s: 'stazione · 320 auto disponibili' },
                { n: 'Milano Linate', s: 'aeroporto · 180 auto' },
                { n: 'Milano Malpensa', s: 'aeroporto · 410 auto' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SkIcon name="pin" size={16} color={INK_SOFT} />
                  <div>
                    <SkText size={14} weight={600} style={{ display: 'block' }}>{s.n}</SkText>
                    <SkText size={11} color={INK_SOFT}>{s.s}</SkText>
                  </div>
                </div>
              ))}
            </SkBox>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <SkBtn size="md" variant="ghost" seed="back2d">← indietro</SkBtn>
              <SkBtn size="lg" fill={INK} seed="next2d">Avanti</SkBtn>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — V3: Mappa-first
// ─────────────────────────────────────────────────────────────
function MapBg({ height = '100%' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#e9e4d3', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 320 600" preserveAspectRatio="none">
        {/* roads */}
        <path d="M -20 120 Q 80 110 160 140 T 340 100" stroke={INK_SOFT} strokeWidth="2.4" fill="none" opacity="0.5" />
        <path d="M -20 260 Q 100 250 200 280 T 340 240" stroke={INK_SOFT} strokeWidth="2.4" fill="none" opacity="0.5" />
        <path d="M -20 400 Q 100 410 220 380 T 340 420" stroke={INK_SOFT} strokeWidth="2.4" fill="none" opacity="0.5" />
        <path d="M 80 -20 Q 90 100 100 240 T 80 620" stroke={INK_SOFT} strokeWidth="1.6" fill="none" opacity="0.3" />
        <path d="M 200 -20 Q 220 200 230 380 T 220 620" stroke={INK_SOFT} strokeWidth="1.6" fill="none" opacity="0.3" />
        {/* park */}
        <path d="M 230 80 Q 280 90 290 140 Q 280 180 230 170 Z" fill={GREEN} opacity="0.2" stroke={INK_SOFT} strokeWidth="0.6" />
        {/* river */}
        <path d="M 0 480 Q 80 460 160 490 T 320 470 L 320 540 L 0 540 Z" fill={BLUE} opacity="0.15" />
      </svg>
    </div>
  );
}

function MapPin({ x, y, price, hot, big }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)' }}>
      <div style={{
        background: hot ? INK : '#fff',
        color: hot ? '#fff' : INK,
        border: `1.4px solid ${INK}`,
        borderRadius: 14,
        padding: big ? '6px 12px' : '3px 8px',
        fontFamily: HAND, fontWeight: 700, fontSize: big ? 13 : 11,
        boxShadow: '1px 2px 0 rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
      }}>
        {price}
      </div>
    </div>
  );
}

function HomeV3Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <MapBg />
        {/* search overlay top */}
        <div style={{ position: 'absolute', top: 12, left: 10, right: 10 }}>
          <SkBox seed="sov3" fill="#fff" style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <SkIcon name="search" size={16} />
            <SkText size={13} color={INK_SOFT} style={{ flex: 1 }}>Milano · 18–22 giu</SkText>
            <SkIcon name="sliders" size={16} />
          </SkBox>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, overflow: 'hidden' }}>
            {['Sotto 50€', 'Elettrica', 'Cambio auto', '5+ posti'].map((c, i) => (
              <SkChip key={c} seed={'fc' + i} active={i === 0}>{c}</SkChip>
            ))}
          </div>
        </div>
        {/* pins */}
        <MapPin x={80} y={200} price="32€" />
        <MapPin x={160} y={260} price="49€" hot big />
        <MapPin x={240} y={220} price="55€" />
        <MapPin x={120} y={340} price="38€" />
        <MapPin x={210} y={380} price="42€" />
        <MapPin x={90} y={440} price="60€" />
        {/* bottom card */}
        <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10 }}>
          <SkBox seed="bv3" fill="#fff" style={{ padding: 10, display: 'flex', gap: 10 }}>
            <SkCarPlaceholder seed="bv3c" width={90} height={64} label="" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <SkText size={13} weight={700}>VW Polo · 2022</SkText>
                <SkText size={11} color={INK_SOFT}>AutoLuca · Sesto S. Giovanni</SkText>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <SkText size={16} weight={700} font={DISPLAY}>49€<SkText size={11} color={INK_SOFT}>/giorno</SkText></SkText>
                <SkBtn size="sm" fill={INK}>vedi →</SkBtn>
              </div>
            </div>
          </SkBox>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 6 }}>
            {[0,1,2,3,4,5].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: i === 1 ? INK : INK_SOFT, opacity: i === 1 ? 1 : 0.4 }} />)}
          </div>
        </div>
        {/* toggle list/map */}
        <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)' }}>
          <SkBtn size="sm" fill={INK} seed="tlist">
            <SkIcon name="list" size={14} color="#fff" /> Vedi lista
          </SkBtn>
        </div>
      </div>
      <MobileTabBar active="home" />
      <Anno top={20} right={-6} width={120} rotate={5} color={YELLOW}>
        mappa<br/>= primo<br/>impatto
      </Anno>
    </Frame>
  );
}

function HomeV3Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/mappa">
      <DesktopNav active="Mappa" />
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: 575 }}>
        {/* left: list */}
        <div style={{ borderRight: `1.3px solid ${INK}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: `1.3px solid ${INK}` }}>
            <SkInput seed="sd3" icon={<SkIcon name="search" size={16} />} value="Milano · 18–22 giu · Tutte" />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {['Sotto 50€', 'Elettrica', 'Cambio auto', '5+ posti', 'Aria cond.'].map((c, i) => (
                <SkChip key={c} seed={'fcd' + i} active={i === 0 || i === 2}>{c}</SkChip>
              ))}
            </div>
            <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginTop: 8 }}>
              183 auto trovate · ordina per <span style={{ textDecoration: 'underline' }}>prezzo ↑</span>
            </SkText>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {[
              { n: 'VW Polo · 2022', l: 'Sesto S.G.', p: 32, host: 'AutoLuca', hot: true },
              { n: 'Fiat 500 · 2021', l: 'Centrale', p: 38, host: 'CarHub MI' },
              { n: 'Renault Clio · 2023', l: 'Navigli', p: 42, host: 'CarHub MI' },
            ].map((c, i) => (
              <div key={c.n} style={{ padding: 12, borderBottom: `1px dashed ${INK_SOFT}`, display: 'flex', gap: 12, background: c.hot ? YELLOW + '22' : 'transparent' }}>
                <SkCarPlaceholder seed={'lcd' + i} width={120} height={70} label="" />
                <div style={{ flex: 1 }}>
                  <SkText size={13} weight={700} style={{ display: 'block' }}>{c.n}</SkText>
                  <SkText size={11} color={INK_SOFT}>{c.host} · {c.l}</SkText>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
                    <SkText size={16} weight={700} font={DISPLAY}>{c.p}€<SkText size={11} color={INK_SOFT}>/giorno</SkText></SkText>
                    <SkIcon name="heart" size={14} color={INK_SOFT} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* right: map */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <MapBg />
          <MapPin x={180} y={150} price="32€" hot big />
          <MapPin x={320} y={200} price="38€" />
          <MapPin x={420} y={170} price="42€" />
          <MapPin x={500} y={260} price="49€" />
          <MapPin x={620} y={220} price="55€" />
          <MapPin x={280} y={320} price="36€" />
          <MapPin x={460} y={400} price="44€" />
          <MapPin x={600} y={380} price="58€" />
          <MapPin x={380} y={480} price="40€" />
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SkBox seed="zin" fill="#fff" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</SkBox>
            <SkBox seed="zout" fill="#fff" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</SkBox>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// LISTING — V1: Lista classica, filtri come chips top
// ─────────────────────────────────────────────────────────────
function VehicleCard({ seed, name, host, loc, price, kw = [], hot, layout = 'grid' }) {
  const photo = <SkCarPlaceholder seed={seed + 'c'} height={layout === 'list' ? 84 : 110} label="" />;
  const body = (
    <div style={{ flex: 1, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <SkText size={13} weight={700} style={{ display: 'block' }}>{name}</SkText>
          <SkText size={11} color={INK_SOFT}>{host} · {loc}</SkText>
        </div>
        <SkIcon name="heart" size={14} color={INK_SOFT} />
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
        {kw.map(k => <SkText key={k} size={10} font={MONO} color={INK_SOFT} style={{ background: PAPER_2, padding: '1px 4px' }}>{k}</SkText>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
        <div>
          <SkText size={17} weight={700} font={DISPLAY}>{price}€</SkText>
          <SkText size={10} color={INK_SOFT}> /giorno</SkText>
        </div>
        {hot && <SkChip seed={seed + 'h'} active><SkIcon name="check" size={10} /> oggi</SkChip>}
      </div>
    </div>
  );
  if (layout === 'list') {
    return (
      <SkBox seed={seed} fill="#fff" style={{ padding: 10, display: 'flex', gap: 10 }}>
        <div style={{ width: 110 }}>{photo}</div>
        {body}
      </SkBox>
    );
  }
  return (
    <SkBox seed={seed} fill="#fff" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {photo}
      {body}
    </SkBox>
  );
}

function ListV1Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        {/* sticky header */}
        <div style={{ padding: '8px 12px', borderBottom: `1.3px solid ${INK}`, background: PAPER }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SkIcon name="chevronLeft" size={18} />
            <SkBox seed="searchl1" fill="#fff" style={{ flex: 1, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <SkIcon name="search" size={14} />
              <SkText size={12}>Milano · 18-22 giu</SkText>
            </SkBox>
            <SkIcon name="map" size={18} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, overflow: 'hidden' }}>
            <SkChip seed="fl1" active icon={<SkIcon name="filter" size={11} />}>Filtri · 2</SkChip>
            <SkChip seed="fl2" active>Sotto 50€</SkChip>
            <SkChip seed="fl3">Elettrica</SkChip>
            <SkChip seed="fl4">SUV</SkChip>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <SkText size={11} weight={600}>183 risultati</SkText>
            <SkText size={11} color={INK_SOFT}>Prezzo ↑ ▾</SkText>
          </div>
        </div>
        {/* list */}
        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { n: 'VW Polo · 2022', h: 'AutoLuca', l: 'Sesto S.G.', p: 32, k: ['1.0 TSI', 'Manuale', '5 posti'], hot: true },
            { n: 'Fiat 500e · 2023', h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica', '4 posti'] },
            { n: 'Renault Clio · 2023', h: 'CarHub MI', l: 'Centrale', p: 42, k: ['Hybrid', 'Auto'], hot: true },
          ].map((c, i) => <VehicleCard key={i} seed={'lv1' + i} {...c} kw={c.k} layout="list" />)}
        </div>
      </div>
      <MobileTabBar active="search" />
    </Frame>
  );
}

function ListV1Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/cerca?l=milano">
      <DesktopNav active="Esplora" />
      {/* search bar */}
      <div style={{ padding: '12px 32px', borderBottom: `1.3px solid ${INK}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkInput seed="sl1d" icon={<SkIcon name="pin" size={14} />} value="Milano" style={{ width: 160 }} dense />
        <SkInput seed="sl1dd" icon={<SkIcon name="calendar" size={14} />} value="18-22 giu" style={{ width: 160 }} dense />
        <SkInput seed="sl1dt" value="Tutti i tipi" suffix="▾" style={{ width: 140 }} dense />
        <SkBtn size="sm" fill={INK} seed="lookd">Aggiorna</SkBtn>
        <div style={{ flex: 1 }} />
        <SkText size={12} color={INK_SOFT}>183 risultati · ordina <span style={{ textDecoration: 'underline' }}>Prezzo ↑</span></SkText>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 540 }}>
        {/* sidebar filters */}
        <div style={{ padding: 18, borderRight: `1.3px solid ${INK}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SkText size={14} weight={700} font={DISPLAY}>Filtri</SkText>
          <div>
            <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Prezzo / giorno</SkText>
            <div style={{ position: 'relative', height: 24 }}>
              <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 1.4, background: INK }} />
              <div style={{ position: 'absolute', top: 11, left: '20%', right: '40%', height: 2, background: INK }} />
              <div style={{ position: 'absolute', top: 5, left: '20%', width: 14, height: 14, borderRadius: 7, background: '#fff', border: `1.4px solid ${INK}` }} />
              <div style={{ position: 'absolute', top: 5, left: '60%', width: 14, height: 14, borderRadius: 7, background: '#fff', border: `1.4px solid ${INK}` }} />
            </div>
            <SkText size={11} color={INK_SOFT}>25€ — 80€</SkText>
          </div>
          <div>
            <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Carburante</SkText>
            {['Benzina', 'Diesel', 'Hybrid', 'Elettrica', 'GPL'].map((f, i) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                <SkBox seed={'cb' + i} style={{ width: 14, height: 14, background: i === 2 || i === 3 ? INK : '#fff' }} />
                <SkText size={12}>{f}</SkText>
                <SkText size={10} color={INK_SOFT} style={{ marginLeft: 'auto' }}>{[42, 31, 28, 12, 8][i]}</SkText>
              </div>
            ))}
          </div>
          <div>
            <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Cambio</SkText>
            <div style={{ display: 'flex', gap: 6 }}>
              <SkChip seed="cm1" active>Tutti</SkChip>
              <SkChip seed="cm2">Manuale</SkChip>
              <SkChip seed="cm3">Auto.</SkChip>
            </div>
          </div>
          <div>
            <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Accessori</SkText>
            {['Apple CarPlay', 'Android Auto', 'Tetto', 'Cruise', 'Sens. parcheggio', '+12 altri…'].map(a => (
              <SkText key={a} size={12} style={{ display: 'block', padding: '2px 0', textDecoration: 'underline' }}>{a}</SkText>
            ))}
          </div>
          <SkBtn full size="sm" variant="ghost" seed="reset">Azzera filtri</SkBtn>
        </div>
        {/* grid */}
        <div style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { n: 'VW Polo · 2022', h: 'AutoLuca', l: 'Sesto S.G.', p: 32, k: ['1.0 TSI', 'Manuale'], hot: true },
              { n: 'Fiat 500e · 2023', h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica', 'Auto.'] },
              { n: 'Renault Clio · 2023', h: 'CarHub MI', l: 'Centrale', p: 42, k: ['Hybrid', 'Auto.'], hot: true },
              { n: 'Citroën C3 · 2021', h: 'AutoLuca', l: 'Sesto', p: 28, k: ['Diesel', 'Manuale'] },
              { n: 'Audi A1 · 2022', h: 'PremiumDrive', l: 'Porta Romana', p: 55, k: ['Benz.', 'Auto.'] },
              { n: 'Peugeot 208 · 2023', h: 'CarHub', l: 'Centrale', p: 36, k: ['Hybrid'], hot: true },
            ].map((c, i) => <VehicleCard key={i} seed={'lvd1' + i} {...c} kw={c.k} />)}
          </div>
        </div>
      </div>
      <Anno top={86} left={250} width={170} rotate={-3} color={YELLOW}>
        sidebar persistente,<br/>grid 3 col su desk
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// LISTING — V2: Split mappa/lista
// ─────────────────────────────────────────────────────────────
function ListV2Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        {/* map half */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '38%', overflow: 'hidden' }}>
          <MapBg />
          <MapPin x={60} y={50} price="32€" />
          <MapPin x={180} y={90} price="49€" hot big />
          <MapPin x={260} y={60} price="55€" />
          <MapPin x={120} y={150} price="38€" />
          <MapPin x={220} y={170} price="42€" />
          <div style={{ position: 'absolute', top: 8, left: 8, right: 8 }}>
            <SkBox seed="msv2" fill="#fff" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <SkIcon name="chevronLeft" size={14} />
              <SkText size={12} style={{ flex: 1 }}>Milano · 18-22 giu</SkText>
              <SkIcon name="filter" size={14} />
            </SkBox>
          </div>
        </div>
        {/* sheet */}
        <div style={{ position: 'absolute', top: '36%', left: 0, right: 0, bottom: 0, background: PAPER, borderTop: `1.4px solid ${INK}`, borderRadius: '12px 12px 0 0', padding: 10, overflow: 'hidden' }}>
          <div style={{ width: 40, height: 4, background: INK_SOFT, borderRadius: 2, margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <SkText size={12} weight={700}>183 risultati</SkText>
            <SkText size={11} color={INK_SOFT}>prezzo ↑</SkText>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { n: 'VW Polo · 2022', h: 'AutoLuca', l: 'Sesto', p: 32, k: ['1.0 TSI'], hot: true },
              { n: 'Fiat 500e · 2023', h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica'] },
            ].map((c, i) => <VehicleCard key={i} seed={'lv2' + i} {...c} kw={c.k} layout="list" />)}
          </div>
        </div>
      </div>
      <MobileTabBar active="search" />
      <Anno top={140} right={-2} width={120} rotate={5} color={YELLOW}>
        sheet draggable<br/>su/giù
      </Anno>
    </Frame>
  );
}

function ListV2Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/cerca">
      <DesktopNav active="Esplora" />
      <div style={{ padding: '10px 24px', borderBottom: `1.3px solid ${INK}`, display: 'flex', gap: 10, alignItems: 'center' }}>
        <SkInput seed="lv2sd" icon={<SkIcon name="pin" size={14} />} value="Milano · 18-22 giu · Tutte" dense style={{ width: 320 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['Sotto 50€', 'Elettrica', 'Cambio auto'].map((c, i) => <SkChip key={c} seed={'lv2c' + i} active={i === 0}>{c}</SkChip>)}
        </div>
        <SkChip seed="more">+ altri filtri</SkChip>
        <div style={{ flex: 1 }} />
        <SkText size={12} color={INK_SOFT}>183 risultati</SkText>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 540 }}>
        {/* list */}
        <div style={{ overflow: 'hidden', padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, gridAutoRows: 'min-content' }}>
          {[
            { n: 'VW Polo · 2022', h: 'AutoLuca', l: 'Sesto', p: 32, k: ['1.0 TSI', 'Manuale'], hot: true },
            { n: 'Fiat 500e · 2023', h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettrica'] },
            { n: 'Renault Clio · 2023', h: 'CarHub', l: 'Centrale', p: 42, k: ['Hybrid'], hot: true },
            { n: 'Citroën C3 · 2021', h: 'AutoLuca', l: 'Sesto', p: 28, k: ['Diesel'] },
          ].map((c, i) => <VehicleCard key={i} seed={'lv2d' + i} {...c} kw={c.k} />)}
        </div>
        {/* map */}
        <div style={{ position: 'relative', overflow: 'hidden', borderLeft: `1.3px solid ${INK}` }}>
          <MapBg />
          <MapPin x={180} y={150} price="32€" hot big />
          <MapPin x={320} y={200} price="39€" />
          <MapPin x={250} y={300} price="42€" />
          <MapPin x={380} y={260} price="28€" />
          <MapPin x={460} y={400} price="55€" />
          <MapPin x={300} y={420} price="44€" />
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// LISTING — V3: Filtri come bottom-sheet (mobile) / mega-filter (desk)
// ─────────────────────────────────────────────────────────────
function ListV3Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ padding: '6px 12px', borderBottom: `1.3px solid ${INK}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SkIcon name="chevronLeft" size={18} />
            <SkText size={13} weight={700} style={{ flex: 1 }}>Milano · 4 giorni</SkText>
            <SkIcon name="map" size={18} />
          </div>
        </div>
        {/* dim list under sheet */}
        <div style={{ padding: 10, opacity: 0.4 }}>
          <VehicleCard seed="dim1" name="VW Polo · 2022" host="AutoLuca" loc="Sesto" price={32} kw={['1.0 TSI']} layout="list" />
        </div>
        {/* bottom sheet open */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1.5px solid ${INK}`, borderRadius: '14px 14px 0 0', padding: '12px 14px 14px', maxHeight: '70%', overflow: 'hidden' }}>
          <div style={{ width: 40, height: 4, background: INK_SOFT, borderRadius: 2, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SkText size={16} weight={700} font={DISPLAY}>Filtri</SkText>
            <SkText size={12} color={INK_SOFT}>azzera</SkText>
          </div>
          <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginBottom: 6 }}>PREZZO / GIORNO</SkText>
          <div style={{ position: 'relative', height: 20, marginBottom: 14 }}>
            <div style={{ position: 'absolute', top: 9, left: 0, right: 0, height: 1.4, background: INK }} />
            <div style={{ position: 'absolute', top: 9, left: '20%', right: '40%', height: 2, background: INK }} />
            <div style={{ position: 'absolute', top: 3, left: '20%', width: 14, height: 14, borderRadius: 7, background: '#fff', border: `1.4px solid ${INK}` }} />
            <div style={{ position: 'absolute', top: 3, left: '60%', width: 14, height: 14, borderRadius: 7, background: '#fff', border: `1.4px solid ${INK}` }} />
          </div>
          <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginBottom: 6 }}>CARBURANTE</SkText>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {['Benz.', 'Diesel', 'Hybrid', 'Elettr.', 'GPL'].map((f, i) => <SkChip key={f} seed={'sc' + i} active={i === 2 || i === 3}>{f}</SkChip>)}
          </div>
          <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginBottom: 6 }}>CAMBIO</SkText>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <SkChip seed="cmb1" active>Tutti</SkChip>
            <SkChip seed="cmb2">Manuale</SkChip>
            <SkChip seed="cmb3">Automatico</SkChip>
          </div>
          <SkBtn full size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="sapp">Mostra 124 auto →</SkBtn>
        </div>
      </div>
      <MobileTabBar active="search" />
      <Anno top={120} right={-6} width={120} rotate={4} color={YELLOW}>
        full-screen sheet,<br/>tutti i filtri qui
      </Anno>
    </Frame>
  );
}

function ListV3Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/cerca">
      <DesktopNav active="Esplora" />
      {/* mega-filter ribbon */}
      <div style={{ padding: '16px 32px', borderBottom: `1.3px solid ${INK}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) auto', gap: 10, alignItems: 'end' }}>
          <SkInput seed="mf1" label="Dove" icon={<SkIcon name="pin" size={14} />} value="Milano" dense />
          <SkInput seed="mf2" label="Quando" icon={<SkIcon name="calendar" size={14} />} value="18-22 giu" dense />
          <SkInput seed="mf3" label="Tipo" value="Tutte" suffix="▾" dense />
          <SkInput seed="mf4" label="Carburante" value="Hybrid, Elettr." suffix="▾" dense />
          <SkInput seed="mf5" label="Cambio" value="Automatico" suffix="▾" dense />
          <SkInput seed="mf6" label="Prezzo max" value="50€" suffix="▾" dense />
          <SkBtn size="md" fill={INK} seed="mfg">Cerca →</SkBtn>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <SkText size={11} color={INK_SOFT}>Accessori:</SkText>
          {['Apple CarPlay', 'Android Auto', 'Cruise control', 'Sensori park.', 'Tetto', 'Telecamera', 'Aria cond.', '+ altri'].map((a, i) => (
            <SkChip key={a} seed={'acc' + i} active={i === 0 || i === 1}>{a}</SkChip>
          ))}
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <SkText size={14} weight={600}>124 auto trovate</SkText>
          <SkText size={12} color={INK_SOFT}>griglia ▾ · prezzo ↑</SkText>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { n: 'VW Polo · 2022', h: 'AutoLuca', l: 'Sesto', p: 32, k: ['Hybrid', 'Auto'], hot: true },
            { n: 'Fiat 500e · 2023', h: 'GreenCar', l: 'Navigli', p: 39, k: ['Elettr.', 'Auto'] },
            { n: 'Renault Clio · 2023', h: 'CarHub', l: 'Centrale', p: 42, k: ['Hybrid'], hot: true },
            { n: 'Audi A1 · 2022', h: 'PremiumDrive', l: 'P. Romana', p: 55, k: ['Hybrid', 'Auto'] },
            { n: 'Peugeot 208 · 2023', h: 'CarHub', l: 'Centrale', p: 36, k: ['Hybrid'], hot: true },
            { n: 'Tesla M3 · 2024', h: 'GreenCar', l: 'Navigli', p: 89, k: ['Elettr.'] },
            { n: 'Toyota Yaris · 2022', h: 'CarHub', l: 'Centrale', p: 34, k: ['Hybrid', 'Auto'] },
            { n: 'Mini · 2023', h: 'PremiumDrive', l: 'Brera', p: 58, k: ['Hybrid'] },
          ].map((c, i) => <VehicleCard key={i} seed={'lv3d' + i} {...c} kw={c.k} />)}
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// SCHEDA VEICOLO — V1: Galleria + sticky CTA / sidebar prezzo
// ─────────────────────────────────────────────────────────────
function VehicleV1Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        {/* gallery */}
        <div style={{ position: 'relative', height: 180 }}>
          <SkCarPlaceholder seed="vv1g" height={180} label="foto 1/6" />
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <SkBox seed="bk" fill="#fff" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkIcon name="chevronLeft" size={16} />
            </SkBox>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <SkBox seed="sh" fill="#fff" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkIcon name="share" size={14} />
            </SkBox>
            <SkBox seed="hh" fill="#fff" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkIcon name="heart" size={14} />
            </SkBox>
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
            {[0,1,2,3,4,5].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)', border: `1px solid ${INK}` }} />)}
          </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SkText size={18} weight={700} font={DISPLAY}>VW Polo · 2022</SkText>
            <SkText size={11} color={INK_SOFT}>📍 Sesto S.G.</SkText>
          </div>
          <SkText size={11} color={INK_SOFT}>1.0 TSI · Manuale · 5 posti</SkText>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {['1.0 TSI 95cv', 'Manuale', 'Benzina', '5 posti', '40k km'].map(k => <SkChip key={k} seed={'sk1' + k}>{k}</SkChip>)}
          </div>
          <SkLine seed="sl1" style={{ margin: '14px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SkBox seed="hosta" style={{ width: 36, height: 36, borderRadius: 18, background: PAPER_2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SkText size={14} font={DISPLAY} weight={700}>AL</SkText>
              </SkBox>
              <div>
                <SkText size={13} weight={700} style={{ display: 'block' }}>AutoLuca</SkText>
                <SkText size={11} color={INK_SOFT}>★ 4.8 · 142 noleggi</SkText>
              </div>
            </div>
            <SkText size={11} style={{ textDecoration: 'underline' }}>vedi profilo</SkText>
          </div>
          <SkLine seed="sl2" style={{ margin: '14px 0' }} />
          <SkText size={14} weight={700} font={DISPLAY} style={{ display: 'block', marginBottom: 6 }}>Descrizione</SkText>
          <SkText size={12} color={INK_SOFT} style={{ display: 'block', lineHeight: 1.5 }}>
            Polo del 2022 in ottimo stato, ideale per città. Aria condizionata,<br/>
            sensori posteriori, Android Auto.
          </SkText>
          <SkText size={14} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 14, marginBottom: 6 }}>Accessori</SkText>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {['Android Auto', 'Bluetooth', 'Sens. parcheggio', 'Cruise control', 'Aria cond.', 'USB'].map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SkIcon name="check" size={12} color={GREEN} />
                <SkText size={12}>{a}</SkText>
              </div>
            ))}
          </div>
        </div>
        {/* sticky cta */}
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, background: '#fff', borderTop: `1.4px solid ${INK}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <SkText size={20} weight={700} font={DISPLAY}>32€</SkText>
            <SkText size={11} color={INK_SOFT}>/giorno · disp. ora</SkText>
          </div>
          <div style={{ flex: 1 }} />
          <SkBtn size="md" variant="ghost" seed="contact">
            <SkIcon name="chat" size={14} />
          </SkBtn>
          <SkBtn size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="bk1">Prenota →</SkBtn>
        </div>
      </div>
      <MobileTabBar active="search" />
      <Anno top={-10} right={-4} width={140} rotate={-4} color={YELLOW}>
        sticky CTA<br/>"Prenota" sempre<br/>visibile
      </Anno>
    </Frame>
  );
}

function VehicleV1Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/auto/vw-polo-2022">
      <DesktopNav active="Esplora" />
      <div style={{ padding: '12px 32px 0' }}>
        <SkText size={11} color={INK_SOFT}>Esplora · Milano · <span style={{ textDecoration: 'underline' }}>VW Polo 2022</span></SkText>
      </div>
      <div style={{ padding: '16px 32px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 28 }}>
        {/* left: gallery + info */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, height: 320 }}>
            <SkCarPlaceholder seed="vv1d" height="100%" label="foto principale" />
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8 }}>
              <SkCarPlaceholder seed="vv1d2" height="100%" label="interno" tone="paper" />
              <SkCarPlaceholder seed="vv1d3" height="100%" label="dettaglio" tone="yellow" />
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <SkText size={28} weight={700} font={DISPLAY}>VW Polo · 2022</SkText>
            <SkText size={13} color={INK_SOFT} style={{ display: 'block' }}>1.0 TSI · Manuale · 5 posti · 📍 Sesto San Giovanni, Milano</SkText>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 18 }}>
            {[
              { i: 'fuel', l: 'Benzina', s: '1.0 TSI · 95cv' },
              { i: 'transmission', l: 'Manuale', s: '6 marce' },
              { i: 'seat', l: '5 posti', s: '4 porte' },
              { i: 'car', l: '40.000 km', s: 'rev. 2024' },
            ].map((s, i) => (
              <SkBox key={i} seed={'spec' + i} fill={PAPER_2} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <SkIcon name={s.i} size={20} />
                <SkText size={14} weight={700}>{s.l}</SkText>
                <SkText size={11} color={INK_SOFT}>{s.s}</SkText>
              </SkBox>
            ))}
          </div>
          <SkText size={18} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 22 }}>Descrizione</SkText>
          <SkText size={13} color={INK_SOFT} style={{ display: 'block', marginTop: 4, lineHeight: 1.6 }}>
            Polo del 2022, ottimo stato, perfetta per la città e brevi spostamenti extraurbani. <br/>
            Aria condizionata, sensori posteriori, Android Auto e Bluetooth.
          </SkText>
          <SkText size={18} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 18 }}>Accessori</SkText>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
            {['Android Auto', 'Apple CarPlay', 'Bluetooth', 'Sens. parcheggio', 'Cruise control', 'Aria cond.', 'USB', 'Vivavoce', 'Specchi rip. elett.'].map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SkIcon name="check" size={14} color={GREEN} />
                <SkText size={13}>{a}</SkText>
              </div>
            ))}
          </div>
        </div>
        {/* right: sticky price card */}
        <div>
          <SkBox seed="pcd" fill="#fff" style={{ padding: 18, position: 'sticky', top: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <SkText size={30} weight={700} font={DISPLAY}>32€<SkText size={14} color={INK_SOFT}> /giorno</SkText></SkText>
              <SkChip seed="dnow" active><SkIcon name="check" size={11} /> disp. ora</SkChip>
            </div>
            <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginTop: 2 }}>
              o 690€/mese (-28%)
            </SkText>
            <SkLine seed="pld" style={{ margin: '14px 0' }} />
            <SkInput seed="bk1" label="Ritiro" icon={<SkIcon name="calendar" size={14} />} value="Mer 18 giu · 10:00" />
            <SkInput seed="bk2" label="Riconsegna" icon={<SkIcon name="calendar" size={14} />} value="Dom 22 giu · 18:00" style={{ marginTop: 8 }} />
            <SkLine seed="pld2" style={{ margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <SkText size={13}>32€ × 4 giorni</SkText>
              <SkText size={13}>128€</SkText>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <SkText size={13} color={INK_SOFT}>Servizio</SkText>
              <SkText size={13} color={INK_SOFT}>—</SkText>
            </div>
            <SkLine seed="pld3" style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <SkText size={14} weight={700}>Totale</SkText>
              <SkText size={16} weight={700} font={DISPLAY}>128€</SkText>
            </div>
            <SkBtn full size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="bkd" style={{ marginTop: 14 }}>Richiedi prenotazione →</SkBtn>
            <SkBtn full size="md" variant="ghost" seed="ctd" style={{ marginTop: 8 }}>
              <SkIcon name="chat" size={14} /> Contatta noleggiatore
            </SkBtn>
          </SkBox>
        </div>
      </div>
      <Anno top={120} right={36} width={140} rotate={-2} color={YELLOW}>
        sidebar prezzo<br/>sticky a destra
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// SCHEDA VEICOLO — V2: Info-dense (tabs sotto galleria)
// ─────────────────────────────────────────────────────────────
function VehicleV2Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 140 }}>
          <SkCarPlaceholder seed="vv2g" height={140} label="" />
          <div style={{ position: 'absolute', top: 8, left: 10 }}>
            <SkBox seed="bk2" fill="#fff" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkIcon name="chevronLeft" size={14} />
            </SkBox>
          </div>
        </div>
        <div style={{ padding: '10px 14px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SkText size={16} weight={700} font={DISPLAY}>Fiat 500e · 2023</SkText>
            <SkText size={18} weight={700} font={DISPLAY}>39€<SkText size={11} color={INK_SOFT}>/g</SkText></SkText>
          </div>
          <SkText size={11} color={INK_SOFT}>GreenCar · Navigli · ★ 4.9 · disp. ora</SkText>
        </div>
        {/* tabs */}
        <div style={{ display: 'flex', borderBottom: `1.3px solid ${INK}`, padding: '0 14px' }}>
          {['Dettagli', 'Foto · 6', 'Accessori', 'Noleggiatore', 'Recensioni'].map((t, i) => (
            <div key={t} style={{ padding: '8px 8px', borderBottom: i === 0 ? `2px solid ${INK}` : 'none', marginBottom: -1 }}>
              <SkText size={11} weight={i === 0 ? 700 : 400} color={i === 0 ? INK : INK_SOFT}>{t}</SkText>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 14px', overflow: 'hidden' }}>
          {/* spec grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontFamily: MONO, fontSize: 11 }}>
            {[
              ['Marchio', 'Fiat'],
              ['Modello', '500e La Prima'],
              ['Anno', '2023'],
              ['Motore', '42 kWh'],
              ['Carburante', 'Elettrica'],
              ['Autonomia', '320 km'],
              ['Cambio', 'Automatico'],
              ['Trazione', 'FWD'],
              ['Posti', '4'],
              ['Porte', '3'],
              ['Colore', 'Nero'],
              ['Km', '18.000'],
              ['Bagagliaio', '185 L'],
              ['Categoria', 'Citycar'],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <SkText size={11} font={MONO} color={INK_SOFT}>{k}:</SkText>
                <SkText size={11} font={MONO} weight={700}>{v}</SkText>
              </React.Fragment>
            ))}
          </div>
          <SkLine seed="vl2" style={{ margin: '10px 0' }} />
          <SkText size={12} weight={700}>Prezzi</SkText>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <SkBox seed="pp1" fill={YELLOW} style={{ padding: '6px 10px', flex: 1 }}>
              <SkText size={11} color={INK_SOFT}>Giornaliero</SkText>
              <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block' }}>39€</SkText>
            </SkBox>
            <SkBox seed="pp2" style={{ padding: '6px 10px', flex: 1 }}>
              <SkText size={11} color={INK_SOFT}>Mensile</SkText>
              <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block' }}>820€</SkText>
            </SkBox>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, padding: '8px 14px', background: '#fff', borderTop: `1.4px solid ${INK}`, display: 'flex', gap: 8 }}>
          <SkBtn full size="md" variant="ghost" seed="chv2">
            <SkIcon name="chat" size={14} /> Scrivi
          </SkBtn>
          <SkBtn size="md" fill={YELLOW_DEEP} variant="pill-yellow" seed="bkv2" style={{ flex: 2 }}>Prenota</SkBtn>
        </div>
      </div>
      <MobileTabBar active="search" />
      <Anno top={140} right={-4} width={130} rotate={5} color={YELLOW}>
        tabs = densità<br/>massima, scroll<br/>ridotto
      </Anno>
    </Frame>
  );
}

function VehicleV2Desktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/auto/fiat-500e">
      <DesktopNav active="Esplora" />
      <div style={{ padding: '16px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, height: 280 }}>
              <SkCarPlaceholder seed="v2d1" height="100%" label="" style={{ gridColumn: 'span 2', gridRow: 'span 2' }} />
              <SkImg seed="v2d2" height="100%" tone="paper" label="" />
              <SkImg seed="v2d3" height="100%" tone="yellow" label="" />
              <SkImg seed="v2d4" height="100%" tone="paper" label="" />
              <SkImg seed="v2d5" height="100%" tone="green" label="+2" />
            </div>
          </div>
          <SkBox seed="v2pc" fill={YELLOW + '44'} style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <SkText size={26} weight={700} font={DISPLAY}>Fiat 500e · 2023</SkText>
                <SkText size={12} color={INK_SOFT} style={{ display: 'block' }}>Citycar elettrica · GreenCar · Navigli, Milano</SkText>
              </div>
              <SkIcon name="heart" size={18} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <SkBox seed="pp1d" fill="#fff" style={{ padding: 10, flex: 1 }}>
                <SkText size={11} color={INK_SOFT}>Giornaliero</SkText>
                <SkText size={22} weight={700} font={DISPLAY} style={{ display: 'block' }}>39€</SkText>
              </SkBox>
              <SkBox seed="pp2d" fill="#fff" style={{ padding: 10, flex: 1 }}>
                <SkText size={11} color={INK_SOFT}>Mensile</SkText>
                <SkText size={22} weight={700} font={DISPLAY} style={{ display: 'block' }}>820€</SkText>
              </SkBox>
            </div>
            <SkBtn full size="lg" fill={INK} seed="bkv2d" style={{ marginTop: 14 }}>Richiedi prenotazione</SkBtn>
            <SkBtn full size="md" variant="ghost" seed="chv2d" style={{ marginTop: 8 }}>
              <SkIcon name="chat" size={14} /> Scrivi a GreenCar
            </SkBtn>
          </SkBox>
        </div>
        {/* tabs */}
        <div style={{ display: 'flex', borderBottom: `1.3px solid ${INK}`, gap: 24 }}>
          {['Dettagli tecnici', 'Foto · 6', 'Accessori · 14', 'Noleggiatore', 'Recensioni · 23'].map((t, i) => (
            <div key={t} style={{ padding: '10px 0', borderBottom: i === 0 ? `2px solid ${INK}` : 'none', marginBottom: -1.3 }}>
              <SkText size={13} weight={i === 0 ? 700 : 400} color={i === 0 ? INK : INK_SOFT}>{t}</SkText>
            </div>
          ))}
        </div>
        {/* data table */}
        <div style={{ padding: '16px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { t: 'Generale', d: [['Marchio', 'Fiat'], ['Modello', '500e La Prima'], ['Anno', '2023'], ['Categoria', 'Citycar']] },
            { t: 'Motorizzazione', d: [['Carburante', 'Elettrica'], ['Motore', '42 kWh'], ['Cavalli', '118 cv'], ['Trazione', 'FWD'], ['Autonomia', '320 km']] },
            { t: 'Cambio & Carr.', d: [['Cambio', 'Automatico'], ['Posti', '4'], ['Porte', '3'], ['Bagagliaio', '185 L']] },
            { t: 'Stato', d: [['Km', '18.000'], ['Colore', 'Nero'], ['Imm.', '03/2023'], ['Revisione', '03/2024']] },
          ].map((g, i) => (
            <SkBox key={i} seed={'tg' + i} fill={PAPER_2} style={{ padding: 12 }}>
              <SkText size={11} weight={700} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 8 }}>{g.t}</SkText>
              {g.d.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <SkText size={12} color={INK_SOFT} font={MONO}>{k}</SkText>
                  <SkText size={12} weight={600} font={MONO}>{v}</SkText>
                </div>
              ))}
            </SkBox>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// SCHEDA VEICOLO — V3: Storytelling lungo (mobile only)
// ─────────────────────────────────────────────────────────────
function VehicleV3Mobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: 240 }}>
          <SkCarPlaceholder seed="vv3g" height={240} label="hero photo full-bleed" tone="yellow" />
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <SkBox seed="bk3" fill="rgba(255,255,255,0.9)" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkIcon name="chevronLeft" size={14} />
            </SkBox>
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
            <SkText size={26} weight={700} font={DISPLAY} style={{ color: INK, display: 'block', lineHeight: 1, background: 'rgba(255,255,255,0.85)', padding: '2px 6px', display: 'inline-block' }}>Renault Clio</SkText>
            <SkText size={14} font={HAND} style={{ display: 'block', background: 'rgba(255,255,255,0.85)', padding: '0 6px', display: 'inline-block', marginTop: 4 }}>"perfetta per la città"</SkText>
          </div>
        </div>
        <div style={{ padding: '16px 16px 100px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <SkText size={22} weight={700} font={DISPLAY}>42€<SkText size={12} color={INK_SOFT}>/giorno</SkText></SkText>
              <SkText size={11} color={INK_SOFT} style={{ display: 'block' }}>o 880€/mese</SkText>
            </div>
            <SkChip seed="d3" active><SkIcon name="check" size={11} /> Disponibile oggi</SkChip>
          </div>
          <Squiggle width={120} style={{ marginTop: 16 }} />
          <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 6 }}>La storia di questa auto</SkText>
          <SkText size={13} color={INK_SOFT} style={{ display: 'block', marginTop: 6, lineHeight: 1.55 }}>
            Acquistata a inizio 2023 e tenuta come nuova. La uso io per i miei spostamenti e la metto a noleggio quando non serve. Hybrid, parsimoniosa, perfetta per Milano.
          </SkText>
          <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginTop: 8 }}>— Marco, CarHub MI</SkText>

          <SkBox seed="3sp" fill={PAPER_2} style={{ padding: 12, marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { i: 'fuel', t: 'Hybrid' },
              { i: 'transmission', t: 'Automatico' },
              { i: 'seat', t: '5 posti' },
            ].map(s => (
              <div key={s.t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <SkIcon name={s.i} size={22} />
                <SkText size={11}>{s.t}</SkText>
              </div>
            ))}
          </SkBox>

          <Squiggle width={120} style={{ marginTop: 18 }} />
          <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 6 }}>Chi te la affida</SkText>
          <SkBox seed="hst3" style={{ padding: 12, marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
            <SkBox seed="ha3" style={{ width: 48, height: 48, borderRadius: 24, background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkText size={18} font={DISPLAY} weight={700}>M</SkText>
            </SkBox>
            <div style={{ flex: 1 }}>
              <SkText size={13} weight={700} style={{ display: 'block' }}>Marco · CarHub MI</SkText>
              <SkText size={11} color={INK_SOFT}>★ 4.9 · 89 noleggi · risponde in 2h</SkText>
            </div>
            <SkIcon name="chat" size={18} />
          </SkBox>
        </div>
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, padding: '10px 14px', background: '#fff', borderTop: `1.4px solid ${INK}` }}>
          <SkBtn full size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="bkv3">Prenota questa Clio →</SkBtn>
        </div>
      </div>
      <MobileTabBar active="search" />
      <Anno top={60} right={-6} width={120} rotate={-5} color="#cfe4d4">
        tono caldo,<br/>"come Airbnb"
      </Anno>
    </Frame>
  );
}

Object.assign(window, {
  HomeV1Mobile, HomeV1Desktop, HomeV2Mobile, HomeV2Desktop, HomeV3Mobile, HomeV3Desktop,
  ListV1Mobile, ListV1Desktop, ListV2Mobile, ListV2Desktop, ListV3Mobile, ListV3Desktop,
  VehicleV1Mobile, VehicleV1Desktop, VehicleV2Mobile, VehicleV2Desktop, VehicleV3Mobile,
  DesktopNav, Logo,
});
