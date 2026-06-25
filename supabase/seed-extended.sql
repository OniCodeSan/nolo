-- MoviQ seed extended — aggiunge auto per ogni categoria.
-- Esegui DOPO seed.sql. Additivo (skip se ID gi`a esiste).
-- Usa "on conflict do nothing" cos`i puoi rieseguirlo senza problemi.

insert into hosts (id, name, city, rating, reviews_count, since, response_time, verified) values
  ('vipcar',  'VipCar Milano',  'Porta Romana, MI', 4.8,  54, 'mar 2024', '~2h', true),
  ('vanity',  'Vanity Rent',    'Linate, MI',       4.7,  41, 'nov 2023', '~3h', true),
  ('vanmi',   'VanMilano',      'Bicocca, MI',      4.6,  72, 'giu 2023', '~5h', true)
on conflict (id) do nothing;

insert into cars (
  id, brand, model, year, name, category, fuel, transmission, seats, doors,
  engine, km, range_km, price_per_day, price_per_month, host_id, city, distance,
  coords, hot, variant, tone, accent_tone, accessories, description
) values
  -- SUV
  ('tiguan', 'Volkswagen', 'Tiguan', 2022, 'VW Tiguan · 2022',
    'suv', 'Diesel', 'Automatico', 5, 5,
    '2.0 TDI · 150cv', '48.000', null, 68, 1490, 'carhub', 'Centrale', '2.8 km',
    array[260,310], true, 'suv', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Cerchi lega','Navigatore','Tetto panoramico'],
    'Tiguan diesel del 2022, ideale per viaggi familiari. Spazioso, comodo, dotato di tutti i comfort.'),

  ('xc40', 'Volvo', 'XC40', 2023, 'Volvo XC40 · 2023',
    'suv', 'Hybrid', 'Automatico', 5, 5,
    '1.5 Hybrid · 180cv', '21.000', null, 78, 1690, 'premium', 'Brera', '3.5 km',
    array[380,290], false, 'suv', 'colored', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera 360°','Cruise control','Aria condizionata','Cerchi lega','Tetto panoramico','Navigatore'],
    'XC40 Hybrid 2023, scandinavo style. Interni premium, sicurezza top di gamma.'),

  ('q3', 'Audi', 'Q3', 2023, 'Audi Q3 · 2023',
    'suv', 'Benzina', 'Automatico', 5, 5,
    '1.5 TFSI · 150cv', '24.000', null, 82, 1750, 'premium', 'Brera', '3.5 km',
    array[330,200], false, 'suv', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Cerchi lega','Navigatore','Quattro'],
    'Audi Q3 con trazione integrale Quattro. Premium e versatile.'),

  -- Cabrio
  ('500c', 'Fiat', '500 Cabrio', 2022, 'Fiat 500 Cabrio · 2022',
    'cabrio', 'Benzina', 'Manuale', 4, 2,
    '1.2 · 69cv', '32.000', null, 49, 1090, 'autoluca', 'Sesto', '1.4 km',
    array[150,260], false, 'hatch', 'colored', null,
    array['Bluetooth','Aria condizionata','USB','Tetto in tela'],
    '500 Cabrio per girare scoperti in città. Iconica e divertente.'),

  ('124', 'Fiat', '124 Spider', 2020, 'Fiat 124 Spider · 2020',
    'cabrio', 'Benzina', 'Manuale', 2, 2,
    '1.4 MultiAir · 140cv', '38.000', null, 95, 1980, 'vipcar', 'Porta Romana', '4.2 km',
    array[420,210], true, 'sedan', 'colored', null,
    array['Apple CarPlay','Bluetooth','Bose','Cerchi lega','Sensori parcheggio','Aria condizionata','Tetto morbido'],
    'Roadster italiana per il weekend perfetto. Audio Bose, tetto morbido in 10 secondi.'),

  ('z4', 'BMW', 'Z4', 2023, 'BMW Z4 · 2023',
    'cabrio', 'Benzina', 'Automatico', 2, 2,
    '2.0 · 258cv', '14.000', null, 145, 2890, 'premium', 'Brera', '3.5 km',
    array[440,250], false, 'sedan', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Cerchi lega','Tetto morbido','HiFi','Navigatore'],
    'Z4 sDrive 20i, roadster sportiva tedesca. Esperienza di guida pura.'),

  -- Furgoni
  ('ducato', 'Fiat', 'Ducato', 2021, 'Fiat Ducato · 2021',
    'furgone', 'Diesel', 'Manuale', 3, 4,
    '2.3 MJT · 140cv', '95.000', null, 65, 1390, 'vanmi', 'Bicocca', '5.1 km',
    array[120,360], false, 'suv', 'neutral', null,
    array['Bluetooth','Aria condizionata','USB','Sensori parcheggio','12 m³'],
    'Ducato L2H2 (12 m³) ideale per traslochi e trasporti. Patente B sufficiente.'),

  ('jumper', 'Citroën', 'Jumper', 2022, 'Citroën Jumper · 2022',
    'furgone', 'Diesel', 'Manuale', 3, 4,
    '2.2 BlueHDi · 160cv', '64.000', null, 72, 1490, 'vanmi', 'Bicocca', '5.1 km',
    array[160,380], false, 'suv', 'neutral', null,
    array['Bluetooth','Aria condizionata','USB','Sensori parcheggio','Telecamera retro','15 m³','Cruise control'],
    'Jumper L3H2 da 15 m³, recente. Perfetto per traslochi grandi.'),

  ('partner', 'Peugeot', 'Partner', 2023, 'Peugeot Partner · 2023',
    'furgone', 'Diesel', 'Automatico', 3, 4,
    '1.5 BlueHDi · 100cv', '28.000', null, 55, 1190, 'carhub', 'Centrale', '2.8 km',
    array[280,360], true, 'suv', 'neutral', null,
    array['Bluetooth','Aria condizionata','USB','Sensori parcheggio','Telecamera retro','4.4 m³','Cruise control'],
    'Partner compatto, cambio automatico. Perfetto per consegne urbane.'),

  -- Lungo termine (mensile)
  ('panda', 'Fiat', 'Panda Hybrid', 2024, 'Fiat Panda Hybrid · 2024',
    'mensile', 'Hybrid', 'Manuale', 5, 5,
    '1.0 Hybrid · 70cv', '8.000', null, 22, 590, 'autoluca', 'Sesto', '1.4 km',
    array[170,330], false, 'hatch', 'colored', null,
    array['Bluetooth','Aria condizionata','USB','Sensori parcheggio'],
    'Panda Hybrid in formula lungo termine. Tariffa scontata da 30+ giorni.'),

  ('corsa', 'Opel', 'Corsa-e', 2024, 'Opel Corsa-e · 2024',
    'mensile', 'Elettrica', 'Automatico', 5, 5,
    '50 kWh · 136cv', '5.000', '337 km', 35, 790, 'greencar', 'Navigli', '2.1 km',
    array[300,260], false, 'hatch', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Cerchi lega'],
    'Corsa-e in lungo termine: include manutenzione e assicurazione full kasko.'),

  -- Premium (citycar di lusso ma marcate come "elettrica" o citycar)
  ('a3', 'Audi', 'A3 Sportback', 2024, 'Audi A3 Sportback · 2024',
    'citycar', 'Hybrid', 'Automatico', 5, 5,
    '1.5 TFSI Hybrid · 150cv', '12.000', null, 75, 1590, 'premium', 'Brera', '3.5 km',
    array[400,290], false, 'sedan', 'neutral', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Cerchi lega','Navigatore','Cockpit virtuale'],
    'A3 Sportback 2024, ultimissima generazione. Cockpit virtuale e MMI Plus.'),

  ('macan', 'Porsche', 'Macan', 2022, 'Porsche Macan · 2022',
    'suv', 'Benzina', 'Automatico', 5, 5,
    '2.0 · 265cv', '32.000', null, 195, 3990, 'vipcar', 'Porta Romana', '4.2 km',
    array[460,310], true, 'suv', 'neutral', null,
    array['Apple CarPlay','Bluetooth','Sensori parcheggio','Telecamera 360°','Cruise control','Aria condizionata','Cerchi lega','Navigatore','Tetto panoramico','Bose','PASM'],
    'Macan, SUV sportivo Porsche. Esperienza premium completa.'),

  -- Extra elettriche
  ('e208', 'Peugeot', 'e-208', 2023, 'Peugeot e-208 · 2023',
    'elettrica', 'Elettrica', 'Automatico', 5, 5,
    '50 kWh · 136cv', '14.000', '362 km', 45, 950, 'carhub', 'Centrale', '2.8 km',
    array[250,180], false, 'hatch', 'colored', null,
    array['Apple CarPlay','Android Auto','Bluetooth','Sensori parcheggio','Telecamera','Cruise control','Aria condizionata','Cerchi lega'],
    'e-208 elettrica, 362km autonomia. Ricarica rapida 100kW.')

on conflict (id) do nothing;

insert into nearest_hosts (host_id, distance, cars_count) values
  ('vipcar', '4.2 km', 14),
  ('vanmi',  '5.1 km',  9)
on conflict (host_id) do nothing;
