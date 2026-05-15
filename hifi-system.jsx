// hifi-system.jsx — UI primitives che si adattano al theme

const { Icon, CarRender } = window;

// ─────────────────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────────────────
function Button({ T, variant = 'primary', size = 'md', icon, iconRight, children, full, style = {}, ...rest }) {
  const pad = size === 'sm' ? '8px 14px' : size === 'lg' ? '14px 24px' : '11px 18px';
  const fs = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  const radius = T.name === 'Casa' ? T.r.pill : T.r.md;
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: pad, fontFamily: T.fontBody, fontSize: fs, fontWeight: 600,
    borderRadius: radius, cursor: 'pointer',
    border: '1px solid transparent', whiteSpace: 'nowrap',
    width: full ? '100%' : undefined,
    letterSpacing: T.name === 'Lustro' ? '0.02em' : '-0.01em',
    transition: 'background 120ms, transform 120ms',
  };
  let palette;
  if (variant === 'primary') {
    palette = T.name === 'Casa'
      ? { background: T.ink1, color: '#fff' }
      : { background: T.ink1, color: '#fff' };
  } else if (variant === 'accent') {
    palette = T.name === 'Casa'
      ? { background: T.accent, color: T.ink1 }
      : { background: T.accent, color: '#fff' };
  } else if (variant === 'secondary') {
    palette = { background: T.surfaceAlt, color: T.ink1, borderColor: T.line };
  } else if (variant === 'outline') {
    palette = { background: 'transparent', color: T.ink1, borderColor: T.lineStrong };
  } else if (variant === 'ghost') {
    palette = { background: 'transparent', color: T.ink1 };
  }
  return (
    <button style={{ ...base, ...palette, ...style }} {...rest}>
      {icon && <Icon name={icon} size={fs + 2} T={T} />}
      {children}
      {iconRight && <Icon name={iconRight} size={fs + 2} T={T} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// CARD — surface base
// ─────────────────────────────────────────────────────────
function Card({ T, children, padding = 16, hover, style = {}, onClick, ...rest }) {
  return (
    <div onClick={onClick}
      style={{
        background: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.r.lg,
        padding,
        boxShadow: T.sh.soft,
        ...style,
      }} {...rest}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CHIP — pill / tag
// ─────────────────────────────────────────────────────────
function Chip({ T, children, active, icon, onClose, style = {}, size = 'md' }) {
  const pad = size === 'sm' ? '3px 9px' : '5px 12px';
  const fs = size === 'sm' ? 11 : 13;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, fontFamily: T.fontBody, fontSize: fs, fontWeight: 500,
      background: active ? T.ink1 : T.surface,
      color: active ? '#fff' : T.ink1,
      border: `1px solid ${active ? T.ink1 : T.line}`,
      borderRadius: T.r.pill, whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <Icon name={icon} size={fs + 1} T={T} />}
      {children}
      {onClose && <Icon name="x" size={fs} T={T} />}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// INPUT — campo display (non realmente interattivo)
// ─────────────────────────────────────────────────────────
function Input({ T, label, value, placeholder, icon, suffix, style = {}, size = 'md', readOnly = true }) {
  const pad = size === 'sm' ? '8px 10px' : size === 'lg' ? '14px 14px' : '11px 12px';
  const fs = size === 'sm' ? 13 : 14;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && <span style={{ fontFamily: T.fontBody, fontSize: 11, fontWeight: 500, color: T.ink2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: pad,
        background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.sm,
      }}>
        {icon && <Icon name={icon} size={16} color={T.ink2} T={T} />}
        <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: fs, color: value ? T.ink1 : T.ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        {suffix && (typeof suffix === 'string'
          ? <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink3 }}>{suffix}</span>
          : suffix)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PRICE — visualizzazione prezzo coerente
// ─────────────────────────────────────────────────────────
function Price({ T, value, unit = '/giorno', size = 'md', color, weight = 600 }) {
  const big = size === 'xl' ? 36 : size === 'lg' ? 24 : size === 'md' ? 18 : 15;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, color: color || T.ink1, fontFamily: T.fontBody }}>
      <span style={{ fontSize: big, fontWeight: weight, letterSpacing: '-0.02em' }}>{value}€</span>
      {unit && <span style={{ fontSize: Math.max(10, big * 0.4), color: T.ink2, fontWeight: 400 }}>{unit}</span>}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// RATING — stelle
// ─────────────────────────────────────────────────────────
function Rating({ T, value = 4.8, count, size = 13, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: T.fontBody, fontSize: size, color: color || T.ink1 }}>
      <Icon name="starFill" size={size + 1} color={T.name === 'Casa' ? T.accent : T.ink1} T={T} />
      <span style={{ fontWeight: 600 }}>{value}</span>
      {count != null && <span style={{ color: T.ink3 }}>({count})</span>}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// BADGE — etichette piccole
// ─────────────────────────────────────────────────────────
function Badge({ T, children, tone = 'neutral', icon, style = {} }) {
  const map = {
    neutral: { bg: T.surfaceAlt, fg: T.ink1, bd: T.line },
    success: { bg: T.name === 'Casa' ? T.greenSoft : '#DDEFE3', fg: T.ok, bd: 'transparent' },
    accent:  { bg: T.accentSoft, fg: T.name === 'Casa' ? T.ink1 : T.accentDeep, bd: 'transparent' },
    alert:   { bg: T.name === 'Casa' ? T.coralSoft : '#FBDDD2', fg: T.alert, bd: 'transparent' },
    dark:    { bg: T.ink1, fg: '#fff', bd: T.ink1 },
  };
  const c = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      borderRadius: T.r.pill, whiteSpace: 'nowrap',
      letterSpacing: T.name === 'Lustro' ? '0.04em' : '0',
      textTransform: T.name === 'Lustro' ? 'uppercase' : 'none',
      ...style,
    }}>
      {icon && <Icon name={icon} size={11} T={T} color="currentColor" />}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// AVATAR — iniziali in cerchio
// ─────────────────────────────────────────────────────────
function Avatar({ T, name = 'A', size = 36, tone }) {
  const bg = tone === 'accent' ? T.accent : tone === 'coral' ? (T.coral || T.accent) : T.surfaceAlt;
  const fg = tone === 'accent' ? T.ink1 : tone === 'coral' ? '#fff' : T.ink1;
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.fontDisplay, fontSize: size * 0.42, fontWeight: 600,
      border: `1px solid ${T.line}`,
    }}>{name[0]}</span>
  );
}

