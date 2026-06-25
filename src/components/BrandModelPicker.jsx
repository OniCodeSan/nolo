import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './icons.jsx';
import { Txt } from './ui.jsx';
import { listBrands, listModels } from '../services/catalog-cars.js';

function useOutsideClose(ref, onClose, active) {
  useEffect(() => {
    if (!active) return;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [active, onClose, ref]);
}

function Combobox({
  T, label, value, displayValue, placeholder, options, onPick, onCustom,
  disabled, loading, invalid, allowCustom = true, hint, required,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  useOutsideClose(wrapRef, () => setOpen(false), open);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const showCreate = allowCustom && query.trim().length >= 2 && !filtered.some(o => o.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <label style={{ display: 'block' }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: T.coral }}> *</span>}
      </Txt>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px', textAlign: 'left',
            background: T.surface,
            border: `1px solid ${invalid ? T.coral : open ? T.ink1 : T.line}`,
            borderRadius: 8,
            fontFamily: T.fontBody, fontSize: 14, color: displayValue ? T.ink1 : T.ink3,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayValue || placeholder || 'Seleziona…'}
          </span>
          {loading
            ? <Txt T={T} size={11} color={T.ink3}>…</Txt>
            : <Icon name="chevronDown" size={14} color={T.ink2} T={T} />}
        </button>

        {open && (
          <div role="listbox" style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
            background: T.bg, border: `1px solid ${T.line}`, borderRadius: 10,
            boxShadow: T.sh.deep, maxHeight: 320, display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: 8, borderBottom: `1px solid ${T.line}` }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', background: T.surfaceAlt, borderRadius: 8,
              }}>
                <Icon name="search" size={14} color={T.ink2} T={T} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca…"
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: T.fontBody, fontSize: 13, color: T.ink1, padding: 0,
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Pulisci" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 }}>
                    <Icon name="x" size={12} color={T.ink2} T={T} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 4 }}>
              {loading && (
                <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', padding: 12, textAlign: 'center' }}>Caricamento…</Txt>
              )}
              {!loading && filtered.length === 0 && !showCreate && (
                <Txt T={T} size={12} color={T.ink3} style={{ display: 'block', padding: 12, textAlign: 'center' }}>Nessun risultato</Txt>
              )}
              {filtered.map(o => (
                <button
                  key={o.id}
                  role="option"
                  aria-selected={o.id === value}
                  onClick={() => { onPick(o); setOpen(false); setQuery(''); }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '9px 12px', borderRadius: 6,
                    background: o.id === value ? T.accentSoft : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  }}
                >
                  <span style={{ fontFamily: T.fontBody, fontSize: 14, fontWeight: o.id === value ? 600 : 500, color: T.ink1 }}>
                    {o.name}
                  </span>
                  {o.popular && (
                    <span style={{ fontFamily: T.fontBody, fontSize: 10, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      popolare
                    </span>
                  )}
                </button>
              ))}
              {showCreate && (
                <button
                  onClick={() => { onCustom?.(query.trim()); setOpen(false); setQuery(''); }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    padding: '9px 12px', borderRadius: 6, background: T.accentSoft,
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
                  }}
                >
                  <Icon name="plus" size={14} color={T.ink1} T={T} />
                  <span style={{ fontFamily: T.fontBody, fontSize: 13, color: T.ink1 }}>
                    Usa "<strong>{query.trim()}</strong>" come {label.toLowerCase()}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {hint && <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>{hint}</Txt>}
    </label>
  );
}

export function BrandModelPicker({ T, value, onChange, disabled, isDesktop, errors = {} }) {
  // value: { brandId, brandName, modelId, modelName }
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listBrands().then(b => { if (!cancelled) setBrands(b); }).finally(() => { if (!cancelled) setLoadingBrands(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!value.brandId) { setModels([]); return; }
    let cancelled = false;
    setLoadingModels(true);
    listModels(value.brandId).then(m => { if (!cancelled) setModels(m); }).finally(() => { if (!cancelled) setLoadingModels(false); });
    return () => { cancelled = true; };
  }, [value.brandId]);

  const pickBrand = (brand) => {
    onChange({ brandId: brand.id, brandName: brand.name, modelId: null, modelName: '' });
  };
  const customBrand = (name) => {
    onChange({ brandId: null, brandName: name, modelId: null, modelName: '' });
  };
  const pickModel = (model) => {
    onChange({ ...value, modelId: model.id, modelName: model.name });
  };
  const customModel = (name) => {
    onChange({ ...value, modelId: null, modelName: name });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 12 }}>
      <Combobox
        T={T} label="Marchio" required
        value={value.brandId}
        displayValue={value.brandName || ''}
        options={brands}
        loading={loadingBrands}
        onPick={pickBrand}
        onCustom={customBrand}
        invalid={errors.brand}
        placeholder="Cerca o seleziona…"
        hint={!value.brandId && value.brandName ? `Marchio personalizzato "${value.brandName}"` : undefined}
      />
      <Combobox
        T={T} label="Modello" required
        value={value.modelId}
        displayValue={value.modelName || ''}
        options={models}
        loading={loadingModels}
        onPick={pickModel}
        onCustom={customModel}
        disabled={!value.brandName}
        invalid={errors.model}
        placeholder={value.brandName ? 'Cerca modello…' : 'Scegli prima il marchio'}
        hint={!value.modelId && value.modelName ? `Modello personalizzato "${value.modelName}"` : undefined}
      />
    </div>
  );
}

export function BrandFilterSelect({ T, value, onChange }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listBrands().then(b => { if (!cancelled) setBrands(b); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const current = brands.find(b => b.id === value);
  return (
    <Combobox
      T={T} label="Marca"
      value={value}
      displayValue={current?.name || ''}
      options={[{ id: null, name: 'Tutte le marche', popular: false }, ...brands]}
      loading={loading}
      onPick={(b) => onChange(b.id || null)}
      allowCustom={false}
      placeholder="Tutte le marche"
    />
  );
}
