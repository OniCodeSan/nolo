import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Icon, CarRender } from '../../components/icons.jsx';
import { Badge, Button, H, Txt, Chip } from '../../components/ui.jsx';
import { BrandModelPicker } from '../../components/BrandModelPicker.jsx';
import { ImageUploader } from '../../components/ImageUploader.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { createCar, getCarOwner, updateCar, listCarsByHost } from '../../services/cars.js';
import { geocode } from '../../services/geocode.js';
import { PUNTI_RITIRO, CITTA_LIST } from '../../data/pickup-points.js';

// Opzioni città per il selettore ritiro (slug → "Nome (PROV)").
const CITY_OPTIONS = CITTA_LIST.map(c => ({ id: c.slug, l: `${c.nome} (${c.provincia})` }));
const POINT_ICON = { stazione: '🚉', aeroporto: '✈️', porto: '⚓', centro: '📍' };
// Trova città+punto a partire dal nome salvato (per precompilare in modifica).
function findPickup(name) {
  if (!name) return null;
  for (const c of CITTA_LIST) {
    const p = c.puntiRitiro.find(p => p.nome === name);
    if (p) return { citySlug: c.slug, pointName: p.nome };
  }
  return null;
}

const CATEGORIES = [
  { id: 'citycar',   l: 'Citycar' },
  { id: 'suv',       l: 'SUV' },
  { id: 'elettrica', l: 'Elettrica' },
  { id: 'cabrio',    l: 'Cabrio' },
  { id: 'furgone',   l: 'Furgone' },
  { id: 'mensile',   l: 'Lungo termine' },
];
const FUELS = ['Benzina', 'Diesel', 'Hybrid', 'Elettrica', 'GPL', 'Metano'];
const TRANSMISSIONS = ['Manuale', 'Automatico'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4x4'];
const VARIANTS = [
  { id: 'hatch', l: 'Compatta' },
  { id: 'sedan', l: 'Berlina' },
  { id: 'suv',   l: 'SUV' },
];
const TONES = [
  { id: 'colored', l: 'Colorato' },
  { id: 'neutral', l: 'Neutro' },
];
const ACCESSORIES = [
  'Apple CarPlay', 'Android Auto', 'Bluetooth', 'Sensori parcheggio',
  'Telecamera retro', 'Telecamera 360°', 'Cruise control', 'Aria condizionata',
  'Navigatore', 'Tetto panoramico', 'Cerchi lega', 'Fendinebbia',
  'USB', 'Sedili riscaldati', 'Vivavoce', 'Autopilot',
];

function Section({ T, n, title, desc, children, status = 'active' }) {
  return (
    <section style={{
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: 22, boxShadow: T.sh.soft,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <span style={{
          width: 28, height: 28, borderRadius: '50%',
          background: status === 'done' ? T.ok : T.accent, color: T.ink1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontBody, fontWeight: 700, fontSize: 13, flex: 'none',
        }}>{n}</span>
        <div style={{ flex: 1 }}>
          <H T={T} size="h4">{title}</H>
          {desc && <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{desc}</Txt>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ T, label, hint, required, children }) {
  return (
    <label style={{ display: 'block' }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
        {label}{required && <span style={{ color: T.coral }}> *</span>}
      </Txt>
      {children}
      {hint && <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>{hint}</Txt>}
    </label>
  );
}

function inputStyle(T, invalid) {
  return {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    background: T.surface, border: `1px solid ${invalid ? T.coral : T.line}`, borderRadius: 8,
    fontFamily: T.fontBody, fontSize: 14, color: T.ink1, outline: 'none',
  };
}

function Select({ T, value, onChange, options, placeholder, invalid }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)} style={{ ...inputStyle(T, invalid), appearance: 'auto' }}>
      <option value="">{placeholder || 'Seleziona…'}</option>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.id} value={typeof o === 'string' ? o : o.id}>
          {typeof o === 'string' ? o : o.l}
        </option>
      ))}
    </select>
  );
}

const EMPTY_FORM = {
  brand: '', model: '', brandId: null, modelId: null,
  year: '', name: '',
  category: 'citycar', fuel: 'Benzina', transmission: 'Manuale',
  seats: 5, doors: 5, engine: '', km: '', range: '',
  powerHp: '', drivetrain: '',
  pricePerDay: '', pricePerWeek: '', pricePerMonth: '',
  variant: 'hatch', tone: 'neutral',
  accessories: new Set(),
  description: '',
  licensePlate: '',
  pickupLocation: '',
  pickupCity: '',   // slug città selezionata (selettore punti di ritiro)
  pickupPoint: '',  // nome del punto di ritiro selezionato
  internalNotes: '',
  status: 'draft',
  images: [],
};

