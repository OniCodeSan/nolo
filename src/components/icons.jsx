export function Icon({ name, size = 20, color = 'currentColor', stroke, T }) {
  const sw = stroke ?? (T && T.name === 'Lustro' ? 1.4 : 1.7);
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    search: <><circle cx="11" cy="11" r="7" {...p} /><path d="m20 20-3.5-3.5" {...p} /></>,
    pin: <><path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z" {...p} /><circle cx="12" cy="9" r="3" {...p} /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" {...p} /><path d="M3 9h18M8 3v4M16 3v4" {...p} /></>,
    filter: <><path d="M3 6h18M6 12h12M10 18h4" {...p} /></>,
    sliders: <><path d="M3 7h18M3 12h18M3 17h18" {...p} /><circle cx="9" cy="7" r="2.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none"/><circle cx="8" cy="17" r="2.2" fill="currentColor" stroke="none"/></>,
    heart: <><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" {...p} /></>,
    heartFill: <path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round" />,
    star: <><path d="M12 3l2.7 5.8 6.3.7-4.8 4.4 1.4 6.4L12 17l-5.6 3.3 1.4-6.4L3 9.5l6.3-.7z" {...p} /></>,
    starFill: <path d="M12 3l2.7 5.8 6.3.7-4.8 4.4 1.4 6.4L12 17l-5.6 3.3 1.4-6.4L3 9.5l6.3-.7z" fill={color} stroke={color} strokeWidth={sw} strokeLinejoin="round" />,
    user: <><circle cx="12" cy="8" r="4" {...p} /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" {...p} /></>,
    menu: <><path d="M3 7h18M3 12h18M3 17h18" {...p} /></>,
    chevron: <><path d="M9 6l6 6-6 6" {...p} /></>,
    chevronDown: <><path d="M6 9l6 6 6-6" {...p} /></>,
    chevronLeft: <><path d="M15 6l-6 6 6 6" {...p} /></>,
    chevronUp: <><path d="M6 15l6-6 6 6" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    x: <><path d="M6 6l12 12M18 6L6 18" {...p} /></>,
    check: <><path d="M5 12l4 4L19 7" {...p} /></>,
    fuel: <><path d="M3 22V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v17M3 22h11M14 8h3a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2 2 2 0 0 0 2-2V8l-3-3" {...p} /></>,
    seat: <><path d="M5 21V11a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v10M5 13h12v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 8V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3" {...p} /></>,
    gauge: <><path d="M12 14m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0" {...p} /><path d="M13.4 12.6L19 7M22 14a10 10 0 1 0-19 4" {...p} /></>,
    car: <><path d="M3 17l1.5-5a3 3 0 0 1 2.8-2h9.4a3 3 0 0 1 2.8 2L21 17M3 17v3h3v-3M21 17v3h-3v-3M3 17h18" {...p} /><circle cx="7" cy="17" r="1.5" fill={color} stroke="none"/><circle cx="17" cy="17" r="1.5" fill={color} stroke="none"/></>,
    transmission: <><circle cx="6" cy="6" r="2.5" {...p} /><circle cx="18" cy="6" r="2.5" {...p} /><circle cx="6" cy="18" r="2.5" {...p} /><path d="M6 8.5V18M6 6h12M18 8.5V10a4 4 0 0 1-4 4h-4a4 4 0 0 0-4 4" {...p} /></>,
    bolt: <><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" {...p} /></>,
    door: <><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M3 21h18M15 12h.01" {...p} /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" {...p} /></>,
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8 8.4 8.4 0 0 1-3.7-.9L3 21l1.4-5.3a8.4 8.4 0 0 1-.9-3.7 8.4 8.4 0 0 1 8-9 8.4 8.4 0 0 1 9 8z" {...p} /></>,
    share: <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" {...p} /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" {...p} /><circle cx="3.5" cy="6" r="1" fill={color} stroke="none"/><circle cx="3.5" cy="12" r="1" fill={color} stroke="none"/><circle cx="3.5" cy="18" r="1" fill={color} stroke="none"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" {...p} /><rect x="14" y="3" width="7" height="7" rx="1" {...p} /><rect x="3" y="14" width="7" height="7" rx="1" {...p} /><rect x="14" y="14" width="7" height="7" rx="1" {...p} /></>,
    map: <><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" {...p} /></>,
    arrowRight: <><path d="M5 12h14M13 5l7 7-7 7" {...p} /></>,
    arrowLeft: <><path d="M19 12H5M11 5L4 12l7 7" {...p} /></>,
    phone: <><path d="M22 16.9V20a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" {...p} /></>,
    edit: <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" {...p} /></>,
    euro: <><path d="M18 7A6 6 0 0 0 8 12a6 6 0 0 0 10 5M3 10h12M3 14h12" {...p} /></>,
    sparkle: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" {...p} /></>,
    home: <><path d="M3 11l9-8 9 8M5 9v11h14V9" {...p} /></>,
    creditCard: <><rect x="2" y="6" width="20" height="13" rx="2" {...p} /><path d="M2 11h20M6 16h3" {...p} /></>,
    settings: <><circle cx="12" cy="12" r="3" {...p} /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" {...p} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none', display: 'block' }}>
      {paths[name] || paths.x}
    </svg>
  );
}

export function CarRender({ width = '100%', height = '100%', T, variant = 'sedan', tone, label }) {
  const bg = tone === 'dark' ? T.ink1 : tone === 'colored' ? T.accentSoft : T.surfaceAlt;
  const bodyColor = tone === 'dark' ? '#fff' : T.ink1;
  const wheelInner = tone === 'dark' ? T.ink1 : bg;
  const ground = tone === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const silhouettes = {
    sedan: 'M 30 110 Q 35 78 60 76 L 90 52 Q 115 42 155 46 L 188 76 Q 215 80 220 110 L 220 122 L 30 122 Z',
    hatch: 'M 30 110 Q 35 80 55 78 L 80 50 Q 100 40 145 42 L 195 78 Q 215 82 220 110 L 220 122 L 30 122 Z',
    suv:   'M 28 108 Q 30 70 56 68 L 80 44 Q 100 36 160 38 L 190 68 Q 218 72 222 108 L 222 124 L 28 124 Z',
  };
  return (
    <div style={{ width, height, background: bg, position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 250 140" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx="125" cy="128" rx="100" ry="6" fill={ground} />
        <path d={silhouettes[variant] || silhouettes.sedan} fill={bodyColor} />
        <path d="M 70 73 L 92 56 Q 110 48 150 50 L 180 73 Z" fill={bg} opacity="0.7" />
        <line x1="125" y1="56" x2="125" y2="110" stroke={bg} strokeWidth="1.2" opacity="0.6" />
        <circle cx="68" cy="118" r="13" fill={bodyColor} />
        <circle cx="68" cy="118" r="6" fill={wheelInner} />
        <circle cx="68" cy="118" r="2.5" fill={bodyColor} />
        <circle cx="182" cy="118" r="13" fill={bodyColor} />
        <circle cx="182" cy="118" r="6" fill={wheelInner} />
        <circle cx="182" cy="118" r="2.5" fill={bodyColor} />
        <ellipse cx="216" cy="92" rx="4" ry="2.5" fill={T.accent || '#F5C518'} />
      </svg>
      {label && (
        <div style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: T.fontMono, fontSize: 10, color: tone === 'dark' ? 'rgba(255,255,255,0.7)' : T.ink3, letterSpacing: 0.4 }}>
          {label}
        </div>
      )}
    </div>
  );
}
