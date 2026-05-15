// Main app — assembla tutte le schermate in un design canvas

const { DesignCanvas, DCSection, DCArtboard, DCPostIt,
  TweaksPanel, useTweaks, TweakSection, TweakToggle, TweakRadio,
  HomeV1Mobile, HomeV1Desktop, HomeV2Mobile, HomeV2Desktop, HomeV3Mobile, HomeV3Desktop,
  ListV1Mobile, ListV1Desktop, ListV2Mobile, ListV2Desktop, ListV3Mobile, ListV3Desktop,
  VehicleV1Mobile, VehicleV1Desktop, VehicleV2Mobile, VehicleV2Desktop, VehicleV3Mobile,
  LoginMobile, RegisterMobile, UserHomeMobile, UserBookingsMobile, UserFavoritesMobile,
  UserProfileDesktop, UserDashboardDesktop,
  OnboardWizardMobile, OnboardWizardDesktop, OnboardLongMobile,
  RentalDashboardDesktop, RentalDashboardMobile,
  RentalVehiclesDesktop, RentalAddVehicleDesktop, RentalAddVehicleMobile,
  INK, INK_SOFT, PAPER, YELLOW, RED, DISPLAY, HAND
} = window;

// Tweakable defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showNotes": true,
  "fillState": "filled",
  "device": "both"
}/*EDITMODE-END*/;

