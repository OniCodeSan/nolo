-- MoviQ seed — esegui dopo schema.sql. Idempotente (truncate + insert).

truncate table reviews, nearest_hosts, cars, categories, hosts, locations restart identity cascade;

insert into hosts (id, name, city, rating, reviews_count, since, response_time, verified) values
  ('autoluca', 'AutoLuca',      'Sesto S.G., MI', 4.9, 142, 'feb 2023', '~2h', true),
  ('greencar', 'GreenCar MI',   'Navigli, MI',    4.8,  89, 'gen 2024', '~1h', true),
  ('carhub',   'CarHub Milano', 'Centrale, MI',   4.7, 318, 'mag 2022', '~4h', true),
  ('premium',  'PremiumDrive',  'Brera, MI',      4.9,  76, 'set 2023', '~3h', true);

insert into categories (id, label, tone, from_price) values
  ('citycar',   'Citycar',       'colored', 25),
  ('suv',       'SUV',           'neutral', 45),
  ('elettrica', 'Elettrica',     'colored', 38),
  ('cabrio',    'Cabrio',        'neutral', 65),
  ('furgone',   'Furgone',       'neutral', 55),
  ('mensile',   'Lungo termine', 'neutral', 590);

insert into cars (
  id, brand, model, year, name, category, fuel, transmission, seats, doors,
  engine, km, range_km, price_per_day, price_per_month, host_id, city, distance,
  coords, hot, variant, tone, accent_tone, accessories, description
) values
  ('polo', 'Volkswagen', 'Polo', 2022, 'VW Polo · 2022',
    'citycar', 'Benzina', 'Manuale', 5, 5,
    '1.0 TSI · 95cv', '40.000', null, 32, 690, 'autoluca', 'Sesto S.G.', '1.4 km',
    array[180,240], true, 'hatch', 'neutral', 'colored',
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Cruise control','Aria condizionata','USB'],
    'Polo del 2022 in ottime condizioni, ideale per la città e brevi spostamenti extraurbani. Tenuta come nuova, sempre in box. Aria condizionata, sensori posteriori, Android Auto.'),

  ('500e', 'Fiat', '500e', 2023, 'Fiat 500e · 2023',
    'elettrica', 'Elettrica', 'Automatico', 4, 3,
    '42 kWh · 118cv', '18.000', '320 km', 39, 820, 'greencar', 'Navigli', '2.1 km',
    array[320,180], true, 'hatch', 'colored', 'colored',
    array['Apple CarPlay','Android Auto','Bluetooth','Cruise control','Aria condizionata','Tetto panoramico','Cerchi lega'],
    'Fiat 500e elettrica del 2023, perfetta per la città. 320km di autonomia, ricarica rapida. Tenuta come nuova.'),

  ('clio', 'Renault', 'Clio', 2023, 'Renault Clio · 2023',
    'citycar', 'Hybrid', 'Automatico', 5, 5,
    '1.6 Hybrid · 145cv', '12.000', null, 42, 890, 'carhub', 'Centrale', '2.8 km',
    array[220,320], true, 'hatch', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Navigatore'],
    'Clio Hybrid del 2023, ottima per consumi misti città-extra. Cambio automatico, dotata di tutto.'),

  ('c3', 'Citroën', 'C3', 2021, 'Citroën C3 · 2021',
    'citycar', 'Diesel', 'Manuale', 5, 5,
    '1.5 BlueHDi · 100cv', '62.000', null, 28, 590, 'autoluca', 'Sesto', '1.4 km',
    array[140,280], false, 'hatch', 'neutral', null,
    array['Bluetooth','Aria condizionata','USB'],
    'C3 Diesel, economica nei consumi su lunghe percorrenze. Ideale per trasferte.'),

  ('a1', 'Audi', 'A1', 2022, 'Audi A1 · 2022',
    'citycar', 'Benzina', 'Automatico', 5, 5,
    '1.0 TFSI · 110cv', '28.000', null, 55, 1180, 'premium', 'Brera', '3.5 km',
    array[380,220], false, 'sedan', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Cruise control','Aria condizionata','Cerchi lega','Fendinebbia'],
    'A1 Sportback in versione premium. Interni curati, ottimo per chi cerca un''auto compatta con classe.'),

  ('208', 'Peugeot', '208', 2023, 'Peugeot 208 · 2023',
    'citycar', 'Hybrid', 'Automatico', 5, 5,
    '1.2 Hybrid · 100cv', '15.000', null, 36, 770, 'carhub', 'Centrale', '2.8 km',
    array[260,380], true, 'hatch', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Cruise control','Aria condizionata'],
    'Peugeot 208 Hybrid del 2023, recente e parsimoniosa.'),

  ('m3', 'Tesla', 'Model 3', 2024, 'Tesla M3 · 2024',
    'elettrica', 'Elettrica', 'Automatico', 5, 4,
    '60 kWh · 283cv', '6.000', '491 km', 89, 1890, 'greencar', 'Navigli', '2.1 km',
    array[340,380], false, 'sedan', 'neutral', null,
    array['Apple CarPlay','Bluetooth','Autopilot','Tetto panoramico','Cerchi lega','Aria condizionata','Telecamera 360°'],
    'Tesla Model 3 Standard Range del 2024. Autopilot, 491km autonomia. Esperienza guida elettrica al top.'),

  ('mini', 'Mini', 'Cooper', 2023, 'Mini Cooper · 2023',
    'citycar', 'Benzina', 'Automatico', 4, 3,
    '1.5 · 136cv', '22.000', null, 58, 1240, 'premium', 'Brera', '3.5 km',
    array[420,280], false, 'hatch', 'neutral', null,
    array['Apple CarPlay','Bluetooth','Sensori parcheggio','Tetto panoramico','Cerchi lega','Fendinebbia'],
    'Mini Cooper iconica, perfetta per chi cerca personalità e divertimento di guida.');

insert into nearest_hosts (host_id, distance, cars_count) values
  ('autoluca', '1.4 km', 12),
  ('greencar', '2.1 km',  8),
  ('carhub',   '2.8 km', 24),
  ('premium',  '3.5 km',  6);

insert into locations (id, label, sub, icon) values
  ('milano-centrale', 'Milano Centrale',     'stazione · 320 auto disponibili', 'pin'),
  ('milano-linate',   'Milano Linate',       'aeroporto · 180 auto',            'pin'),
  ('milano-malpensa', 'Milano Malpensa',     'aeroporto · 410 auto',            'pin'),
  ('milano-sesto',    'Sesto San Giovanni',  'quartiere · 45 auto',             'pin'),
  ('milano-navigli',  'Navigli',             'zona · 62 auto',                  'pin'),
  ('milano-brera',    'Brera',               'zona · 38 auto',                  'pin');

insert into reviews (reviewer_name, avatar, date_label, stars, body) values
  ('Marta R.',   'M', 'maggio 2026', 5, 'Auto perfetta per Milano, host super disponibile. Ritiro veloce, riconsegna idem.'),
  ('Stefano G.', 'S', 'aprile 2026', 5, 'Esattamente come nelle foto. Consigliatissimo.'),
  ('Luca P.',    'L', 'marzo 2026',  4, 'Tutto bene, solo un piccolo ritardo al ritiro.');
