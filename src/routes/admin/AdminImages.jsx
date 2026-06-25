import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase, hasSupabase } from '../../lib/supabase.js';
import { useToast } from '../../state/ToastContext.jsx';
import { Button, H, Txt, Badge, TabPills } from '../../components/ui.jsx';

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
}

function KpiCard({ T, label, value, hint, tone = 'default' }) {
  const accent = tone === 'alert' ? T.coral : tone === 'success' ? T.ok : T.ink1;
  return (
    <div style={{
      padding: 16, background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: 12, boxShadow: T.sh.soft,
    }}>
      <Txt T={T} size={11} weight={600} color={T.ink2} style={{
        textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6,
      }}>{label}</Txt>
      <Txt T={T} size={22} weight={700} style={{ color: accent, display: 'block', lineHeight: 1 }}>
        {value ?? '—'}
      </Txt>
      {hint && (
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>{hint}</Txt>
      )}
    </div>
  );
}

const QUEUE_TABS = [
  { id: 'pending',   l: 'In coda' },
  { id: 'errors',    l: 'Errori (≥3 attempts)' },
  { id: 'processed', l: 'Recenti processati' },
];

export function AdminImages() {
  const { T, isDesktop } = useOutletContext();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [queueTab, setQueueTab] = useState('pending');
  const [queueRows, setQueueRows] = useState(null);

  const loadStats = () => {
    supabase.rpc('admin_images_stats').then(({ data, error }) => {
      if (error) toast.error(error.message);
      else setStats(data);
    });
  };
  const loadQueue = () => {
    setQueueRows(null);
    supabase.rpc('admin_cleanup_queue', { p_filter: queueTab, p_limit: 50 }).then(({ data, error }) => {
      if (error) { toast.error(error.message); setQueueRows([]); return; }
      setQueueRows(data || []);
    });
  };

  useEffect(() => { if (hasSupabase) { loadStats(); } }, []);
  useEffect(() => { if (hasSupabase) loadQueue(); }, [queueTab]);

  if (!hasSupabase) {
    return (
      <div style={{ padding: 32 }}>
        <Txt T={T} color={T.ink3}>Supabase non configurato.</Txt>
      </div>
    );
  }

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <H T={T} size="h2">Immagini</H>
          <Txt T={T} size={13} color={T.ink2}>Telemetria upload, coda cleanup orfani, top consumers.</Txt>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href="https://console.cloudinary.com/console" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <Button T={T} variant="outline" size="sm">Dashboard Cloudinary</Button>
          </a>
          <Button T={T} variant="ghost" size="sm" onClick={() => { loadStats(); loadQueue(); }}>Refresh</Button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 26 }}>
        <KpiCard T={T} label="Immagini totali" value={stats?.images_total} hint="su tutti i veicoli pubblicati" />
        <KpiCard T={T} label="Upload ultime 24h" value={stats?.uploads_24h} />
        <KpiCard T={T} label="Upload ultimi 30g" value={stats?.uploads_30d} hint={formatBytes(stats?.bytes_uploaded_30d) + ' caricati'} />
        <KpiCard T={T} label="Coda cleanup" tone={stats?.queue_pending > 0 ? 'alert' : 'success'}
          value={stats?.queue_pending}
          hint={stats?.queue_pending > 0 ? 'da processare al prossimo cron' : 'tutto pulito'} />
        <KpiCard T={T} label="Errori cleanup" tone={stats?.queue_errors > 0 ? 'alert' : 'default'}
          value={stats?.queue_errors}
          hint={stats?.queue_errors > 0 ? 'ispeziona manualmente' : ''} />
        <KpiCard T={T} label="Processate 24h" tone="success" value={stats?.queue_processed_24h} />
      </div>

      {/* Top hosts per quota */}
      <H T={T} size="h4" style={{ marginBottom: 12 }}>Top host per immagini caricate</H>
      {stats?.top_hosts_by_images?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
          {stats.top_hosts_by_images.map(h => {
            const pct = h.quota ? Math.round((h.image_count / h.quota) * 100) : 0;
            const tone = pct >= 90 ? T.coral : pct >= 70 ? T.accentDeep : T.ok;
            return (
              <div key={h.host_id} style={{
                padding: 12, background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <Txt T={T} size={13} weight={600}>{h.name || h.host_id}</Txt>
                  <Txt T={T} size={11} color={T.ink3} style={{ display: 'block' }}>{h.host_id}</Txt>
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <div style={{ height: 8, background: T.surfaceAlt, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: tone, transition: 'width 200ms' }} />
                  </div>
                  <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>
                    {h.image_count} / {h.quota} immagini ({pct}%)
                  </Txt>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', marginBottom: 26 }}>Nessun host ha caricato immagini.</Txt>
      )}

      {/* Coda cleanup */}
      <H T={T} size="h4" style={{ marginBottom: 12 }}>Coda cleanup</H>
      <TabPills T={T} tabs={QUEUE_TABS} value={queueTab} onChange={setQueueTab} style={{ marginBottom: 14 }} />

      {queueRows === null ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 24 }}>Caricamento…</Txt>
      ) : queueRows.length === 0 ? (
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 24 }}>
          Nessuna riga in questo stato.
        </Txt>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {queueRows.map(r => (
            <div key={r.id} style={{
              padding: 10, background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
              fontSize: 12,
            }}>
              <code style={{ fontFamily: T.fontMono, fontSize: 11, color: T.ink1, flex: 1, minWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.public_id}
              </code>
              <Badge T={T} tone="neutral">{r.reason}</Badge>
              {r.attempts > 0 && <Badge T={T} tone="alert">try {r.attempts}</Badge>}
              <Txt T={T} size={11} color={T.ink3}>{formatDate(r.processed_at || r.enqueued_at)}</Txt>
              {r.last_error && (
                <Txt T={T} size={11} color={T.coral} style={{ width: '100%', marginTop: 4, fontStyle: 'italic' }}>
                  {r.last_error}
                </Txt>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
