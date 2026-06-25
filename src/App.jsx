import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './state/AuthContext.jsx';
import { useSessionTracking } from './hooks/useSessionTracking.js';
import { page as trackPage } from './lib/analytics.js';
import { T } from './theme/tokens.js';
import { TabBar } from './components/TabBar.jsx';
import { NavBar } from './components/NavBar.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { useViewport } from './hooks/useViewport.js';
import { Home } from './routes/Home.jsx';
import { LocationPicker } from './routes/LocationPicker.jsx';
import { DatePicker } from './routes/DatePicker.jsx';
import { Listing } from './routes/Listing.jsx';
import { Vehicle } from './routes/Vehicle.jsx';
import { Booking } from './routes/Booking.jsx';
import { Confirmation } from './routes/Confirmation.jsx';
import { Saved } from './routes/Saved.jsx';
import { Profile } from './routes/Profile.jsx';
import { Bookings } from './routes/Bookings.jsx';
import { BookingDetail } from './routes/BookingDetail.jsx';
import { ResetPassword } from './routes/ResetPassword.jsx';
import { Help } from './routes/Help.jsx';
import { NotFound } from './routes/NotFound.jsx';
import { SeoLanding } from './routes/SeoLanding.jsx';
import { HostLeadLanding } from './routes/HostLeadLanding.jsx';
import { BlogList } from './routes/Blog/BlogList.jsx';
import { BlogPost } from './routes/Blog/BlogPost.jsx';
import { StaticPage } from './routes/StaticPage.jsx';
import { Footer } from './components/Footer.jsx';
import { Toaster } from './components/Toaster.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { CookieBanner } from './components/CookieBanner.jsx';
import { SkeletonStyles } from './components/Skeleton.jsx';
import { Txt, H, Button } from './components/ui.jsx';
import { Icon } from './components/icons.jsx';

// Host backoffice: caricato solo quando l'utente entra in /noleggia
const HostLayout      = lazy(() => import('./routes/host/HostLayout.jsx').then(m => ({ default: m.HostLayout })));
const HostDashboard   = lazy(() => import('./routes/host/HostDashboard.jsx').then(m => ({ default: m.HostDashboard })));
const HostProfile     = lazy(() => import('./routes/host/HostProfile.jsx').then(m => ({ default: m.HostProfile })));
const HostVehicles    = lazy(() => import('./routes/host/HostVehicles.jsx').then(m => ({ default: m.HostVehicles })));
const HostVehicleForm = lazy(() => import('./routes/host/HostVehicleForm.jsx').then(m => ({ default: m.HostVehicleForm })));
const HostRequests    = lazy(() => import('./routes/host/HostRequests.jsx').then(m => ({ default: m.HostRequests })));
const HostBookings    = lazy(() => import('./routes/host/HostBookings.jsx').then(m => ({ default: m.HostBookings })));
const HostStats       = lazy(() => import('./routes/host/HostStats.jsx').then(m => ({ default: m.HostStats })));
const HostPayments    = lazy(() => import('./routes/host/HostPayments.jsx').then(m => ({ default: m.HostPayments })));
const HostSubscription = lazy(() => import('./routes/host/HostSubscription.jsx').then(m => ({ default: m.HostSubscription })));
const HostKYC          = lazy(() => import('./routes/host/HostKYC.jsx').then(m => ({ default: m.HostKYC })));

// Admin panel: caricato solo quando si entra in /admin
const AdminLayout     = lazy(() => import('./routes/admin/AdminLayout.jsx').then(m => ({ default: m.AdminLayout })));
const AdminDashboard  = lazy(() => import('./routes/admin/AdminDashboard.jsx').then(m => ({ default: m.AdminDashboard })));
const AdminHosts      = lazy(() => import('./routes/admin/AdminHosts.jsx').then(m => ({ default: m.AdminHosts })));
const AdminCars       = lazy(() => import('./routes/admin/AdminCars.jsx').then(m => ({ default: m.AdminCars })));
const AdminBookings   = lazy(() => import('./routes/admin/AdminBookings.jsx').then(m => ({ default: m.AdminBookings })));
const AdminReports    = lazy(() => import('./routes/admin/AdminReports.jsx').then(m => ({ default: m.AdminReports })));
const AdminAudit      = lazy(() => import('./routes/admin/AdminAudit.jsx').then(m => ({ default: m.AdminAudit })));
const AdminImages     = lazy(() => import('./routes/admin/AdminImages.jsx').then(m => ({ default: m.AdminImages })));
const AdminCoupons    = lazy(() => import('./routes/admin/AdminCoupons.jsx').then(m => ({ default: m.AdminCoupons })));
const AdminKYC        = lazy(() => import('./routes/admin/AdminKYC.jsx').then(m => ({ default: m.AdminKYC })));
const AdminUsers      = lazy(() => import('./routes/admin/AdminUsers.jsx').then(m => ({ default: m.AdminUsers })));
const AdminSessions   = lazy(() => import('./routes/admin/AdminSessions.jsx').then(m => ({ default: m.AdminSessions })));
const AdminSearches   = lazy(() => import('./routes/admin/AdminSearches.jsx').then(m => ({ default: m.AdminSearches })));
const AdminLeads      = lazy(() => import('./routes/admin/AdminLeads.jsx').then(m => ({ default: m.AdminLeads })));
const AdminBlog       = lazy(() => import('./routes/admin/AdminBlog.jsx').then(m => ({ default: m.AdminBlog })));
const AdminAiSettings = lazy(() => import('./routes/admin/AdminAiSettings.jsx').then(m => ({ default: m.AdminAiSettings })));

