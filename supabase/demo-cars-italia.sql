-- ============================================================
-- 20 auto demo distribuite in tutta Italia (Nord, Centro, Sud, Isole)
-- Tutte sotto cotugnomariano-ed430705 + internal_notes = '[demo-italia]'
-- Cancellazione futura:  delete from cars where internal_notes = '[demo-italia]';
-- ============================================================

-- 1) Aggiorna le 5 auto esistenti di Milano con coordinate vere (così la mappa le posiziona giuste)
update public.cars set coords = array[45.4655, 9.1880]::float8[]  where id = 'cotugno-500e';
update public.cars set coords = array[45.4710, 9.2020]::float8[]  where id = 'cotugno-golf';
update public.cars set coords = array[45.4575, 9.1690]::float8[]  where id in (select id from cars where host_id='cotugnomariano-ed430705' and id not in ('cotugno-500e','cotugno-golf') order by id limit 1);
update public.cars set coords = array[45.4810, 9.1755]::float8[]  where id in (select id from cars where host_id='cotugnomariano-ed430705' and id not in ('cotugno-500e','cotugno-golf') and (coords[1] is null or coords[1] < 35) order by id limit 1);
update public.cars set coords = array[45.4490, 9.2150]::float8[]  where id in (select id from cars where host_id='cotugnomariano-ed430705' and id not in ('cotugno-500e','cotugno-golf') and (coords[1] is null or coords[1] < 35) order by id limit 1);

