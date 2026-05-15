// Sketchy primitives — wireframe a mano libera
// Tutto è "ink on paper": linee leggermente storte, contorni morbidi,
// 1-2 accenti colore (giallo evidenziatore, rosso indicatore).
//
// Convenzioni:
//  - SkBox    rettangolo morbido (border-radius variabile)
//  - SkLine   linea singola (separatore / sketch text line)
//  - SkText   testo a mano (Kalam / Caveat)
//  - SkBtn    bottone sketchy (pill / rect)
//  - SkChip   pill piccola filtro/tag
//  - SkInput  campo input con placeholder
//  - SkImg    placeholder immagine (X attraversata)
//  - SkIcon   icona stilizzata (set base)
//  - Anno     post-it / annotazione (controllata via window.WIRE_SHOW_NOTES)
//  - Squiggle linea ondulata (separatore decorativo)

const INK = '#1a1814';
const INK_SOFT = '#5b574f';
const PAPER = '#fbf8f0';
const PAPER_2 = '#f4efe1';
const YELLOW = '#fde68a';
const YELLOW_DEEP = '#fbcf3a';
const RED = '#d6452f';
const BLUE = '#2f6fd6';
const GREEN = '#3a9b6a';

// Hand-drawn type stack
const HAND = '"Kalam", "Patrick Hand", "Comic Sans MS", cursive';
const DISPLAY = '"Caveat", "Patrick Hand", cursive';
const MONO = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// --- helpers --------------------------------------------------------------
const rand = (seed) => {
  // deterministic-ish jitter so reloads don't reshuffle everything
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return ((h >>> 0) % 1000) / 1000;
};
const wobble = (seed, amt = 1) => (rand(seed) - 0.5) * 2 * amt;

// Border-radius con angoli leggermente diversi per look "disegnato"
const sketchyRadius = (seed, base = 10) => {
  const r = (k) => Math.max(2, base + wobble(seed + k, 4));
  return `${r('a')}px ${r('b')}px ${r('c')}px ${r('d')}px / ${r('e')}px ${r('f')}px ${r('g')}px ${r('h')}px`;
};

