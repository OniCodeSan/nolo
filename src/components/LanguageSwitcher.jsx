import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGS, langFromPath, stripLangPrefix, pathForLang } from '../i18n/langs.js';

// Selettore lingua. Cambiare lingua naviga allo stesso path sotto il nuovo
// prefisso (/en, /es, …) con un reload pulito: così il router rimonta col
// basename corretto e tutti i link restano coerenti.
export function LanguageSwitcher({ T, up = false }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const cur = langFromPath(window.location.pathname);
  const meta = LANGS.find(l => l.code === cur) || LANGS[0];
  const neutral = stripLangPrefix(window.location.pathname);

  const switchTo = (code) => {
    setOpen(false);
    if (code === cur) return;
    try { localStorage.setItem('moviq_lang', code); } catch { /* no-op */ }
    window.location.assign(pathForLang(neutral, code) + window.location.search + window.location.hash);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={t('settings.lang_section')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          background: 'transparent', border: `1px solid ${T.line}`, borderRadius: T.r.pill,
          padding: '6px 12px', color: T.ink1, fontFamily: T.fontBody, fontSize: 13, fontWeight: 600,
        }}
      >
        <span aria-hidden="true">🌐</span> {meta.short}
        <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', [up ? 'bottom' : 'top']: 'calc(100% + 6px)', left: 0, minWidth: 160, zIndex: 50,
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md,
          boxShadow: T.sh.soft, overflow: 'hidden', padding: 4,
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => switchTo(l.code)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                background: l.code === cur ? T.surfaceAlt : 'transparent', border: 'none',
                borderRadius: T.r.sm, padding: '9px 12px', cursor: 'pointer',
                color: T.ink1, fontFamily: T.fontBody, fontSize: 13, fontWeight: l.code === cur ? 700 : 500, textAlign: 'left',
              }}
            >
              {l.label}
              <span style={{ fontSize: 11, color: T.ink3 }}>{l.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
