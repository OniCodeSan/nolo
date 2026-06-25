import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Icon, CarRender } from '../../components/icons.jsx';
import { Badge, H, Txt } from '../../components/ui.jsx';
import { useToast } from '../../state/ToastContext.jsx';
import { getHostStats, getMarketStats } from '../../services/stats.js';

const MONTHS_SHORT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const WEEKDAYS = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];

const CATEGORY_LABEL = {
  citycar: 'Citycar', suv: 'SUV', elettrica: 'Elettrica',
  cabrio: 'Cabrio', furgone: 'Furgone', mensile: 'Lungo termine',
};

const fmtMonth = (key) => {
  if (!key) return '';
  const [y, m] = key.split('-');
  return `${MONTHS_SHORT[parseInt(m, 10) - 1]} '${y.slice(2)}`;
};

const trendArrow = (now, prev) => {
  if (prev === 0) return now > 0 ? { up: true, pct: null } : null;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (Math.abs(pct) < 1) return null;
  return { up: pct >= 0, pct };
};

function Kpi({ T, label, value, sub, trend, tone = 'neutral' }) {
  const bg = tone === 'accent' ? T.accent : tone === 'success' ? T.greenSoft : tone === 'alert' ? T.coralSoft : T.surface;
  return (
    <div style={{
      padding: 18, background: bg, border: `1px solid ${T.line}`, borderRadius: 14,
    }}>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</Txt>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
        <Txt T={T} size={28} weight={700} style={{ fontFamily: T.fontDisplay, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</Txt>
        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            padding: '2px 6px', borderRadius: 999,
            background: trend.up ? T.greenSoft : T.coralSoft,
            color: trend.up ? T.ok : T.alert,
            fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
          }}>
            {trend.up ? '▲' : '▼'}{trend.pct != null && `${Math.abs(trend.pct)}%`}
          </span>
        )}
      </div>
      {sub && <Txt T={T} size={11} color={T.ink2} style={{ display: 'block', marginTop: 4 }}>{sub}</Txt>}
    </div>
  );
}

function HorizontalBar({ T, label, value, max, color = 'accent', sub, thumb }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  const bg = color === 'success' ? T.ok : color === 'coral' ? T.coral : T.accent;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {thumb}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <Txt T={T} size={13} weight={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</Txt>
          <Txt T={T} size={13} weight={700}>{value}</Txt>
        </div>
        <div style={{ height: 8, background: T.surfaceAlt, borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: bg, transition: 'width 300ms' }} />
        </div>
        {sub && <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 2 }}>{sub}</Txt>}
      </div>
    </div>
  );
}

