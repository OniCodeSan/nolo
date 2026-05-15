// hifi-app.jsx — Direzione A unica, area utente + noleggiatore, tweaks panel

const { DesignCanvas, DCSection, DCArtboard,
  ThemeA,
  TweaksPanel, useTweaks, TweakSection, TweakRadio,
  LogoBoard, PaletteBoard, TypeBoard, ComponentsBoard,
  HomeV1Mobile, HomeV1Desktop,
  ListingDesktop, ListingMobile,
  VehicleV1Mobile, VehicleV1Desktop,
  LoginMobile, LoginDesktop, UserDashboardMobile, UserDashboardDesktop,
  BookingsMobile, SavedMobile, ProfileDesktop,
  OnboardDesktop, OnboardMobile, RentalDashboardDesktop, RentalDashboardMobile,
  VehiclesListDesktop, AddVehicleDesktop, AddVehicleMobile,
  H, Txt, Logo, Button, Badge, Icon,
} = window;

const MW = 390, MH = 800;
const DW = 1280, DH = 800;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "giallo"
}/*EDITMODE-END*/;

function buildTheme(tweaks) {
  const base = { ...ThemeA };
  if (tweaks.accent === 'corallo') {
    base.accent = ThemeA.coral;
    base.accentSoft = ThemeA.coralSoft;
    base.accentDeep = '#A8311A';
  } else if (tweaks.accent === 'verde') {
    base.accent = ThemeA.green;
    base.accentSoft = ThemeA.greenSoft;
    base.accentDeep = '#155F3F';
  }
  return base;
}

