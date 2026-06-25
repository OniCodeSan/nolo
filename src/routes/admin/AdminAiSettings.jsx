import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { aiStatus, aiSetKey, aiDeleteKey, aiTestKey, aiSetConfig, AI_KEYS } from '../../services/ai.js';
import { useToast } from '../../state/ToastContext.jsx';
import { H, Txt, Button, Badge } from '../../components/ui.jsx';

function inputStyle(T) {
  return {
    flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px 12px',
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.sm,
    fontFamily: T.fontMono, fontSize: 13, color: T.ink1, outline: 'none',
  };
}

function KeyRow({ T, def, isSet, onSaved }) {
  const toast = useToast();
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (val.trim().length < 8) { toast.error('Inserisci una chiave valida.'); return; }
    setBusy(true);
    try { await aiSetKey(def.name, val.trim()); toast.success(`${def.label}: chiave salvata in Vault.`); setVal(''); onSaved(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm(`Rimuovere la chiave ${def.label}?`)) return;
    try { await aiDeleteKey(def.name); toast.success('Chiave rimossa.'); onSaved(); }
    catch (e) { toast.error(e.message); }
  };
  const test = async () => {
    setBusy(true);
    try { const r = await aiTestKey(def.name); r.ok ? toast.success('Chiave valida ✓') : toast.error(`Test fallito (${r.status || r.error || 'errore'})`); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <Txt T={T} size={14} weight={600}>{def.label}</Txt>
          {def.required && <Txt T={T} size={11} color={T.ink3}> · obbligatoria</Txt>}
        </div>
        <Badge T={T} tone={isSet ? 'success' : 'neutral'}>{isSet ? 'Impostata' : 'Non impostata'}</Badge>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="password" autoComplete="off" value={val} onChange={e => setVal(e.target.value)} placeholder={isSet ? 'Inserisci per sostituire…' : def.hint} style={inputStyle(T)} />
        <Button T={T} variant="accent" size="sm" onClick={save} disabled={busy}>{isSet ? 'Sostituisci' : 'Salva'}</Button>
        {def.testable && isSet && <Button T={T} variant="secondary" size="sm" onClick={test} disabled={busy}>Testa</Button>}
        {isSet && <Button T={T} variant="ghost" size="sm" onClick={remove} style={{ color: T.coral }}>Rimuovi</Button>}
      </div>
    </div>
  );
}

export function AdminAiSettings() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [state, setState] = useState(null); // { keys, config, models }

  const refresh = () => aiStatus().then(setState).catch(e => toast.error(e.message));
  useEffect(() => { refresh(); }, []);

  const model = state?.config?.model?.article || 'claude-sonnet-4-6';
  const onModel = async (m) => {
    try { await aiSetConfig('model', { article: m }); toast.success('Modello aggiornato.'); refresh(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div style={{ padding: isDesktop ? '28px 32px 60px' : '18px 16px 40px', maxWidth: 760, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 4 }}>Modulo AI & chiavi cloud</H>
      <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', marginBottom: 8 }}>
        Le chiavi vengono salvate cifrate in <strong>Supabase Vault</strong> e usate solo lato server. Non vengono mai mostrate né incluse nel sito.
      </Txt>

      {state === null ? (
        <Txt T={T} size={13} color={T.ink3}>Caricamento…</Txt>
      ) : (
        <>
          <H T={T} size="h4" style={{ margin: '20px 0 12px' }}>Chiavi API</H>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AI_KEYS.map(def => (
              <KeyRow key={def.name} T={T} def={def} isSet={!!state.keys?.[def.name]} onSaved={refresh} />
            ))}
          </div>

          <H T={T} size="h4" style={{ margin: '26px 0 12px' }}>Modello per gli articoli</H>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(state.models || ['claude-sonnet-4-6']).filter(m => !m.includes('haiku')).map(m => (
              <button key={m} onClick={() => onModel(m)} style={{
                padding: '8px 14px', borderRadius: T.r.pill, cursor: 'pointer',
                background: model === m ? T.ink1 : T.surface,
                color: model === m ? '#fff' : T.ink1,
                border: `1px solid ${model === m ? T.ink1 : T.line}`,
                fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
              }}>{m === 'claude-opus-4-8' ? 'Opus 4.8 (qualità max)' : m === 'claude-sonnet-4-6' ? 'Sonnet 4.6 (consigliato)' : m}</button>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: 14, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
            <Txt T={T} size={12} color={T.ink2} style={{ lineHeight: 1.55 }}>
              Per generare un articolo con Claude vai su <strong>Blog → Genera con AI</strong>. Le chiavi Cloudinary e immagini auto servono alla Fase 3 (foto automatiche), in pausa.
            </Txt>
          </div>
        </>
      )}
    </div>
  );
}
