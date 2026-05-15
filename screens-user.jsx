// Schermate utente: login, area personale (profilo, prenotazioni, preferiti)

const { INK, INK_SOFT, PAPER, PAPER_2, YELLOW, YELLOW_DEEP, RED, BLUE, GREEN,
  HAND, DISPLAY, MONO,
  SkBox, SkLine, SkText, SkBtn, SkChip, SkInput, SkImg, SkCarPlaceholder, SkIcon,
  Anno, Squiggle, Frame, MobileStatus, MobileTabBar, DesktopNav, Logo } = window;

// ─────────────────────────────────────────────────────────────
// LOGIN / REGISTRAZIONE
// ─────────────────────────────────────────────────────────────
function LoginMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ padding: '14px 18px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <SkIcon name="chevronLeft" size={20} />
          <SkText size={12} color={INK_SOFT}>Hai bisogno di aiuto?</SkText>
        </div>
        <Logo size={32} />
        <SkText size={28} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 30, lineHeight: 1 }}>
          Ciao!<br />
          <span style={{ background: YELLOW, padding: '0 4px' }}>Bentornato.</span>
        </SkText>
        <SkText size={13} color={INK_SOFT} style={{ display: 'block', marginTop: 6 }}>
          Entra per gestire le tue prenotazioni.
        </SkText>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SkInput seed="lem" label="Email" value="luca@email.it" />
          <SkInput seed="lpw" label="Password" value="••••••••" suffix={<SkIcon name="eye" size={14} />} />
          <SkText size={11} color={INK_SOFT} style={{ textAlign: 'right', textDecoration: 'underline' }}>password dimenticata?</SkText>
          <SkBtn full size="lg" fill={INK} seed="lin">Entra</SkBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
          <SkLine seed="lor1" length="100%" style={{ flex: 1 }} />
          <SkText size={11} color={INK_SOFT}>oppure</SkText>
          <SkLine seed="lor2" length="100%" style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkBtn full variant="ghost" seed="lg">
            <SkIcon name="google" size={16} /> Continua con Google
          </SkBtn>
          <SkBtn full variant="ghost" seed="la">
            <SkIcon name="apple" size={16} /> Continua con Apple
          </SkBtn>
        </div>
        <div style={{ flex: 1 }} />
        <SkText size={12} style={{ textAlign: 'center', marginTop: 14 }}>
          Non hai un account? <span style={{ textDecoration: 'underline', fontWeight: 700 }}>Registrati</span>
        </SkText>
      </div>
      <Anno top={140} right={-6} width={130} rotate={4} color={YELLOW}>
        social login<br/>= fase 2
      </Anno>
    </Frame>
  );
}

function RegisterMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ padding: '14px 18px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SkIcon name="chevronLeft" size={20} />
          <SkText size={11} color={INK_SOFT}>1 di 2</SkText>
        </div>
        <SkText size={24} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>
          Crea il tuo account.
        </SkText>
        <SkText size={12} color={INK_SOFT} style={{ display: 'block', marginTop: 6 }}>
          Bastano 30 secondi.
        </SkText>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkInput seed="rnm" label="Nome" placeholder="Mario" />
          <SkInput seed="rcm" label="Cognome" placeholder="Rossi" />
          <SkInput seed="rem" label="Email" placeholder="mario@email.it" />
          <SkInput seed="rpw" label="Password" placeholder="almeno 8 caratteri" suffix={<SkIcon name="eyeOff" size={14} />} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
            <SkBox seed="cb1" style={{ width: 16, height: 16, background: INK, flex: 'none', marginTop: 1 }} />
            <SkText size={11} color={INK_SOFT}>
              Accetto i <span style={{ textDecoration: 'underline' }}>termini</span> e la <span style={{ textDecoration: 'underline' }}>privacy</span>.
            </SkText>
          </div>
          <SkBtn full size="lg" fill={YELLOW_DEEP} variant="pill-yellow" seed="rng">Crea account</SkBtn>
          <SkText size={11} color={INK_SOFT} style={{ textAlign: 'center', marginTop: 6 }}>
            Sei un noleggiatore? <span style={{ textDecoration: 'underline', fontWeight: 700 }}>Registra la tua attività</span>
          </SkText>
        </div>
      </div>
      <Anno top={300} right={-6} width={130} rotate={-3} color={YELLOW}>
        scelta utente<br/>vs noleggiatore<br/>più avanti
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// AREA PERSONALE — Home dashboard mobile
// ─────────────────────────────────────────────────────────────
function UserHomeMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 0' }}>
          <SkText size={13} color={INK_SOFT}>Ciao,</SkText>
          <SkText size={26} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>Luca 👋</SkText>
        </div>
        <div style={{ padding: '14px 16px 0' }}>
          {/* prenotazione attiva */}
          <SkBox seed="ub1" fill={YELLOW} style={{ padding: 12 }}>
            <SkText size={11} color={INK_SOFT}>PRENOTAZIONE ATTIVA</SkText>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
              <SkCarPlaceholder seed="ubc" width={80} height={56} label="" />
              <div style={{ flex: 1 }}>
                <SkText size={13} weight={700} style={{ display: 'block' }}>VW Polo · 2022</SkText>
                <SkText size={11} color={INK_SOFT}>fino a Dom 22 giu</SkText>
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <SkChip seed="ust"><SkIcon name="check" size={10} color={GREEN} /> attiva</SkChip>
                </div>
              </div>
              <SkIcon name="chevron" size={16} />
            </div>
          </SkBox>
        </div>
        {/* quick actions */}
        <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { i: 'search', l: 'Cerca' },
            { i: 'heart', l: 'Salvati' },
            { i: 'calendar', l: 'Prenotaz.' },
            { i: 'chat', l: 'Messaggi' },
          ].map((q, i) => (
            <SkBox key={q.l} seed={'qa' + i} style={{ padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <SkIcon name={q.i} size={20} />
              <SkText size={11}>{q.l}</SkText>
            </SkBox>
          ))}
        </div>
        {/* recent */}
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SkText size={15} weight={700} font={DISPLAY}>Visti di recente</SkText>
            <SkText size={11} color={INK_SOFT}>tutti →</SkText>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, overflow: 'hidden' }}>
            {[1, 2].map(i => (
              <div key={i} style={{ minWidth: 130, flex: 'none' }}>
                <SkCarPlaceholder seed={'rv' + i} height={70} label="" tone={i === 1 ? 'yellow' : 'paper'} />
                <SkText size={12} weight={700} style={{ display: 'block', marginTop: 4 }}>{i === 1 ? 'Fiat 500e' : 'Audi A1'}</SkText>
                <SkText size={11} color={INK_SOFT}>{i === 1 ? '39€' : '55€'}/g</SkText>
              </div>
            ))}
          </div>
        </div>
        {/* notifications */}
        <div style={{ padding: '14px 16px 0' }}>
          <SkText size={15} weight={700} font={DISPLAY}>Notifiche</SkText>
          <SkBox seed="n1" style={{ padding: 10, marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', background: PAPER_2 }}>
            <SkIcon name="bell" size={16} />
            <SkText size={12} style={{ flex: 1 }}>AutoLuca ha risposto al tuo messaggio</SkText>
            <SkText size={10} color={INK_SOFT}>2h fa</SkText>
          </SkBox>
        </div>
      </div>
      <MobileTabBar active="user" />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// USER — Prenotazioni mobile
// ─────────────────────────────────────────────────────────────
function UserBookingsMobile() {
  const Status = ({ t, c }) => (
    <span style={{ background: c, color: INK, fontFamily: HAND, fontSize: 10, fontWeight: 700, padding: '1px 6px', border: `1px solid ${INK}`, borderRadius: 4 }}>{t}</span>
  );
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 0' }}>
          <SkText size={22} weight={700} font={DISPLAY}>Le tue prenotazioni</SkText>
        </div>
        {/* tabs */}
        <div style={{ display: 'flex', gap: 18, padding: '14px 16px 0', borderBottom: `1.3px solid ${INK}` }}>
          {['In corso', 'In arrivo', 'Storico'].map((t, i) => (
            <div key={t} style={{ paddingBottom: 8, borderBottom: i === 1 ? `2px solid ${INK}` : 'none', marginBottom: -1.3 }}>
              <SkText size={13} weight={i === 1 ? 700 : 400} color={i === 1 ? INK : INK_SOFT}>{t} {i === 1 ? '· 2' : i === 0 ? '· 1' : '· 7'}</SkText>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { n: 'VW Polo · 2022', d: '18-22 giu', h: 'AutoLuca', t: 'Confermata', c: GREEN + '50', p: '128€' },
            { n: 'Fiat 500e · 2023', d: '5-7 lug', h: 'GreenCar', t: 'In attesa', c: YELLOW, p: '78€' },
          ].map((b, i) => (
            <SkBox key={i} seed={'bk' + i} style={{ padding: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <SkCarPlaceholder seed={'bkc' + i} width={86} height={62} label="" tone={i === 0 ? 'paper' : 'yellow'} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <SkText size={13} weight={700}>{b.n}</SkText>
                    <Status t={b.t} c={b.c} />
                  </div>
                  <SkText size={11} color={INK_SOFT}>{b.h} · {b.d}</SkText>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                    <SkText size={14} weight={700} font={DISPLAY}>{b.p}</SkText>
                    <SkText size={11} style={{ textDecoration: 'underline' }}>dettagli →</SkText>
                  </div>
                </div>
              </div>
            </SkBox>
          ))}
        </div>
      </div>
      <MobileTabBar active="book" />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// USER — Preferiti mobile
// ─────────────────────────────────────────────────────────────
function UserFavoritesMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 8px' }}>
          <SkText size={22} weight={700} font={DISPLAY}>Salvati</SkText>
          <SkText size={12} color={INK_SOFT} style={{ display: 'block', marginTop: 2 }}>4 auto in 2 liste</SkText>
        </div>
        {/* lists */}
        <div style={{ padding: '0 16px', display: 'flex', gap: 6 }}>
          <SkChip seed="ls1" active>Tutte · 4</SkChip>
          <SkChip seed="ls2">Milano weekend · 2</SkChip>
          <SkChip seed="ls3">Per Roma · 2</SkChip>
          <SkChip seed="ls4"><SkIcon name="plus" size={11} /> nuova</SkChip>
        </div>
        <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { n: 'Fiat 500e', p: 39, t: 'yellow' },
            { n: 'Polo', p: 32, t: 'paper' },
            { n: 'Mini Cooper', p: 58, t: 'red' },
            { n: 'Tesla M3', p: 89, t: 'green' },
          ].map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <SkCarPlaceholder seed={'fv' + i} height={84} label="" tone={c.t} />
              <div style={{ position: 'absolute', top: 6, right: 6, background: '#fff', border: `1.3px solid ${INK}`, borderRadius: 10, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SkIcon name="heart" size={12} color={RED} />
              </div>
              <SkText size={12} weight={700} style={{ display: 'block', marginTop: 4 }}>{c.n}</SkText>
              <SkText size={11} color={INK_SOFT}>{c.p}€/g · Milano</SkText>
            </div>
          ))}
        </div>
      </div>
      <MobileTabBar active="fav" />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// USER — Profilo desktop
// ─────────────────────────────────────────────────────────────
function UserProfileDesktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/account">
      <DesktopNav />
      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28 }}>
        {/* side nav */}
        <div>
          <SkBox seed="ua" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <SkBox seed="uava" style={{ width: 64, height: 64, borderRadius: 32, background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkText size={26} font={DISPLAY} weight={700}>L</SkText>
            </SkBox>
            <SkText size={14} weight={700}>Luca Bianchi</SkText>
            <SkText size={11} color={INK_SOFT}>membro da feb '25</SkText>
          </SkBox>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
            {[
              { i: 'home', l: 'Panoramica' },
              { i: 'calendar', l: 'Prenotazioni', b: '2' },
              { i: 'heart', l: 'Salvati', b: '4' },
              { i: 'chat', l: 'Messaggi', b: '1' },
              { i: 'user', l: 'Profilo', a: true },
              { i: 'bell', l: 'Notifiche' },
              { i: 'settings', l: 'Impostazioni' },
            ].map((n, i) => (
              <div key={n.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: n.a ? YELLOW : 'transparent', borderRadius: 6, marginBottom: 2 }}>
                <SkIcon name={n.i} size={16} />
                <SkText size={13} weight={n.a ? 700 : 400} style={{ flex: 1 }}>{n.l}</SkText>
                {n.b && <SkChip seed={'b' + i} active={false}>{n.b}</SkChip>}
              </div>
            ))}
          </div>
        </div>
        {/* main */}
        <div>
          <SkText size={28} weight={700} font={DISPLAY}>Il tuo profilo</SkText>
          <SkText size={13} color={INK_SOFT} style={{ display: 'block', marginTop: 2 }}>Tieni i dati aggiornati per prenotare più velocemente.</SkText>

          <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 20 }}>Dati personali</SkText>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            <SkInput seed="pn1" label="Nome" value="Luca" />
            <SkInput seed="pn2" label="Cognome" value="Bianchi" />
            <SkInput seed="pn3" label="Email" value="luca@email.it" suffix={<SkChip seed="ev" active><SkIcon name="check" size={10} /> verif.</SkChip>} />
            <SkInput seed="pn4" label="Telefono" value="+39 333 1234567" suffix="non verif." />
            <SkInput seed="pn5" label="Data di nascita" value="14/03/1992" icon={<SkIcon name="calendar" size={14} />} />
            <SkInput seed="pn6" label="Città" value="Milano" icon={<SkIcon name="pin" size={14} />} />
          </div>

          <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 22 }}>Patente</SkText>
          <SkBox seed="pat" style={{ padding: 14, marginTop: 8, display: 'flex', gap: 14, alignItems: 'center' }}>
            <SkImg seed="patimg" width={120} height={70} label="patente fronte" tone="paper" />
            <div style={{ flex: 1 }}>
              <SkText size={13} weight={700} style={{ display: 'block' }}>B · scade 03/2032</SkText>
              <SkText size={11} color={INK_SOFT}>Caricata feb '25 — in verifica</SkText>
            </div>
            <SkBtn size="sm" variant="ghost" seed="pe">Sostituisci</SkBtn>
          </SkBox>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <SkBtn size="md" fill={INK} seed="psv">Salva modifiche</SkBtn>
            <SkBtn size="md" variant="ghost" seed="cdc">Annulla</SkBtn>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// USER — Dashboard desktop (panoramica)
