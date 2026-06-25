import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { searchOverview } from '../../services/admin.js';
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

function Bars({ T, obj, label, showAsPercent }) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return <Txt T={T} size={12} color={T.ink3}>Nessun dato in 30 giorni.</Txt>;
  const max = Math.max(...entries.map(([, v]) => v));
  const total = showAsPercent ? entries.reduce((s, [, v]) => s + v, 0) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(([k, v]) => (
        <div key={k}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <Txt T={T} size={13} weight={600}>{k || `(${label} sconosciuto)`}</Txt>
            <Txt T={T} size={12} color={T.ink2}>{v}{showAsPercent && total ? ` · ${((v / total) * 100).toFixed(0)}%` : ''}</Txt>
          </div>
          <div style={{ height: 6, background: T.surfaceAlt, borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${(v / max) * 100}%`, height: '100%', background: T.accent }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminSearches() {
  const { T, isDesktop } = useOutletContext();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    searchOverview().then(setData).catch(e => setErr(e.message));
  }, []);

  const topCars = data?.top_cars || [];

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <H T={T} size="h2">Ricerche & traffico</H>
        <Txt T={T} size={13} color={T.ink2}>Analytics ricerche, click su auto, conversion. Finestra: ultimi 30 giorni.</Txt>
      </div>

      {err && (
        <div style={{ padding: 14, background: '#FEE2E2', borderRadius: 10, marginBottom: 18 }}>
          <Txt T={T} size={12} color="#991B1B">Errore: {err}</Txt>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
        <StatCard T={T} label="Ricerche oggi" value={data?.searches_today ?? '—'} />
        <StatCard T={T} label="Click auto oggi" value={data?.clicks_today ?? '—'} />
        <StatCard T={T} label="CTR 30gg" value={data ? `${data.ctr_pct}%` : '—'} hint="click / ricerche" />
      </div>

      <section style={{ marginBottom: 32 }}>
        <H T={T} size="h4" style={{ marginBottom: 12 }}>Auto più cliccate (30gg)</H>
        <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
          {topCars.length === 0 ? (
            <Txt T={T} size={12} color={T.ink3}>Nessun click ancora in 30 giorni. I dati appaiono qui dopo i primi click utente.</Txt>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topCars.map((c, i) => (
                <div key={c.car_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < topCars.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                  <Txt T={T} size={20} weight={700} color={T.ink3} style={{ fontFamily: T.fontDisplay, width: 24, textAlign: 'right' }}>{i + 1}</Txt>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/auto/${c.car_id}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <Txt T={T} size={13} weight={600}>{c.name || c.car_id}</Txt>
                    </Link>
                    <Txt T={T} size={11} color={T.ink3}>{c.car_id}</Txt>
                  </div>
                  <Txt T={T} size={13} weight={700}>{c.clicks}</Txt>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 20 }}>
        <section>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Categorie più cercate</H>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <Bars T={T} obj={data?.top_categories} label="categoria" showAsPercent />
          </div>
        </section>
        <section>
          <H T={T} size="h4" style={{ marginBottom: 12 }}>Località più cercate</H>
          <div style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <Bars T={T} obj={data?.top_locations} label="località" />
          </div>
        </section>
      </div>
    </div>
  );
}
