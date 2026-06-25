import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useSearch } from '../state/SearchContext.jsx';
import { Icon, CarRender } from '../components/icons.jsx';
import { Button, H, Txt, Rating, Avatar, Badge, Price } from '../components/ui.jsx';
import { Lightbox } from '../components/Lightbox.jsx';
import { HostPoliciesBlock } from '../components/HostPolicies.jsx';
import { ReviewsSheet } from '../components/ReviewsSheet.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { getCar, getHost } from '../services/cars.js';
import { listReviews } from '../services/catalog.js';
import { daysBetween, formatDates, monthName } from '../utils/dates.js';
import { useToast } from '../state/ToastContext.jsx';
import { VehicleSkeleton } from '../components/Skeleton.jsx';
import { logCarView } from '../services/stats.js';
import { events as analyticsEvents } from '../lib/analytics.js';
import { cldUrl, cldSrcSet } from '../lib/cloudinary.js';
import { ReportModal } from '../components/ReportModal.jsx';
import { useSeo, vehicleJsonLd } from '../lib/seo.js';

function carPhotos(car) {
  if (Array.isArray(car.images) && car.images.length > 0) {
    return car.images.map((img, i) => ({
      kind: 'image',
      publicId: img.public_id,
      url: img.url,
      label: i === 0 ? null : `foto ${i + 1}`,
    }));
  }
  // Nessuna foto reale: un solo placeholder illustrato (niente finto "1/5"
  // con 5 immagini identiche, che dava un'impressione fuorviante).
  return [
    { kind: 'render', variant: car.variant, tone: 'colored', placeholder: true },
  ];
}

// Renderer per una singola "foto": immagine Cloudinary o CarRender illustrato.
function PhotoTile({ T, photo, alt = '' }) {
  if (photo.kind === 'image') {
    const src = cldUrl(photo.publicId, { w: 1200 }) || photo.url;
    const srcSet = cldSrcSet(photo.publicId);
    return (
      <img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 768px) 100vw, 50vw"
        alt={alt}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return <CarRender T={T} variant={photo.variant} tone={photo.tone} label={photo.label} />;
}

function shareCar(car, toast, t) {
  const url = window.location.origin + `/auto/${car.id}`;
  const title = `${car.brand} ${car.model} su MoviQ`;
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(
      () => toast?.success(t('vehicle.link_copied')),
      () => toast?.error(t('vehicle.link_copy_failed'))
    );
  }
}


