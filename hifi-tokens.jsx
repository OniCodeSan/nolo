// hifi-tokens.jsx — Design tokens per le 2 direzioni visive
//
// Direzione A "Casa": warm, friendly Italian-confident
// Direzione B "Lustro": editorial magazine premium

// ─────────────────────────────────────────────────────────
// DIRECTION A — "Casa"
// ─────────────────────────────────────────────────────────
const A = {
  name: 'Casa',
  bg: '#FAF7F0',          // warm ivory
  surface: '#FFFFFF',
  surfaceAlt: '#F2EDDD',  // soft cream card
  ink1: '#15110A',        // primary text
  ink2: '#5B5246',        // secondary
  ink3: '#8C8273',        // tertiary / placeholder
  line: '#E8E1D1',
  lineStrong: '#D4C9B1',
  // Accenti — yellow è primario, gli altri usabili per tag/categorie
  accent: '#F5C518',
  accentSoft: '#FCE783',
  accentDeep: '#C29200',
  coral: '#EE5D3F',
  coralSoft: '#FBDDD2',
  green: '#1F8F5F',
  greenSoft: '#C8E6D4',
  alert: '#C73E1D',
  ok: '#1F8F5F',
  blue: '#3B6CD9',
  blueSoft: '#D9E4F8',

  fontDisplay: '"Bricolage Grotesque", system-ui, sans-serif',
  fontBody: '"Inter", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',

  r: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
  sh: {
    soft: '0 1px 2px rgba(20,15,5,0.04), 0 4px 16px rgba(20,15,5,0.05)',
    raised: '0 2px 4px rgba(20,15,5,0.06), 0 12px 32px rgba(20,15,5,0.08)',
    deep: '0 4px 8px rgba(20,15,5,0.08), 0 24px 48px rgba(20,15,5,0.12)',
  },
};

// ─────────────────────────────────────────────────────────
// DIRECTION B — "Lustro"
// ─────────────────────────────────────────────────────────
const B = {
  name: 'Lustro',
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F5F2',
  ink1: '#0A0A0A',
  ink2: '#525252',
  ink3: '#8A8A8A',
  line: '#E5E5E5',
  lineStrong: '#0A0A0A',
  accent: '#D03B0E',      // burnt red/orange
  accentSoft: '#FDE6DC',
  accentDeep: '#8F2806',
  navy: '#0A1F3D',
  navySoft: '#DCE3EE',
  sage: '#4F6650',
  sageSoft: '#DCE5DC',
  alert: '#D03B0E',
  ok: '#1A6E40',
  blue: '#1E3A8A',

  fontDisplay: '"Instrument Serif", Georgia, serif',
  fontBody: '"Inter", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',

  r: { sm: 2, md: 4, lg: 8, xl: 12, pill: 999 },
  sh: {
    soft: 'none',
    raised: '0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
    deep: '0 8px 32px rgba(0,0,0,0.12)',
  },
};

Object.assign(window, { ThemeA: A, ThemeB: B });
