const MONTHS_SHORT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const MONTHS_LONG = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

export function formatDates(from, to) {
  if (!from || !to) return '';
  if (from.m === to.m) return `${from.d} — ${to.d} ${MONTHS_SHORT[from.m]}`;
  return `${from.d} ${MONTHS_SHORT[from.m]} — ${to.d} ${MONTHS_SHORT[to.m]}`;
}

export function daysBetween(a, b) {
  if (!a || !b) return 0;
  if (a.m === b.m) return Math.max(1, b.d - a.d);
  return Math.max(1, (b.m - a.m) * 30 + b.d - a.d);
}

export function monthName(m, long = false) {
  return (long ? MONTHS_LONG : MONTHS_SHORT)[m];
}

export function dateToParam(d) {
  if (!d) return null;
  return `${d.d}-${d.m}`;
}

export function paramToDate(s) {
  if (!s) return null;
  const [d, m] = s.split('-').map(n => parseInt(n, 10));
  if (Number.isNaN(d) || Number.isNaN(m)) return null;
  return { d, m };
}