// --- SkBox: rettangolo con bordo morbido ----------------------------------
function SkBox({ children, seed = 'x', style = {}, fill, stroke = INK, strokeWidth = 1.4, dashed, ...rest }) {
  const tilt = wobble(seed + 'tilt', 0.4);
  return (
    <div
      style={{
        position: 'relative',
        border: `${strokeWidth}px ${dashed ? 'dashed' : 'solid'} ${stroke}`,
        borderRadius: sketchyRadius(seed),
        background: fill || 'transparent',
        transform: `rotate(${tilt}deg)`,
        boxSizing: 'border-box',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// --- SkLine: linea orizzontale --------------------------------------------
function SkLine({ length = '100%', color = INK, thick = 1.4, style = {}, seed = 'l' }) {
  return (
    <svg
      width={typeof length === 'number' ? length : undefined}
      height="6"
      viewBox="0 0 200 6"
      preserveAspectRatio="none"
      style={{ width: length, height: 6, display: 'block', overflow: 'visible', ...style }}
    >
      <path
        d={`M 1 ${3 + wobble(seed + 'a', 1)} Q 50 ${3 + wobble(seed + 'b', 1.4)} 100 ${3 + wobble(seed + 'c', 0.8)} T 199 ${3 + wobble(seed + 'd', 1.2)}`}
        fill="none"
        stroke={color}
        strokeWidth={thick}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Squiggle: linea decorativa più marcata
function Squiggle({ width = 60, color = INK, style = {} }) {
  return (
    <svg width={width} height="10" viewBox="0 0 60 10" style={{ display: 'block', ...style }}>
      <path d="M 1 5 Q 7 1 13 5 T 25 5 T 37 5 T 49 5 T 59 5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// --- SkText: testo a mano -------------------------------------------------
function SkText({ children, size = 14, weight = 400, color = INK, font = HAND, style = {}, ...rest }) {
  return (
    <span style={{ fontFamily: font, fontSize: size, fontWeight: weight, color, lineHeight: 1.25, ...style }} {...rest}>
      {children}
    </span>
  );
}

// --- SkBtn: bottone -------------------------------------------------------
function SkBtn({ children, variant = 'solid', size = 'md', seed = 'b', style = {}, fill, full, ...rest }) {
  const pad = size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 22px' : '10px 18px';
  const fs = size === 'sm' ? 13 : size === 'lg' ? 18 : 15;
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: pad, fontFamily: HAND, fontSize: fs, fontWeight: 700,
    border: `1.5px solid ${INK}`, color: INK,
    borderRadius: sketchyRadius(seed, size === 'lg' ? 26 : 18),
    background: variant === 'solid' ? (fill || INK) : 'transparent',
    cursor: 'pointer', whiteSpace: 'nowrap',
    width: full ? '100%' : undefined,
    transform: `rotate(${wobble(seed + 'r', 0.3)}deg)`,
    ...style,
  };
  if (variant === 'solid') base.color = fill === YELLOW || fill === YELLOW_DEEP ? INK : '#fff';
  if (variant === 'ghost') { base.background = 'transparent'; base.color = INK; }
  if (variant === 'pill-yellow') { base.background = YELLOW; base.color = INK; }
  return <span style={base} {...rest}>{children}</span>;
}

// --- SkChip: piccola pill -------------------------------------------------
function SkChip({ children, active, seed = 'c', icon, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', fontFamily: HAND, fontSize: 12, fontWeight: 600,
      border: `1.3px solid ${INK}`, borderRadius: sketchyRadius(seed, 14),
      background: active ? YELLOW : 'transparent',
      color: INK, whiteSpace: 'nowrap',
      transform: `rotate(${wobble(seed, 0.6)}deg)`,
      ...style,
    }}>
      {icon}{children}
    </span>
  );
}

// --- SkInput: campo testo / select fittizio ------------------------------
function SkInput({ label, value, placeholder, icon, seed = 'i', style = {}, suffix, dense }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      {label && <SkText size={11} color={INK_SOFT} font={HAND} style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</SkText>}
      <SkBox seed={seed} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: dense ? '6px 10px' : '10px 12px', minHeight: dense ? 28 : 38, background: '#fff' }}>
        {icon && <span style={{ color: INK_SOFT, display: 'flex' }}>{icon}</span>}
        <SkText size={14} color={value ? INK : INK_SOFT} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </SkText>
        {suffix && <SkText size={12} color={INK_SOFT}>{suffix}</SkText>}
      </SkBox>
    </div>
  );
}

// --- SkImg: placeholder immagine ------------------------------------------
function SkImg({ ratio, height, width = '100%', label, seed = 'im', tone = 'gray', style = {} }) {
  const bg = tone === 'yellow' ? YELLOW : tone === 'red' ? '#f4d6cf' : tone === 'green' ? '#d6e7d4' : tone === 'blue' ? '#d6e0f0' : tone === 'paper' ? PAPER_2 : '#ebe6d6';
  return (
    <SkBox seed={seed} fill={bg} style={{ width, height, aspectRatio: ratio, position: 'relative', overflow: 'hidden', ...style }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 60" style={{ position: 'absolute', inset: 0 }}>
        <line x1="0" y1="0" x2="100" y2="60" stroke={INK_SOFT} strokeWidth="0.4" opacity="0.5" />
        <line x1="100" y1="0" x2="0" y2="60" stroke={INK_SOFT} strokeWidth="0.4" opacity="0.5" />
      </svg>
      {label && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SkText size={11} font={MONO} color={INK_SOFT} style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: 2 }}>
            {label}
          </SkText>
        </div>
      )}
    </SkBox>
  );
}

// Car illustration placeholder (silhouette molto semplice)
function SkCarPlaceholder({ width = '100%', height = 120, label = 'car photo', tone = 'gray', seed = 'car' }) {
  const bg = tone === 'yellow' ? YELLOW : tone === 'paper' ? PAPER_2 : '#ebe6d6';
  return (
    <SkBox seed={seed} fill={bg} style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
        {/* sketchy car silhouette */}
        <path
          d="M 25 70 Q 30 50 55 48 L 80 38 Q 100 32 130 35 L 155 50 Q 175 52 178 70 L 178 75 L 25 75 Z"
          fill="none" stroke={INK_SOFT} strokeWidth="1.4" strokeLinejoin="round"
        />
        <circle cx="60" cy="76" r="9" fill={PAPER} stroke={INK_SOFT} strokeWidth="1.4" />
        <circle cx="60" cy="76" r="4" fill="none" stroke={INK_SOFT} strokeWidth="1.2" />
        <circle cx="148" cy="76" r="9" fill={PAPER} stroke={INK_SOFT} strokeWidth="1.4" />
        <circle cx="148" cy="76" r="4" fill="none" stroke={INK_SOFT} strokeWidth="1.2" />
        <path d="M 70 48 L 88 40 L 120 40 L 138 50" fill="none" stroke={INK_SOFT} strokeWidth="1" />
        <line x1="105" y1="40" x2="105" y2="50" stroke={INK_SOFT} strokeWidth="1" />
      </svg>
      {label && (
        <SkText size={10} font={MONO} color={INK_SOFT} style={{ position: 'absolute', bottom: 4, right: 6, background: 'rgba(255,255,255,0.7)', padding: '1px 4px' }}>
          {label}
        </SkText>
      )}
    </SkBox>
  );
}

