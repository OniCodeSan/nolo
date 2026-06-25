import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';

export function Button({ T, variant = 'primary', size = 'md', icon, iconRight, children, full, style = {}, ...rest }) {
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
    palette = { background: T.ink1, color: '#fff' };
  } else if (variant === 'accent') {
    palette = { background: T.accent, color: T.ink1 };
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

export function Card({ T, children, padding = 16, style = {}, onClick, ...rest }) {
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

export function Chip({ T, children, active, icon, onClose, style = {}, size = 'md' }) {
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

export function Input({ T, label, value, placeholder, icon, suffix, style = {}, size = 'md' }) {
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

export function Price({ T, value, unit = '/giorno', size = 'md', color, weight = 600 }) {
  const big = size === 'xl' ? 36 : size === 'lg' ? 24 : size === 'md' ? 18 : 15;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, color: color || T.ink1, fontFamily: T.fontBody }}>
      <span style={{ fontSize: big, fontWeight: weight, letterSpacing: '-0.02em' }}>{value}€</span>
      {unit && <span style={{ fontSize: Math.max(10, big * 0.4), color: T.ink2, fontWeight: 400 }}>{unit}</span>}
    </span>
  );
}

export function Rating({ T, value = 4.8, count, size = 13, color, newLabel }) {
  const { t } = useTranslation();
  // Host/auto senza recensioni: rating 0 o nullo. Mostrare "0 (0)" trasmette
  // sfiducia — meglio segnalare che è nuovo.
  const hasRating = value != null && Number(value) > 0;
  if (!hasRating) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: T.fontBody, fontSize: size, color: T.ink3 }}>
        <Icon name="sparkle" size={size} color={T.ink3} T={T} />
        {newLabel || t('common.new')}
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: T.fontBody, fontSize: size, color: color || T.ink1 }}>
      <Icon name="starFill" size={size + 1} color={T.name === 'Casa' ? T.accent : T.ink1} T={T} />
      <span style={{ fontWeight: 600 }}>{value}</span>
      {count != null && count > 0 && <span style={{ color: T.ink3 }}>({count})</span>}
    </span>
  );
}

export function Badge({ T, children, tone = 'neutral', icon, style = {} }) {
  const map = {
    neutral: { bg: T.surfaceAlt, fg: T.ink1, bd: T.line },
    success: { bg: T.greenSoft, fg: T.ok, bd: 'transparent' },
    accent:  { bg: T.accentSoft, fg: T.ink1, bd: 'transparent' },
    alert:   { bg: T.coralSoft, fg: T.alert, bd: 'transparent' },
    dark:    { bg: T.ink1, fg: '#fff', bd: T.ink1 },
  };
  const c = map[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      borderRadius: T.r.pill, whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <Icon name={icon} size={11} T={T} color="currentColor" />}
      {children}
    </span>
  );
}

export function Avatar({ T, name = 'A', size = 36, tone }) {
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

export function H({ T, size = 'h2', children, style = {}, weight, color }) {
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

// Tab-pill horizontal nav usato in HostRequests + tutto l'AdminPanel.
// tabs: [{ id, l, count? }], value: id attivo, onChange(id)
export function TabPills({ T, tabs, value, onChange, style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', ...style }}>
      {tabs.map(t => {
        const active = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap',
            background: active ? T.ink1 : T.surface,
            color: active ? '#fff' : T.ink1,
            borderRadius: 999,
            fontFamily: T.fontBody, fontSize: 13,
            fontWeight: active ? 600 : 500,
            border: `1px solid ${active ? T.ink1 : T.line}`,
          }}>
            {t.l}{t.count != null && <span style={{ marginLeft: 6, opacity: 0.7 }}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Txt({ T, size = 14, weight = 400, color, mono, style = {}, children, ...rest }) {
  return (
    <span style={{
      fontFamily: mono ? T.fontMono : T.fontBody,
      fontSize: size, fontWeight: weight, lineHeight: 1.45,
      color: color || T.ink1, ...style,
    }} {...rest}>{children}</span>
  );
}

export function Logo({ T, size = 22, subline }) {
  const mark = size * 1.05;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: mark, height: mark, position: 'relative', display: 'inline-block' }}>
        <svg width={mark} height={mark} viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="31" fill={T.accent} />
          <g stroke={T.ink1} strokeWidth="3.4" strokeLinecap="round" opacity="0.5">
            <line x1="11" y1="24" x2="20" y2="24" />
            <line x1="9"  y1="32" x2="20" y2="32" />
            <line x1="11" y1="40" x2="20" y2="40" />
          </g>
          <circle cx="38" cy="32" r="12.5" fill="none" stroke={T.ink1} strokeWidth="6.2" />
          <line x1="41" y1="35" x2="50" y2="44" stroke={T.ink1} strokeWidth="6.2" strokeLinecap="round" />
        </svg>
      </span>
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Montserrat', system-ui, sans-serif",
          fontSize: size,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: T.ink1,
        }}>
          Movi<span style={{ color: T.accent }}>Q</span>
        </span>
        {subline && <span style={{ fontFamily: T.fontBody, fontSize: size * 0.4, color: T.ink2, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{subline}</span>}
      </span>
    </span>
  );
}