// ─────────────────────────────────────────────────────────────
function UserDashboardDesktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/account">
      <DesktopNav />
      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28 }}>
        <div>
          <SkBox seed="uad" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <SkBox seed="uavad" style={{ width: 40, height: 40, borderRadius: 20, background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SkText size={16} font={DISPLAY} weight={700}>L</SkText>
            </SkBox>
            <div>
              <SkText size={13} weight={700} style={{ display: 'block' }}>Luca</SkText>
              <SkText size={11} color={INK_SOFT}>membro da feb '25</SkText>
            </div>
          </SkBox>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
            {[
              { i: 'home', l: 'Panoramica', a: true },
              { i: 'calendar', l: 'Prenotazioni', b: '2' },
              { i: 'heart', l: 'Salvati', b: '4' },
              { i: 'chat', l: 'Messaggi', b: '1' },
              { i: 'user', l: 'Profilo' },
              { i: 'bell', l: 'Notifiche' },
              { i: 'settings', l: 'Impostazioni' },
            ].map((n, i) => (
              <div key={n.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: n.a ? YELLOW : 'transparent', borderRadius: 6, marginBottom: 2 }}>
                <SkIcon name={n.i} size={16} />
                <SkText size={13} weight={n.a ? 700 : 400} style={{ flex: 1 }}>{n.l}</SkText>
                {n.b && <SkChip seed={'bd' + i}>{n.b}</SkChip>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <SkText size={13} color={INK_SOFT}>Ciao,</SkText>
          <SkText size={34} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>Luca 👋</SkText>

          {/* active booking strip */}
          <SkBox seed="abb" fill={YELLOW} style={{ padding: 16, marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <SkCarPlaceholder seed="abbc" width={140} height={90} label="" />
            <div style={{ flex: 1 }}>
              <SkText size={11} color={INK_SOFT}>PRENOTAZIONE IN ARRIVO</SkText>
              <SkText size={18} weight={700} font={DISPLAY} style={{ display: 'block' }}>VW Polo · 2022</SkText>
              <SkText size={12} color={INK_SOFT}>AutoLuca · 18 giu — 22 giu · 128€</SkText>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <SkChip seed="ad1" active><SkIcon name="check" size={11} /> Confermata</SkChip>
                <SkChip seed="ad2"><SkIcon name="pin" size={11} /> Ritiro Sesto S.G.</SkChip>
              </div>
            </div>
            <SkBtn size="md" variant="ghost" seed="abd"><SkIcon name="chat" size={14} /> Chat</SkBtn>
            <SkBtn size="md" fill={INK} seed="abx">Dettagli →</SkBtn>
          </SkBox>

          {/* stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 18 }}>
            {[
              { l: 'Prenotazioni totali', v: 9 },
              { l: 'In arrivo', v: 2 },
              { l: 'Auto salvate', v: 4 },
              { l: 'Messaggi non letti', v: 1 },
            ].map((s, i) => (
              <SkBox key={i} seed={'st' + i} style={{ padding: 14 }}>
                <SkText size={11} color={INK_SOFT}>{s.l}</SkText>
                <SkText size={28} weight={700} font={DISPLAY} style={{ display: 'block', marginTop: 4 }}>{s.v}</SkText>
              </SkBox>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
            <div>
              <SkText size={16} weight={700} font={DISPLAY}>Viste di recente</SkText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {[
                  { n: 'Fiat 500e · 2023', p: 39, h: 'GreenCar' },
                  { n: 'Audi A1 · 2022', p: 55, h: 'PremiumDrive' },
                  { n: 'Mini · 2023', p: 58, h: 'PremiumDrive' },
                ].map((r, i) => (
                  <SkBox key={i} seed={'rec' + i} style={{ padding: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <SkCarPlaceholder seed={'rcc' + i} width={70} height={48} label="" tone={i === 0 ? 'yellow' : 'paper'} />
                    <div style={{ flex: 1 }}>
                      <SkText size={13} weight={700} style={{ display: 'block' }}>{r.n}</SkText>
                      <SkText size={11} color={INK_SOFT}>{r.h}</SkText>
                    </div>
                    <SkText size={15} weight={700} font={DISPLAY}>{r.p}€</SkText>
                  </SkBox>
                ))}
              </div>
            </div>
            <div>
              <SkText size={16} weight={700} font={DISPLAY}>Messaggi recenti</SkText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {[
                  { f: 'AutoLuca', m: 'Ciao Luca, confermo per le 10:00…', t: '2h', b: true },
                  { f: 'GreenCar', m: 'Tutto ok, ti aspetto giovedì.', t: 'ieri' },
                ].map((m, i) => (
                  <SkBox key={i} seed={'ms' + i} style={{ padding: 10, display: 'flex', gap: 10, alignItems: 'center', background: m.b ? PAPER_2 : 'transparent' }}>
                    <SkBox seed={'msa' + i} style={{ width: 32, height: 32, borderRadius: 16, background: i === 0 ? YELLOW : '#cfe4d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SkText size={12} font={DISPLAY} weight={700}>{m.f[0]}</SkText>
                    </SkBox>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <SkText size={12} weight={700}>{m.f}</SkText>
                        <SkText size={10} color={INK_SOFT}>{m.t}</SkText>
                      </div>
                      <SkText size={11} color={INK_SOFT} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.m}</SkText>
                    </div>
                    {m.b && <span style={{ width: 8, height: 8, borderRadius: 4, background: RED }} />}
                  </SkBox>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Anno top={50} left={250} width={140} rotate={-3} color={YELLOW}>
        prenot. attiva =<br/>oggetto principale<br/>della dashboard
      </Anno>
    </Frame>
  );
}

Object.assign(window, {
  LoginMobile, RegisterMobile,
  UserHomeMobile, UserBookingsMobile, UserFavoritesMobile,
  UserProfileDesktop, UserDashboardDesktop,
});