// --- SkIcon: micro icone disegnate ---------------------------------------
function SkIcon({ name, size = 18, color = INK, stroke = 1.4 }) {
  const p = { fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search: <><circle cx="9" cy="9" r="6" {...p} /><path d="M 13.5 13.5 L 18 18" {...p} /></>,
    pin: <><path d="M 10 18 C 10 18 4 12 4 8 A 6 6 0 0 1 16 8 C 16 12 10 18 10 18 Z" {...p} /><circle cx="10" cy="8" r="2.2" {...p} /></>,
    calendar: <><rect x="3" y="5" width="14" height="13" rx="1.5" {...p} /><path d="M 3 9 L 17 9 M 7 3 L 7 7 M 13 3 L 13 7" {...p} /></>,
    filter: <><path d="M 3 5 L 17 5 M 6 10 L 14 10 M 8 15 L 12 15" {...p} /></>,
    heart: <><path d="M 10 17 C 10 17 3 13 3 7.5 A 3.5 3.5 0 0 1 10 6 A 3.5 3.5 0 0 1 17 7.5 C 17 13 10 17 10 17 Z" {...p} /></>,
    star: <><path d="M 10 2 L 12.4 7.2 L 18 8 L 14 12 L 15 17.5 L 10 14.8 L 5 17.5 L 6 12 L 2 8 L 7.6 7.2 Z" {...p} /></>,
    user: <><circle cx="10" cy="7" r="3.5" {...p} /><path d="M 3 18 C 3 14 6 12 10 12 C 14 12 17 14 17 18" {...p} /></>,
    menu: <><path d="M 3 6 L 17 6 M 3 10 L 17 10 M 3 14 L 17 14" {...p} /></>,
    chevron: <><path d="M 7 4 L 13 10 L 7 16" {...p} /></>,
    chevronDown: <><path d="M 4 7 L 10 13 L 16 7" {...p} /></>,
    chevronLeft: <><path d="M 13 4 L 7 10 L 13 16" {...p} /></>,
    plus: <><path d="M 10 4 L 10 16 M 4 10 L 16 10" {...p} /></>,
    x: <><path d="M 5 5 L 15 15 M 15 5 L 5 15" {...p} /></>,
    check: <><path d="M 4 10 L 8 14 L 16 6" {...p} /></>,
    car: <><path d="M 3 13 L 4 9 Q 5 7 7 7 L 13 7 Q 15 7 16 9 L 17 13 M 3 13 L 17 13 L 17 16 L 14 16 L 14 14 M 3 13 L 3 16 L 6 16 L 6 14" {...p} /><circle cx="6.5" cy="13.5" r="1" {...p} /><circle cx="13.5" cy="13.5" r="1" {...p} /></>,
    fuel: <><path d="M 4 17 L 11 17 L 11 5 Q 11 4 10 4 L 5 4 Q 4 4 4 5 Z M 11 8 L 14 8 L 14 14 Q 14 15 15 15 Q 16 15 16 14 L 16 7 L 14 5" {...p} /></>,
    seat: <><path d="M 5 17 L 5 11 Q 5 9 7 9 L 11 9 Q 13 9 13 11 L 13 17 M 5 11 L 15 11 L 15 13 L 13 13 M 7 9 L 7 5 Q 7 4 8 4 L 10 4 Q 11 4 11 5 L 11 9" {...p} /></>,
    settings: <><circle cx="10" cy="10" r="2.5" {...p} /><path d="M 10 3 L 10 5 M 10 15 L 10 17 M 3 10 L 5 10 M 15 10 L 17 10 M 5.5 5.5 L 7 7 M 13 13 L 14.5 14.5 M 5.5 14.5 L 7 13 M 13 7 L 14.5 5.5" {...p} /></>,
    home: <><path d="M 3 9 L 10 3 L 17 9 L 17 17 L 12 17 L 12 12 L 8 12 L 8 17 L 3 17 Z" {...p} /></>,
    bell: <><path d="M 5 14 L 15 14 Q 14 13 14 11 L 14 9 A 4 4 0 0 0 6 9 L 6 11 Q 6 13 5 14 Z M 8.5 16 Q 10 18 11.5 16" {...p} /></>,
    chat: <><path d="M 3 5 L 17 5 L 17 14 L 11 14 L 7 17 L 7 14 L 3 14 Z" {...p} /></>,
    arrow: <><path d="M 3 10 L 17 10 M 12 5 L 17 10 L 12 15" {...p} /></>,
    upload: <><path d="M 10 3 L 10 13 M 5 8 L 10 3 L 15 8 M 3 16 L 17 16" {...p} /></>,
    eye: <><path d="M 1 10 Q 5 4 10 4 Q 15 4 19 10 Q 15 16 10 16 Q 5 16 1 10 Z" {...p} /><circle cx="10" cy="10" r="2.5" {...p} /></>,
    grid: <><rect x="3" y="3" width="6" height="6" {...p} /><rect x="11" y="3" width="6" height="6" {...p} /><rect x="3" y="11" width="6" height="6" {...p} /><rect x="11" y="11" width="6" height="6" {...p} /></>,
    list: <><circle cx="4" cy="5" r="1" {...p} /><circle cx="4" cy="10" r="1" {...p} /><circle cx="4" cy="15" r="1" {...p} /><path d="M 8 5 L 17 5 M 8 10 L 17 10 M 8 15 L 17 15" {...p} /></>,
    map: <><path d="M 3 4 L 8 6 L 13 4 L 17 6 L 17 16 L 13 14 L 8 16 L 3 14 Z M 8 6 L 8 16 M 13 4 L 13 14" {...p} /></>,
    transmission: <><circle cx="5" cy="5" r="2" {...p} /><circle cx="15" cy="5" r="2" {...p} /><circle cx="5" cy="15" r="2" {...p} /><path d="M 5 7 L 5 15 M 5 5 L 15 5 M 15 7 Q 15 10 10 10 Q 5 10 5 13" {...p} /></>,
    sliders: <><path d="M 3 6 L 17 6 M 3 14 L 17 14" {...p} /><circle cx="8" cy="6" r="2" {...p} fill={PAPER} /><circle cx="13" cy="14" r="2" {...p} fill={PAPER} /></>,
    euro: <><path d="M 14 5 Q 11 3 8 5 Q 5 7 5 10 Q 5 13 8 15 Q 11 17 14 15 M 3 8 L 11 8 M 3 12 L 11 12" {...p} /></>,
    phone: <><path d="M 4 4 L 8 4 L 9 8 L 7 9 Q 8 13 12 14 L 13 12 L 17 13 L 17 17 Q 10 17 6 13 Q 4 9 4 4 Z" {...p} /></>,
    share: <><circle cx="15" cy="5" r="2" {...p} /><circle cx="5" cy="10" r="2" {...p} /><circle cx="15" cy="15" r="2" {...p} /><path d="M 7 9 L 13 6 M 7 11 L 13 14" {...p} /></>,
    edit: <><path d="M 3 17 L 4 13 L 14 3 L 17 6 L 7 16 Z M 12 5 L 15 8" {...p} /></>,
    trash: <><path d="M 4 6 L 16 6 M 7 6 L 7 4 Q 7 3 8 3 L 12 3 Q 13 3 13 4 L 13 6 M 5 6 L 6 17 Q 6 18 7 18 L 13 18 Q 14 18 14 17 L 15 6" {...p} /></>,
    eyeOff: <><path d="M 3 3 L 17 17 M 6 6 Q 3 8 1 10 Q 5 16 10 16 Q 12 16 14 15 M 14 14 Q 17 12 19 10 Q 15 4 10 4 Q 8 4 6 5" {...p} /></>,
    google: <><circle cx="10" cy="10" r="7" {...p} /><path d="M 10 7 L 10 11 L 14 11" {...p} /></>,
    apple: <><path d="M 10 5 Q 10 3 12 3 M 6 8 Q 4 11 6 15 Q 8 18 10 16 Q 12 18 14 15 Q 16 11 14 8 Q 12 6 10 8 Q 8 6 6 8 Z" {...p} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flex: 'none' }}>
      {paths[name] || paths.x}
    </svg>
  );
}

