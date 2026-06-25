import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { presenceLive, sessionsOverview, utmOverview } from '../../services/admin.js';
import { H, Txt } from '../../components/ui.jsx';

function StatCard({ T, label, value, hint }) {
  return (
    <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, boxShadow: T.sh.soft }}>
      <Txt T={T} size={10} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{label}</Txt>
      <Txt T={T} size={26} weight={700} style={{ fontFamily: T.fontDisplay, lineHeight: 1, display: 'block' }}>{value ?? '—'}</Txt>
      {hint && <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 6 }}>{hint}</Txt>}
    </div>
  );
}

function Bars({ T, obj, label }) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return <Txt T={T} size={12} color={T.ink3}>Nessun dato.</Txt>;
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(([k, v]) => (
        <div key={k}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <Txt T={T} size={13} weight={600}>{k || `(${label} sconosciuto)`}</Txt>
            <Txt T={T} size={12} color={T.ink2}>{v}</Txt>
          </div>
          <div style={{ height: 6, background: T.surfaceAlt, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(v / max) * 100}%`, height: '100%', background: T.accent }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function fmtDuration(sec) {
  if (!sec || sec < 1) return '0s';
  if (sec < 60) return `${Math.round(sec)}s`;
  return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
}

export function AdminSessions() {
  const { T, isDesktop } = useOutletContext();
  const [live, setLive] = useState(null);
  const [ovw, setOvw] = useState(null);
  const [utm, setUtm] = useState(null);
  const [err, setErr] = useState(null);

  const refresh = () => {
    presenceLive().then(setLive).catch(e => setErr(e.message));
    sessionsOverview().then(setOvw).catch(e => setErr(e.message));
    utmOverview().then(setUtm).catch(e => setErr(e.message));
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000); // ogni 15s
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <H T={T} size="h2">Sessioni & presenza</H>
        <Txt T={T} size={13} color={T.ink2}>Auto-refresh ogni 15s. Sessioni "online" = ping nell'ultimo minuto.</Txt>
      </div>

      {err && (
        <div style={{ padding: 14, background: '#FEE2E2', borderRadius: 10, marginBottom: 18 }}>
          <Txt T={T} size={12} color="#991B1B">Errore: {err}</Txt>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard T={T} label="Online ora" value={live?.online_count ?? '—'} hint="ultimi 2 min" />
        <StatCard T={T} label="Sessioni oggi" value={ovw?.sessions_today ?? '—'} />
        <StatCard T={T} label="Sessioni 30gg" value={ovw?.total_sessions ?? '—'} />
        <StatCard T={T} label="Visitatori unici 30gg" value={ovw?.unique_visitors ?? '—'} />
        <StatCard T={T} label="Durata media" value={ovw ? fmtDuration(Number(ovw.avg_duration_seconds)) : '—'} hint="ultimi 30gg" />
        <StatCard T={T} label="Pagine/sessione" value={ovw?.avg_pages_per_session ?? '—'} />
        <StatCard T={T} label="% loggati" value={ovw ? `${ovw.authed_share_pct}%` : '—'} hint="vs anonimi" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 20 }}>
        <section>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Top paesi (live)</H>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <Bars T={T} obj={live?.by_country} label="paese" />
          </div>
        </section>
        <section>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Top città (live)</H>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <Bars T={T} obj={live?.by_city} label="città" />
          </div>
        </section>
      </div>

      <div style={{ marginTop: 32 }}>
        <H T={T} size="h3" style={{ marginBottom: 6 }}>Attribuzione campagne (UTM)</H>
        <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginBottom: 14 }}>
          First-touch attribution. Ultimi 30 giorni · {utm?.utm_sessions ?? 0} sessioni con UTM su {utm?.total_sessions ?? 0} totali · {utm?.utm_visitors ?? 0} visitatori unici da campagna.
        </Txt>

        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 20, marginBottom: 20 }}>
          <section>
            <H T={T} size="h4" style={{ marginBottom: 12 }}>Per sorgente</H>
            <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
              <Bars T={T} obj={utm?.by_source} label="sorgente" />
            </div>
          </section>
          <section>
            <H T={T} size="h4" style={{ marginBottom: 12 }}>Per medium</H>
            <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
              <Bars T={T} obj={utm?.by_medium} label="medium" />
            </div>
          </section>
        </div>

        <section style={{ marginBottom: 20 }}>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Campagne</H>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            {!utm?.campaigns?.length ? (
              <Txt T={T} size={12} color={T.ink3}>Nessuna campagna ancora. Usa link tipo <code style={{ fontFamily: T.fontMono }}>?utm_source=newsletter&utm_campaign=lancio</code>.</Txt>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 12, paddingBottom: 6, borderBottom: `1px solid ${T.line}` }}>
                  <Txt T={T} size={11} weight={600} color={T.ink3} style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Campagna</Txt>
                  <Txt T={T} size={11} weight={600} color={T.ink3} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Sessioni</Txt>
                  <Txt T={T} size={11} weight={600} color={T.ink3} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Visitatori</Txt>
                </div>
                {utm.campaigns.map(c => (
                  <div key={c.campaign} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 12, alignItems: 'baseline' }}>
                    <Txt T={T} size={13} weight={600}>{c.campaign}</Txt>
                    <Txt T={T} size={13} color={T.ink2} style={{ textAlign: 'right' }}>{c.sessions}</Txt>
                    <Txt T={T} size={13} color={T.ink2} style={{ textAlign: 'right' }}>{c.visitors}</Txt>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Pagine di atterraggio (solo traffico UTM)</H>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <Bars T={T} obj={utm?.by_landing} label="pagina" />
          </div>
        </section>
      </div>
    </div>
  );
}
