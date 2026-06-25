import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { paramToDate, dateToParam } from '../utils/dates.js';
import { useAuth } from './AuthContext.jsx';
import { listSavedCarIds, addSavedCar, removeSavedCar } from '../services/saved.js';

const SearchCtx = createContext(null);

const SAVED_KEY = 'moviq.saved.v1';
const FILTERS_KEY = 'moviq.filters.v1';
const BOOKING_KEY = 'moviq.booking.v1';
const SEARCH_KEY = 'moviq.search.v1';

function readSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function writeSet(key, s) {
  try { localStorage.setItem(key, JSON.stringify([...s])); } catch {}
}
function readJSON(key, fallback, storage = localStorage) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.fuels) parsed.fuels = new Set(parsed.fuels);
    return parsed;
  } catch { return fallback; }
}
function writeJSON(key, val, storage = localStorage) {
  try {
    const out = { ...val };
    if (out.fuels instanceof Set) out.fuels = [...out.fuels];
    storage.setItem(key, JSON.stringify(out));
  } catch {}
}

function initialSearch(params) {
  const stored = readJSON(SEARCH_KEY, null);
  const fromUrl = {
    location: params.get('dove') || null,
    from: paramToDate(params.get('da')),
    to: paramToDate(params.get('a')),
    category: params.get('cat') || null,
    timeFrom: params.get('hda') || null,
    timeTo: params.get('ha') || null,
  };
  const hasUrlValues = fromUrl.location || fromUrl.from || fromUrl.to || fromUrl.category;
  if (hasUrlValues) return { ...fromUrl, timeFrom: fromUrl.timeFrom || '10:00', timeTo: fromUrl.timeTo || '18:00' };
  if (stored) return {
    ...stored,
    from: stored.from || null,
    to: stored.to || null,
    timeFrom: stored.timeFrom || '10:00',
    timeTo: stored.timeTo || '18:00',
  };
  return { location: null, from: null, to: null, category: null, timeFrom: '10:00', timeTo: '18:00' };
}

export function SearchProvider({ children }) {
  const [params, setParams] = useSearchParams();

  const [search, setSearchState] = useState(() => initialSearch(params));

  // Persist search state across reloads AND new tabs.
  // localStorage (not sessionStorage) so the magic-link return — which opens
  // a new tab — can recover the same date/booking selection.
  useEffect(() => {
    try { localStorage.setItem(SEARCH_KEY, JSON.stringify(search)); } catch {}
  }, [search]);

  const updateSearch = (patch) => {
    setSearchState(prev => {
      const next = { ...prev };
      if ('location' in patch) next.location = patch.location || null;
      if ('from' in patch) next.from = patch.from || null;
      if ('to' in patch) next.to = patch.to || null;
      if ('category' in patch) next.category = patch.category || null;
      if ('timeFrom' in patch) next.timeFrom = patch.timeFrom || '10:00';
      if ('timeTo' in patch) next.timeTo = patch.timeTo || '18:00';
      return next;
    });
  };

  // One-way sync: when search changes and we're on a /cerca route, mirror to URL
  // so deep-link / share works. We only write — never read back into state.
  const syncToUrl = () => {
    const next = new URLSearchParams();
    if (search.location) next.set('dove', search.location);
    const fromV = dateToParam(search.from); if (fromV) next.set('da', fromV);
    const toV = dateToParam(search.to); if (toV) next.set('a', toV);
    if (search.category) next.set('cat', search.category);
    setParams(next, { replace: true });
  };

  const [filters, setFiltersState] = useState(() => readJSON(FILTERS_KEY, { priceMax: 100, fuels: new Set(), transmission: 'all', brandId: null }));
  const setFilters = (next) => {
    setFiltersState(next);
    writeJSON(FILTERS_KEY, next);
  };

  const { user } = useAuth();
  const [saved, setSavedState] = useState(() => readSet(SAVED_KEY));

  // Hydrate saved set from server when user logs in (and push local-only items up)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listSavedCarIds(user.id).then(async (remoteIds) => {
      if (cancelled) return;
      const local = readSet(SAVED_KEY);
      const remote = new Set(remoteIds);
      const union = new Set([...local, ...remote]);
      // Push local-only items to server (one-time merge on first login)
      const onlyLocal = [...local].filter(id => !remote.has(id));
      for (const id of onlyLocal) {
        try { await addSavedCar(user.id, id); } catch {}
      }
      setSavedState(union);
      writeSet(SAVED_KEY, union);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const toggleSaved = (id) => {
    setSavedState(prev => {
      const next = new Set(prev);
      const hadIt = next.has(id);
      if (hadIt) next.delete(id); else next.add(id);
      writeSet(SAVED_KEY, next);
      if (user) {
        (hadIt ? removeSavedCar(user.id, id) : addSavedCar(user.id, id)).catch(() => {});
      }
      return next;
    });
  };

  const [booking, setBookingState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BOOKING_KEY)) || null; } catch { return null; }
  });
  const setBooking = (b) => {
    setBookingState(b);
    try {
      if (b) localStorage.setItem(BOOKING_KEY, JSON.stringify(b));
      else localStorage.removeItem(BOOKING_KEY);
    } catch {}
  };

  const value = {
    search, updateSearch, syncToUrl,
    filters, setFilters,
    saved, toggleSaved,
    booking, setBooking,
  };
  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchCtx);
  if (!ctx) throw new Error('useSearch outside provider');
  return ctx;
}
