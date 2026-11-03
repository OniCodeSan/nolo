import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase, hasSupabase } from '../../lib/supabase.js';
import { H, Txt, Badge } from '../../components/ui.jsx';

// Log consultabili rapidamente: chiamate di R-Pie al webhook del magazine
// (magazine_webhook_log) ed email transazionali (email_log, incluso il reset
// password). SQL: supabase/admin-logs.sql.

const TABS = [
  { id: 'webhook', l: 'R-Pie (webhook)', rpc: 'admin_magazine_webhook_log' },
  { id: 'email',   l: 'Email',            rpc: 'admin_email_log' },
];

const EMAIL_BAD = ['failed', 'bounced', 'rejected', 'complained'];

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'medium' });
}

function plural(n, one, many) { return `${n} ${n === 1 ? one : many}`; }

export function AdminLog() {
  const { T, isDesktop } = useOutletContext();
  const [tab, setTab] = useState('webhook');
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!hasSupabase) { setRows([]); return; }
    let alive = true;
    setRows(null); setError(null); setOpen(null);
    const { rpc } = TABS.find(x => x.id === tab);
    supabase.rpc(rpc, { p_limit: 200, p_only_errors: onlyErrors }).then(({ data, error: err }) => {
      if (!alive) return;
      if (err) { setError(err.message); setRows([]); return; }
      setRows(data || []);
    });
    return () => { alive = false; };
  }, [tab, onlyErrors, reload]);

  const pill = (active) => ({
    padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
    background: active ? T.ink1 : T.surface, color: active ? '#fff' : T.ink1,
    border: `1px solid ${active ? T.ink1 : T.line}`,
    fontFamily: T.fontBody, fontSize: 12, fontWeight: 600,
  });
  const card = {
    padding: 12, background: T.surface, border: `1px solid ${T.line}`,
    borderRadius: 10, fontSize: 12, fontFamily: T.fontBody,
  };

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <H T={T} size="h2" style={{ marginBottom: 6 }}>Log</H>
      <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginBottom: 18 }}>
        Ultime 200 chiamate di R-Pie al webhook del magazine ed email inviate dal sito.
      </Txt>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        {TABS.map(x => (
          <button key={x.id} type="button" style={pill(tab === x.id)} onClick={() => setTab(x.id)}>{x.l}</button>
        ))}
        <div style={{ flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.fontBody, fontSize: 12, color: T.ink2, cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyErrors} onChange={e => setOnlyErrors(e.target.checked)} />
          Solo errori
        </label>
        <button type="button" style={pill(false)} onClick={() => setReload(n => n + 1)}>Aggiorna</button>
      </div>

      {error && (
        <Txt T={T} size={13} color={T.alert} style={{ display: 'block', marginBottom: 12 }}>
          {error}{/function .* does not exist|Could not find the function/i.test(error) ? ' — applica supabase/admin-logs.sql nel SQL Editor.' : ''}
        </Txt>
      )}

      {rows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 32 }}>Caricamento…</Txt>
      ) : rows.length === 0 ? (
        !error && <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 40 }}>
          {tab === 'webhook' ? 'Nessuna chiamata registrata.' : 'Nessuna email registrata.'}
        </Txt>
      ) : tab === 'webhook' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(r => {
            const ping = r.event === 'ping' || (r.ok && !r.event && !r.articles && !r.categories);
            const parts = [
              r.articles ? plural(r.articles, 'articolo', 'articoli') : null,
              r.categories ? plural(r.categories, 'categoria', 'categorie') : null,
              r.failed ? plural(r.failed, 'errore', 'errori') : null,
            ].filter(Boolean);
            const items = Array.isArray(r.items) ? r.items : [];
            return (
              <div key={r.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Badge T={T} tone={r.ok ? 'success' : 'alert'}>{r.http_status}</Badge>
                  <Txt T={T} size={12} color={T.ink1} style={{ fontWeight: 600 }}>
                    {ping ? 'Prova di collegamento (ping)' : parts.join(' · ') || '—'}
                  </Txt>
                  {r.error && <Txt T={T} size={12} color={T.alert}>{r.error}</Txt>}
                  <div style={{ flex: 1 }} />
                  <Txt T={T} size={11} color={T.ink3}>{formatDate(r.created_at)}</Txt>
                  {items.length > 0 && (
                    <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} style={{
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                      fontFamily: T.fontBody, fontSize: 12, fontWeight: 600, color: T.ink2, textDecoration: 'underline',
                    }}>{open === r.id ? 'Chiudi' : 'Dettagli'}</button>
                  )}
                </div>
                {open === r.id && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <Badge T={T} tone={it.ok ? 'neutral' : 'alert'}>
                          {it.type === 'category' ? 'categoria' : (it.action || 'articolo')}
                        </Badge>
                        <Txt T={T} size={12} color={T.ink1}>{it.title || it.name || it.external_id || '—'}</Txt>
                        {it.slug && <code style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink3 }}>{it.slug}</code>}
                        {it.status && <Txt T={T} size={11} color={T.ink3}>{it.status}</Txt>}
                        {it.error && <Txt T={T} size={12} color={T.alert}>{it.error}</Txt>}
                      </div>
                    ))}
                    <Txt T={T} size={11} color={T.ink3} style={{ marginTop: 4 }}>
                      {[r.delivery_id && `consegna ${r.delivery_id}`, r.ip, r.user_agent].filter(Boolean).join(' · ')}
                    </Txt>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(r => (
            <div key={r.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge T={T} tone={EMAIL_BAD.includes(r.status) ? 'alert' : r.status === 'queued' ? 'neutral' : 'success'}>{r.status}</Badge>
                <code style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink2 }}>{r.template}</code>
                <Txt T={T} size={12} color={T.ink1}>{r.to_email}</Txt>
                <div style={{ flex: 1 }} />
                <Txt T={T} size={11} color={T.ink3}>{formatDate(r.created_at)}</Txt>
              </div>
              <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>{r.subject}</Txt>
              {r.error && <Txt T={T} size={12} color={T.alert} style={{ display: 'block', marginTop: 4 }}>{r.error}</Txt>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
