// Print-friendly layout: rende ogni artboard come una pagina A4 landscape,
// senza il design canvas (niente pan/zoom).

const { 
  HomeV1Mobile, HomeV1Desktop, HomeV2Mobile, HomeV2Desktop, HomeV3Mobile, HomeV3Desktop,
  ListV1Mobile, ListV1Desktop, ListV2Mobile, ListV2Desktop, ListV3Mobile, ListV3Desktop,
  VehicleV1Mobile, VehicleV1Desktop, VehicleV2Mobile, VehicleV2Desktop, VehicleV3Mobile,
  LoginMobile, RegisterMobile, UserHomeMobile, UserBookingsMobile, UserFavoritesMobile,
  UserProfileDesktop, UserDashboardDesktop,
  OnboardWizardMobile, OnboardWizardDesktop, OnboardLongMobile,
  RentalDashboardDesktop, RentalDashboardMobile,
  RentalVehiclesDesktop, RentalAddVehicleDesktop, RentalAddVehicleMobile,
  INK, INK_SOFT, PAPER, YELLOW, DISPLAY, HAND
} = window;

window.WIRE_SHOW_NOTES = true;

// Mobile 360×760 → coppie per pagina landscape
// Desktop 1240×740 → uno per pagina landscape

const MW = 360, MH = 760, DW = 1240, DH = 740;

// Pagina A4 landscape, margine 10mm: area utile ~1046 × 718 px @ 96dpi
const PAGE_W = 1046;
const PAGE_H = 718;