const HIDE_TABBAR = [/^\/auto\//, /^\/prenota\//, /^\/conferma$/, /^\/cerca\/dove$/, /^\/cerca\/quando$/, /^\/noleggia/, /^\/admin/, /^\/benvenuti$/];
const HIDE_FOOTER = [/^\/auto\//, /^\/prenota\//, /^\/conferma$/, /^\/cerca/, /^\/noleggia/, /^\/admin/];
const HIDE_NAVBAR = [/^\/noleggia/, /^\/admin/];

function RouteFallback({ T, label = 'Caricamento…' }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Txt T={T} size={13} color={T.ink3}>{label}</Txt>
    </div>
  );
}

// Gate per route customer (prenotazioni, profilo cliente, salvati).
// Un noleggiatore loggato non ha un profilo cliente: invece di un redirect
// secco al backoffice (disorientante), mostra una schermata che spiega il
// contesto e offre la navigazione esplicita. Gli ospiti passano.
function CustomerOnly({ children }) {
  const { loading, isHost } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (isHost) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '48px 28px', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: T.surfaceAlt, border: `1px solid ${T.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="car" size={28} color={T.ink2} T={T} />
        </div>
        <H T={T} size="h3">Sei nel tuo account noleggiatore</H>
        <Txt T={T} size={14} color={T.ink2} style={{ maxWidth: 320 }}>
          Quest'area è riservata ai clienti. Con un account noleggiatore gestisci
          i tuoi veicoli e le prenotazioni ricevute dal tuo backoffice.
        </Txt>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 8 }}>
          <Button T={T} variant="accent" iconRight="arrowRight" onClick={() => navigate('/noleggia')}>
            Vai al backoffice
          </Button>
          <Button T={T} variant="secondary" onClick={() => navigate('/')}>
            Torna alla home
          </Button>
        </div>
      </div>
    );
  }
  return children;
}

export function App() {
  const { pathname, search } = useLocation();
  const { isDesktop } = useViewport();
  const { openAuthModal, isAuthed } = useAuth();
  useSessionTracking();

  // Deep-link campagne: ?accedi=noleggiatore o ?accedi=cliente apre la modal
  // di login pre-impostata sul ruolo corretto. Strippa il param dall'URL
  // dopo aver aperto, così un refresh non riapre la modal.
  useEffect(() => {
    const params = new URLSearchParams(search);
    const role = params.get('accedi');
    if (!role || isAuthed) return;
    if (role === 'noleggiatore' || role === 'host') openAuthModal('host');
    else if (role === 'cliente' || role === 'customer') openAuthModal('customer');
    else return;
    params.delete('accedi');
    const qs = params.toString();
    window.history.replaceState(null, '', pathname + (qs ? `?${qs}` : ''));
  }, [search, isAuthed, pathname]);
  const showTabBar = !isDesktop && !HIDE_TABBAR.some(re => re.test(pathname));
  const showFooter = !HIDE_FOOTER.some(re => re.test(pathname));
  const showNavBar = isDesktop && !HIDE_NAVBAR.some(re => re.test(pathname));

  // Track pageview on every route change (SPA).
  useEffect(() => {
    trackPage(pathname + search);
  }, [pathname, search]);

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      background: T.bg,
      color: T.ink1,
      fontFamily: T.fontBody,
      maxWidth: isDesktop ? '100%' : 560,
      margin: '0 auto',
      width: '100%',
      position: 'relative',
    }}>
      <SkeletonStyles T={T} />
      {showNavBar && <NavBar T={T} />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
        <ErrorBoundary T={T}>
        <Suspense fallback={<RouteFallback T={T} label="Caricamento backoffice…" />}>
        {/* Wrapper route. Con footer visibile: sticky-footer (cresce ma NON
            si comprime, flex-shrink:0) così il contenuto non viene schiacciato
            dal footer e `main` scrolla. Senza footer: fill-height (basis 0,
            shrink 1) per le pagine con scroll interno (es. /cerca, /auto). */}
        <div style={showFooter
          ? { flex: '1 0 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }
          : { flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<Home T={T} isDesktop={isDesktop} />} />
          <Route path="/cerca" element={<Listing T={T} isDesktop={isDesktop} />} />
          <Route path="/cerca/dove" element={<LocationPicker T={T} isDesktop={isDesktop} />} />
          <Route path="/cerca/quando" element={<DatePicker T={T} isDesktop={isDesktop} />} />
          <Route path="/auto/:id" element={<Vehicle T={T} isDesktop={isDesktop} />} />
          <Route path="/prenota/:id" element={<CustomerOnly><Booking T={T} isDesktop={isDesktop} /></CustomerOnly>} />
          <Route path="/conferma" element={<CustomerOnly><Confirmation T={T} isDesktop={isDesktop} /></CustomerOnly>} />
          <Route path="/salvati" element={<CustomerOnly><Saved T={T} isDesktop={isDesktop} /></CustomerOnly>} />
          <Route path="/prenotazioni" element={<CustomerOnly><Bookings T={T} /></CustomerOnly>} />
          <Route path="/prenotazioni/:id" element={<CustomerOnly><BookingDetail T={T} /></CustomerOnly>} />
          <Route path="/profilo" element={<CustomerOnly><Profile T={T} isDesktop={isDesktop} section="panoramica" /></CustomerOnly>} />
          <Route path="/profilo/dati" element={<CustomerOnly><Profile T={T} isDesktop={isDesktop} section="dati" /></CustomerOnly>} />
          <Route path="/profilo/messaggi" element={<CustomerOnly><Profile T={T} isDesktop={isDesktop} section="messaggi" /></CustomerOnly>} />
          <Route path="/profilo/notifiche" element={<CustomerOnly><Profile T={T} isDesktop={isDesktop} section="notifiche" /></CustomerOnly>} />
          <Route path="/profilo/impostazioni" element={<CustomerOnly><Profile T={T} isDesktop={isDesktop} section="impostazioni" /></CustomerOnly>} />
          <Route path="/aiuto" element={<Help T={T} />} />
          <Route path="/reset-password" element={<ResetPassword T={T} />} />
          <Route path="/manifesto" element={<StaticPage T={T} slug="manifesto" />} />
          <Route path="/come-funziona" element={<StaticPage T={T} slug="come-funziona" />} />
          <Route path="/per-noleggiatori" element={<StaticPage T={T} slug="per-noleggiatori" />} />
          <Route path="/sicurezza" element={<StaticPage T={T} slug="sicurezza" />} />
          <Route path="/contatti" element={<StaticPage T={T} slug="contatti" />} />
          <Route path="/privacy" element={<StaticPage T={T} slug="privacy" />} />
          <Route path="/termini" element={<StaticPage T={T} slug="termini" />} />
          <Route path="/cookie" element={<StaticPage T={T} slug="cookie" />} />
          {/* Landing SEO città /auto-noleggio-<città>: rotta generica /:seoCity
              perché RR v6 non matcha "auto-noleggio-:citta" (param parziale).
              SeoLanding estrae la città dal prefisso o mostra NotFound. */}
          <Route path="/:seoCity" element={<SeoLanding T={T} />} />
          <Route path="/benvenuti" element={<HostLeadLanding T={T} isDesktop={isDesktop} />} />
          <Route path="/blog" element={<BlogList T={T} isDesktop={isDesktop} />} />
          <Route path="/blog/:slug" element={<BlogPost T={T} isDesktop={isDesktop} />} />
          <Route path="/admin" element={<AdminLayout T={T} isDesktop={isDesktop} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="hosts" element={<AdminHosts />} />
            <Route path="veicoli" element={<AdminCars />} />
            <Route path="prenotazioni" element={<AdminBookings />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="immagini" element={<AdminImages />} />
            <Route path="coupon" element={<AdminCoupons T={T} />} />
            <Route path="kyc" element={<AdminKYC T={T} />} />
            <Route path="utenti" element={<AdminUsers />} />
            <Route path="sessioni" element={<AdminSessions />} />
            <Route path="ricerche" element={<AdminSearches />} />
            <Route path="lead" element={<AdminLeads />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="ai" element={<AdminAiSettings />} />
          </Route>
          <Route path="/noleggia" element={<HostLayout T={T} isDesktop={isDesktop} />}>
            <Route index element={<HostDashboard T={T} />} />
            <Route path="profilo" element={<HostProfile T={T} />} />
            <Route path="veicoli" element={<HostVehicles T={T} />} />
            <Route path="veicoli/nuovo" element={<HostVehicleForm T={T} mode="new" />} />
            <Route path="veicoli/:id" element={<HostVehicleForm T={T} mode="edit" />} />
            <Route path="prenotazioni" element={<HostBookings T={T} />} />
            <Route path="richieste" element={<HostRequests T={T} />} />
            <Route path="pagamenti" element={<HostPayments T={T} />} />
            <Route path="abbonamento" element={<HostSubscription T={T} />} />
            <Route path="verifica" element={<HostKYC T={T} />} />
            <Route path="statistiche" element={<HostStats T={T} />} />
          </Route>
          <Route path="*" element={<NotFound T={T} />} />
        </Routes>
        </div>
        </Suspense>
        </ErrorBoundary>
        {showFooter && <Footer T={T} isDesktop={isDesktop} />}
      </main>
      {showTabBar && <TabBar T={T} />}
      <AuthModal T={T} isDesktop={isDesktop} />
      <Toaster T={T} />
      <CookieBanner T={T} isDesktop={isDesktop} />
    </div>
  );
}
