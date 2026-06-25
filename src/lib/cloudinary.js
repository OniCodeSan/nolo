// Cloudinary client — upload unsigned + URL helpers.
//
// Setup richiesto su cloudinary.com:
//  1. Settings → Upload → Add upload preset
//  2. Mode: unsigned
//  3. Folder: noleggio/cars (consigliato per organizzazione)
//  4. Salva il preset name in VITE_CLOUDINARY_UPLOAD_PRESET
//  5. Cloud name in VITE_CLOUDINARY_CLOUD_NAME
//
// Senza env il modulo è no-op: l'app continua a usare CarRender illustrato.

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || null;

export const hasCloudinary = Boolean(cloudName && uploadPreset);

const BASE = cloudName ? `https://res.cloudinary.com/${cloudName}` : null;
const UPLOAD_URL = cloudName ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` : null;

// Costruisce un URL responsivo. Inserisce trasformazioni Cloudinary
// (f_auto = WebP/AVIF automatico, q_auto = qualità adattiva, w_<n> = resize).
export function cldUrl(publicId, { w, h, crop = 'fill', quality = 'auto', format = 'auto' } = {}) {
  if (!publicId || !BASE) return null;
  const parts = [`f_${format}`, `q_${quality}`];
  if (w) parts.push(`w_${w}`);
  if (h) parts.push(`h_${h}`);
  if (w || h) parts.push(`c_${crop}`);
  return `${BASE}/image/upload/${parts.join(',')}/${publicId}`;
}

// Genera srcSet per <img> responsivo
export function cldSrcSet(publicId, widths = [400, 800, 1200, 1600]) {
  if (!publicId) return null;
  return widths.map(w => `${cldUrl(publicId, { w })} ${w}w`).join(', ');
}

// Upload singolo file. Ritorna { public_id, secure_url, width, height, format, bytes }
export async function uploadImage(file, { onProgress, folder = 'noleggio/cars' } = {}) {
  if (!hasCloudinary) throw new Error('Cloudinary non configurato');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', uploadPreset);
  fd.append('folder', folder);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL);
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            public_id: res.public_id,
            url: res.secure_url,
            width: res.width,
            height: res.height,
            format: res.format,
            bytes: res.bytes,
          });
        } else {
          reject(new Error(res.error?.message || `Upload fallito (${xhr.status})`));
        }
      } catch (e) {
        reject(e);
      }
    };
    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(fd);
  });
}

// Validazione file lato client prima dell'upload.
export function validateImageFile(file, { maxBytes = 10 * 1024 * 1024 } = {}) {
  if (!file.type.startsWith('image/')) return 'Solo immagini sono permesse.';
  if (file.size > maxBytes) return `File troppo grande (max ${Math.round(maxBytes / 1024 / 1024)} MB).`;
  return null;
}
