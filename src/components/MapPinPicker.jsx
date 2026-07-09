import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Txt } from './ui.jsx';

const ITALY_CENTER = [41.9, 12.5];

const pinIcon = L.divIcon({
  className: 'moviq-pin-picker',
  html: '<div style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

// Mappa con pin TRASCINABILE: l'host posiziona il punto esatto di consegna.
// Indipendente dalla copertura del geocoder (vie non mappate, cortili, campagne).
// coords: [lat,lng] | null — onChange([lat,lng]) a ogni spostamento del pin.
export function MapPinPicker({ T, coords, onChange, height = 220 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Init mappa una sola volta.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const hasCoords = Array.isArray(coords) && coords.length >= 2;
    const start = hasCoords ? coords : ITALY_CENTER;

    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false })
      .setView(start, hasCoords ? 16 : 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    const marker = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map);
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      onChangeRef.current?.([p.lat, p.lng]);
    });
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onChangeRef.current?.([e.latlng.lat, e.latlng.lng]);
    });

    mapRef.current = map;
    markerRef.current = marker;
    const t = setTimeout(() => map.invalidateSize(), 120);
    return () => { clearTimeout(t); map.remove(); mapRef.current = null; markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coordinate cambiate dall'esterno (es. scelta dall'autocomplete) → ricentra.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (!Array.isArray(coords) || coords.length < 2) return;
    markerRef.current.setLatLng(coords);
    mapRef.current.setView(coords, 16);
  }, [coords?.[0], coords?.[1]]);

  return (
    <div>
      {/* position+z-index creano uno stacking context: i controlli zoom di
          Leaflet (z-index 1000) restano confinati sotto le tendine dei campi. */}
      <div ref={containerRef} style={{
        height, width: '100%', borderRadius: 10, overflow: 'hidden',
        border: `1px solid ${T.line}`, background: T.surfaceAlt,
        position: 'relative', zIndex: 0, isolation: 'isolate',
      }} />
      <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 5, lineHeight: 1.4 }}>
        Trascina il pin (o clicca sulla mappa) sul <strong>punto esatto</strong> dove consegni l'auto.
      </Txt>
    </div>
  );
}
