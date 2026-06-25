import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = 8 + i; // 08:00 → 22:00
  return `${String(h).padStart(2, '0')}:00`;
});

export function TimePicker({ T, label, value, onChange, ariaLabel }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        aria-label={ariaLabel || `${label || t('common.time')} ${value}`}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', fontFamily: T.fontBody, fontSize: 12, fontWeight: 500,
          background: open ? T.ink1 : T.surface,
          color: open ? '#fff' : T.ink1,
          border: `1px solid ${open ? T.ink1 : T.line}`,
          borderRadius: T.r.pill, cursor: 'pointer',
        }}
      >
        <Icon name="calendar" size={11} color="currentColor" T={T} />
        {value}
        <Icon name="chevronDown" size={11} color="currentColor" T={T} />
      </button>
      {open && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
          background: T.bg, border: `1px solid ${T.line}`, borderRadius: T.r.md,
          boxShadow: T.sh.raised, padding: 4,
          maxHeight: 220, overflow: 'auto', minWidth: 96,
        }}>
          {HOURS.map(h => (
            <button
              key={h}
              role="option"
              aria-selected={h === value}
              onClick={() => { onChange(h); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '7px 12px', border: 'none',
                background: h === value ? T.accentSoft : 'transparent',
                color: T.ink1, cursor: 'pointer',
                fontFamily: T.fontBody, fontSize: 13, fontWeight: h === value ? 600 : 500,
                borderRadius: T.r.sm,
              }}
            >
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