function MiniThumb({ T, variant, tone }) {
  return (
    <div style={{ width: 50, height: 32, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.line}`, flex: 'none' }}>
      <CarRender T={T} variant={variant || 'hatch'} tone={tone || 'neutral'} />
    </div>
  );
}

function VBars({ T, items, getLabel, getValue, height = 80, color = 'accent' }) {
  const max = Math.max(1, ...items.map(getValue));
  const bg = color === 'success' ? T.ok : color === 'accent' ? T.accent : T.ink1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 18 }}>
      {items.map((it, i) => {
        const v = getValue(it);
        const h = Math.max(2, (v / max) * (height - 24));
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Txt T={T} size={10} weight={600} color={T.ink2} style={{ height: 12 }}>{v || ''}</Txt>
            <div style={{ width: '100%', height: h, background: bg, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
            <Txt T={T} size={10} color={T.ink3}>{getLabel(it)}</Txt>
          </div>
        );
      })}
    </div>
  );
}

function Section({ T, title, hint, children, right }) {
  return (
    <section style={{
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: 20, boxShadow: T.sh.soft, marginBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <H T={T} size="h4">{title}</H>
          {hint && <Txt T={T} size={12} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>{hint}</Txt>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function HostStats({ T }) {
  const { host, isDesktop } = useOutletContext();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [market, setMarket] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getHostStats(host.id), getMarketStats()])
      .then(([h, m]) => { if (!cancelled) { setStats(h); setMarket(m); } })
      .catch(err => { if (!cancelled) toast.error(err.message || 'Errore caricamento statistiche'); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host.id]);

  if (!stats || !market) {
    return (
      <div style={{ padding: isDesktop ? '28px 36px' : '20px 18px', maxWidth: 1100, margin: '0 auto' }}>
        <H T={T} size="h2">Statistiche</H>
        <Txt T={T} size={13} color={T.ink3} style={{ display: 'block', textAlign: 'center', padding: 48 }}>Caricamento dati…</Txt>
      </div>
    );
  }

  const viewsTrend = trendArrow(stats.views.d30, stats.views.prev_30d);
  const maxViews = Math.max(1, ...stats.top_cars_views.map(c => c.views_30d));
  const maxSaved = Math.max(1, ...stats.top_cars_saved.map(c => c.saved));
  const maxRevenue = Math.max(1, ...stats.top_cars_revenue.map(c => c.revenue));

  const monthly = stats.monthly || [];
  const weekday = (stats.weekday || []).slice().sort((a, b) => a.weekday - b.weekday);
  const fullWeekday = [0,1,2,3,4,5,6].map(d => weekday.find(w => w.weekday === d) || { weekday: d, count: 0 });

  const mktMonthly = market.monthly_demand || [];
  const mktWeekday = (market.weekday_demand || []).slice().sort((a, b) => a.weekday - b.weekday);
  const fullMktWeekday = [0,1,2,3,4,5,6].map(d => mktWeekday.find(w => w.weekday === d) || { weekday: d, count: 0 });
  const maxSegPrice = Math.max(1, ...(market.avg_price_segment || []).map(s => s.max_price || s.avg_price));

  return (
    <div style={{ padding: isDesktop ? '28px 36px 60px' : '20px 18px 32px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 24 }}>
        <H T={T} size="h2">Statistiche</H>
        <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6 }}>
          Performance dei tuoi veicoli + confronto con il mercato. Dati aggiornati in tempo reale.
        </Txt>
      </div>

      {/* ============ HEADER KPI ============ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
        gap: 14, marginBottom: 24,
      }}>
        <Kpi T={T} label="Visite 30gg" value={stats.views.d30}
          sub={`${stats.views.d7} ultimi 7gg · ${stats.views.total} totali`}
          trend={viewsTrend} tone="accent" />
        <Kpi T={T} label="Auto salvate" value={stats.saved_total}
          sub={stats.saved_total > 0 ? 'da utenti in wishlist' : 'nessuno ancora'} />
        <Kpi T={T} label="Conversione" value={`${stats.conversion_rate}%`}
          sub={`${stats.bookings.confirmed + stats.bookings.completed} di ${stats.bookings.total} richieste`}
          tone={stats.conversion_rate >= 70 ? 'success' : stats.conversion_rate >= 40 ? 'neutral' : 'alert'} />
        <Kpi T={T} label="Fatturato 30gg" value={`${stats.revenue.d30}€`}
          sub={`${stats.revenue.total}€ totali · ${stats.bookings.completed} completate`}
          tone="success" />
      </div>

      {/* Pending alert */}
      {stats.bookings.pending > 0 && (
        <div style={{ padding: 14, background: T.coralSoft, border: `1px solid ${T.coral}`, borderRadius: 12, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="bell" size={18} color={T.coral} T={T} />
          <Txt T={T} size={14} weight={600} style={{ flex: 1 }}>{stats.bookings.pending} richieste in attesa di risposta</Txt>
          <Txt T={T} size={12} color={T.ink2}>Va su Richieste per gestirle</Txt>
        </div>
      )}

      {/* ============ I TUOI VEICOLI ============ */}
      <Section T={T} title="I tuoi veicoli — Top 5" hint="Auto più viste, più salvate e più redditizie negli ultimi 30 giorni.">
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 24 }}>
          <div>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Più viste</Txt>
            {stats.top_cars_views.length === 0
              ? <Txt T={T} size={12} color={T.ink3}>Nessuna visita ancora</Txt>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.top_cars_views.map(c => (
                    <HorizontalBar key={c.car_id} T={T}
                      label={c.name} value={c.views_30d || 0} max={maxViews}
                      thumb={<MiniThumb T={T} variant={c.variant} tone={c.tone} />}
                      sub={`${c.saved || 0} salvati`} />
                  ))}
                </div>}
          </div>

          <div>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Più salvate</Txt>
            {stats.top_cars_saved.filter(c => c.saved > 0).length === 0
              ? <Txt T={T} size={12} color={T.ink3}>Nessun salvataggio ancora</Txt>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.top_cars_saved.filter(c => c.saved > 0).map(c => (
                    <HorizontalBar key={c.car_id} T={T}
                      label={c.name} value={c.saved} max={maxSaved} color="coral"
                      thumb={<MiniThumb T={T} variant={c.variant} tone={c.tone} />} />
                  ))}
                </div>}
          </div>

          <div>
            <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>Più redditizie</Txt>
            {stats.top_cars_revenue.length === 0
              ? <Txt T={T} size={12} color={T.ink3}>Ancora nessun fatturato</Txt>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.top_cars_revenue.map(c => (
                    <HorizontalBar key={c.car_id} T={T}
                      label={c.name} value={c.revenue} max={maxRevenue} color="success"
                      thumb={<MiniThumb T={T} variant={c.variant} tone={c.tone} />}
                      sub={`${c.bookings_count} prenotazioni`} />
                  ))}
                </div>}
          </div>
        </div>
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 14, lineHeight: 1.5 }}>
          ⓘ <strong>Fatturato indicativo</strong>: MoviQ non incassa direttamente. Il valore è la somma dei totali delle prenotazioni confermate/completate dei tuoi veicoli.
        </Txt>
      </Section>

      {/* ============ ANDAMENTO MENSILE ============ */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr', gap: 18, marginBottom: 18 }}>
        <Section T={T} title="Prenotazioni mese per mese" hint="Ultimi 12 mesi delle tue richieste ricevute.">
          {monthly.length === 0
            ? <Txt T={T} size={13} color={T.ink3}>Non ci sono ancora dati storici.</Txt>
            : <VBars T={T} items={monthly} getLabel={(m) => fmtMonth(m.month)} getValue={(m) => m.count} height={120} color="accent" />}
        </Section>

        <Section T={T} title="Giorno della settimana" hint="Quando ritirano di più.">
          {fullWeekday.every(w => w.count === 0)
            ? <Txt T={T} size={13} color={T.ink3}>Nessun dato.</Txt>
            : <VBars T={T} items={fullWeekday} getLabel={(w) => WEEKDAYS[w.weekday]} getValue={(w) => w.count} height={120} color="success" />}
        </Section>
      </div>

      {/* ============ MERCATO ============ */}
      <div style={{
        background: T.ink1, color: '#fff', padding: '24px 24px 6px', borderRadius: 18, marginTop: 32, marginBottom: 18,
      }}>
        <H T={T} size="h3" style={{ color: '#fff' }}>📊 Benchmark del mercato</H>
        <Txt T={T} size={13} color="rgba(255,255,255,0.7)" style={{ display: 'block', marginTop: 4, marginBottom: 14 }}>
          Dati aggregati di tutti i noleggiatori della piattaforma — usa questi numeri per posizionare i tuoi prezzi e capire cosa va per la maggiore.
        </Txt>
      </div>

      <Section T={T} title="Modelli più richiesti" hint="Le auto che gli utenti scelgono di più sull'intera piattaforma negli ultimi 12 mesi.">
        {market.top_models.length === 0
          ? <Txt T={T} size={13} color={T.ink3}>Non ci sono ancora prenotazioni sul marketplace.</Txt>
          : <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr', gap: 12 }}>
              {market.top_models.slice(0, 10).map((m, i) => (
                <div key={m.model_key} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  background: T.surfaceAlt, borderRadius: 10,
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', background: i < 3 ? T.accent : T.surface,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 13, color: T.ink1,
                  }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <Txt T={T} size={14} weight={600} style={{ display: 'block' }}>{m.brand} {m.model}</Txt>
                    <Txt T={T} size={11} color={T.ink2}>{m.bookings} prenotazioni · prezzo medio {m.avg_price}€/g</Txt>
                  </div>
                </div>
              ))}
            </div>}
      </Section>

      <Section T={T} title="Prezzi medi per segmento" hint="Quanto chiedono in media gli altri noleggiatori per ogni tipologia di auto.">
        {market.avg_price_segment.length === 0
          ? <Txt T={T} size={13} color={T.ink3}>Nessun dato di mercato.</Txt>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {market.avg_price_segment.map(s => (
                <div key={s.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <Txt T={T} size={13} weight={600}>{CATEGORY_LABEL[s.category] || s.category}</Txt>
                    <Txt T={T} size={11} color={T.ink2}>{s.cars_count} auto attive</Txt>
                  </div>
                  <div style={{ position: 'relative', height: 36, background: T.surfaceAlt, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', left: `${(s.min_price / maxSegPrice) * 100}%`,
                      right: `${100 - (s.max_price / maxSegPrice) * 100}%`,
                      top: 0, bottom: 0, background: T.accentSoft,
                    }} />
                    <div style={{
                      position: 'absolute', left: `${(s.avg_price / maxSegPrice) * 100}%`,
                      top: 4, bottom: 4, width: 3, background: T.ink1,
                      transform: 'translateX(-50%)',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                      padding: '0 12px', justifyContent: 'space-between',
                    }}>
                      <Txt T={T} size={11} weight={600} color={T.ink2}>min {s.min_price}€</Txt>
                      <Txt T={T} size={13} weight={700} style={{ fontFamily: T.fontDisplay }}>media {s.avg_price}€</Txt>
                      <Txt T={T} size={11} weight={600} color={T.ink2}>max {s.max_price}€</Txt>
                    </div>
                  </div>
                </div>
              ))}
            </div>}
      </Section>

      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr', gap: 18 }}>
        <Section T={T} title="Periodi di alta richiesta" hint="Domanda mensile totale sulla piattaforma — pianifica disponibilità e prezzi.">
          {mktMonthly.length === 0
            ? <Txt T={T} size={13} color={T.ink3}>Nessun dato.</Txt>
            : <VBars T={T} items={mktMonthly} getLabel={(m) => fmtMonth(m.month)} getValue={(m) => m.count} height={140} color="accent" />}
        </Section>

        <Section T={T} title="Ritiri per giorno" hint="Quale giorno della settimana è più richiesto.">
          {fullMktWeekday.every(w => w.count === 0)
            ? <Txt T={T} size={13} color={T.ink3}>Nessun dato.</Txt>
            : <VBars T={T} items={fullMktWeekday} getLabel={(w) => WEEKDAYS[w.weekday]} getValue={(w) => w.count} height={140} />}
        </Section>
      </div>

      <Section T={T} title="Top marchi" hint="Le marche più richieste sull'intera piattaforma — dove si concentra la domanda.">
        {market.top_brands.length === 0
          ? <Txt T={T} size={13} color={T.ink3}>Nessun dato.</Txt>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {market.top_brands.map((b, i) => (
                <div key={b.brand} style={{
                  padding: '8px 12px', background: i < 3 ? T.accent : T.surfaceAlt,
                  borderRadius: 999, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Txt T={T} size={13} weight={700}>{b.brand}</Txt>
                  <Txt T={T} size={11} color={T.ink2}>{b.bookings} · {b.avg_price}€/g</Txt>
                </div>
              ))}
            </div>}
      </Section>
    </div>
  );
}
