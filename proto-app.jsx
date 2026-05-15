// proto-app.jsx — State machine + screen orchestrator

const { ThemeA, PhoneFrame, Icon, H, Txt, Button, Logo,
  HomeScreen, LocationPicker, DatePicker, ListingScreen,
  VehicleScreen, BookingScreen, ConfirmationScreen,
  TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakButton, TweakNumber,
} = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "giallo",
  "showFrame": true,
  "phoneSize": 390
}/*EDITMODE-END*/;

function buildTheme(tw) {
  const base = { ...ThemeA };
  if (tw.accent === 'corallo') {
    base.accent = ThemeA.coral;
    base.accentSoft = ThemeA.coralSoft;
    base.accentDeep = '#A8311A';
  } else if (tw.accent === 'verde') {
    base.accent = ThemeA.green;
    base.accentSoft = ThemeA.greenSoft;
    base.accentDeep = '#155F3F';
  }
  return base;
}

// Initial state of the prototype
function initialState() {
  return {
    screen: 'home',
    history: [],
    search: { location: null, from: null, to: null, category: null },
    filters: { priceMax: 100, fuels: new Set(), transmission: 'all' },
    saved: new Set(),
    vehicleId: null,
    booking: null,
  };
}

function App() {
  const [tw, setTw] = useTweaks(TWEAK_DEFAULTS);
  const T = React.useMemo(() => buildTheme(tw), [tw.accent]);
  const [state, setState] = React.useState(() => initialState());

  // navigation: push to history, or pop with 'back', or replace screen
  const nav = React.useCallback((target) => {
    setState(s => {
      if (target === 'back') {
        if (s.history.length === 0) return { ...s, screen: 'home' };
        const prev = s.history[s.history.length - 1];
        return { ...s, screen: prev, history: s.history.slice(0, -1) };
      }
      if (target === s.screen) return s;
      return { ...s, screen: target, history: [...s.history, s.screen] };
    });
  }, []);

  // mutate state partially
  const set = React.useCallback((patch) => {
    setState(s => ({ ...s, ...patch }));
  }, []);

  const reset = () => setState(initialState());

  // Screen routing
  const screens = {
    home: HomeScreen,
    searchLocation: LocationPicker,
    searchDate: DatePicker,
    listing: ListingScreen,
    vehicle: VehicleScreen,
    booking: BookingScreen,
    confirmation: ConfirmationScreen,
  };
  const Screen = screens[state.screen] || HomeScreen;

  // Phone frame or fullscreen
  const content = (
    <ScreenTransition screenKey={state.screen}>
      <Screen T={T} state={state} nav={nav} set={set} />
    </ScreenTransition>
  );

  return (
    <>
      <div style={{
        minHeight: '100vh', width: '100%',
        background: ThemeA.surfaceAlt,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', boxSizing: 'border-box',
        fontFamily: ThemeA.fontBody,
      }}>
        {tw.showFrame ? (
          <PhoneFrame T={T} width={tw.phoneSize} height={800}>{content}</PhoneFrame>
        ) : (
          <div style={{
            width: tw.phoneSize, height: 800, background: T.bg,
            borderRadius: 12, overflow: 'hidden',
            boxShadow: T.sh.deep,
          }}>
            {content}
          </div>
        )}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema" />
        <TweakRadio label="Accent" value={tw.accent}
          options={[
            { value: 'giallo', label: 'Giallo' },
            { value: 'corallo', label: 'Corallo' },
            { value: 'verde', label: 'Verde' },
          ]}
          onChange={(v) => setTw('accent', v)} />

        <TweakSection label="Visualizzazione" />
        <TweakToggle label="Cornice telefono" value={tw.showFrame}
          onChange={(v) => setTw('showFrame', v)} />
        <TweakRadio label="Dimensione" value={tw.phoneSize}
          options={[
            { value: 360, label: '360' },
            { value: 390, label: '390' },
            { value: 420, label: '420' },
          ]}
          onChange={(v) => setTw('phoneSize', v)} />

        <TweakSection label="Stato prototipo" />
        <TweakButton label="Reset al primo schermo" onClick={reset} />
        <TweakButton label='Salta a "Risultati"' onClick={() => {
          setState(s => ({
            ...s,
            screen: 'listing',
            history: ['home'],
            search: { location: 'Milano Centrale', from: { d: 18, m: 5 }, to: { d: 22, m: 5 }, category: null },
          }));
        }} />
        <TweakButton label='Salta a "Scheda Polo"' onClick={() => {
          setState(s => ({
            ...s,
            screen: 'vehicle',
            history: ['home', 'listing'],
            search: { location: 'Milano Centrale', from: { d: 18, m: 5 }, to: { d: 22, m: 5 }, category: null },
            vehicleId: 'polo',
          }));
        }} />
      </TweaksPanel>

      <Breadcrumb T={T} state={state} />
    </>
  );
}

// Cross-fade between screens
function ScreenTransition({ screenKey, children }) {
  const [shown, setShown] = React.useState(screenKey);
  const [opacity, setOpacity] = React.useState(1);
  React.useEffect(() => {
    if (screenKey !== shown) {
      setOpacity(0);
      const t = setTimeout(() => {
        setShown(screenKey);
        setOpacity(1);
      }, 160);
      return () => clearTimeout(t);
    }
  }, [screenKey, shown]);
  return (
    <div style={{ height: '100%', opacity, transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {children}
    </div>
  );
}

// Floating breadcrumb showing the user's path (helper for review)
function Breadcrumb({ T, state }) {
  const labels = {
    home: 'Home',
    searchLocation: 'Dove',
    searchDate: 'Quando',
    listing: 'Risultati',
    vehicle: 'Scheda veicolo',
    booking: 'Prenotazione',
    confirmation: 'Conferma',
  };
  return (
    <div style={{
      position: 'fixed', top: 16, left: 16, zIndex: 50,
      padding: '6px 12px', background: 'rgba(20,15,5,0.85)', color: '#fff',
      fontFamily: ThemeA.fontMono, fontSize: 11, fontWeight: 500,
      borderRadius: 999, letterSpacing: '0.02em',
      backdropFilter: 'blur(8px)',
    }}>
      {[...state.history, state.screen].map((s, i, a) => (
        <React.Fragment key={i}>
          <span style={{ opacity: i === a.length - 1 ? 1 : 0.55 }}>{labels[s] || s}</span>
          {i < a.length - 1 && <span style={{ opacity: 0.4, margin: '0 6px' }}>›</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
