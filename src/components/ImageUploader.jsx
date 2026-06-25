import { useRef, useState } from 'react';
import { Icon } from './icons.jsx';
import { Txt, H } from './ui.jsx';
import { uploadImage, validateImageFile, cldUrl, hasCloudinary } from '../lib/cloudinary.js';
import { useToast } from '../state/ToastContext.jsx';

// ImageUploader — multi-image drag&drop, reorder, delete, progress.
// `value` è un array di { public_id, url, width, height, format }.
// `onChange(next)` viene chiamato a ogni mutazione (upload completato, delete, reorder).
export function ImageUploader({ T, value = [], onChange, max = 10, label = 'Foto del veicolo' }) {
  const inputRef = useRef(null);
  const toast = useToast();
  const [uploading, setUploading] = useState({}); // { localId: progressPct }
  const [draggingOver, setDraggingOver] = useState(false);
  const [dragSrc, setDragSrc] = useState(null);

  const remaining = Math.max(0, max - value.length);

  const handleFiles = async (files) => {
    if (!hasCloudinary) {
      toast.error('Cloudinary non configurato. Imposta VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) {
      toast.error(`Massimo ${max} foto.`);
      return;
    }

    for (const file of toUpload) {
      const err = validateImageFile(file);
      if (err) { toast.error(err); continue; }

      const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setUploading(p => ({ ...p, [localId]: 0 }));
      try {
        const result = await uploadImage(file, {
          onProgress: (pct) => setUploading(p => ({ ...p, [localId]: pct })),
        });
        onChange([...value, result]);
      } catch (e) {
        toast.error(e.message || 'Upload fallito');
      } finally {
        setUploading(p => {
          const n = { ...p }; delete n[localId]; return n;
        });
      }
    }
  };

  const onPick = (e) => {
    handleFiles(e.target.files);
    e.target.value = ''; // reset così re-selezione stesso file funziona
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDraggingOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const remove = (publicId) => {
    onChange(value.filter(img => img.public_id !== publicId));
  };

  // Reorder via HTML5 drag-and-drop
  const onItemDragStart = (idx) => setDragSrc(idx);
  const onItemDragOver = (e) => { e.preventDefault(); };
  const onItemDrop = (idx) => {
    if (dragSrc === null || dragSrc === idx) return;
    const next = [...value];
    const [moved] = next.splice(dragSrc, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDragSrc(null);
  };

  const uploadingIds = Object.keys(uploading);

  return (
    <div>
      <Txt T={T} size={12} weight={600} color={T.ink2} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
        {label} <span style={{ color: T.ink3, fontWeight: 500 }}>· {value.length}/{max}</span>
      </Txt>

      {!hasCloudinary && (
        <div style={{ padding: 12, background: T.surfaceAlt, borderRadius: 8, marginBottom: 12 }}>
          <Txt T={T} size={12} color={T.ink2} style={{ lineHeight: 1.5 }}>
            Cloudinary non configurato. Configura <code>VITE_CLOUDINARY_CLOUD_NAME</code> e <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> in <code>.env</code> per abilitare l'upload.
          </Txt>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={onDrop}
        onClick={() => remaining > 0 && inputRef.current?.click()}
        style={{
          border: `2px dashed ${draggingOver ? T.ink1 : T.line}`,
          borderRadius: 12, padding: 24, textAlign: 'center', cursor: remaining > 0 ? 'pointer' : 'not-allowed',
          background: draggingOver ? T.accent : T.surface,
          opacity: remaining > 0 ? 1 : 0.5,
          transition: 'background 120ms, border-color 120ms',
        }}
      >
        <Icon name="share" size={24} color={T.ink2} T={T} />
        <Txt T={T} size={13} color={T.ink1} style={{ display: 'block', marginTop: 8, fontWeight: 600 }}>
          {remaining > 0 ? 'Trascina o clicca per caricare' : `Massimo ${max} foto raggiunto`}
        </Txt>
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 4 }}>
          JPG/PNG/WebP · max 10 MB · prima foto = copertina
        </Txt>
        <input
          ref={inputRef} type="file" accept="image/*" multiple onChange={onPick}
          style={{ display: 'none' }}
        />
      </div>

      {(value.length > 0 || uploadingIds.length > 0) && (
        <div style={{
          marginTop: 14, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10,
        }}>
          {value.map((img, idx) => (
            <div
              key={img.public_id}
              draggable
              onDragStart={() => onItemDragStart(idx)}
              onDragOver={onItemDragOver}
              onDrop={() => onItemDrop(idx)}
              style={{
                position: 'relative', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden',
                border: `1px solid ${T.line}`, background: T.surfaceAlt, cursor: 'grab',
              }}
            >
              <img
                src={cldUrl(img.public_id, { w: 400, h: 300 }) || img.url}
                alt=""
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {idx === 0 && (
                <span style={{
                  position: 'absolute', top: 6, left: 6,
                  background: T.ink1, color: '#fff', fontFamily: T.fontBody,
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                }}>Copertina</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); remove(img.public_id); }}
                aria-label="Rimuovi foto"
                style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(20,15,5,0.7)', border: 'none', color: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="x" size={12} color="#fff" T={T} />
              </button>
            </div>
          ))}
          {uploadingIds.map(id => (
            <div key={id} style={{
              aspectRatio: '4/3', borderRadius: 8, border: `1px solid ${T.line}`,
              background: T.surfaceAlt, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <div style={{
                width: '70%', height: 4, borderRadius: 4, background: T.line, overflow: 'hidden',
              }}>
                <div style={{ width: `${uploading[id]}%`, height: '100%', background: T.ink1, transition: 'width 200ms' }} />
              </div>
              <Txt T={T} size={11} color={T.ink2}>{uploading[id]}%</Txt>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <Txt T={T} size={11} color={T.ink3} style={{ display: 'block', marginTop: 10, lineHeight: 1.5 }}>
          Trascina le foto per riordinarle. La prima foto è la copertina mostrata in lista.
        </Txt>
      )}
    </div>
  );
}