// --- Anno: post-it / annotazione ----------------------------------------
function Anno({ children, top, left, right, bottom, width = 140, rotate, color = YELLOW, style = {} }) {
  if (typeof window !== 'undefined' && window.WIRE_SHOW_NOTES === false) return null;
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width, zIndex: 20,
      background: color, padding: '6px 10px',
      fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, lineHeight: 1.15, color: INK,
      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      transform: `rotate(${rotate !== undefined ? rotate : wobble(String(children).slice(0,6), 3)}deg)`,
      pointerEvents: 'none',
      ...style,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', opacity: 0.3 }}>
        <path d="M 0 28 Q 25 26 50 28 T 100 28" stroke={INK} strokeWidth="0.4" fill="none" />
      </svg>
      {children}
    </div>
  );
}

// Arrow annotation che punta a qualcosa
function AnnoArrow({ from, to, color = RED, style = {} }) {
  if (typeof window !== 'undefined' && window.WIRE_SHOW_NOTES === false) return null;
  const [x1, y1] = from;
  const [x2, y2] = to;
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 19, ...style }} width="100%" height="100%">
      <defs>
        <marker id="ar" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill={color} />
        </marker>
      </defs>
      <path d={`M ${x1} ${y1} Q ${(x1+x2)/2 + wobble('a',20)} ${(y1+y2)/2 + wobble('b',20)} ${x2} ${y2}`}
        stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="4 3" markerEnd="url(#ar)" />
    </svg>
  );
}