function ArtboardPage({ kind, label, sectionTitle, sectionSub, children, second }) {
  const W = kind === 'mobile' ? MW : DW;
  const H = kind === 'mobile' ? MH : DH;
  // Per mobile in pair (two side by side): total = 720 wide
  let scale;
  if (kind === 'mobilePair') {
    scale = Math.min((PAGE_W - 40) / 760, (PAGE_H - 120) / MH);
  } else if (kind === 'mobile') {
    scale = Math.min((PAGE_W - 40) / MW, (PAGE_H - 120) / MH);
  } else {
    scale = Math.min((PAGE_W - 40) / DW, (PAGE_H - 120) / DH);
  }
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-sect">{sectionTitle}{sectionSub && <span className="page-sub"> · {sectionSub}</span>}</div>
        <div className="page-label">{label}</div>
      </div>
      <div className="page-stage">
        <div className="page-scale" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function MobilePairPage({ a, b, sectionTitle, sectionSub }) {
  const scale = Math.min((PAGE_W - 40) / 760, (PAGE_H - 120) / MH);
  return (
    <div className="page">
      <div className="page-head">
        <div className="page-sect">{sectionTitle}{sectionSub && <span className="page-sub"> · {sectionSub}</span>}</div>
        <div className="page-label">{a.label}{b ? `  +  ${b.label}` : ''}</div>
      </div>
      <div className="page-stage">
        <div className="page-scale" style={{ transform: `scale(${scale})`, transformOrigin: 'top center', display: 'flex', gap: 40 }}>
          <div style={{ width: MW, height: MH }}>{a.children}</div>
          {b && <div style={{ width: MW, height: MH }}>{b.children}</div>}
        </div>
      </div>
    </div>
  );
}

function SectionDivider({ idx, title, subtitle }) {
  return (
    <div className="page divider">
      <div className="div-num">{idx}</div>
      <div className="div-title">{title}</div>
      <div className="div-sub">{subtitle}</div>
      <svg width="180" height="14" viewBox="0 0 180 14" style={{ marginTop: 16 }}>
        <path d="M 2 7 Q 24 1 46 7 T 88 7 T 130 7 T 178 7" stroke={INK} strokeWidth="1.8" fill="none" />
      </svg>
    </div>
  );
}

function CoverPage() {
  return (
    <div className="page cover">
      <div style={{ fontFamily: DISPLAY, fontSize: 80, fontWeight: 700, lineHeight: 0.9 }}>noleggio.it</div>
      <div style={{ fontFamily: HAND, fontSize: 22, marginTop: 10, color: INK_SOFT }}>
        wireframe lo-fi · esplorazione delle aree principali
      </div>
      <svg width="240" height="14" viewBox="0 0 240 14" style={{ marginTop: 22 }}>
        <path d="M 2 7 Q 30 1 60 7 T 120 7 T 180 7 T 238 7" stroke={INK} strokeWidth="2" fill="none" />
      </svg>
      <div style={{ marginTop: 38, fontFamily: HAND, fontSize: 16, lineHeight: 1.6, maxWidth: 640 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, marginBottom: 10 }}>indice</div>
        <ol style={{ paddingLeft: 22 }}>
          <li>Home / Ricerca — 3 pattern</li>
          <li>Risultati ricerca — 3 layout</li>
          <li>Scheda veicolo — 3 approcci</li>
          <li>Area personale utente</li>
          <li>Onboarding noleggiatore</li>
          <li>Dashboard noleggiatore</li>
        </ol>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 50, fontFamily: HAND, fontSize: 13, color: INK_SOFT }}>
        progetto · MVP · maggio 2026
      </div>
      <div style={{ position: 'absolute', bottom: 40, right: 50, background: YELLOW, padding: '6px 12px', fontFamily: HAND, fontSize: 14, transform: 'rotate(-2deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
        mobile-first · IT
      </div>
    </div>
  );
}

function PrintApp() {
  // Section structure (mirrors app.jsx)
  const sections = [
    { idx: '01', title: 'Home / Ricerca', sub: '3 pattern di ingaggio',
      pairs: [
        { a: { label: 'V1 · Search bar — Mobile', el: <HomeV1Mobile /> } },
        { desktop: { label: 'V1 · Search bar — Desktop', el: <HomeV1Desktop /> } },
        { a: { label: 'V2 · Step-by-step — Mobile', el: <HomeV2Mobile /> } },
        { desktop: { label: 'V2 · Step-by-step — Desktop', el: <HomeV2Desktop /> } },
        { a: { label: 'V3 · Mappa-first — Mobile', el: <HomeV3Mobile /> } },
        { desktop: { label: 'V3 · Mappa-first — Desktop', el: <HomeV3Desktop /> } },
      ]},
    { idx: '02', title: 'Risultati ricerca', sub: '3 layout per filtri e mappa',
      pairs: [
        { a: { label: 'V1 · Lista — Mobile', el: <ListV1Mobile /> } },
        { desktop: { label: 'V1 · Sidebar filtri + grid — Desktop', el: <ListV1Desktop /> } },
        { a: { label: 'V2 · Split mappa/lista — Mobile', el: <ListV2Mobile /> } },
        { desktop: { label: 'V2 · Split mappa/lista — Desktop', el: <ListV2Desktop /> } },
        { a: { label: 'V3 · Filtri full-sheet — Mobile', el: <ListV3Mobile /> } },
        { desktop: { label: 'V3 · Mega-filter — Desktop', el: <ListV3Desktop /> } },
      ]},
    { idx: '03', title: 'Scheda veicolo', sub: '3 approcci alla densità info',
      pairs: [
        { a: { label: 'V1 · Galleria + CTA — Mobile', el: <VehicleV1Mobile /> }, b: { label: 'V2 · Info-dense + tabs — Mobile', el: <VehicleV2Mobile /> } },
        { a: { label: 'V3 · Storytelling — Mobile', el: <VehicleV3Mobile /> } },
        { desktop: { label: 'V1 · Galleria + sidebar prezzo — Desktop', el: <VehicleV1Desktop /> } },
        { desktop: { label: 'V2 · Info-dense — Desktop', el: <VehicleV2Desktop /> } },
      ]},
    { idx: '04', title: 'Area personale utente', sub: 'Login, dashboard, prenotazioni',
      pairs: [
        { a: { label: 'Login — Mobile', el: <LoginMobile /> }, b: { label: 'Registrazione — Mobile', el: <RegisterMobile /> } },
        { a: { label: 'Dashboard — Mobile', el: <UserHomeMobile /> }, b: { label: 'Prenotazioni — Mobile', el: <UserBookingsMobile /> } },
        { a: { label: 'Salvati — Mobile', el: <UserFavoritesMobile /> } },
        { desktop: { label: 'Dashboard utente — Desktop', el: <UserDashboardDesktop /> } },
        { desktop: { label: 'Profilo — Desktop', el: <UserProfileDesktop /> } },
      ]},
    { idx: '05', title: 'Onboarding noleggiatore', sub: '2 approcci: wizard · long-form',
      pairs: [
        { a: { label: 'V1 · Wizard — Mobile', el: <OnboardWizardMobile /> }, b: { label: 'V2 · Long-form — Mobile', el: <OnboardLongMobile /> } },
        { desktop: { label: 'V1 · Wizard con rail — Desktop', el: <OnboardWizardDesktop /> } },
      ]},
    { idx: '06', title: 'Dashboard noleggiatore', sub: 'Panoramica, veicoli, aggiunta veicolo',
      pairs: [
        { desktop: { label: 'Dashboard — Desktop', el: <RentalDashboardDesktop /> } },
        { a: { label: 'Dashboard — Mobile', el: <RentalDashboardMobile /> }, b: { label: 'Aggiungi veicolo — Mobile', el: <RentalAddVehicleMobile /> } },
        { desktop: { label: 'Lista veicoli — Desktop', el: <RentalVehiclesDesktop /> } },
        { desktop: { label: 'Aggiungi veicolo — Desktop', el: <RentalAddVehicleDesktop /> } },
      ]},
  ];
  return (
    <>
      <CoverPage />
      {sections.map(sec => (
        <React.Fragment key={sec.idx}>
          <SectionDivider idx={sec.idx} title={sec.title} subtitle={sec.sub} />
          {sec.pairs.map((p, i) => {
            if (p.desktop) {
              return (
                <ArtboardPage key={i} kind="desktop" label={p.desktop.label} sectionTitle={sec.idx + ' · ' + sec.title} sectionSub={sec.sub}>
                  {p.desktop.el}
                </ArtboardPage>
              );
            }
            if (p.b) {
              return (
                <MobilePairPage key={i} sectionTitle={sec.idx + ' · ' + sec.title} sectionSub={sec.sub}
                  a={{ label: p.a.label, children: p.a.el }}
                  b={{ label: p.b.label, children: p.b.el }} />
              );
            }
            return (
              <ArtboardPage key={i} kind="mobile" label={p.a.label} sectionTitle={sec.idx + ' · ' + sec.title} sectionSub={sec.sub}>
                {p.a.el}
              </ArtboardPage>
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PrintApp />);

// Auto-print dopo che fonts + render sono pronti
(async () => {
  try { await document.fonts.ready; } catch {}
  await new Promise(r => setTimeout(r, 800));
  if (!window.__noPrint) window.print();
})();