function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  // sync global flag for Anno
  React.useEffect(() => { window.WIRE_SHOW_NOTES = t.showNotes; }, [t.showNotes]);
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => { force(); }, [t.showNotes, t.fillState, t.device]);

  // Width constants
  const MW = 360, MH = 760;
  const DW = 1240, DH = 740;

  // Helper to skip a kind of artboard based on the device tweak
  const showMobile = t.device !== 'desktop';
  const showDesktop = t.device !== 'mobile';

  // Compact mode: if showing only one device, narrow the section's gap
  return (
    <>
      <DesignCanvas>
        <DCSection id="intro" title="Brief & approccio" subtitle="Note di partenza prima dei wireframe">
          <DCArtboard id="brief" label="Brief sintetico" width={520} height={MH}>
            <div style={{ padding: 28, background: PAPER, height: '100%', fontFamily: HAND, color: INK, overflow: 'hidden' }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 36, fontWeight: 700, lineHeight: 0.95 }}>
                noleggio.it
              </div>
              <div style={{ fontSize: 14, color: INK_SOFT, marginTop: 4 }}>
                aggregatore di autonoleggi privati — wireframe lo-fi
              </div>
              <svg width="120" height="10" viewBox="0 0 120 10" style={{ marginTop: 10 }}>
                <path d="M 2 5 Q 14 1 26 5 T 50 5 T 74 5 T 98 5 T 118 5" stroke={INK} strokeWidth="1.5" fill="none" />
              </svg>
              <div style={{ marginTop: 22, fontFamily: DISPLAY, fontSize: 22, fontWeight: 700 }}>cosa esploriamo</div>
              <ul style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, paddingLeft: 18 }}>
                <li>frontend pubblico — home, ricerca, scheda veicolo</li>
                <li>area personale utente — login, prenotazioni, salvati</li>
                <li>dashboard noleggiatori — gestione veicoli, richieste</li>
                <li>onboarding noleggiatore — wizard guidato</li>
              </ul>
              <div style={{ marginTop: 22, fontFamily: DISPLAY, fontSize: 22, fontWeight: 700 }}>regole del gioco</div>
              <ul style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, paddingLeft: 18 }}>
                <li><b>mobile-first</b> ma desktop affiancato</li>
                <li>tempo target: &lt; 30 sec per trovare un'auto</li>
                <li>tassonomie controllate (marchio, carburante, accessori)</li>
                <li>scheda veicolo: 4 campi obbligatori, resto opzionale</li>
              </ul>
              <div style={{ marginTop: 22, fontFamily: DISPLAY, fontSize: 22, fontWeight: 700 }}>3 varianti dove conta</div>
              <ul style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6, paddingLeft: 18 }}>
                <li>pattern di <b>ricerca</b> (search bar / step / mappa)</li>
                <li>layout <b>listing</b> (lista / split mappa / filtri-sheet)</li>
                <li>densità <b>scheda veicolo</b> (cta / tabs / storytelling)</li>
              </ul>
              <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28, background: YELLOW, padding: '10px 12px', fontSize: 13, fontFamily: HAND, transform: 'rotate(-1deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                <b>Suggerimento:</b> usa i tweaks ⚙ in alto a destra per mostrare<br/>solo mobile o solo desktop, o nascondere le annotazioni.
              </div>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="home" title="01 · Home / Ricerca" subtitle="3 pattern: search bar · step · mappa-first">
          {showMobile && <DCArtboard id="h1m" label="V1 · Search bar — Mobile" width={MW} height={MH}><HomeV1Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="h1d" label="V1 · Search bar — Desktop" width={DW} height={DH}><HomeV1Desktop /></DCArtboard>}
          {showMobile && <DCArtboard id="h2m" label="V2 · Step-by-step — Mobile" width={MW} height={MH}><HomeV2Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="h2d" label="V2 · Step-by-step — Desktop" width={DW} height={DH}><HomeV2Desktop /></DCArtboard>}
          {showMobile && <DCArtboard id="h3m" label="V3 · Mappa-first — Mobile" width={MW} height={MH}><HomeV3Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="h3d" label="V3 · Mappa-first — Desktop" width={DW} height={DH}><HomeV3Desktop /></DCArtboard>}
        </DCSection>

        <DCSection id="listing" title="02 · Risultati ricerca" subtitle="3 pattern: lista classica · split mappa · filtri-sheet">
          {showMobile && <DCArtboard id="l1m" label="V1 · Lista — Mobile" width={MW} height={MH}><ListV1Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="l1d" label="V1 · Sidebar filtri + grid — Desktop" width={DW} height={DH}><ListV1Desktop /></DCArtboard>}
          {showMobile && <DCArtboard id="l2m" label="V2 · Split mappa/lista — Mobile" width={MW} height={MH}><ListV2Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="l2d" label="V2 · Split mappa/lista — Desktop" width={DW} height={DH}><ListV2Desktop /></DCArtboard>}
          {showMobile && <DCArtboard id="l3m" label="V3 · Filtri full-sheet — Mobile" width={MW} height={MH}><ListV3Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="l3d" label="V3 · Mega-filter — Desktop" width={DW} height={DH}><ListV3Desktop /></DCArtboard>}
        </DCSection>

        <DCSection id="vehicle" title="03 · Scheda veicolo" subtitle="3 approcci: galleria + CTA sticky · info-dense · storytelling">
          {showMobile && <DCArtboard id="v1m" label="V1 · Galleria + CTA — Mobile" width={MW} height={MH}><VehicleV1Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="v1d" label="V1 · Galleria + sidebar prezzo — Desktop" width={DW} height={DH}><VehicleV1Desktop /></DCArtboard>}
          {showMobile && <DCArtboard id="v2m" label="V2 · Info-dense + tabs — Mobile" width={MW} height={MH}><VehicleV2Mobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="v2d" label="V2 · Info-dense — Desktop" width={DW} height={DH}><VehicleV2Desktop /></DCArtboard>}
          {showMobile && <DCArtboard id="v3m" label="V3 · Storytelling — Mobile" width={MW} height={MH}><VehicleV3Mobile /></DCArtboard>}
        </DCSection>

        <DCSection id="user" title="04 · Area personale utente" subtitle="Login, dashboard, prenotazioni, salvati, profilo">
          {showMobile && <DCArtboard id="ulog" label="Login — Mobile" width={MW} height={MH}><LoginMobile /></DCArtboard>}
          {showMobile && <DCArtboard id="ureg" label="Registrazione — Mobile" width={MW} height={MH}><RegisterMobile /></DCArtboard>}
          {showMobile && <DCArtboard id="uhm" label="Dashboard utente — Mobile" width={MW} height={MH}><UserHomeMobile /></DCArtboard>}
          {showMobile && <DCArtboard id="ubk" label="Prenotazioni — Mobile" width={MW} height={MH}><UserBookingsMobile /></DCArtboard>}
          {showMobile && <DCArtboard id="ufv" label="Salvati — Mobile" width={MW} height={MH}><UserFavoritesMobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="udd" label="Dashboard utente — Desktop" width={DW} height={DH}><UserDashboardDesktop /></DCArtboard>}
          {showDesktop && <DCArtboard id="upd" label="Profilo — Desktop" width={DW} height={DH}><UserProfileDesktop /></DCArtboard>}
        </DCSection>

        <DCSection id="onboard" title="05 · Onboarding noleggiatore" subtitle="2 approcci: wizard guidato · long-form con sezioni">
          {showMobile && <DCArtboard id="ow1m" label="V1 · Wizard step — Mobile" width={MW} height={MH}><OnboardWizardMobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="ow1d" label="V1 · Wizard con rail — Desktop" width={DW} height={DH}><OnboardWizardDesktop /></DCArtboard>}
          {showMobile && <DCArtboard id="ow2m" label="V2 · Long-form sezioni — Mobile" width={MW} height={MH}><OnboardLongMobile /></DCArtboard>}
        </DCSection>

        <DCSection id="rental" title="06 · Dashboard noleggiatore" subtitle="Panoramica, lista veicoli, aggiunta veicolo">
          {showDesktop && <DCArtboard id="rdd" label="Dashboard — Desktop" width={DW} height={DH}><RentalDashboardDesktop /></DCArtboard>}
          {showMobile && <DCArtboard id="rdm" label="Dashboard — Mobile" width={MW} height={MH}><RentalDashboardMobile /></DCArtboard>}
          {showDesktop && <DCArtboard id="rvd" label="Lista veicoli — Desktop" width={DW} height={DH}><RentalVehiclesDesktop /></DCArtboard>}
          {showDesktop && <DCArtboard id="rad" label="Aggiungi veicolo — Desktop" width={DW} height={DH}><RentalAddVehicleDesktop /></DCArtboard>}
          {showMobile && <DCArtboard id="ram" label="Aggiungi veicolo — Mobile" width={MW} height={MH}><RentalAddVehicleMobile /></DCArtboard>}
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Visualizzazione" />
        <TweakRadio label="Device" value={t.device}
          options={[
            { value: 'both', label: 'Entrambi' },
            { value: 'mobile', label: 'Mobile' },
            { value: 'desktop', label: 'Desktop' },
          ]}
          onChange={(v) => setT('device', v)} />
        <TweakToggle label="Mostra annotazioni" value={t.showNotes}
          onChange={(v) => setT('showNotes', v)} />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
