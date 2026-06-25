import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Milano centro come default (usato se non viene passato `center` esplicito).
const DEFAULT_CENTER = [45.4642, 9.19];
const DEFAULT_ZOOM = 12;
const USER_ZOOM = 11;  // un po' più largo quando partiamo dall'utente, così vede contesto

// Range geografico Italia: lat 35–48, lng 6–19 (incluse isole).
function isValidItalyCoord(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng)
      && lat >= 35 && lat <= 48 && lng >= 6 && lng <= 19;
}

// Genera coordinate stabili da car.id pseudorandom centrate su Milano (fallback)
function coordsFor(carId) {
  let h = 0;
  for (let i = 0; i < carId.length; i++) h = ((h << 5) - h) + carId.charCodeAt(i);
  // dispersione +/- 0.04° (~4 km) attorno al centro Milano
  const dx = (((h >> 0) % 1000) / 1000 - 0.5) * 0.08;
  const dy = (((h >> 10) % 1000) / 1000 - 0.5) * 0.08;
  return [DEFAULT_CENTER[0] + dy, DEFAULT_CENTER[1] + dx];
}

// Estrae [lat, lng] dall'auto: usa car.coords se valido (range Italia), altrimenti hash su Milano.
function carLatLng(car) {
  const c = car?.coords;
  if (Array.isArray(c) && c.length >= 2) {
    const lat = Number(c[0]);
    const lng = Number(c[1]);
    if (isValidItalyCoord(lat, lng)) return [lat, lng];
  }
  return coordsFor(car.id);
}

function priceMarker(T, price, active) {
  const bg     = active ? T.ink1 : '#ffffff';
  const fg     = active ? '#ffffff' : T.ink1;
  const border = active ? T.ink1 : 'rgba(0,0,0,0.14)';
  const label  = `${price}€`;
  // Sizing in base alla lunghezza testo (es. "9€", "95€", "1.200€")
  const padH   = active ? 12 : 10;
  const charW  = active ? 8.2 : 7.4;
  const width  = Math.round(label.length * charW + padH * 2);
  const height = active ? 30 : 26;
  const tail   = 6;
  const fontSz = active ? 13 : 12;
  const html = `
    <div style="
      position:relative;
      width:${width}px; height:${height}px;
      background:${bg}; color:${fg};
      border:1.5px solid ${border};
      border-radius:999px;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;
      font-weight:700; font-size:${fontSz}px;
      line-height:${height - 4}px;
      text-align:center;
      box-shadow:0 6px 14px rgba(0,0,0,0.18),0 2px 4px rgba(0,0,0,0.08);
      box-sizing:border-box;
      white-space:nowrap;
      letter-spacing:-0.01em;
    ">
      ${label}
      <span style="
        position:absolute; left:50%; bottom:-${tail - 1}px;
        width:${tail}px; height:${tail}px;
        background:${bg};
        border-right:1.5px solid ${border};
        border-bottom:1.5px solid ${border};
        transform:translateX(-50%) rotate(45deg);
      "></span>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'moviq-price-pin',
    iconSize:   [width, height + tail],
    iconAnchor: [width / 2, height + tail], // tip della codina sul punto
  });
}

export function LeafletMap({ T, cars, activeId, onPinClick, onActivePinPosition, center, style = {} }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Mount once. Centro iniziale = user location se fornita, altrimenti Milano.
  useEffect(() => {
    if (mapRef.current) return;
    const initialCenter = (center && center.lat && center.lng) ? [center.lat, center.lng] : DEFAULT_CENTER;
    const initialZoom = (center && center.lat && center.lng) ? USER_ZOOM : DEFAULT_ZOOM;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(initialCenter, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Coords memoized
  const carCoords = useMemo(
    () => cars.map(c => {
      const [lat, lng] = carLatLng(c);
      return { id: c.id, lat, lng, price: c.pricePerDay };
    }),
    [cars]
  );

  // (A) Render/refresh markers: si triggera anche quando cambia activeId
  // (serve per rifare l'icona del pin attivo in nero). NON tocca la viewport.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    carCoords.forEach(c => {
      const marker = L.marker([c.lat, c.lng], {
        icon: priceMarker(T, c.price, c.id === activeId),
        keyboard: false,
        riseOnHover: true,
        zIndexOffset: c.id === activeId ? 1000 : 0,
      });
      marker.on('click', () => onPinClick?.(c.id));
      marker.addTo(layer);
    });
  }, [carCoords, activeId, T, onPinClick]);

  // (B) Viewport: fitBounds SOLO quando cambia la lista cars o la user location.
  // Stacco activeId dalle deps così cliccare un pin non re-zoomma la mappa.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (carCoords.length > 0) {
      const bounds = L.latLngBounds(carCoords.map(c => [c.lat, c.lng]));
      if (center && center.lat && center.lng) bounds.extend([center.lat, center.lng]);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    } else if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], USER_ZOOM);
    }
  }, [carCoords, center?.lat, center?.lng]);

  // Marker "Sei qui" per la user location (se fornita).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (center && center.lat && center.lng) {
      const youAreHere = L.divIcon({
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:${T.ink1};border:3px solid #fff;
          box-shadow:0 0 0 1px rgba(0,0,0,0.2),0 4px 12px rgba(0,0,0,0.25);
        "></div>`,
        className: '', iconSize: [16, 16], iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([center.lat, center.lng], { icon: youAreHere, interactive: false, keyboard: false }).addTo(map);
    }
  }, [center?.lat, center?.lng, T]);

  // Emette al parent la posizione in pixel del pin attivo (ancorata al tip della codina).
  // Si aggiorna a ogni move/zoom/resize così la card segue il pin se l'utente trascina la mappa.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onActivePinPosition) return;
    if (!activeId) { onActivePinPosition(null); return; }
    const active = carCoords.find(c => c.id === activeId);
    if (!active) { onActivePinPosition(null); return; }

    const emit = () => {
      const pt = map.latLngToContainerPoint([active.lat, active.lng]);
      onActivePinPosition({ x: pt.x, y: pt.y });
    };
    emit();
    map.on('move zoom zoomanim resize', emit);
    return () => {
      map.off('move zoom zoomanim resize', emit);
    };
  }, [activeId, carCoords, onActivePinPosition]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 300, ...style }} aria-label={t('map.cars_map')} role="application" />;
}