// --- Frame: device frame attorno a uno schermo ---------------------------
// Mobile: phone bezel hand-drawn
// Desktop: browser window con tab finto
function Frame({ kind = 'mobile', url, children, style = {} }) {
  if (kind === 'mobile') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: PAPER, padding: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style,
      }}>
        <div style={{
          width: 320, height: '100%', maxHeight: 660,
          border: `2px solid ${INK}`,
          borderRadius: '32px 30px 33px 31px / 34px 32px 31px 33px',
          background: '#fff',
          padding: '34px 12px 16px',
          position: 'relative',
          boxShadow: '4px 6px 0 rgba(0,0,0,0.08)',
        }}>
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 60, height: 8, border: `1.4px solid ${INK}`, borderRadius: 8,
          }} />
          <div style={{
            position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
            width: 90, height: 3, background: INK, borderRadius: 2,
          }} />
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
  // desktop browser
  return (
    <div style={{ width: '100%', height: '100%', background: PAPER, padding: 16, ...style }}>
      <SkBox seed="frame" fill="#fff" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '4px 6px 0 rgba(0,0,0,0.08)' }}>
        <div style={{
          borderBottom: `1.3px solid ${INK}`, padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8, background: PAPER,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.3px solid ${INK}` }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.3px solid ${INK}` }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: `1.3px solid ${INK}` }} />
          <SkBox seed="urlbar" style={{ flex: 1, padding: '4px 10px', marginLeft: 12, background: '#fff' }}>
            <SkText size={12} font={MONO} color={INK_SOFT}>{url || 'noleggio.it/'}</SkText>
          </SkBox>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>
      </SkBox>
    </div>
  );
}

// Status bar mobile (hour + battery)
function MobileStatus() {
  return (
    <div style={{ position: 'absolute', top: -28, left: 0, right: 0, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontFamily: HAND, fontSize: 13, fontWeight: 700, color: INK }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span>••• </span><span>4G</span>
        <span style={{ display: 'inline-block', width: 18, height: 9, border: `1.2px solid ${INK}`, borderRadius: 2, position: 'relative' }}>
          <span style={{ position: 'absolute', inset: 1, background: INK, width: '70%' }} />
        </span>
      </span>
    </div>
  );
}

// Mobile bottom nav (5 tab)
function MobileTabBar({ active = 'home' }) {
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
      borderTop: `1.4px solid ${INK}`, background: PAPER,
      display: 'flex', justifyContent: 'space-around', padding: '8px 4px 6px',
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: active === t.id ? 1 : 0.55 }}>
          <SkIcon name={t.icon} size={18} />
          <SkText size={10} weight={active === t.id ? 700 : 400}>{t.label}</SkText>
          {active === t.id && <span style={{ width: 4, height: 4, borderRadius: 2, background: INK }} />}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  INK, INK_SOFT, PAPER, PAPER_2, YELLOW, YELLOW_DEEP, RED, BLUE, GREEN,
  HAND, DISPLAY, MONO,
  SkBox, SkLine, SkText, SkBtn, SkChip, SkInput, SkImg, SkCarPlaceholder, SkIcon,
  Anno, AnnoArrow, Squiggle, Frame, MobileStatus, MobileTabBar,
  sketchyRadius, wobble,
});
