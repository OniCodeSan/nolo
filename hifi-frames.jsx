// hifi-frames.jsx — Device frames (phone bezel, browser chrome)

const { Icon } = window;

// Mobile phone frame con statusbar + home indicator
function PhoneFrame({ T, children, width = 360, height }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: T.surfaceAlt,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, boxSizing: 'border-box',
    }}>
      <div style={{
        width, height: height || '100%',
        background: T.bg,
        borderRadius: 38,
        border: `1.5px solid ${T.ink1}`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: T.sh.deep,
      }}>
        {/* Status bar */}
        <div style={{
          height: 30, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 22px',
          fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.ink1,
          position: 'relative', zIndex: 5,
        }}>
          <span>9:41</span>
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 84, height: 22, background: T.ink1, borderRadius: 16,
          }} />
          <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="16" height="11" viewBox="0 0 16 11"><path d="M1 8h2v2H1zM5 6h2v4H5zM9 4h2v6H9zM13 2h2v8h-2z" fill={T.ink1}/></svg>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M7 9c2 0 3-1.5 3-3M4 9c-2 0-3-1.5-3-3M7 6c1 0 1.5-.5 1.5-1.5M7 6V9" stroke={T.ink1} strokeWidth="1.2" strokeLinecap="round"/></svg>
            <span style={{ display: 'inline-block', width: 22, height: 11, border: `1.3px solid ${T.ink1}`, borderRadius: 3, position: 'relative' }}>
              <span style={{ position: 'absolute', inset: 1.2, background: T.ink1, borderRadius: 1, width: '78%' }} />
              <span style={{ position: 'absolute', right: -3, top: 3, width: 2, height: 4, background: T.ink1, borderRadius: 1 }} />
            </span>
          </span>
        </div>
        {/* Screen content */}
        <div style={{ position: 'absolute', top: 30, bottom: 0, left: 0, right: 0, overflow: 'hidden' }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 4, background: T.ink1, borderRadius: 3, zIndex: 10,
        }} />
      </div>
    </div>
  );
}

// Browser frame
function BrowserFrame({ T, url, children }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: T.surfaceAlt,
      padding: 16, boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: T.bg,
        borderRadius: 10,
        border: `1px solid ${T.line}`,
        overflow: 'hidden',
        boxShadow: T.sh.raised,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          height: 36, display: 'flex', alignItems: 'center', gap: 14,
          padding: '0 14px', borderBottom: `1px solid ${T.line}`,
          background: T.surfaceAlt,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <span key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, maxWidth: 380, margin: '0 auto',
            height: 24, background: T.bg, borderRadius: 6,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 10px', fontFamily: T.fontBody, fontSize: 12, color: T.ink2,
            border: `1px solid ${T.line}`,
          }}>
            <Icon name="search" size={11} color={T.ink3} T={T} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{url || 'noleggio.it/'}</span>
          </div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Tab bar mobile (bottom nav)
function TabBar({ T, active = 'home' }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Esplora' },
    { id: 'search', icon: 'search', label: 'Cerca' },
    { id: 'fav', icon: 'heart', label: 'Salvati' },
    { id: 'book', icon: 'calendar', label: 'Prenot.' },
    { id: 'user', icon: 'user', label: 'Profilo' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 14,
      background: T.bg,
      borderTop: `1px solid ${T.line}`,
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 4px 14px',
      fontFamily: T.fontBody,
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: t.id === active ? T.ink1 : T.ink3 }}>
          <Icon name={t.icon} size={22} color="currentColor" T={T} />
          <span style={{ fontSize: 10, fontWeight: t.id === active ? 600 : 500, color: 'currentColor' }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { PhoneFrame, BrowserFrame, TabBar });