function IntroCard({ T }) {
  return (
    <div style={{ background: T.bg, height: '100%', padding: 40, boxSizing: 'border-box', fontFamily: T.fontBody, color: T.ink1, position: 'relative', overflow: 'hidden' }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>Sviluppo grafico</Txt>
      <H T={T} size="display" style={{ marginTop: 10, lineHeight: 0.95 }}>
        noleggio.it<br/>
        <span style={{ background: T.accent, padding: '0 12px', borderRadius: 10 }}>Direzione A</span>
      </H>
      <Txt T={T} size={16} color={T.ink2} style={{ display: 'block', marginTop: 18, maxWidth: 460, lineHeight: 1.55 }}>
        Bricolage Grotesque + Inter su ivory. Accento giallo, corallo o verde — cambialo dal pannello Tweaks.
      </Txt>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Txt T={T} size={11} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>In questo file</Txt>
        {[
          ['00', 'Sistema — logo, palette, tipo, componenti'],
          ['01', 'Frontend pubblico — home, listing, scheda veicolo'],
          ['02', 'Area utente — login, dashboard, prenotazioni, salvati, profilo'],
          ['03', 'Area noleggiatore — onboarding, dashboard, veicoli, add'],
        ].map(([n, t]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <Txt T={T} size={11} mono color={T.ink3} style={{ width: 24, flex: 'none' }}>{n}</Txt>
            <Txt T={T} size={14}>{t}</Txt>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 36, left: 40, right: 40, padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Icon name="sparkle" size={16} color={T.accentDeep} T={T} />
        <Txt T={T} size={12} color={T.ink2} style={{ flex: 1, lineHeight: 1.5 }}>
          <strong>Suggerimento:</strong> apri un artboard a tutto schermo (click sul nome) e usa ←/→ per navigare nella sezione, ↑/↓ tra sezioni.
        </Txt>
      </div>
    </div>
  );
}

function App() {
  const [tw, setT] = useTweaks(TWEAK_DEFAULTS);
  const T = React.useMemo(() => buildTheme(tw), [tw]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="intro" title="Sviluppo grafico" subtitle="Direzione A · noleggio.it">
          <DCArtboard id="intro" label="Panoramica" width={560} height={MH}>
            <IntroCard T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="logo" title="00.1 · Logo" subtitle="3 opzioni — clicca per espandere">
          <DCArtboard id="logo" label="3 proposte logo" width={DW} height={DH}>
            <LogoBoard T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="palette" title="00.2 · Palette" subtitle="3 accenti — usa Tweaks per testarli">
          <DCArtboard id="palette" label="Colori sistema" width={DW} height={DH}>
            <PaletteBoard T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="type" title="00.3 · Tipografia" subtitle="Display, body, mono">
          <DCArtboard id="type" label="Scale tipografiche" width={DW} height={DH}>
            <TypeBoard T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="components" title="00.4 · Componenti" subtitle="Sistema UI base">
          <DCArtboard id="components" label="Button, chip, input, badge" width={DW} height={DH}>
            <ComponentsBoard T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="home" title="01.1 · Home · ricerca" subtitle="Search bar dominante">
          <DCArtboard id="home-m" label="Mobile" width={MW} height={MH}>
            <HomeV1Mobile T={T} />
          </DCArtboard>
          <DCArtboard id="home-d" label="Desktop" width={DW} height={DH}>
            <HomeV1Desktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="listing-init" title="01.2 · Risultati · stato iniziale" subtitle="No ricerca = noleggiatori vicini a te">
          <DCArtboard id="list-init-m" label="Mobile" width={MW} height={MH}>
            <ListingMobile T={T} state="initial" />
          </DCArtboard>
          <DCArtboard id="list-init-d" label="Desktop" width={DW} height={DH}>
            <ListingDesktop T={T} state="initial" />
          </DCArtboard>
        </DCSection>

        <DCSection id="listing-split" title="01.3 · Risultati · split mappa+lista (V2)" subtitle="Default dopo la ricerca">
          <DCArtboard id="list-split-m" label="Mobile" width={MW} height={MH}>
            <ListingMobile T={T} state="split" />
          </DCArtboard>
          <DCArtboard id="list-split-d" label="Desktop" width={DW} height={DH}>
            <ListingDesktop T={T} state="split" />
          </DCArtboard>
        </DCSection>

        <DCSection id="listing-list" title="01.4 · Risultati · vista lista (V1)" subtitle="Toggle da V2 — sidebar filtri su desktop">
          <DCArtboard id="list-list-m" label="Mobile" width={MW} height={MH}>
            <ListingMobile T={T} state="list" />
          </DCArtboard>
          <DCArtboard id="list-list-d" label="Desktop" width={DW} height={DH}>
            <ListingDesktop T={T} state="list" />
          </DCArtboard>
        </DCSection>

        <DCSection id="vehicle" title="01.5 · Scheda veicolo" subtitle="Galleria + sticky CTA mobile / sidebar prezzo desktop">
          <DCArtboard id="veh-m" label="Mobile" width={MW} height={MH}>
            <VehicleV1Mobile T={T} />
          </DCArtboard>
          <DCArtboard id="veh-d" label="Desktop" width={DW} height={1600}>
            <VehicleV1Desktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="login" title="02.1 · Login & registrazione" subtitle="Accesso utente">
          <DCArtboard id="login-m" label="Login — Mobile" width={MW} height={MH}>
            <LoginMobile T={T} />
          </DCArtboard>
          <DCArtboard id="login-d" label="Login — Desktop (split hero)" width={DW} height={DH}>
            <LoginDesktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="userdash" title="02.2 · Dashboard utente" subtitle="Panoramica delle prenotazioni">
          <DCArtboard id="userdash-m" label="Mobile" width={MW} height={MH}>
            <UserDashboardMobile T={T} />
          </DCArtboard>
          <DCArtboard id="userdash-d" label="Desktop" width={DW} height={DH}>
            <UserDashboardDesktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="userbook" title="02.3 · Prenotazioni & Salvati" subtitle="Mobile — viste secondarie">
          <DCArtboard id="bookings-m" label="Prenotazioni — Mobile" width={MW} height={MH}>
            <BookingsMobile T={T} />
          </DCArtboard>
          <DCArtboard id="saved-m" label="Salvati — Mobile" width={MW} height={MH}>
            <SavedMobile T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="userprofile" title="02.4 · Profilo" subtitle="Gestione dati personali + patente">
          <DCArtboard id="profile-d" label="Profilo — Desktop" width={DW} height={DH}>
            <ProfileDesktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="onboard" title="03.1 · Onboarding noleggiatore" subtitle="Wizard 5 step">
          <DCArtboard id="onb-m" label="Step 2 · Mobile" width={MW} height={MH}>
            <OnboardMobile T={T} />
          </DCArtboard>
          <DCArtboard id="onb-d" label="Step 2 · Desktop con rail" width={DW} height={DH}>
            <OnboardDesktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="rentaldash" title="03.2 · Dashboard noleggiatore" subtitle="Stats, richieste, ritiri">
          <DCArtboard id="rent-m" label="Mobile" width={MW} height={MH}>
            <RentalDashboardMobile T={T} />
          </DCArtboard>
          <DCArtboard id="rent-d" label="Desktop" width={DW} height={DH}>
            <RentalDashboardDesktop T={T} />
          </DCArtboard>
        </DCSection>

        <DCSection id="rentalveh" title="03.3 · Gestione veicoli" subtitle="Lista + nuovo veicolo">
          <DCArtboard id="rvlist-d" label="Lista veicoli — Desktop" width={DW} height={DH}>
            <VehiclesListDesktop T={T} />
          </DCArtboard>
          <DCArtboard id="rvadd-d" label="Aggiungi veicolo — Desktop" width={DW} height={920}>
            <AddVehicleDesktop T={T} />
          </DCArtboard>
          <DCArtboard id="rvadd-m" label="Aggiungi veicolo · step Foto — Mobile" width={MW} height={MH}>
            <AddVehicleMobile T={T} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent color" />
        <TweakRadio
          label="Variante"
          value={tw.accent}
          options={[
            { value: 'giallo', label: 'Giallo' },
            { value: 'corallo', label: 'Corallo' },
            { value: 'verde', label: 'Verde' },
          ]}
          onChange={(v) => setT('accent', v)}
        />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
