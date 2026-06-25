import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../state/AuthContext.jsx';
import { HostSidebar, HostMobileMenu } from '../../components/HostSidebar.jsx';
import { HostSubscriptionBanner } from '../../components/HostSubscriptionBanner.jsx';
import { HostKYCBanner } from '../../components/HostKYCBanner.jsx';
import { Button, H, Txt } from '../../components/ui.jsx';
import { Icon } from '../../components/icons.jsx';
import { getMyHost, createHostForUser } from '../../services/cars.js';
import { useToast } from '../../state/ToastContext.jsx';

function Onboard({ T, onCreated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.email?.split('@')[0] || '');
  const [city, setCity] = useState('Milano');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const host = await createHostForUser(user.id, { name: name.trim(), city: city.trim() || 'Milano' });
      toast.success('Account noleggiatore creato!');
      onCreated(host);
    } catch (err) {
      toast.error(err.message || 'Errore creazione account noleggiatore');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: T.bg }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 72, height: 72, borderRadius: '50%', background: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="car" size={32} color={T.ink1} T={T} />
        </span>
        <H T={T} size="h2">Diventa noleggiatore</H>
        <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.55, maxWidth: 380 }}>
          Inizia a noleggiare le tue auto sulla piattaforma. Imposta termini, modalità di pagamento e veicoli dal tuo backoffice dedicato.
        </Txt>
        <form onSubmit={submit} style={{ marginTop: 14, width: '100%', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Nome attività</Txt>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Es. AutoLuca, Rossi Rent"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md,
                fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 18 }}>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Città principale</Txt>
            <input
              required value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="Milano"
              style={{
                width: '100%', boxSizing: 'border-box', padding: '11px 14px',
                background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md,
                fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
              }}
            />
          </label>
          <Button T={T} variant="accent" size="lg" full iconRight="arrowRight" disabled={busy}>
            {busy ? 'Creazione…' : 'Crea account noleggiatore'}
          </Button>
        </form>
        <Txt T={T} size={11} color={T.ink3} style={{ marginTop: 8, lineHeight: 1.5, maxWidth: 380 }}>
          Potrai personalizzare i dettagli e aggiungere auto subito dopo.
        </Txt>
      </div>
    </div>
  );
}

function HostAccessDenied({ T, reason }) {
  const { openAuthModal, signOut } = useAuth();
  const isWrongRole = reason === 'wrong-role';
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: T.bg }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 72, height: 72, borderRadius: '50%', background: T.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="user" size={32} color={T.ink2} T={T} />
        </span>
        <H T={T} size="h2">Area noleggiatori</H>
        <Txt T={T} size={14} color={T.ink2} style={{ lineHeight: 1.55, maxWidth: 380 }}>
          {isWrongRole
            ? 'Sei loggato con un account cliente. Per accedere al backoffice noleggiatore esci e usa un account host (email diversa).'
            : 'Per gestire la tua flotta noleggio devi accedere con un account noleggiatore.'}
        </Txt>
        {isWrongRole ? (
          <Button T={T} variant="accent" size="lg" onClick={signOut}>
            Esci e cambia account
          </Button>
        ) : (
          <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={() => openAuthModal('host')}>
            Accedi come noleggiatore
          </Button>
        )}
      </div>
    </div>
  );
}

export function HostLayout({ T, isDesktop }) {
  const { user, isAuthed, isHost, loading: authLoading } = useAuth();
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthed || !user || !isHost) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    getMyHost(user.id)
      .then(h => { if (!cancelled) setHost(h); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthed, isHost, user?.id]);

  if (authLoading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}><Txt T={T} size={13} color={T.ink3}>Caricamento…</Txt></div>;
  }
  if (!isAuthed) return <HostAccessDenied T={T} reason="not-authed" />;
  if (!isHost) return <HostAccessDenied T={T} reason="wrong-role" />;
  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg }}><Txt T={T} size={13} color={T.ink3}>Caricamento backoffice…</Txt></div>;
  if (!host) return <Onboard T={T} onCreated={setHost} />;

  if (!isDesktop) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
        <div style={{ flex: 'none', padding: '12px 14px', borderBottom: `1px solid ${T.line}`, background: T.ink1, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Apri menu" style={{
            border: 'none', background: 'rgba(255,255,255,0.12)', borderRadius: 10,
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flex: 'none',
          }}>
            <Icon name="menu" size={20} color="#fff" T={T} />
          </button>
          <div style={{ minWidth: 0 }}>
            <Txt T={T} size={11} weight={600} color="rgba(255,255,255,0.6)" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Noleggiatore</Txt>
            <H T={T} size="h3" style={{ color: '#fff', lineHeight: 1, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host.n}</H>
          </div>
        </div>
        <HostKYCBanner T={T} host={host} />
        <HostSubscriptionBanner T={T} host={host} />
        <Outlet context={{ host, setHost, isDesktop }} />
        <HostMobileMenu T={T} host={host} open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 60px)' }}>
      <HostSidebar T={T} host={host} />
      <div style={{ background: T.bg, overflow: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <HostKYCBanner T={T} host={host} />
        <HostSubscriptionBanner T={T} host={host} />
        <Outlet context={{ host, setHost, isDesktop }} />
      </div>
    </div>
  );
}