export function HostVehicleForm({ T, mode = 'new' }) {
  const { host, isDesktop } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loaded, setLoaded] = useState(mode === 'new');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const car = await getCarOwner(id);
        if (cancelled || !car) { if (!cancelled) toast.error('Veicolo non trovato'); return; }
        if (car.host !== host.id) { toast.error('Non hai accesso a questo veicolo'); navigate('/noleggia/veicoli'); return; }
        setForm({
          brand: car.brand || '', model: car.model || '',
          brandId: car.brandId ?? null, modelId: car.modelId ?? null,
          year: car.year || '',
          name: car.name || '',
          category: car.category || 'citycar',
          fuel: car.fuel || 'Benzina',
          transmission: car.transmission || 'Manuale',
          seats: car.seats || 5, doors: car.doors || 5,
          engine: car.engine || '', km: car.km || '', range: car.range || '',
          powerHp: car.powerHp || '', drivetrain: car.drivetrain || '',
          pricePerDay: car.pricePerDay || '', pricePerWeek: car.pricePerWeek || '', pricePerMonth: car.pricePerMonth || '',
          variant: car.variant || 'hatch', tone: car.tone || 'neutral',
          accessories: new Set(car.accessories || []),
          description: car.description || '',
          licensePlate: car.licensePlate || '',
          pickupLocation: car.pickupLocation || '',
          pickupCity: findPickup(car.pickupLocation)?.citySlug || '',
          pickupPoint: findPickup(car.pickupLocation)?.pointName || '',
          internalNotes: car.internalNotes || '',
          status: car.status || 'draft',
          images: Array.isArray(car.images) ? car.images : [],
        });
        setLoaded(true);
      } catch (err) {
        toast.error(err.message || 'Errore caricamento veicolo');
      }
    })();
    return () => { cancelled = true; };
  }, [mode, id, host.id]);

  const set = (patch) => setForm(prev => ({ ...prev, ...patch }));
  const toggleAcc = (a) => setForm(prev => {
    const next = new Set(prev.accessories);
    if (next.has(a)) next.delete(a); else next.add(a);
    return { ...prev, accessories: next };
  });

  const validate = (forPublish = false) => {
    const e = {};
    if (!form.brand?.trim()) e.brand = true;
    if (!form.model?.trim()) e.model = true;
    if (forPublish) {
      if (!form.pricePerDay) e.pricePerDay = true;
      if (!form.fuel) e.fuel = true;
      if (!form.transmission) e.transmission = true;
      if (!form.seats) e.seats = true;
      if (!form.pickupPoint) e.pickup = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fieldsLabel = {
    brand: 'Marchio',
    model: 'Modello',
    pricePerDay: 'Prezzo giornaliero',
    fuel: 'Carburante',
    transmission: 'Cambio',
    seats: 'Posti',
    pickup: 'Punto di ritiro',
  };
  const errorList = Object.keys(errors).map(k => fieldsLabel[k] || k);

  const submit = async (status) => {
    if (!validate(status === 'active')) {
      toast.error('Compila i campi obbligatori');
      // scroll alla prima sezione che ha errori
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    try {
      // Punto di ritiro dal dizionario → coordinate ESATTE (niente geocoding incerto).
      const cityObj = form.pickupCity ? PUNTI_RITIRO[form.pickupCity] : null;
      const point = cityObj?.puntiRitiro.find(p => p.nome === form.pickupPoint) || null;
      const pickupLabel = point ? point.nome : (form.pickupLocation?.trim() || null);
      const pickupCityName = point ? cityObj.nome : (host.city || null);
      let coords = point ? [point.lat, point.lng] : null;
      // Legacy / nessun punto selezionato: geocoding best-effort del testo (non blocca il salvataggio).
      if (!coords && pickupLabel) coords = await geocode(`${pickupLabel}, Italia`);

      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        brandId: form.brandId,
        modelId: form.modelId,
        year: form.year || null,
        name: form.name?.trim() || `${form.brand.trim()} ${form.model.trim()}${form.year ? ' · ' + form.year : ''}`,
        category: form.category,
        fuel: form.fuel,
        transmission: form.transmission,
        seats: form.seats || null,
        doors: form.doors || null,
        engine: form.engine?.trim() || null,
        km: form.km?.trim() || null,
        range: form.range?.trim() || null,
        powerHp: form.powerHp || null,
        drivetrain: form.drivetrain || null,
        pricePerDay: form.pricePerDay || null,
        pricePerWeek: form.pricePerWeek || null,
        pricePerMonth: form.pricePerMonth || null,
        variant: form.variant,
        tone: form.tone,
        accessories: [...form.accessories],
        description: form.description?.trim() || null,
        licensePlate: form.licensePlate?.trim() || null,
        pickupLocation: pickupLabel,
        internalNotes: form.internalNotes?.trim() || null,
        status,
        city: pickupCityName,
        images: form.images || [],
      };
      if (coords) payload.coords = coords;
      let result;
      if (isEdit) result = await updateCar(id, payload);
      else result = await createCar(host.id, payload);
      toast.success(status === 'active' ? 'Veicolo pubblicato' : 'Bozza salvata');
      if (!isEdit && result?.id) navigate(`/noleggia/veicoli/${result.id}`, { replace: true });
      else if (isEdit) setForm(prev => ({ ...prev, status: result?.status || prev.status }));
    } catch (err) {
      toast.error(err.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Txt T={T} size={13} color={T.ink3}>Caricamento…</Txt>
      </div>
    );
  }

  const canPublish = form.brand && form.model && form.pricePerDay && form.fuel && form.transmission && form.seats && form.pickupPoint;

  return (
    <div style={{ padding: isDesktop ? '24px 36px 60px' : '18px 18px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <Txt T={T} size={12} color={T.ink2}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/noleggia/veicoli')}>I miei veicoli</span>
            <span style={{ margin: '0 6px', color: T.ink3 }}>›</span>
            <span style={{ color: T.ink1, fontWeight: 500 }}>{isEdit ? `${form.brand} ${form.model}` : 'Nuovo veicolo'}</span>
          </Txt>
          <H T={T} size="h2" style={{ lineHeight: 1, marginTop: 4 }}>
            {isEdit ? `${form.brand} ${form.model}` : 'Aggiungi un veicolo'}
          </H>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {isEdit && <Badge T={T} tone={form.status === 'active' ? 'success' : 'neutral'}>{form.status === 'active' ? 'Pubblicato' : form.status === 'draft' ? 'Bozza' : 'Fuori catalogo'}</Badge>}
          <Button T={T} variant="outline" size="md" onClick={() => submit('draft')} disabled={saving}>
            {isEdit && form.status === 'draft' ? 'Aggiorna bozza' : 'Salva bozza'}
          </Button>
          <Button T={T} variant="accent" size="md" iconRight="check" onClick={() => submit('active')} disabled={saving || !canPublish}>
            {isEdit ? 'Aggiorna & pubblica' : 'Pubblica veicolo'}
          </Button>
        </div>
      </div>

      {errorList.length > 0 && (
        <div style={{
          marginBottom: 18, padding: 14, background: T.coralSoft, border: `1px solid ${T.coral}`,
          borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <Icon name="x" size={18} color={T.alert} T={T} />
          <div style={{ flex: 1 }}>
            <Txt T={T} size={14} weight={700} color={T.alert} style={{ display: 'block', marginBottom: 4 }}>
              Compila i campi obbligatori
            </Txt>
            <Txt T={T} size={13} color={T.ink1} style={{ lineHeight: 1.55 }}>
              Mancano: {errorList.join(', ')}.
            </Txt>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: isDesktop ? '1fr 320px' : '1fr', gap: 22,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Section T={T} n={1} title="Identificazione" desc="Campi obbligatori per pubblicare">
            <BrandModelPicker
              T={T} isDesktop={isDesktop}
              value={{ brandId: form.brandId, brandName: form.brand, modelId: form.modelId, modelName: form.model }}
              onChange={(v) => set({ brand: v.brandName || '', model: v.modelName || '', brandId: v.brandId, modelId: v.modelId })}
              errors={errors}
            />
            <div style={{ height: 14 }} />
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 12 }}>
              <Field T={T} label="Anno">
                <input type="number" min="1990" max="2030" value={form.year} onChange={(e) => set({ year: e.target.value })} style={inputStyle(T)} placeholder="2022" />
              </Field>
              <Field T={T} label="Targa" hint="Visibile solo a te. Non viene mostrata pubblicamente.">
                <input value={form.licensePlate} onChange={(e) => set({ licensePlate: e.target.value.toUpperCase() })} style={inputStyle(T)} placeholder="AB123CD" />
              </Field>
              <Field T={T} label="Categoria" required>
                <Select T={T} value={form.category} onChange={(v) => set({ category: v })} options={CATEGORIES} />
              </Field>
              <Field T={T} label="Motorizzazione" hint="Es. '1.0 TSI · 95cv'">
                <input value={form.engine} onChange={(e) => set({ engine: e.target.value })} style={inputStyle(T)} placeholder="1.0 TSI · 95cv" />
              </Field>
            </div>
          </Section>

          <Section T={T} n={2} title="Dettagli tecnici" desc="Aiutano l'utente a filtrare">
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 12 }}>
              <Field T={T} label="Carburante" required>
                <Select T={T} value={form.fuel} onChange={(v) => set({ fuel: v })} options={FUELS} invalid={errors.fuel} />
              </Field>
              <Field T={T} label="Cambio" required>
                <Select T={T} value={form.transmission} onChange={(v) => set({ transmission: v })} options={TRANSMISSIONS} invalid={errors.transmission} />
              </Field>
              <Field T={T} label="Trazione">
                <Select T={T} value={form.drivetrain} onChange={(v) => set({ drivetrain: v })} options={DRIVETRAINS} />
              </Field>
              <Field T={T} label="Posti" required>
                <input type="number" min="1" max="9" value={form.seats} onChange={(e) => set({ seats: e.target.value ? Number(e.target.value) : '' })} style={inputStyle(T, errors.seats)} />
              </Field>
              <Field T={T} label="Porte">
                <input type="number" min="2" max="5" value={form.doors} onChange={(e) => set({ doors: e.target.value ? Number(e.target.value) : '' })} style={inputStyle(T)} />
              </Field>
              <Field T={T} label="Cavalli">
                <input type="number" min="0" max="2000" value={form.powerHp} onChange={(e) => set({ powerHp: e.target.value })} style={inputStyle(T)} placeholder="95" />
              </Field>
              <Field T={T} label="Km percorsi">
                <input value={form.km} onChange={(e) => set({ km: e.target.value })} style={inputStyle(T)} placeholder="40.000" />
              </Field>
              <Field T={T} label="Autonomia">
                <input value={form.range} onChange={(e) => set({ range: e.target.value })} style={inputStyle(T)} placeholder="320 km (solo elettriche)" />
              </Field>
            </div>
          </Section>

          <Section T={T} n={3} title="Accessori e dotazione" desc="Selezione multipla">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ACCESSORIES.map(a => {
                const active = form.accessories.has(a);
                return (
                  <button key={a} onClick={() => toggleAcc(a)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                    <Chip T={T} size="sm" active={active} icon={active ? 'check' : undefined}>{a}</Chip>
                  </button>
                );
              })}
            </div>
            <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 8 }}>
              {form.accessories.size} accessori selezionati
            </Txt>
          </Section>

          <Section T={T} n={4} title="Descrizione" desc="Racconta cos'ha di speciale">
            <textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value.slice(0, 500) })}
              rows={5}
              placeholder="Polo del 2022 in ottime condizioni, ideale per la città e brevi spostamenti…"
              style={{ ...inputStyle(T), resize: 'vertical', minHeight: 110, fontFamily: T.fontBody, lineHeight: 1.55 }}
            />
            <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>
              {form.description.length}/500 caratteri
            </Txt>
          </Section>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, boxShadow: T.sh.soft }}>
            <ImageUploader
              T={T}
              value={form.images}
              onChange={(next) => set({ images: next })}
              max={10}
              label="Foto del veicolo"
            />
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
              <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                Fallback illustrato <span style={{ color: T.ink3, fontWeight: 500 }}>· usato se non carichi foto</span>
              </Txt>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.line}`, aspectRatio: '1.6 / 1', marginBottom: 12 }}>
                <CarRender T={T} variant={form.variant} tone={form.tone} />
              </div>
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginBottom: 6 }}>Forma</Txt>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {VARIANTS.map(v => (
                  <button key={v.id} onClick={() => set({ variant: v.id })} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                    <Chip T={T} size="sm" active={form.variant === v.id} icon={form.variant === v.id ? 'check' : undefined}>{v.l}</Chip>
                  </button>
                ))}
              </div>
              <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginBottom: 6 }}>Tono</Txt>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TONES.map(t => (
                  <button key={t.id} onClick={() => set({ tone: t.id })} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                    <Chip T={T} size="sm" active={form.tone === t.id} icon={form.tone === t.id ? 'check' : undefined}>{t.l}</Chip>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, boxShadow: T.sh.soft }}>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Prezzi</Txt>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field T={T} label="Giornaliero (€)" required>
                <input type="number" min="0" value={form.pricePerDay} onChange={(e) => set({ pricePerDay: e.target.value })} style={inputStyle(T, errors.pricePerDay)} placeholder="32" />
              </Field>
              <Field T={T} label="Settimanale (€)" hint="Opzionale">
                <input type="number" min="0" value={form.pricePerWeek} onChange={(e) => set({ pricePerWeek: e.target.value })} style={inputStyle(T)} placeholder="—" />
              </Field>
              <Field T={T} label="Mensile (€)" hint="Per noleggi 30+ giorni">
                <input type="number" min="0" value={form.pricePerMonth} onChange={(e) => set({ pricePerMonth: e.target.value })} style={inputStyle(T)} placeholder="690" />
              </Field>
            </div>
          </div>

          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16, boxShadow: T.sh.soft }}>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>Ritiro</Txt>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field T={T} label="Città" required>
                <Select T={T} value={form.pickupCity}
                  onChange={(v) => set({ pickupCity: v || '', pickupPoint: '' })}
                  options={CITY_OPTIONS} placeholder="Seleziona città…" invalid={errors.pickup} />
              </Field>
              <Field T={T} label="Punto di ritiro" required hint="Visibile pubblicamente · posiziona l'auto sulla mappa con coordinate esatte">
                <Select T={T} value={form.pickupPoint}
                  onChange={(v) => set({ pickupPoint: v || '' })}
                  options={form.pickupCity ? PUNTI_RITIRO[form.pickupCity].puntiRitiro.map(p => ({ id: p.nome, l: `${POINT_ICON[p.tipo] || ''} ${p.nome}` })) : []}
                  placeholder={form.pickupCity ? 'Stazione, aeroporto, porto, centro…' : 'Scegli prima la città'}
                  invalid={errors.pickup} />
              </Field>
              {form.pickupLocation && !form.pickupPoint && (
                <Txt T={T} size={11} color={T.ink3} style={{ display: 'block' }}>
                  Ritiro attuale: <strong>{form.pickupLocation}</strong> — seleziona un punto qui sopra per aggiornarlo.
                </Txt>
              )}
            </div>
          </div>

          <div style={{
            background: T.surfaceAlt, border: `1px dashed ${T.line}`,
            borderRadius: 14, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Icon name="eye" size={14} color={T.ink2} T={T} />
              <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Solo per te</Txt>
            </div>
            <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginBottom: 12, lineHeight: 1.5 }}>
              Queste informazioni non sono visibili agli utenti. Servono per la gestione interna.
            </Txt>

            <Field T={T} label="Note interne" hint="Targa, danni, scadenza tagliando, assicurazione, dotazioni extra, ecc.">
              <textarea
                value={form.internalNotes}
                onChange={(e) => set({ internalNotes: e.target.value })}
                rows={6}
                placeholder={"Targa: AB123CD\nAssicurazione: scade 12/2026\nGraffi: paraurti posteriore destro\nKit chiavi: 2 originali\nPosizione: garage box 14\n…"}
                style={{ ...inputStyle(T), resize: 'vertical', minHeight: 130, fontFamily: T.fontBody, lineHeight: 1.55 }}
              />
            </Field>
          </div>

          {isEdit && form.status !== 'disabled' && (
            <Button T={T} variant="ghost" size="md" onClick={() => submit('disabled')} disabled={saving} style={{ color: T.coral }}>
              Metti fuori catalogo
            </Button>
          )}
          {isEdit && form.status === 'disabled' && (
            <Button T={T} variant="outline" size="md" onClick={() => submit('active')} disabled={saving}>
              Rimetti in catalogo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
