-- Aggiunge la colonna images (jsonb) alla tabella cars.
-- Struttura prevista: array di oggetti Cloudinary
--   [{ public_id, url, width, height, format, bytes }, ...]
-- La prima foto è la copertina.

alter table public.cars
  add column if not exists images jsonb not null default '[]'::jsonb;

-- Index opzionale: ricerca rapida per copertura immagini
create index if not exists idx_cars_has_images
  on public.cars ((jsonb_array_length(images) > 0));

-- Commento di documentazione
comment on column public.cars.images is
  'Foto del veicolo (Cloudinary). Array di oggetti {public_id, url, width, height, format}. Prima foto = copertina.';