function VehicleDesktop({ T, car, host, reviews, search, saved, toggleSaved, toast, onBook, onSearchDate, onBack, onListing, onOpenGallery, onOpenReviews, onReport }) {
  const { t } = useTranslation();
  const days = daysBetween(search.from, search.to);
  const hasDates = Boolean(search.from && search.to);
  const subtotal = car.pricePerDay * days;
  const deposit = 200;
  const total = subtotal + deposit;

  const breadcrumbBtnStyle = {
    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
    fontFamily: T.fontBody, fontSize: 12, color: T.ink2,
  };

  return (
    <div style={{ flex: 1, background: T.bg, overflow: 'auto' }}>
      <div style={{ padding: '12px 40px 0', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={breadcrumbBtnStyle}>{t('nav.explore')}</button>
          <span style={{ color: T.ink3 }}>›</span>
          <button onClick={onListing} style={breadcrumbBtnStyle}>{host.city}</button>
          <span style={{ color: T.ink3 }}>›</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.ink1, fontWeight: 500, whiteSpace: 'nowrap' }}>{car.brand} {car.model} · {car.year}</span>
        </nav>
      </div>

      <div style={{
        padding: '12px 40px 40px', maxWidth: 1280, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, width: '100%',
      }}>
        <div>
          {(() => {
            const photos = carPhotos(car);
            // Una sola foto (o placeholder illustrato): niente griglia a 3 colonne
            // mezza vuota, ma un singolo tile a tutta larghezza.
            if (photos.length === 1) {
              return (
                <div style={{ position: 'relative', height: 380, borderRadius: T.r.lg, overflow: 'hidden', border: `1px solid ${T.line}` }}>
                  <button onClick={() => onOpenGallery(0)} aria-label={t('vehicle.open_photo')} style={{ width: '100%', height: '100%', border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }}>
                    <PhotoTile T={T} photo={photos[0]} alt={`${car.brand} ${car.model}`} />
                  </button>
                  {photos[0]?.placeholder && (
                    <span style={{ position: 'absolute', top: 14, left: 14, padding: '8px 14px', background: 'rgba(255,255,255,0.92)', borderRadius: T.r.pill, fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.ink1 }}>
                      {t('vehicle.no_photos')}
                    </span>
                  )}
                </div>
              );
            }
            return (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 6, height: 380, borderRadius: T.r.lg, overflow: 'hidden', border: `1px solid ${T.line}` }}>
              <div style={{ gridRow: 'span 2', position: 'relative' }}>
                <button onClick={() => onOpenGallery(0)} aria-label={t('vehicle.open_main_photo')} style={{
                  width: '100%', height: '100%', border: 'none', cursor: 'pointer', padding: 0, background: 'transparent',
                  position: 'absolute', inset: 0,
                }}>
                  <PhotoTile T={T} photo={photos[0]} alt={`${car.brand} ${car.model}`} />
                </button>
                <button
                  onClick={() => onOpenGallery(0)}
                  aria-label={t('vehicle.open_gallery_count', { count: photos.length })}
                  style={{
                    position: 'absolute', top: 14, left: 14, border: 'none', cursor: 'pointer',
                    padding: '8px 14px', background: 'rgba(255,255,255,0.92)', borderRadius: T.r.pill,
                    fontFamily: T.fontBody, fontSize: 13, fontWeight: 600, color: T.ink1,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Icon name="grid" size={14} T={T} /> {t('vehicle.photos_count', { count: photos.length })}
                </button>
              </div>
              {[1, 2, 3].map(i => photos[i] && (
                <button key={i} onClick={() => onOpenGallery(i)} aria-label={t('vehicle.open_photo_n', { n: i + 1 })} style={{ border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }}>
                  <PhotoTile T={T} photo={photos[i]} alt="" />
                </button>
              ))}
              {photos[4] && (
                <button onClick={() => onOpenGallery(4)} aria-label={t('vehicle.open_gallery_more', { count: photos.length - 3 })} style={{ position: 'relative', border: 'none', cursor: 'pointer', padding: 0, background: 'transparent' }}>
                  <PhotoTile T={T} photo={photos[4]} alt="" />
                  {photos.length > 5 && (
                    <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,5,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 600 }}>
                      +{photos.length - 5}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 22, gap: 20 }}>
            <div>
              <H T={T} size="h1" style={{ lineHeight: 1 }}>
                <span style={{ whiteSpace: 'nowrap' }}>{car.brand} {car.model}</span>
                <span style={{ color: T.ink2, fontWeight: 500 }}> · {car.year}</span>
              </H>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                <Rating T={T} value={host.rating} count={host.reviews} size={13} />
                <Txt T={T} size={13} color={T.ink2} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="pin" size={13} color={T.ink2} T={T} /> {host.city}
                </Txt>
                <Badge T={T} tone="success" icon="check">{t('home.available_now')}</Badge>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button T={T} variant="ghost" size="sm" icon="share" onClick={() => shareCar(car, toast, t)} aria-label={t('vehicle.share_aria')}>{t('vehicle.share')}</Button>
              <Button T={T} variant="ghost" size="sm" icon={saved.has(car.id) ? 'heartFill' : 'heart'} onClick={() => toggleSaved(car.id)} aria-label={saved.has(car.id) ? t('saved.remove_aria') : t('home.save_aria')}>
                {saved.has(car.id) ? t('vehicle.saved_label') : t('vehicle.save_label')}
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
            {[
              { i: 'fuel', l: car.engine, s: car.fuel },
              { i: 'transmission', l: car.transmission, s: car.transmission === 'Manuale' ? `6 ${t('vehicle.gears')}` : t('vehicle.auto_gearbox') },
              { i: 'seat', l: `${car.seats} ${t('vehicle.seats')}`, s: `${car.doors} ${t('vehicle.doors')}` },
              { i: 'gauge', l: `${car.km} km`, s: car.range ? `${car.range} ${t('vehicle.range_suffix')}` : t('vehicle.recent_service') },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 16, background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: T.r.md, display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <Icon name={s.i} size={22} color={T.ink1} T={T} />
                <Txt T={T} size={15} weight={600} style={{ marginTop: 6 }}>{s.l}</Txt>
                <Txt T={T} size={12} color={T.ink2}>{s.s}</Txt>
              </div>
            ))}
          </div>

          <H T={T} size="h3" style={{ marginTop: 30 }}>{t('vehicle.description')}</H>
          <Txt T={T} size={14} color={T.ink2} style={{ display: 'block', marginTop: 10, lineHeight: 1.65 }}>
            {car.description}
          </Txt>

          <H T={T} size="h3" style={{ marginTop: 30 }}>{t('vehicle.accessories_title')}</H>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
            {car.accessories.slice(0, 9).map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="check" size={16} color={T.ok} T={T} />
                <Txt T={T} size={14}>{a}</Txt>
              </div>
            ))}
          </div>
          {car.accessories.length > 9 && (
            <Button T={T} variant="outline" size="sm" iconRight="chevronDown" style={{ marginTop: 14 }}>
              {t('vehicle.show_all_accessories', { count: car.accessories.length })}
            </Button>
          )}

          <H T={T} size="h3" style={{ marginTop: 36 }}>{t('vehicle.the_host')}</H>
          <div style={{ marginTop: 14, padding: 18, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 16, boxShadow: T.sh.soft }}>
            <Avatar T={T} name={host.n} size={64} tone={host.id === 'greencar' ? 'accent' : undefined} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Txt T={T} size={17} weight={600}>{host.n}</Txt>
                {host.verified && <Badge T={T} tone="success" icon="check">{t('vehicle.verified')}</Badge>}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                <Rating T={T} value={host.rating} count={host.reviews} size={12} />
                <Txt T={T} size={12} color={T.ink2}>{t('vehicle.responds', { time: host.responseTime })}</Txt>
                <Txt T={T} size={12} color={T.ink2}>{t('vehicle.renting_since', { since: host.since })}</Txt>
              </div>
            </div>
            <Button T={T} variant="outline" size="sm" icon="chat" onClick={() => toast.info(t('vehicle.chat_after_request'), { duration: 4500 })}>{t('vehicle.write')}</Button>
          </div>

          <HostPoliciesBlock T={T} host={host} title={t('confirmation.terms_of', { host: host.n })} />

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onReport} style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: T.fontBody, fontSize: 12, color: T.ink3,
              textDecoration: 'underline', padding: 4,
            }} aria-label={t('vehicle.report')}>
              {t('vehicle.report')}
            </button>
          </div>

          {reviews.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 36 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <H T={T} size="h3">{t('vehicle.reviews')}</H>
                  <Rating T={T} value={host.rating} count={host.reviews} />
                </div>
                <Button T={T} variant="ghost" size="sm" iconRight="chevron" onClick={onOpenReviews}>{t('home.see_all')}</Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                {reviews.slice(0, 2).map((r, i) => (
                  <div key={i} style={{ padding: 16, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, boxShadow: T.sh.soft }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar T={T} name={r.avatar} size={36} />
                      <div style={{ flex: 1 }}>
                        <Txt T={T} size={13} weight={600} style={{ display: 'block' }}>{r.n}</Txt>
                        <Txt T={T} size={11} color={T.ink2}>{r.date}</Txt>
                      </div>
                      <Rating T={T} value={r.stars} size={12} />
                    </div>
                    <Txt T={T} size={13} color={T.ink1} style={{ display: 'block', marginTop: 10, lineHeight: 1.55 }}>{r.text}</Txt>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <div style={{
            position: 'sticky', top: 90,
            background: T.surface, border: `1px solid ${T.line}`,
            borderRadius: T.r.lg, padding: 22,
            boxShadow: T.sh.raised,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Price T={T} value={car.pricePerDay} unit={t('common.per_day')} size="xl" weight={600} />
              <Badge T={T} tone="success" icon="bolt">{t('vehicle.quick_confirm')}</Badge>
            </div>
            {car.pricePerMonth && (
              <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 2 }}>
                {t('vehicle.or')} <strong style={{ color: T.ink1 }}>{car.pricePerMonth}€{t('home.per_month')}</strong>
              </Txt>
            )}
            <div style={{ height: 1, background: T.line, margin: '20px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${T.line}`, borderRadius: T.r.md, overflow: 'hidden', cursor: 'pointer' }} onClick={onSearchDate}>
              <div style={{ padding: '10px 12px', borderRight: `1px solid ${T.line}` }}>
                <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{t('home.pickup')}</Txt>
                <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 2 }}>
                  {search.from ? `${search.from.d} ${monthName(search.from.m)}` : t('vehicle.choose')}
                </Txt>
                <Txt T={T} size={12} color={T.ink2}>{search.timeFrom || '10:00'}</Txt>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{t('home.return')}</Txt>
                <Txt T={T} size={13} weight={600} style={{ display: 'block', marginTop: 2 }}>
                  {search.to ? `${search.to.d} ${monthName(search.to.m)}` : t('vehicle.choose')}
                </Txt>
                <Txt T={T} size={12} color={T.ink2}>{search.timeTo || '18:00'}</Txt>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '12px 14px', background: T.surfaceAlt, borderRadius: T.r.md }}>
              <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{t('booking_form.pickup_at_label')}</Txt>
              <Txt T={T} size={13} weight={500} style={{ display: 'block', marginTop: 4 }}>
                <Icon name="pin" size={12} color={T.ink2} T={T} /> {[car.pickupLocation, car.city].filter(Boolean).join(' · ') || car.city || '—'}
              </Txt>
            </div>
            {search.from && search.to && (
              <>
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Txt T={T} size={13} color={T.ink2}>{car.pricePerDay}€ × {t('bookings.days', { count: days })}</Txt>
                    <Txt T={T} size={13}>{subtotal}€</Txt>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Txt T={T} size={13} color={T.ink2}>{t('vehicle.deposit_refunded')}</Txt>
                    <Txt T={T} size={13}>{deposit}€</Txt>
                  </div>
                </div>
                <div style={{ height: 1, background: T.line, margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Txt T={T} size={15} weight={600}>{t('confirmation.total')}</Txt>
                  <Price T={T} value={total} unit="" size="lg" weight={600} />
                </div>
              </>
            )}
            <Button T={T} variant="accent" size="lg" full iconRight="arrowRight" style={{ marginTop: 18 }} onClick={onBook}>
              {search.from && search.to ? t('vehicle.request_booking') : t('booking_form.cta_choose_dates')}
            </Button>
            <Button T={T} variant="outline" size="md" full icon="chat" style={{ marginTop: 8 }} onClick={() => toast.info(t('vehicle.chat_after_request'), { duration: 4500 })}>{t('vehicle.contact', { host: host.n })}</Button>
            <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>
              {t('vehicle.no_charge_note')}
            </Txt>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleMobile({ T, car, host, reviews, search, saved, toggleSaved, toast, onBook, onBack, onOpenGallery, onReport }) {
  const { t } = useTranslation();
  const [photoIdx, setPhotoIdx] = useState(0);
  const days = daysBetween(search.from, search.to);
  const total = car.pricePerDay * days;

  const photos = carPhotos(car);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: T.bg }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative', height: 250 }} onClick={() => onOpenGallery(photoIdx)} role="button" aria-label={t('vehicle.open_gallery')}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
            <div style={{ display: 'flex', transition: 'transform 350ms cubic-bezier(0.2, 0.8, 0.2, 1)', transform: `translateX(-${photoIdx * 100}%)`, width: '100%' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ minWidth: '100%', height: 250, flex: 'none' }}>
                  <PhotoTile T={T} photo={p} alt={`${car.brand} ${car.model}`} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} aria-label={t('vehicle.back_aria')} style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: T.sh.soft,
            }}>
              <Icon name="chevronLeft" size={18} color={T.ink1} T={T} />
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={(e) => { e.stopPropagation(); shareCar(car, toast, t); }} aria-label={t('vehicle.share')} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft }}>
                <Icon name="share" size={15} color={T.ink1} T={T} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleSaved(car.id); }} aria-label={saved.has(car.id) ? t('saved.remove_aria') : t('vehicle.save_label')} style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.sh.soft,
              }}>
                <Icon name={saved.has(car.id) ? 'heartFill' : 'heart'} size={15} color={saved.has(car.id) ? T.coral : T.ink1} T={T} />
              </button>
            </div>
          </div>

          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: '5px 12px', background: 'rgba(20,15,5,0.6)', borderRadius: T.r.pill, alignItems: 'center' }}>
              {photos.map((_, i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'background 200ms' }} />
              ))}
              <Txt T={T} size={11} color="#fff" weight={500} style={{ marginLeft: 6 }}>{photoIdx + 1}/{photos.length}</Txt>
            </div>
          )}

          {photos[photoIdx]?.placeholder && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', padding: '5px 12px', background: 'rgba(20,15,5,0.6)', borderRadius: T.r.pill }}>
              <Txt T={T} size={11} color="#fff" weight={500}>{t('vehicle.no_photos')}</Txt>
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setPhotoIdx((photoIdx + 1) % photos.length); }}
                style={{ position: 'absolute', right: 0, top: 50, bottom: 50, width: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label={t('vehicle.next_photo')} />
              <button onClick={(e) => { e.stopPropagation(); setPhotoIdx((photoIdx - 1 + photos.length) % photos.length); }}
                style={{ position: 'absolute', left: 0, top: 50, bottom: 50, width: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }} aria-label={t('vehicle.prev_photo')} />
            </>
          )}
        </div>

        <div style={{ padding: '20px 18px 8px' }}>
          <H T={T} size="h2" style={{ lineHeight: 1 }}>
            {car.brand} {car.model}<br/>
            <span style={{ color: T.ink2, fontWeight: 500 }}>{car.year}</span>
          </H>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <Rating T={T} value={host.rating} count={host.reviews} size={12} />
            <Txt T={T} size={11} color={T.ink2}>·</Txt>
            <Txt T={T} size={12} color={T.ink2}><Icon name="pin" size={12} color={T.ink2} T={T} /> {host.city}</Txt>
          </div>
          <div style={{ marginTop: 10 }}>
            <Badge T={T} tone="success" icon="check">{t('home.available_now')}</Badge>
          </div>
        </div>

        <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { i: 'fuel', l: car.fuel },
            { i: 'transmission', l: car.transmission },
            { i: 'seat', l: `${car.seats} ${t('vehicle.seats')}` },
            { i: 'gauge', l: car.km.split('.')[0] + 'k km' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '12px 6px', background: T.surface, border: `1px solid ${T.line}`,
              borderRadius: T.r.md, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <Icon name={s.i} size={18} color={T.ink1} T={T} />
              <Txt T={T} size={11} weight={600}>{s.l}</Txt>
            </div>
          ))}
        </div>

        <div style={{ padding: '6px 18px' }}>
          <div style={{ padding: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', gap: 12, boxShadow: T.sh.soft }}>
            <Avatar T={T} name={host.n} size={44} tone={host.id === 'greencar' ? 'accent' : undefined} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Txt T={T} size={14} weight={600}>{host.n}</Txt>
                {host.verified && <Icon name="check" size={12} color={T.ok} T={T} />}
              </div>
              <Txt T={T} size={11} color={T.ink2}>
                {Number(host.rating) > 0
                  ? `★ ${host.rating} · ${t('vehicle.rentals', { count: host.reviews })}`
                  : t('vehicle.new_on')}
                {host.responseTime ? ` · ${t('vehicle.responds_short', { time: host.responseTime })}` : ''}
              </Txt>
            </div>
            <Icon name="chat" size={18} color={T.ink1} T={T} />
          </div>
        </div>

        <div style={{ padding: '14px 18px 4px' }}>
          <H T={T} size="h5">{t('vehicle.description')}</H>
          <Txt T={T} size={13} color={T.ink2} style={{ display: 'block', marginTop: 6, lineHeight: 1.55 }}>
            {car.description}
          </Txt>
        </div>

        <div style={{ padding: '14px 18px 4px' }}>
          <H T={T} size="h5">{t('vehicle.accessories_short')} · {car.accessories.length}</H>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            {car.accessories.slice(0, 6).map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={14} color={T.ok} T={T} />
                <Txt T={T} size={12}>{a}</Txt>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 18px' }}>
          <HostPoliciesBlock T={T} host={host} title={t('confirmation.terms_of', { host: host.n })} />
        </div>

        <div style={{ padding: '14px 18px 24px' }}>
          <H T={T} size="h5">{t('vehicle.reviews')}</H>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviews.slice(0, 2).map((r, i) => (
              <div key={i} style={{ padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r.md }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar T={T} name={r.avatar} size={28} />
                  <div style={{ flex: 1 }}>
                    <Txt T={T} size={12} weight={600} style={{ display: 'block' }}>{r.n}</Txt>
                    <Txt T={T} size={10} color={T.ink2}>{r.date}</Txt>
                  </div>
                  <Rating T={T} value={r.stars} size={11} />
                </div>
                <Txt T={T} size={12} color={T.ink1} style={{ display: 'block', marginTop: 8, lineHeight: 1.5 }}>{r.text}</Txt>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        flex: 'none',
        background: T.bg, borderTop: `1px solid ${T.line}`,
        padding: '12px 16px max(20px, env(safe-area-inset-bottom))',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: T.sh.deep,
      }}>
        <div style={{ minWidth: 0 }}>
          <Price T={T} value={car.pricePerDay} unit={t('common.per_day')} size="lg" weight={700} />
          {search.from && search.to ? (
            <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>{t('vehicle.total_short', { total, days: t('bookings.days', { count: days }) })}</Txt>
          ) : (
            <Txt T={T} size={11} color={T.ink2} style={{ display: 'block' }}>{t('vehicle.choose_dates_total')}</Txt>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => toast.info(t('vehicle.chat_after_request'), { duration: 4500 })} aria-label={t('vehicle.write_to', { host: host.n })} style={{
          border: `1px solid ${T.line}`, background: T.surface, width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="chat" size={18} color={T.ink1} T={T} />
        </button>
        <Button T={T} variant="accent" size="lg" iconRight="arrowRight" onClick={onBook}>
          {(search.from && search.to) ? t('vehicle.book') : t('booking_form.cta_choose_dates')}
        </Button>
      </div>
    </div>
  );
}

export function Vehicle({ T, isDesktop }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { search, saved, toggleSaved } = useSearch();
  const toast = useToast();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const carQ = useAsync(() => getCar(id), [id]);
  const car = carQ.data;
  const hostQ = useAsync(() => car ? getHost(car.host) : Promise.resolve(null), [car?.host]);
  const host = hostQ.data;
  const reviewsQ = useAsync(() => listReviews(2), []);
  const reviews = reviewsQ.data ?? [];

  useEffect(() => {
    if (car?.id) logCarView(car.id, 'direct');
  }, [car?.id]);

  const citySuffix = car?.city ? ` ${t('listing.at')} ${car.city}` : '';
  useSeo(car ? {
    title: t('vehicle.seo_title', { name: `${car.brand} ${car.model}${car.year ? ` ${car.year}` : ''}`, city: citySuffix }),
    description: car.description?.slice(0, 160) || t('vehicle.seo_desc', { name: `${car.brand} ${car.model}`, price: car.pricePerDay, city: citySuffix }),
    image: car.images?.[0]?.url,
    path: `/auto/${car.id}`,
    jsonLd: vehicleJsonLd(car, host),
  } : { title: t('vehicle.seo_fallback') });

  if (carQ.loading || (car && !host)) return <VehicleSkeleton T={T} isDesktop={isDesktop} />;
  if (!car) return <Navigate to="/cerca" replace />;

  const onBook = () => {
    analyticsEvents.bookingStarted({ car_id: car.id, host_id: car.host, price_per_day: car.pricePerDay });
    if (!search.from || !search.to) navigate('/cerca/quando');
    else navigate(`/prenota/${car.id}`);
  };

  const props = {
    T, car, host, reviews, search, saved, toggleSaved, toast,
    onBook,
    onSearchDate: () => navigate('/cerca/quando'),
    onBack: () => navigate(-1),
    onListing: () => navigate('/cerca'),
    onOpenGallery: (i) => { setGalleryIdx(i); setGalleryOpen(true); },
    onOpenReviews: () => setReviewsOpen(true),
    onReport: () => setReportOpen(true),
  };

  return (
    <>
      {isDesktop ? <VehicleDesktop {...props} /> : <VehicleMobile {...props} />}
      <Lightbox T={T} open={galleryOpen} onClose={() => setGalleryOpen(false)} photos={carPhotos(car)} initialIndex={galleryIdx} />
      <ReviewsSheet T={T} open={reviewsOpen} onClose={() => setReviewsOpen(false)} isDesktop={isDesktop} reviews={reviews} host={host} />
      <ReportModal T={T} isDesktop={isDesktop} open={reportOpen} onClose={() => setReportOpen(false)}
        targetType="car" targetId={car.id} targetLabel={`${car.brand} ${car.model} · ${host?.n}`} />
    </>
  );
}
