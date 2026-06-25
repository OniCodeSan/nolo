import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, CarRender } from './icons.jsx';
import { Txt } from './ui.jsx';
import { cldUrl, cldSrcSet } from '../lib/cloudinary.js';

export function Lightbox({ T, open, onClose, photos, initialIndex = 0 }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => { if (open) setIdx(initialIndex); }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, photos.length, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('gallery.title')}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(8,5,2,0.92)', zIndex: 300,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', color: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <Txt T={T} size={13} weight={500} style={{ color: 'rgba(255,255,255,0.7)' }}>{idx + 1} / {photos.length}</Txt>
        <button onClick={onClose} aria-label={t('gallery.close')} style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.12)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={20} color="#fff" T={T} />
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 20px', position: 'relative',
        }}
      >
        <button
          aria-label={t('gallery.prev')}
          onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); }}
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.12)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="chevronLeft" size={22} color="#fff" T={T} />
        </button>

        <div style={{ width: '100%', maxWidth: 1100, maxHeight: '80vh', aspectRatio: '1.5 / 1', background: 'rgba(255,255,255,0.04)', borderRadius: T.r.lg, overflow: 'hidden' }}>
          {photos[idx].kind === 'image' ? (
            <img
              src={cldUrl(photos[idx].publicId, { w: 1600 }) || photos[idx].url}
              srcSet={cldSrcSet(photos[idx].publicId, [800, 1200, 1600, 2000])}
              sizes="(max-width: 1100px) 100vw, 1100px"
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <CarRender T={T} variant={photos[idx].variant} tone={photos[idx].tone} label={photos[idx].label} />
          )}
        </div>

        <button
          aria-label={t('gallery.next')}
          onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); }}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.12)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="chevron" size={22} color="#fff" T={T} />
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '14px 20px 24px' }}>
        {photos.map((_, i) => (
          <button
            key={i}
            aria-label={t('vehicle.open_photo_n', { n: i + 1 })}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 28 : 10, height: 6, borderRadius: 3,
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'width 180ms, background 180ms',
            }}
          />
        ))}
      </div>
    </div>
  );
}
