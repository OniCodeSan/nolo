// Schermate area noleggiatori: onboarding, dashboard, gestione veicoli

const { INK, INK_SOFT, PAPER, PAPER_2, YELLOW, YELLOW_DEEP, RED, BLUE, GREEN,
  HAND, DISPLAY, MONO,
  SkBox, SkLine, SkText, SkBtn, SkChip, SkInput, SkImg, SkCarPlaceholder, SkIcon,
  Anno, Squiggle, Frame, MobileStatus, MobileTabBar, DesktopNav, Logo } = window;

// ─────────────────────────────────────────────────────────────
// ONBOARDING NOLEGGIATORE — V1: wizard a step
// ─────────────────────────────────────────────────────────────
function OnboardWizardMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ padding: '14px 18px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SkIcon name="chevronLeft" size={20} />
          <SkText size={11} color={INK_SOFT}>Step 2 di 5</SkText>
          <SkText size={11} color={INK_SOFT} style={{ textDecoration: 'underline' }}>esci</SkText>
        </div>
        {/* progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= 2 ? INK : INK_SOFT, opacity: n <= 2 ? 1 : 0.3 }} />
          ))}
        </div>
        <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>Sezione · Attività</SkText>
        <SkText size={26} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1.05, marginTop: 4 }}>
          Parlaci della tua<br/>attività.
        </SkText>
        <SkText size={12} color={INK_SOFT} style={{ display: 'block', marginTop: 6 }}>
          Vedremo questi dati nella tua pagina pubblica.
        </SkText>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkInput seed="onm" label="Nome attività" value="AutoLuca" />
          <SkInput seed="ovat" label="P. IVA" value="IT 01234567890" />
          <SkInput seed="osede" label="Sede operativa" icon={<SkIcon name="pin" size={14} />} placeholder="Via, città" />
          <div>
            <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Dimensione</SkText>
            <div style={{ display: 'flex', gap: 6 }}>
              <SkChip seed="dm1" active>1-5 auto</SkChip>
              <SkChip seed="dm2">6-15</SkChip>
              <SkChip seed="dm3">16-50</SkChip>
              <SkChip seed="dm4">50+</SkChip>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <SkBtn size="md" variant="ghost" seed="ob" style={{ flex: 1 }}>← indietro</SkBtn>
          <SkBtn size="md" fill={INK} seed="on" style={{ flex: 2 }}>Avanti →</SkBtn>
        </div>
      </div>
      <Anno top={120} right={-6} width={130} rotate={4} color={YELLOW}>
        wizard breve,<br/>copy friendly
      </Anno>
    </Frame>
  );
}

function OnboardWizardDesktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/noleggiatori/onboard">
      <DesktopNav active="Per noleggiatori" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 580 }}>
        {/* left rail steps */}
        <div style={{ background: PAPER_2, padding: '36px 28px', borderRight: `1.3px solid ${INK}` }}>
          <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>Diventa noleggiatore</SkText>
          <SkText size={22} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1, marginTop: 4 }}>
            5 passi per<br/>iniziare a guadagnare.
          </SkText>
          <Squiggle width={100} style={{ marginTop: 14 }} />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { n: 1, l: 'Account', s: 'Email + password', d: true },
              { n: 2, l: 'Attività', s: 'Nome, P. IVA, sede', a: true },
              { n: 3, l: 'Pagamenti', s: 'IBAN per ricevere' },
              { n: 4, l: 'Primo veicolo', s: 'Foto + dati' },
              { n: 5, l: 'Verifica', s: 'Controllo veloce' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, border: `1.5px solid ${INK}`, background: s.d ? INK : s.a ? YELLOW : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.d ? '#fff' : INK }}>
                  {s.d ? <SkIcon name="check" size={14} color="#fff" /> : <SkText size={13} weight={700}>{s.n}</SkText>}
                </div>
                <div>
                  <SkText size={14} weight={s.a ? 700 : 500} style={{ display: 'block' }}>{s.l}</SkText>
                  <SkText size={11} color={INK_SOFT}>{s.s}</SkText>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* main */}
        <div style={{ padding: '40px 56px' }}>
          <SkText size={11} color={INK_SOFT}>Step 2 di 5</SkText>
          <SkText size={32} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1, marginTop: 4 }}>
            Parlaci della tua attività.
          </SkText>
          <SkText size={13} color={INK_SOFT} style={{ display: 'block', marginTop: 4 }}>
            Queste informazioni appariranno nel tuo profilo pubblico.
          </SkText>
          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <SkInput seed="ow1" label="Nome attività" value="AutoLuca s.r.l." />
            <SkInput seed="ow2" label="P. IVA" value="IT 01234567890" suffix={<SkChip seed="ovv" active><SkIcon name="check" size={10} /> ok</SkChip>} />
            <SkInput seed="ow3" label="Telefono attività" value="+39 02 1234567" />
            <SkInput seed="ow4" label="Email" value="info@autoluca.it" />
            <SkInput seed="ow5" label="Sede operativa" icon={<SkIcon name="pin" size={14} />} value="Via Milano 12, Sesto S.G." style={{ gridColumn: 'span 2' }} />
          </div>
          <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginTop: 22, marginBottom: 6 }}>Numero veicoli che pensi di caricare</SkText>
          <div style={{ display: 'flex', gap: 8 }}>
            <SkChip seed="ndm1">1-5 auto</SkChip>
            <SkChip seed="ndm2" active>6-15 auto</SkChip>
            <SkChip seed="ndm3">16-50 auto</SkChip>
            <SkChip seed="ndm4">Più di 50</SkChip>
          </div>
          <SkText size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginTop: 22, marginBottom: 6 }}>Logo (opzionale)</SkText>
          <SkBox seed="logu" dashed style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: 200 }}>
            <SkIcon name="upload" size={20} color={INK_SOFT} />
            <SkText size={12} color={INK_SOFT}>trascina o clicca</SkText>
          </SkBox>
          <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
            <SkBtn size="md" variant="ghost" seed="owb">← Indietro</SkBtn>
            <SkBtn size="md" fill={INK} seed="own">Continua →</SkBtn>
            <div style={{ flex: 1 }} />
            <SkBtn size="md" variant="ghost" seed="owsv">Salva e continua dopo</SkBtn>
          </div>
        </div>
      </div>
      <Anno top={36} left={250} width={140} rotate={-3} color={YELLOW}>
        rail sx persistente,<br/>auto-save
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// ONBOARDING — V2: long-form (no wizard)
// ─────────────────────────────────────────────────────────────
function OnboardLongMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1.3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SkIcon name="chevronLeft" size={20} />
          <SkText size={13} weight={700} font={DISPLAY}>Registra la tua attività</SkText>
          <SkText size={11} color={INK_SOFT}>78%</SkText>
        </div>
        <div style={{ height: 3, background: PAPER_2, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '78%', background: YELLOW_DEEP }} />
        </div>
        <div style={{ padding: '14px 16px', overflow: 'hidden' }}>
          {/* section 1 - done */}
          <SkText size={13} weight={700} font={DISPLAY} style={{ display: 'block' }}>
            <SkIcon name="check" size={14} color={GREEN} /> 1. Account
          </SkText>
          <SkText size={11} color={INK_SOFT} style={{ display: 'block', marginLeft: 18 }}>luca@email.it</SkText>
          <SkLine seed="sl1" style={{ margin: '10px 0' }} />
          {/* section 2 - active */}
          <SkText size={13} weight={700} font={DISPLAY}>
            2. Attività
          </SkText>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkInput seed="olm1" label="Nome" value="AutoLuca" dense />
            <SkInput seed="olm2" label="P. IVA" value="IT 01234567890" dense />
            <SkInput seed="olm3" label="Sede" value="Sesto S.G." icon={<SkIcon name="pin" size={12} />} dense />
          </div>
          <SkLine seed="sl2" style={{ margin: '12px 0' }} />
          {/* section 3 - todo */}
          <SkText size={13} weight={400} color={INK_SOFT}>
            3. Pagamenti <SkText size={10} color={INK_SOFT} style={{ background: PAPER_2, padding: '0 4px' }}>da fare</SkText>
          </SkText>
          <SkLine seed="sl3" style={{ margin: '10px 0' }} />
          <SkText size={13} weight={400} color={INK_SOFT}>
            4. Primo veicolo <SkText size={10} color={INK_SOFT} style={{ background: PAPER_2, padding: '0 4px' }}>opzionale</SkText>
          </SkText>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1.4px solid ${INK}`, padding: '10px 14px' }}>
          <SkBtn full size="md" fill={YELLOW_DEEP} variant="pill-yellow" seed="ols">Continua — Pagamenti</SkBtn>
        </div>
      </div>
      <Anno top={50} right={-6} width={130} rotate={4} color="#cfe4d4">
        sezioni espandibili,<br/>auto-save<br/>tra le sezioni
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD NOLEGGIATORE — Desktop home
// ─────────────────────────────────────────────────────────────
function RentalSidebar({ active }) {
  return (
    <div style={{ background: PAPER_2, borderRight: `1.3px solid ${INK}`, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Logo size={22} />
      <SkText size={10} color={INK_SOFT} style={{ marginLeft: 30, marginTop: -4, marginBottom: 18 }}>per noleggiatori</SkText>
      {[
        { i: 'home', l: 'Dashboard' },
        { i: 'car', l: 'I miei veicoli', b: '6' },
        { i: 'calendar', l: 'Prenotazioni', b: '3' },
        { i: 'chat', l: 'Richieste', b: '5' },
        { i: 'euro', l: 'Pagamenti' },
        { i: 'eye', l: 'Statistiche' },
        { i: 'user', l: 'Profilo aziendale' },
        { i: 'settings', l: 'Impostazioni' },
      ].map((n, i) => (
        <div key={n.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: n.l === active ? YELLOW : 'transparent', borderRadius: 6, border: n.l === active ? `1.3px solid ${INK}` : 'none' }}>
          <SkIcon name={n.i} size={16} />
          <SkText size={13} weight={n.l === active ? 700 : 400} style={{ flex: 1 }}>{n.l}</SkText>
          {n.b && <SkChip seed={'rb' + i}>{n.b}</SkChip>}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <SkBtn full size="sm" fill={INK} seed="addv"><SkIcon name="plus" size={12} color="#fff" /> Nuovo veicolo</SkBtn>
    </div>
  );
}

function RentalDashboardDesktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', height: '100%', minHeight: 600 }}>
        <RentalSidebar active="Dashboard" />
        <div style={{ overflow: 'hidden' }}>
          {/* header */}
          <div style={{ padding: '16px 28px', borderBottom: `1.3px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <SkText size={11} color={INK_SOFT}>Buongiorno,</SkText>
              <SkText size={20} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>AutoLuca</SkText>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SkIcon name="bell" size={18} />
              <SkBox seed="ravd" style={{ width: 32, height: 32, borderRadius: 16, background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SkText size={13} font={DISPLAY} weight={700}>L</SkText>
              </SkBox>
            </div>
          </div>
          <div style={{ padding: '20px 28px' }}>
            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { l: 'Veicoli attivi', v: 6, sub: '/8 totali', t: 'paper' },
                { l: 'Prenotazioni in corso', v: 3, sub: 'ricavi 386€', t: 'yellow' },
                { l: 'Richieste da gestire', v: 5, sub: '2 nuove', t: 'red', urg: true },
                { l: 'Visualizzazioni 7gg', v: '1.2k', sub: '+18%', t: 'green' },
              ].map((s, i) => (
                <SkBox key={i} seed={'rds' + i} fill={s.t === 'yellow' ? YELLOW : s.t === 'red' ? '#f4d6cf' : s.t === 'green' ? '#d6e7d4' : PAPER_2} style={{ padding: 14 }}>
                  <SkText size={11} color={INK_SOFT}>{s.l}</SkText>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <SkText size={26} weight={700} font={DISPLAY}>{s.v}</SkText>
                    {s.urg && <span style={{ width: 8, height: 8, borderRadius: 4, background: RED }} />}
                  </div>
                  <SkText size={11} color={INK_SOFT}>{s.sub}</SkText>
                </SkBox>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginTop: 18 }}>
              {/* requests */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <SkText size={16} weight={700} font={DISPLAY}>Richieste recenti</SkText>
                  <SkText size={11} color={INK_SOFT} style={{ textDecoration: 'underline' }}>tutte →</SkText>
                </div>
                <SkBox seed="rqb" style={{ padding: 0, overflow: 'hidden' }}>
                  {[
                    { u: 'Luca B.', a: 'VW Polo · 2022', d: '18-22 giu (4g)', s: 'nuova', new: true },
                    { u: 'Marta R.', a: 'Fiat Tipo', d: '5-12 lug (7g)', s: 'in attesa' },
                    { u: 'Stefano G.', a: 'Audi A1', d: '24-25 giu (1g)', s: 'in attesa' },
                  ].map((r, i) => (
                    <div key={i} style={{ padding: 12, borderBottom: i < 2 ? `1px dashed ${INK_SOFT}` : 'none', display: 'flex', gap: 10, alignItems: 'center', background: r.new ? YELLOW + '40' : '#fff' }}>
                      <SkBox seed={'rqu' + i} style={{ width: 32, height: 32, borderRadius: 16, background: PAPER_2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SkText size={13} font={DISPLAY} weight={700}>{r.u[0]}</SkText>
                      </SkBox>
                      <div style={{ flex: 1 }}>
                        <SkText size={13} weight={700} style={{ display: 'block' }}>{r.u} <SkText size={11} color={INK_SOFT}>· {r.a}</SkText></SkText>
                        <SkText size={11} color={INK_SOFT}>{r.d}</SkText>
                      </div>
                      <SkChip seed={'rqs' + i} active={r.new}>{r.s}</SkChip>
                      <SkBtn size="sm" fill={INK} seed={'rqg' + i}>vedi</SkBtn>
                    </div>
                  ))}
                </SkBox>
              </div>
              {/* upcoming */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <SkText size={16} weight={700} font={DISPLAY}>Prossimi ritiri</SkText>
                  <SkText size={11} color={INK_SOFT} style={{ textDecoration: 'underline' }}>cal →</SkText>
                </div>
                <SkBox seed="upb" style={{ padding: 0 }}>
                  {[
                    { d: 'Mar 17', t: '15:00', n: 'Stefano G.', a: 'Fiat Tipo' },
                    { d: 'Mer 18', t: '10:00', n: 'Luca B.', a: 'VW Polo' },
                    { d: 'Gio 19', t: '09:30', n: 'Marta R.', a: 'Mini' },
                  ].map((u, i) => (
                    <div key={i} style={{ padding: 10, borderBottom: i < 2 ? `1px dashed ${INK_SOFT}` : 'none', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 44, textAlign: 'center', flex: 'none' }}>
                        <SkText size={11} color={INK_SOFT} style={{ display: 'block' }}>{u.d.split(' ')[0]}</SkText>
                        <SkText size={14} weight={700} font={DISPLAY}>{u.d.split(' ')[1]}</SkText>
                      </div>
                      <div style={{ flex: 1 }}>
                        <SkText size={12} weight={700} style={{ display: 'block' }}>{u.n}</SkText>
                        <SkText size={11} color={INK_SOFT}>{u.a} · {u.t}</SkText>
                      </div>
                    </div>
                  ))}
                </SkBox>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Anno top={130} right={26} width={140} rotate={-3} color="#f4d6cf">
        rosso = urgente.<br/>richieste sopra tutto
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD — Mobile
// ─────────────────────────────────────────────────────────────
function RentalDashboardMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: '0 0 60px 0', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1.3px solid ${INK}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <SkText size={10} color={INK_SOFT}>NOLEGGIATORE</SkText>
            <SkText size={16} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1 }}>AutoLuca</SkText>
          </div>
          <SkIcon name="bell" size={20} />
        </div>
        {/* alert */}
        <div style={{ padding: '12px 16px 0' }}>
          <SkBox seed="al" fill="#f4d6cf" style={{ padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: RED, flex: 'none' }} />
            <SkText size={12} weight={700} style={{ flex: 1 }}>5 richieste da gestire</SkText>
            <SkIcon name="chevron" size={14} />
          </SkBox>
        </div>
        {/* stats grid */}
        <div style={{ padding: '12px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: 'Veicoli attivi', v: 6, sub: '/8', t: 'paper' },
            { l: 'In corso', v: 3, sub: '386€', t: 'yellow' },
            { l: 'Visite 7gg', v: '1.2k', sub: '+18%', t: 'green' },
            { l: 'Conversione', v: '12%', sub: '+2pp', t: 'paper' },
          ].map((s, i) => (
            <SkBox key={i} seed={'rmd' + i} fill={s.t === 'yellow' ? YELLOW : s.t === 'green' ? '#d6e7d4' : PAPER_2} style={{ padding: 10 }}>
              <SkText size={10} color={INK_SOFT}>{s.l}</SkText>
              <SkText size={20} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1, marginTop: 2 }}>{s.v}</SkText>
              <SkText size={10} color={INK_SOFT}>{s.sub}</SkText>
            </SkBox>
          ))}
        </div>
        {/* quick add */}
        <div style={{ padding: '12px 16px 0' }}>
          <SkBox seed="qa" fill={YELLOW} dashed style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <SkIcon name="plus" size={18} />
            <div style={{ flex: 1 }}>
              <SkText size={13} weight={700}>Aggiungi un veicolo</SkText>
              <SkText size={11} color={INK_SOFT} style={{ display: 'block' }}>~3 minuti</SkText>
            </div>
          </SkBox>
        </div>
        {/* upcoming */}
        <div style={{ padding: '14px 16px 0' }}>
          <SkText size={14} weight={700} font={DISPLAY}>Prossimi ritiri</SkText>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { d: '17', m: 'giu', t: '15:00', n: 'Stefano G.', a: 'Fiat Tipo' },
              { d: '18', m: 'giu', t: '10:00', n: 'Luca B.', a: 'VW Polo' },
            ].map((u, i) => (
              <SkBox key={i} seed={'rmu' + i} style={{ padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 36, textAlign: 'center', flex: 'none' }}>
                  <SkText size={9} color={INK_SOFT} style={{ display: 'block' }}>{u.m}</SkText>
                  <SkText size={16} weight={700} font={DISPLAY}>{u.d}</SkText>
                </div>
                <div style={{ flex: 1 }}>
                  <SkText size={12} weight={700} style={{ display: 'block' }}>{u.n}</SkText>
                  <SkText size={10} color={INK_SOFT}>{u.a} · {u.t}</SkText>
                </div>
              </SkBox>
            ))}
          </div>
        </div>
      </div>
      {/* bottom nav (rental-specific) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1.4px solid ${INK}`, background: PAPER, display: 'flex', justifyContent: 'space-around', padding: '8px 4px 6px' }}>
        {[
          { i: 'home', l: 'Home', a: true },
          { i: 'car', l: 'Veicoli' },
          { i: 'calendar', l: 'Prenot.' },
          { i: 'chat', l: 'Richieste' },
          { i: 'user', l: 'Profilo' },
        ].map(t => (
          <div key={t.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: t.a ? 1 : 0.55 }}>
            <SkIcon name={t.i} size={18} />
            <SkText size={10} weight={t.a ? 700 : 400}>{t.l}</SkText>
            {t.a && <span style={{ width: 4, height: 4, borderRadius: 2, background: INK }} />}
          </div>
        ))}
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// LISTA VEICOLI — Desktop
// ─────────────────────────────────────────────────────────────
function RentalVehiclesDesktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/dashboard/veicoli">
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', height: '100%', minHeight: 600 }}>
        <RentalSidebar active="I miei veicoli" />
        <div>
          <div style={{ padding: '14px 28px', borderBottom: `1.3px solid ${INK}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <SkText size={22} weight={700} font={DISPLAY}>I miei veicoli</SkText>
              <SkText size={11} color={INK_SOFT}>6 attivi · 2 bozze · 0 fuori catalogo</SkText>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <SkInput seed="rsv" icon={<SkIcon name="search" size={14} />} placeholder="Cerca" dense style={{ width: 180 }} />
              <SkBtn size="md" variant="ghost" seed="rfv"><SkIcon name="filter" size={14} /> Filtri</SkBtn>
              <SkBtn size="md" fill={INK} seed="rav"><SkIcon name="plus" size={12} color="#fff" /> Nuovo veicolo</SkBtn>
            </div>
          </div>
          {/* tabs */}
          <div style={{ display: 'flex', gap: 22, padding: '0 28px', borderBottom: `1.3px solid ${INK}` }}>
            {['Tutti · 8', 'Attivi · 6', 'Bozze · 2', 'Fuori catalogo · 0'].map((t, i) => (
              <div key={t} style={{ padding: '10px 0', borderBottom: i === 0 ? `2px solid ${INK}` : 'none', marginBottom: -1.3 }}>
                <SkText size={12} weight={i === 0 ? 700 : 400} color={i === 0 ? INK : INK_SOFT}>{t}</SkText>
              </div>
            ))}
          </div>
          {/* table */}
          <div style={{ padding: '0 28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr 1fr 0.6fr', padding: '12px 6px', borderBottom: `1px solid ${INK_SOFT}` }}>
              {[' ', 'Veicolo', 'Stato', 'Prezzo/g', 'Prenotaz.', 'Visite (7gg)', '  '].map(h => (
                <SkText key={h} size={11} color={INK_SOFT} style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</SkText>
              ))}
            </div>
            {[
              { n: 'VW Polo · 2022', s: 'Attivo', p: 32, b: 4, v: 134, t: 'paper' },
              { n: 'Fiat Tipo · 2021', s: 'Attivo', p: 35, b: 2, v: 89, t: 'paper' },
              { n: 'Audi A1 · 2022', s: 'Attivo', p: 55, b: 1, v: 76, t: 'yellow' },
              { n: 'Mini · 2023', s: 'Attivo', p: 58, b: 0, v: 42, t: 'paper' },
              { n: 'Renault Clio · 2023', s: 'Attivo', p: 42, b: 3, v: 162, t: 'green' },
              { n: 'Tesla M3 · 2024', s: 'Bozza', p: '—', b: 0, v: 0, t: 'paper', draft: true },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 1fr 1fr 1fr 0.6fr', padding: '10px 6px', borderBottom: `1px dashed ${INK_SOFT}`, alignItems: 'center' }}>
                <SkCarPlaceholder seed={'rvr' + i} width={50} height={32} label="" tone={r.t} />
                <div>
                  <SkText size={13} weight={700} style={{ display: 'block' }}>{r.n}</SkText>
                  <SkText size={11} color={INK_SOFT}>1.0 TSI · Manuale · 5 posti</SkText>
                </div>
                <SkChip seed={'rss' + i} active={!r.draft} style={{ background: r.draft ? PAPER_2 : '#d6e7d4' }}>
                  <SkIcon name={r.draft ? 'edit' : 'check'} size={11} color={r.draft ? INK_SOFT : GREEN} /> {r.s}
                </SkChip>
                <SkText size={14} weight={700} font={DISPLAY}>{r.p === '—' ? '—' : r.p + '€'}</SkText>
                <SkText size={13}>{r.b}</SkText>
                <SkText size={13}>{r.v}</SkText>
                <div style={{ display: 'flex', gap: 4 }}>
                  <SkIcon name="edit" size={14} color={INK_SOFT} />
                  <SkIcon name="settings" size={14} color={INK_SOFT} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// AGGIUNGI VEICOLO — Desktop
// ─────────────────────────────────────────────────────────────
function RentalAddVehicleDesktop() {
  return (
    <Frame kind="desktop" url="noleggio.it/dashboard/veicoli/nuovo">
      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', height: '100%', minHeight: 600 }}>
        <RentalSidebar active="I miei veicoli" />
        <div>
          <div style={{ padding: '14px 28px', borderBottom: `1.3px solid ${INK}` }}>
            <SkText size={11} color={INK_SOFT}>I miei veicoli · <span style={{ textDecoration: 'underline' }}>Nuovo</span></SkText>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
              <SkText size={22} weight={700} font={DISPLAY}>Nuovo veicolo</SkText>
              <div style={{ display: 'flex', gap: 8 }}>
                <SkBtn size="sm" variant="ghost" seed="svdr">Salva bozza</SkBtn>
                <SkBtn size="sm" fill={INK} seed="pubv">Pubblica veicolo</SkBtn>
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* sezione 1: identificazione */}
              <SkBox seed="se1" style={{ padding: 16 }}>
                <SkText size={14} weight={700} font={DISPLAY} style={{ display: 'block' }}>
                  <span style={{ background: YELLOW, padding: '0 6px', marginRight: 6 }}>1</span>
                  Identificazione
                </SkText>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  <SkInput seed="iv1" label="Marchio *" value="VW" suffix="▾" />
                  <SkInput seed="iv2" label="Modello *" value="Polo" />
                  <SkInput seed="iv3" label="Motorizzazione *" value="1.0 TSI 95cv Manuale" />
                  <SkInput seed="iv4" label="Carburante *" value="Benzina" suffix="▾" />
                  <SkInput seed="iv5" label="Anno" value="2022" />
                  <SkInput seed="iv6" label="Targa" value="AB123CD" />
                </div>
              </SkBox>
              {/* sezione 2: dettagli */}
              <SkBox seed="se2" style={{ padding: 16 }}>
                <SkText size={14} weight={700} font={DISPLAY} style={{ display: 'block' }}>
                  <span style={{ background: PAPER_2, padding: '0 6px', marginRight: 6 }}>2</span>
                  Dettagli
                </SkText>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
                  <SkInput seed="dv1" label="Posti" value="5" />
                  <SkInput seed="dv2" label="Porte" value="5" />
                  <SkInput seed="dv3" label="Cambio" value="Manuale" suffix="▾" />
                  <SkInput seed="dv4" label="Trazione" value="FWD" suffix="▾" />
                  <SkInput seed="dv5" label="Cilindrata" value="999 cc" />
                  <SkInput seed="dv6" label="Cavalli" value="95" />
                  <SkInput seed="dv7" label="Colore" value="Bianco" suffix="▾" />
                  <SkInput seed="dv8" label="Km" value="40.000" />
                  <SkInput seed="dv9" label="Bagagliaio" value="351 L" />
                </div>
              </SkBox>
              {/* sezione 3: accessori */}
              <SkBox seed="se3" style={{ padding: 16 }}>
                <SkText size={14} weight={700} font={DISPLAY} style={{ display: 'block', marginBottom: 12 }}>
                  <span style={{ background: PAPER_2, padding: '0 6px', marginRight: 6 }}>3</span>
                  Accessori <SkText size={11} color={INK_SOFT}>(multi-select)</SkText>
                </SkText>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Bluetooth', 'Apple CarPlay', 'Android Auto', 'Sens. parcheggio', 'Telecamera', 'Cruise control', 'Navigatore', 'Tetto panor.', 'Cambio aut.', 'Aria cond.', 'USB', 'Vivavoce', 'Specchi rip.', 'Cerchi lega'].map((a, i) => (
                    <SkChip key={a} seed={'acn' + i} active={[0, 2, 3, 5, 9].includes(i)}>{a}</SkChip>
                  ))}
                </div>
              </SkBox>
              {/* sezione 4: descrizione */}
              <SkBox seed="se4" style={{ padding: 16 }}>
                <SkText size={14} weight={700} font={DISPLAY} style={{ display: 'block', marginBottom: 12 }}>
                  <span style={{ background: PAPER_2, padding: '0 6px', marginRight: 6 }}>4</span>
                  Descrizione
                </SkText>
                <SkBox seed="dsc" style={{ background: '#fff', padding: 10, minHeight: 80 }}>
                  <SkText size={12} color={INK_SOFT}>Racconta qualcosa di questa auto: condizioni, peculiarità, casi d'uso ideali…</SkText>
                </SkBox>
              </SkBox>
            </div>
            {/* sidebar: foto + prezzo + dispo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SkBox seed="sb1" style={{ padding: 14 }}>
                <SkText size={13} weight={700} font={DISPLAY} style={{ display: 'block', marginBottom: 10 }}>Foto · max 8</SkText>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <SkCarPlaceholder seed="ph1" height={60} label="1" />
                  <SkCarPlaceholder seed="ph2" height={60} label="2" tone="paper" />
                  <SkCarPlaceholder seed="ph3" height={60} label="3" tone="yellow" />
                  <SkBox seed="ph4" dashed style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <SkIcon name="upload" size={14} color={INK_SOFT} />
                    <SkText size={10} color={INK_SOFT}>aggiungi</SkText>
                  </SkBox>
                </div>
              </SkBox>
              <SkBox seed="sb2" style={{ padding: 14 }}>
                <SkText size={13} weight={700} font={DISPLAY} style={{ display: 'block', marginBottom: 10 }}>Prezzi</SkText>
                <SkInput seed="pr1" label="Giornaliero" value="32" suffix="€" />
                <SkInput seed="pr2" label="Settimanale" placeholder="opzionale" suffix="€" style={{ marginTop: 8 }} />
                <SkInput seed="pr3" label="Mensile" value="690" suffix="€" style={{ marginTop: 8 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <SkBox seed="cb" style={{ width: 14, height: 14, background: INK }} />
                  <SkText size={12}>Cauzione richiesta</SkText>
                </div>
              </SkBox>
              <SkBox seed="sb3" style={{ padding: 14 }}>
                <SkText size={13} weight={700} font={DISPLAY} style={{ display: 'block', marginBottom: 10 }}>Disponibilità</SkText>
                <SkChip seed="av1" active>Sempre disponibile</SkChip>
                <SkChip seed="av2" style={{ marginTop: 4 }}>Calendario</SkChip>
                <SkInput seed="lo" label="Località ritiro" icon={<SkIcon name="pin" size={14} />} value="Sesto S.G." style={{ marginTop: 10 }} />
              </SkBox>
            </div>
          </div>
        </div>
      </div>
      <Anno top={140} right={26} width={130} rotate={3} color={YELLOW}>
        sidebar dx<br/>= foto + soldi.<br/>la roba che<br/>VENDE.
      </Anno>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// AGGIUNGI VEICOLO — Mobile (wizard)
// ─────────────────────────────────────────────────────────────
function RentalAddVehicleMobile() {
  return (
    <Frame kind="mobile">
      <MobileStatus />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1.3px solid ${INK}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SkIcon name="x" size={18} />
          <div style={{ flex: 1 }}>
            <SkText size={13} weight={700} font={DISPLAY}>Nuovo veicolo</SkText>
            <SkText size={10} color={INK_SOFT}>Step 3 di 5 · Foto</SkText>
          </div>
          <SkText size={11} color={INK_SOFT} style={{ textDecoration: 'underline' }}>bozza</SkText>
        </div>
        {/* progress */}
        <div style={{ display: 'flex', gap: 3, padding: '8px 16px' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= 3 ? INK : INK_SOFT, opacity: n <= 3 ? 1 : 0.3 }} />
          ))}
        </div>
        <div style={{ padding: '16px', flex: 1, overflow: 'hidden' }}>
          <SkText size={22} weight={700} font={DISPLAY} style={{ display: 'block', lineHeight: 1.05 }}>
            Aggiungi delle<br/>foto.
          </SkText>
          <SkText size={12} color={INK_SOFT} style={{ display: 'block', marginTop: 4 }}>
            La prima foto è quella che vedono tutti. Curala.
          </SkText>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <SkCarPlaceholder seed="amp1" height={94} label="" />
              <SkChip seed="cov" active style={{ position: 'absolute', top: 4, left: 4 }}>copertina</SkChip>
            </div>
            <SkCarPlaceholder seed="amp2" height={94} label="" tone="paper" />
            <SkCarPlaceholder seed="amp3" height={94} label="" tone="yellow" />
            <SkBox seed="amp4" dashed fill="#fff" style={{ height: 94, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <SkIcon name="plus" size={20} color={INK_SOFT} />
              <SkText size={11} color={INK_SOFT}>aggiungi</SkText>
            </SkBox>
          </div>
          <SkBox seed="tip" fill={YELLOW + '70'} style={{ padding: 10, marginTop: 14, display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 14 }}>💡</span>
            <SkText size={11} color={INK_SOFT}>Auto pulita, sfondo neutro, luce naturale. 3-4 foto bastano.</SkText>
          </SkBox>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: `1.4px solid ${INK}`, padding: '10px 14px', display: 'flex', gap: 8 }}>
          <SkBtn size="md" variant="ghost" seed="amb" style={{ flex: 1 }}>← Indietro</SkBtn>
          <SkBtn size="md" fill={INK} seed="amn" style={{ flex: 2 }}>Avanti — Accessori →</SkBtn>
        </div>
      </div>
    </Frame>
  );
}

Object.assign(window, {
  OnboardWizardMobile, OnboardWizardDesktop, OnboardLongMobile,
  RentalDashboardDesktop, RentalDashboardMobile,
  RentalVehiclesDesktop, RentalAddVehicleDesktop, RentalAddVehicleMobile,
});