// ─────────────────────────────────────────────────────────
// HEADING — display
// ─────────────────────────────────────────────────────────
function H({ T, size = 'h2', children, style = {}, weight, color }) {
  const map = {
    display: { fs: 64, lh: 0.95, ls: '-0.04em', fw: 600 },
    h1: { fs: 44, lh: 1, ls: '-0.03em', fw: 600 },
    h2: { fs: 32, lh: 1.05, ls: '-0.02em', fw: 600 },
    h3: { fs: 22, lh: 1.15, ls: '-0.01em', fw: 600 },
    h4: { fs: 17, lh: 1.2, ls: '0', fw: 600 },
    h5: { fs: 14, lh: 1.3, ls: '0', fw: 600 },
  };
  const s = map[size] || map.h2;
  return (
    <span style={{
      fontFamily: T.fontDisplay, fontSize: s.fs, lineHeight: s.lh,
      letterSpacing: s.ls, fontWeight: weight ?? s.fw,
      color: color || T.ink1, display: 'block',
      ...style,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────
// TEXT — body
// ─────────────────────────────────────────────────────────
function Txt({ T, size = 14, weight = 400, color, mono, style = {}, children, ...rest }) {
  return (
    <span style={{
      fontFamily: mono ? T.fontMono : T.fontBody,
      fontSize: size, fontWeight: weight, lineHeight: 1.45,
      color: color || T.ink1, ...style,
    }} {...rest}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────
// LOGO — wordmark che varia per theme
// ─────────────────────────────────────────────────────────
function Logo({ T, size = 22, mark = 'auto', subline }) {
  // mark = 'auto' uses A: ring+car / B: serif wordmark only
  const isLustro = T.name === 'Lustro';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {!isLustro && (
        <span style={{ width: size * 1.05, height: size * 1.05, position: 'relative', display: 'inline-block' }}>
          <svg width={size * 1.05} height={size * 1.05} viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill={T.accent} stroke={T.ink1} strokeWidth="1.5" />
            <path d="M9 19l1-3.2c.3-.9 1.1-1.4 2-1.4h8c.9 0 1.7.5 2 1.4L23 19v3h-2v-1.5H11V22H9zM11.5 19h9l-.7-2.3c-.1-.4-.5-.7-1-.7h-5.6c-.5 0-.9.3-1 .7z" fill={T.ink1}/>
            <circle cx="12.5" cy="20" r="1.4" fill={T.ink1} />
            <circle cx="19.5" cy="20" r="1.4" fill={T.ink1} />
          </svg>
        </span>
      )}
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: T.fontDisplay,
          fontSize: size * (isLustro ? 1.2 : 1.0),
          fontWeight: isLustro ? 400 : 600,
          letterSpacing: isLustro ? '0' : '-0.03em',
          color: T.ink1,
          fontStyle: isLustro ? 'italic' : 'normal',
        }}>noleggio.it</span>
        {subline && <span style={{ fontFamily: T.fontBody, fontSize: size * 0.4, color: T.ink2, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{subline}</span>}
      </span>
    </span>
  );
}

Object.assign(window, {
  Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo,
});