-- 2) Insert delle 20 auto demo in giro per l'Italia
insert into public.cars (
  id, brand, model, year, name, category, fuel, transmission, seats, doors,
  price_per_day, host_id, city, coords, hot, variant, tone, accessories,
  description, status, images, internal_notes, created_at, updated_at
) values
-- ─── Centro ───────────────────────────────────────
('demo-it-roma-panda',    'Fiat',       'Panda',       2023, 'Fiat Panda',      'citycar',  'Benzina',   'Manuale',    5, 5, 35,
  'cotugnomariano-ed430705', 'Roma', array[41.9028, 12.4964]::float8[], false, 'hatch', 'colored',
  array['Climatizzatore','Bluetooth','Sensori parcheggio','Apple CarPlay'],
  'Citycar ideale per il traffico di Roma. Perfetta per il centro storico.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-roma-tesla',    'Tesla',      'Model 3',     2024, 'Tesla Model 3',   'elettrica','Elettrica', 'Automatico', 5, 4, 110,
  'cotugnomariano-ed430705', 'Roma', array[41.9100, 12.5215]::float8[], true,  'sedan', 'neutral',
  array['Autopilot','Schermo 15"','Ricarica Supercharger','Climatizzazione bizona','Sedili riscaldati'],
  'Elettrica premium per spostamenti in tutta la Capitale e dintorni.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-firenze-mini',  'MINI',       'Cooper',      2022, 'MINI Cooper',     'citycar',  'Benzina',   'Manuale',    4, 3, 58,
  'cotugnomariano-ed430705', 'Firenze', array[43.7696, 11.2558]::float8[], false, 'hatch', 'colored',
  array['Apple CarPlay','Climatizzatore','Bluetooth','Cerchi in lega','Cruise control'],
  'Iconica e divertente da guidare nelle colline toscane.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-firenze-a3',    'Audi',       'A3 Sportback',2023, 'Audi A3 Sportback','citycar', 'Diesel',    'Automatico', 5, 5, 72,
  'cotugnomariano-ed430705', 'Firenze', array[43.7800, 11.2480]::float8[], false, 'hatch', 'neutral',
  array['Navigatore','Apple CarPlay','Android Auto','Climatizzatore bizona','Cruise control adattivo','Sensori parcheggio','Telecamera posteriore'],
  'Berlina premium per viaggi comodi su lunghe distanze.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-perugia-mokka', 'Opel',       'Mokka-e',     2024, 'Opel Mokka-e',    'suv',      'Elettrica', 'Automatico', 5, 5, 58,
  'cotugnomariano-ed430705', 'Perugia', array[43.1107, 12.3908]::float8[], false, 'suv',   'colored',
  array['Climatizzatore','Ricarica rapida','Apple CarPlay','Android Auto','Cruise control','Telecamera posteriore'],
  'SUV compatto 100% elettrico, perfetto per Umbria e tour collinari.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Nord-Ovest ───────────────────────────────────
('demo-it-torino-troc',   'Volkswagen', 'T-Roc',       2023, 'Volkswagen T-Roc','suv',      'Diesel',    'Automatico', 5, 5, 68,
  'cotugnomariano-ed430705', 'Torino', array[45.0703, 7.6869]::float8[], false, 'suv',   'neutral',
  array['Apple CarPlay','Android Auto','Climatizzatore bizona','Navigatore','Sensori parcheggio','Telecamera 360°'],
  'SUV versatile per città e gite in montagna.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-genova-208',    'Peugeot',    '208',         2023, 'Peugeot 208',     'citycar',  'Benzina',   'Manuale',    5, 5, 38,
  'cotugnomariano-ed430705', 'Genova', array[44.4056, 8.9463]::float8[], false, 'hatch', 'colored',
  array['Climatizzatore','Bluetooth','Apple CarPlay','Cerchi in lega','Sensori parcheggio'],
  'Compatta agile per le strette vie di Genova e la Riviera.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Nord-Est ─────────────────────────────────────
('demo-it-venezia-smart', 'Smart',      'EQ ForTwo',   2023, 'Smart EQ ForTwo', 'citycar',  'Elettrica', 'Automatico', 2, 3, 38,
  'cotugnomariano-ed430705', 'Venezia', array[45.4906, 12.2419]::float8[], false, 'hatch', 'colored',
  array['Climatizzatore','Bluetooth','Ricarica domestica','Apple CarPlay'],
  'Piccola e elettrica per esplorare Mestre e dintorni senza traffico.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-verona-bmw1',   'BMW',        'Serie 1',     2024, 'BMW Serie 1',     'citycar',  'Benzina',   'Automatico', 5, 5, 78,
  'cotugnomariano-ed430705', 'Verona', array[45.4384, 10.9916]::float8[], true,  'hatch', 'neutral',
  array['Navigatore','Apple CarPlay','Sedili sportivi','Climatizzatore bizona','Sensori parcheggio','Cruise control adattivo'],
  'Premium tedesca con cambio automatico e prestazioni brillanti.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-padova-sportage','Kia',       'Sportage',    2024, 'Kia Sportage',    'suv',      'Hybrid',    'Automatico', 5, 5, 68,
  'cotugnomariano-ed430705', 'Padova', array[45.4064, 11.8768]::float8[], false, 'suv',   'neutral',
  array['Apple CarPlay','Android Auto','Climatizzatore bizona','Navigatore','Telecamera 360°','Cruise control adattivo','Tetto panoramico'],
  'SUV ibrido con consumi contenuti, ideale per famiglie.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-bologna-captur','Renault',    'Captur',      2024, 'Renault Captur',  'suv',      'Hybrid',    'Automatico', 5, 5, 55,
  'cotugnomariano-ed430705', 'Bologna', array[44.4949, 11.3426]::float8[], false, 'suv',   'colored',
  array['Apple CarPlay','Android Auto','Climatizzatore','Sensori parcheggio','Cruise control','Telecamera posteriore'],
  'SUV compatto ibrido perfetto per la pianura padana.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Nord-Lombardia ───────────────────────────────
('demo-it-brescia-cx30',  'Mazda',      'CX-30',       2023, 'Mazda CX-30',     'suv',      'Benzina',   'Automatico', 5, 5, 60,
  'cotugnomariano-ed430705', 'Brescia', array[45.5416, 10.2118]::float8[], false, 'suv',   'colored',
  array['Apple CarPlay','Android Auto','Climatizzatore bizona','Head-up display','Sedili in pelle','Cruise control adattivo'],
  'SUV elegante con interni curati e guida raffinata.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-bergamo-polo',  'Volkswagen', 'Polo',        2024, 'Volkswagen Polo', 'citycar',  'Benzina',   'Manuale',    5, 5, 42,
  'cotugnomariano-ed430705', 'Bergamo', array[45.6983, 9.6773]::float8[], false, 'hatch', 'colored',
  array['Apple CarPlay','Climatizzatore','Bluetooth','Sensori parcheggio','Cruise control'],
  'Compatta affidabile per spostamenti urbani e gite in valle.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Trentino/Alto Adige ──────────────────────────
('demo-it-trento-outback','Subaru',     'Outback',     2023, 'Subaru Outback',  'suv',      'Benzina',   'Automatico', 5, 5, 75,
  'cotugnomariano-ed430705', 'Trento', array[46.0664, 11.1257]::float8[], false, 'suv',   'neutral',
  array['4x4 permanente','Apple CarPlay','Climatizzatore bizona','Cruise control adattivo','Sensori parcheggio','Barre portatutto','Sedili riscaldati'],
  'Station-wagon 4x4, ideale per le Dolomiti in ogni stagione.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-bolzano-tucson','Hyundai',    'Tucson',      2024, 'Hyundai Tucson',  'suv',      'Hybrid',    'Automatico', 5, 5, 70,
  'cotugnomariano-ed430705', 'Bolzano', array[46.4983, 11.3548]::float8[], true,  'suv',   'neutral',
  array['Apple CarPlay','Android Auto','4WD','Cruise control adattivo','Tetto panoramico','Sedili in pelle riscaldati','Telecamera 360°'],
  'SUV ibrido a trazione integrale per le strade alpine.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Sud ──────────────────────────────────────────
('demo-it-napoli-c3',     'Citroen',    'C3',          2022, 'Citroen C3',      'citycar',  'Benzina',   'Manuale',    5, 5, 32,
  'cotugnomariano-ed430705', 'Napoli', array[40.8518, 14.2681]::float8[], false, 'hatch', 'colored',
  array['Climatizzatore','Bluetooth','Apple CarPlay','Sensori parcheggio','Connected-cam'],
  'Citycar economica per muoversi nel cuore di Napoli.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-napoli-yaris',  'Toyota',     'Yaris Hybrid',2023, 'Toyota Yaris Hybrid','citycar','Hybrid',   'Automatico', 5, 5, 48,
  'cotugnomariano-ed430705', 'Napoli', array[40.8400, 14.2580]::float8[], false, 'hatch', 'colored',
  array['Apple CarPlay','Android Auto','Climatizzatore','Cruise control adattivo','Telecamera posteriore','Safety Sense'],
  'Compatta ibrida ultra-efficiente, perfetta per la Campania.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-bari-puma',     'Ford',       'Puma',        2023, 'Ford Puma',       'suv',      'Benzina',   'Manuale',    5, 5, 50,
  'cotugnomariano-ed430705', 'Bari', array[41.1171, 16.8719]::float8[], false, 'suv',   'colored',
  array['Apple CarPlay','Android Auto','Climatizzatore','Cruise control','MegaBox','Telecamera posteriore'],
  'Crossover divertente per esplorare la Puglia.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-lecce-tipo',    'Fiat',       'Tipo',        2023, 'Fiat Tipo',       'citycar',  'Diesel',    'Manuale',    5, 4, 38,
  'cotugnomariano-ed430705', 'Lecce', array[40.3515, 18.1750]::float8[], false, 'sedan', 'neutral',
  array['Climatizzatore','Bluetooth','Cruise control','Apple CarPlay'],
  'Berlina spaziosa per tour del Salento.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Sicilia ──────────────────────────────────────
('demo-it-palermo-500',   'Fiat',       '500',         2024, 'Fiat 500',        'citycar',  'Benzina',   'Manuale',    4, 3, 36,
  'cotugnomariano-ed430705', 'Palermo', array[38.1157, 13.3615]::float8[], false, 'hatch', 'colored',
  array['Climatizzatore','Bluetooth','Apple CarPlay','Tetto panoramico','Cerchi in lega'],
  'Iconica italiana, perfetta per il centro storico di Palermo.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

('demo-it-catania-compass','Jeep',      'Compass',     2023, 'Jeep Compass',    'suv',      'Hybrid',    'Automatico', 5, 5, 65,
  'cotugnomariano-ed430705', 'Catania', array[37.5079, 15.0830]::float8[], true,  'suv',   'neutral',
  array['4x4','Apple CarPlay','Android Auto','Climatizzatore bizona','Cruise control adattivo','Sensori parcheggio','Tetto apribile'],
  'SUV 4x4 ibrido, ideale per Etna e costa orientale.', 'active', '[]'::jsonb, '[demo-italia]', now(), now()),

-- ─── Sardegna ─────────────────────────────────────
('demo-it-cagliari-sandero','Dacia',    'Sandero',     2023, 'Dacia Sandero',   'citycar',  'Benzina',   'Manuale',    5, 5, 30,
  'cotugnomariano-ed430705', 'Cagliari', array[39.2238, 9.1217]::float8[], false, 'hatch', 'colored',
  array['Climatizzatore','Bluetooth','Apple CarPlay','Sensori parcheggio'],
  'Economica e affidabile per girare la Sardegna del sud.', 'active', '[]'::jsonb, '[demo-italia]', now(), now())
on conflict (id) do nothing;

-- 3) Promuovi l'host a verified così le auto sono pienamente visibili
update public.hosts set status = 'verified' where id = 'cotugnomariano-ed430705' and status <> 'verified';

-- 4) Riepilogo
select count(*) filter (where internal_notes='[demo-italia]') as demo_italia,
       count(*) filter (where host_id='cotugnomariano-ed430705') as totali_account,
       count(distinct city) filter (where host_id='cotugnomariano-ed430705') as citta
from public.cars;
