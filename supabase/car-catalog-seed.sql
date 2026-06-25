-- MoviQ car catalog seed — marche e modelli principali (AutoScout24 derived).
-- Idempotente via "on conflict do nothing". Esegui DOPO car-catalog-schema.sql.
--
-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  POLICY DI INCLUSIONE                                                ║
-- ║                                                                      ║
-- ║  Vengono incluse SOLO marche utili per il noleggio breve termine:    ║
-- ║   ✅ produzioni moderne (post-2000) ancora attive o recenti           ║
-- ║   ✅ EV / brand cinesi emergenti in mercato EU                        ║
-- ║   ✅ sportive premium contemporanee                                   ║
-- ║   ✅ commerciali leggeri (van/furgoni)                                ║
-- ║                                                                      ║
-- ║  ESCLUSE da policy (non vanno aggiunte qui):                         ║
-- ║   ❌ Oldtimer e classiche fuori produzione                            ║
-- ║      (Cord, Auburn, Stutz, Bristol, Borgward, Tucker, ecc.)          ║
-- ║   ❌ Kit-car / replica / track-day                                    ║
-- ║      (Westfield, Donkervoort, Caterham, Ariel Motor, KTM X-Bow,      ║
-- ║       Spyker, Gillet, Marcos, Noble, Ginetta, Radical, ecc.)         ║
-- ║   ❌ Marche fantasma o placeholder "Others"                           ║
-- ║      (Aerfal, ARI, ACM, 9ff, AC, Adler, ecc.)                        ║
-- ║   ❌ Quadricicli / micro EV / minicar                                 ║
-- ║      (Aixam, Microcar, Ligier, Chatenet, Casalini, Bellier,          ║
-- ║       Tazzari, Estrima, Evetta, e.GO, XEV Yoyo, ecc.)                ║
-- ║   ❌ Camper / trailer / caravan brand                                 ║
-- ║      (Caravans-Wohnm e tutti i suoi sotto-brand)                     ║
-- ║   ❌ Mezzi pesanti / Trucks-Lkw                                       ║
-- ║      (DAF, IHC, Iveco trattori, ecc. — l'Iveco Daily commerciale     ║
-- ║       leggero passa via furgone category, non come brand standalone) ║
-- ║                                                                      ║
-- ║  Per l'1% di casi limite il front-end ha free-text fallback nel      ║
-- ║  BrandModelPicker (l'host scrive nome custom e si salva come testo). ║
-- ╚══════════════════════════════════════════════════════════════════════╝

-- ============ BRANDS ============
insert into car_brands (id, name, popular, country) values
  ('abarth',          'Abarth',           true,  'IT'),
  ('alfa-romeo',      'Alfa Romeo',       true,  'IT'),
  ('aston-martin',    'Aston Martin',     false, 'UK'),
  ('audi',            'Audi',             true,  'DE'),
  ('bentley',         'Bentley',          false, 'UK'),
  ('bmw',             'BMW',              true,  'DE'),
  ('byd',             'BYD',              false, 'CN'),
  ('cadillac',        'Cadillac',         false, 'US'),
  ('chevrolet',       'Chevrolet',        false, 'US'),
  ('chrysler',        'Chrysler',         false, 'US'),
  ('citroen',         'Citroën',          true,  'FR'),
  ('cupra',           'CUPRA',            true,  'ES'),
  ('dacia',           'Dacia',            true,  'RO'),
  ('ds-automobiles',  'DS Automobiles',   false, 'FR'),
  ('ferrari',         'Ferrari',          false, 'IT'),
  ('fiat',            'Fiat',             true,  'IT'),
  ('ford',            'Ford',             true,  'US'),
  ('honda',           'Honda',            true,  'JP'),
  ('hyundai',         'Hyundai',          true,  'KR'),
  ('infiniti',        'Infiniti',         false, 'JP'),
  ('jaguar',          'Jaguar',           false, 'UK'),
  ('jeep',            'Jeep',             true,  'US'),
  ('kia',             'Kia',              true,  'KR'),
  ('lamborghini',     'Lamborghini',      false, 'IT'),
  ('lancia',          'Lancia',           true,  'IT'),
  ('land-rover',      'Land Rover',       true,  'UK'),
  ('lexus',           'Lexus',            false, 'JP'),
  ('lotus',           'Lotus',            false, 'UK'),
  ('maserati',        'Maserati',         false, 'IT'),
  ('mazda',           'Mazda',            true,  'JP'),
  ('mclaren',         'McLaren',          false, 'UK'),
  ('mercedes-benz',   'Mercedes-Benz',    true,  'DE'),
  ('mg',              'MG',               false, 'UK'),
  ('mini',            'MINI',             true,  'UK'),
  ('mitsubishi',      'Mitsubishi',       true,  'JP'),
  ('nissan',          'Nissan',           true,  'JP'),
  ('opel',            'Opel',             true,  'DE'),
  ('peugeot',         'Peugeot',          true,  'FR'),
  ('polestar',        'Polestar',         false, 'SE'),
  ('porsche',         'Porsche',          false, 'DE'),
  ('renault',         'Renault',          true,  'FR'),
  ('rolls-royce',     'Rolls-Royce',      false, 'UK'),
  ('seat',            'SEAT',             true,  'ES'),
  ('skoda',           'Skoda',            true,  'CZ'),
  ('smart',           'smart',            true,  'DE'),
  ('subaru',          'Subaru',           false, 'JP'),
  ('suzuki',          'Suzuki',           true,  'JP'),
  ('tesla',           'Tesla',            true,  'US'),
  ('toyota',          'Toyota',           true,  'JP'),
  ('volkswagen',      'Volkswagen',       true,  'DE'),
  ('volvo',           'Volvo',            true,  'SE'),
  ('alpine',          'Alpine',           false, 'FR'),
  ('genesis',         'Genesis',          false, 'KR'),
  ('ineos',           'Ineos',            false, 'UK'),
  ('lynk-co',         'Lynk & Co',        false, 'CN'),
  ('nio',             'NIO',              false, 'CN'),
  ('xpeng',           'Xpeng',            false, 'CN'),
  ('rivian',          'Rivian',           false, 'US'),
  ('lucid',           'Lucid',            false, 'US'),
  ('leapmotor',       'Leapmotor',        false, 'CN'),
  ('omoda',           'Omoda',            false, 'CN'),
  ('jaecoo',          'Jaecoo',           false, 'CN'),
  ('zeekr',           'Zeekr',            false, 'CN'),
  ('vinfast',         'VinFast',          false, 'VN'),
  -- Marche presenti su mercato italiano ma meno comuni nel noleggio
  ('dr-automobiles',  'DR Automobiles',   false, 'IT'),
  ('sportequipe',     'Sportequipe',      false, 'IT'),
  ('evo',             'EVO',              false, 'IT'),
  ('maxus',           'Maxus',            false, 'CN'),
  ('gwm',             'GWM',              false, 'CN'),
  ('haval',           'Haval',            false, 'CN'),
  ('forthing',        'Forthing',         false, 'CN')
on conflict (id) do nothing;

-- ============ MODELS ============
-- Sono inclusi i modelli più richiesti su strada italiana.
-- "popular = true" sui best-seller per ordinarli per primi nelle dropdown.

insert into car_models (id, brand_id, name, popular) values
  -- Abarth
  ('abarth-500',          'abarth',       '500',           true),
  ('abarth-500c',         'abarth',       '500C',          false),
  ('abarth-595',          'abarth',       '595',           true),
  ('abarth-595c',         'abarth',       '595C',          false),
  ('abarth-695',          'abarth',       '695',           false),
  ('abarth-500e',         'abarth',       '500e',          true),
  ('abarth-600e',         'abarth',       '600e',          false),
  ('abarth-124-spider',   'abarth',       '124 Spider',    false),

  -- Alfa Romeo
  ('alfa-romeo-giulia',     'alfa-romeo', 'Giulia',         true),
  ('alfa-romeo-stelvio',    'alfa-romeo', 'Stelvio',        true),
  ('alfa-romeo-tonale',     'alfa-romeo', 'Tonale',         true),
  ('alfa-romeo-junior',     'alfa-romeo', 'Junior',         true),
  ('alfa-romeo-giulietta',  'alfa-romeo', 'Giulietta',      false),
  ('alfa-romeo-mito',       'alfa-romeo', 'MiTo',           false),
  ('alfa-romeo-4c',         'alfa-romeo', '4C',             false),
  ('alfa-romeo-spider',     'alfa-romeo', 'Spider',         false),

  -- Audi
  ('audi-a1',             'audi',         'A1',            true),
  ('audi-a3',             'audi',         'A3',            true),
  ('audi-a4',             'audi',         'A4',            true),
  ('audi-a5',             'audi',         'A5',            true),
  ('audi-a6',             'audi',         'A6',            true),
  ('audi-a7',             'audi',         'A7',            false),
  ('audi-a8',             'audi',         'A8',            false),
  ('audi-q2',             'audi',         'Q2',            true),
  ('audi-q3',             'audi',         'Q3',            true),
  ('audi-q4-e-tron',      'audi',         'Q4 e-tron',     true),
  ('audi-q5',             'audi',         'Q5',            true),
  ('audi-q7',             'audi',         'Q7',            true),
  ('audi-q8',             'audi',         'Q8',            false),
  ('audi-q8-e-tron',      'audi',         'Q8 e-tron',     false),
  ('audi-e-tron-gt',      'audi',         'e-tron GT',     false),
  ('audi-tt',             'audi',         'TT',            false),
  ('audi-r8',             'audi',         'R8',            false),
  ('audi-rs3',            'audi',         'RS3',           false),
  ('audi-rs6',            'audi',         'RS6',           false),

  -- BMW
  ('bmw-serie-1',         'bmw',          'Serie 1',       true),
  ('bmw-serie-2',         'bmw',          'Serie 2',       true),
  ('bmw-serie-3',         'bmw',          'Serie 3',       true),
  ('bmw-serie-4',         'bmw',          'Serie 4',       true),
  ('bmw-serie-5',         'bmw',          'Serie 5',       true),
  ('bmw-serie-6',         'bmw',          'Serie 6',       false),
  ('bmw-serie-7',         'bmw',          'Serie 7',       false),
  ('bmw-serie-8',         'bmw',          'Serie 8',       false),
  ('bmw-x1',              'bmw',          'X1',            true),
  ('bmw-x2',              'bmw',          'X2',            true),
  ('bmw-x3',              'bmw',          'X3',            true),
  ('bmw-x4',              'bmw',          'X4',            true),
  ('bmw-x5',              'bmw',          'X5',            true),
  ('bmw-x6',              'bmw',          'X6',            false),
  ('bmw-x7',              'bmw',          'X7',            false),
  ('bmw-z4',              'bmw',          'Z4',            false),
  ('bmw-i4',              'bmw',          'i4',            true),
  ('bmw-i5',              'bmw',          'i5',            false),
  ('bmw-i7',              'bmw',          'i7',            false),
  ('bmw-ix',              'bmw',          'iX',            true),
  ('bmw-ix1',             'bmw',          'iX1',           true),
  ('bmw-ix2',             'bmw',          'iX2',           false),
  ('bmw-ix3',             'bmw',          'iX3',           false),
  ('bmw-m2',              'bmw',          'M2',            false),
  ('bmw-m3',              'bmw',          'M3',            false),
  ('bmw-m4',              'bmw',          'M4',            false),
  ('bmw-m5',              'bmw',          'M5',            false),

  -- Citroën
  ('citroen-c3',          'citroen',      'C3',            true),
  ('citroen-c3-aircross', 'citroen',      'C3 Aircross',   true),
  ('citroen-c4',          'citroen',      'C4',            true),
  ('citroen-c4-x',        'citroen',      'C4 X',          false),
  ('citroen-c5-aircross', 'citroen',      'C5 Aircross',   true),
  ('citroen-c5-x',        'citroen',      'C5 X',          false),
  ('citroen-berlingo',    'citroen',      'Berlingo',      true),
  ('citroen-jumpy',       'citroen',      'Jumpy',         false),
  ('citroen-jumper',      'citroen',      'Jumper',        false),
  ('citroen-spacetourer', 'citroen',      'Spacetourer',   false),
  ('citroen-ami',         'citroen',      'Ami',           false),
  ('citroen-e-c3',        'citroen',      'ë-C3',          true),
  ('citroen-e-c4',        'citroen',      'ë-C4',          false),

  -- CUPRA
  ('cupra-leon',          'cupra',        'Leon',          true),
  ('cupra-formentor',     'cupra',        'Formentor',     true),
  ('cupra-ateca',         'cupra',        'Ateca',         false),
  ('cupra-born',          'cupra',        'Born',          true),
  ('cupra-tavascan',      'cupra',        'Tavascan',      false),
  ('cupra-terramar',      'cupra',        'Terramar',      false),
  ('cupra-raval',         'cupra',        'Raval',         false),

  -- Dacia
  ('dacia-sandero',       'dacia',        'Sandero',       true),
  ('dacia-duster',        'dacia',        'Duster',        true),
  ('dacia-jogger',        'dacia',        'Jogger',        true),
  ('dacia-spring',        'dacia',        'Spring',        true),
  ('dacia-bigster',       'dacia',        'Bigster',       false),
  ('dacia-logan',         'dacia',        'Logan',         false),
  ('dacia-lodgy',         'dacia',        'Lodgy',         false),
  ('dacia-dokker',        'dacia',        'Dokker',        false),

  -- DS Automobiles
  ('ds-3',                'ds-automobiles', 'DS 3',        true),
  ('ds-4',                'ds-automobiles', 'DS 4',        true),
  ('ds-7',                'ds-automobiles', 'DS 7',        true),
  ('ds-9',                'ds-automobiles', 'DS 9',        false),
  ('ds-n4',               'ds-automobiles', 'N°4',         false),
  ('ds-n8',               'ds-automobiles', 'N°8',         false),

  -- Fiat
  ('fiat-panda',          'fiat',         'Panda',         true),
  ('fiat-500',            'fiat',         '500',           true),
  ('fiat-500e',           'fiat',         '500e',          true),
  ('fiat-500c',           'fiat',         '500C',          true),
  ('fiat-500l',           'fiat',         '500L',          false),
  ('fiat-500x',           'fiat',         '500X',          true),
  ('fiat-600e',           'fiat',         '600e',          true),
  ('fiat-tipo',           'fiat',         'Tipo',          true),
  ('fiat-punto',          'fiat',         'Punto',         false),
  ('fiat-bravo',          'fiat',         'Bravo',         false),
  ('fiat-doblo',          'fiat',         'Doblò',         true),
  ('fiat-ducato',         'fiat',         'Ducato',        true),
  ('fiat-fiorino',        'fiat',         'Fiorino',       false),
  ('fiat-talento',        'fiat',         'Talento',       false),
  ('fiat-fullback',       'fiat',         'Fullback',      false),
  ('fiat-freemont',       'fiat',         'Freemont',      false),
  ('fiat-grande-panda',   'fiat',         'Grande Panda',  true),
  ('fiat-topolino',       'fiat',         'Topolino',      false),

  -- Ford
  ('ford-fiesta',         'ford',         'Fiesta',        true),
  ('ford-focus',          'ford',         'Focus',         true),
  ('ford-puma',           'ford',         'Puma',          true),
  ('ford-puma-gen-e',     'ford',         'Puma Gen-E',    false),
  ('ford-kuga',           'ford',         'Kuga',          true),
  ('ford-mondeo',         'ford',         'Mondeo',        false),
  ('ford-mustang',        'ford',         'Mustang',       false),
  ('ford-mustang-mach-e', 'ford',         'Mustang Mach-E', true),
  ('ford-explorer',       'ford',         'Explorer',      false),
  ('ford-edge',           'ford',         'Edge',          false),
  ('ford-ecosport',       'ford',         'EcoSport',      true),
  ('ford-galaxy',         'ford',         'Galaxy',        false),
  ('ford-s-max',          'ford',         'S-Max',         false),
  ('ford-c-max',          'ford',         'C-Max',         false),
  ('ford-b-max',          'ford',         'B-Max',         false),
  ('ford-ranger',         'ford',         'Ranger',        true),
  ('ford-ranger-raptor',  'ford',         'Ranger Raptor', false),
  ('ford-transit',        'ford',         'Transit',       true),
  ('ford-transit-custom', 'ford',         'Transit Custom', true),
  ('ford-transit-courier','ford',         'Transit Courier', false),
  ('ford-tourneo-custom', 'ford',         'Tourneo Custom', false),
  ('ford-tourneo-courier','ford',         'Tourneo Courier', false),
  ('ford-e-transit',      'ford',         'E-Transit',     false),
  ('ford-ka',             'ford',         'Ka/Ka+',        false),

  -- Honda
  ('honda-jazz',          'honda',        'Jazz',          true),
  ('honda-civic',         'honda',        'Civic',         true),
  ('honda-cr-v',          'honda',        'CR-V',          true),
  ('honda-hr-v',          'honda',        'HR-V',          true),
  ('honda-zr-v',          'honda',        'ZR-V',          true),
  ('honda-e',             'honda',        'e',             false),
  ('honda-e-ny1',         'honda',        'e:Ny1',         false),
  ('honda-accord',        'honda',        'Accord',        false),
  ('honda-nsx',           'honda',        'NSX',           false),

  -- Hyundai
  ('hyundai-i10',         'hyundai',      'i10',           true),
  ('hyundai-i20',         'hyundai',      'i20',           true),
  ('hyundai-i30',         'hyundai',      'i30',           true),
  ('hyundai-tucson',      'hyundai',      'Tucson',        true),
  ('hyundai-santa-fe',    'hyundai',      'Santa Fe',      true),
  ('hyundai-kona',        'hyundai',      'Kona',          true),
  ('hyundai-bayon',       'hyundai',      'Bayon',         true),
  ('hyundai-ioniq',       'hyundai',      'IONIQ',         false),
  ('hyundai-ioniq-5',     'hyundai',      'IONIQ 5',       true),
  ('hyundai-ioniq-6',     'hyundai',      'IONIQ 6',       true),
  ('hyundai-ioniq-9',     'hyundai',      'IONIQ 9',       false),
  ('hyundai-staria',      'hyundai',      'STARIA',        false),
  ('hyundai-inster',      'hyundai',      'Inster',        false),
  ('hyundai-palisade',    'hyundai',      'PALISADE',      false),
  ('hyundai-nexo',        'hyundai',      'NEXO',          false),

  -- Jaguar
  ('jaguar-xe',           'jaguar',       'XE',            false),
  ('jaguar-xf',           'jaguar',       'XF',            false),
  ('jaguar-f-pace',       'jaguar',       'F-Pace',        true),
  ('jaguar-e-pace',       'jaguar',       'E-Pace',        true),
  ('jaguar-i-pace',       'jaguar',       'I-Pace',        true),
  ('jaguar-f-type',       'jaguar',       'F-Type',        false),

  -- Jeep
  ('jeep-renegade',       'jeep',         'Renegade',      true),
  ('jeep-compass',        'jeep',         'Compass',       true),
  ('jeep-cherokee',       'jeep',         'Cherokee',      true),
  ('jeep-grand-cherokee', 'jeep',         'Grand Cherokee', true),
  ('jeep-wrangler',       'jeep',         'Wrangler',      true),
  ('jeep-gladiator',      'jeep',         'Gladiator',     false),
  ('jeep-avenger',        'jeep',         'Avenger',       true),
  ('jeep-commander',      'jeep',         'Commander',     false),

  -- Kia
  ('kia-picanto',         'kia',          'Picanto',       true),
  ('kia-rio',             'kia',          'Rio',           false),
  ('kia-stonic',          'kia',          'Stonic',        true),
  ('kia-ceed',            'kia',          'Ceed',          true),
  ('kia-proceed',         'kia',          'ProCeed',       false),
  ('kia-xceed',           'kia',          'XCeed',         true),
  ('kia-niro',            'kia',          'Niro',          true),
  ('kia-sportage',        'kia',          'Sportage',      true),
  ('kia-sorento',         'kia',          'Sorento',       true),
  ('kia-stinger',         'kia',          'Stinger',       false),
  ('kia-ev3',             'kia',          'EV3',           true),
  ('kia-ev4',             'kia',          'EV4',           false),
  ('kia-ev5',             'kia',          'EV5',           false),
  ('kia-ev6',             'kia',          'EV6',           true),
  ('kia-ev9',             'kia',          'EV9',           false),

  -- Lancia
  ('lancia-ypsilon',      'lancia',       'Ypsilon',       true),
  ('lancia-delta',        'lancia',       'Delta',         false),

  -- Land Rover
  ('land-rover-defender',                'land-rover', 'Defender',             true),
  ('land-rover-discovery',               'land-rover', 'Discovery',            true),
  ('land-rover-discovery-sport',         'land-rover', 'Discovery Sport',      true),
  ('land-rover-range-rover',             'land-rover', 'Range Rover',          true),
  ('land-rover-range-rover-sport',       'land-rover', 'Range Rover Sport',    true),
  ('land-rover-range-rover-evoque',      'land-rover', 'Range Rover Evoque',   true),
  ('land-rover-range-rover-velar',       'land-rover', 'Range Rover Velar',    true),

  -- Lexus
  ('lexus-ux',            'lexus',        'UX',            true),
  ('lexus-nx',            'lexus',        'NX',            true),
  ('lexus-rx',            'lexus',        'RX',            true),
  ('lexus-lbx',           'lexus',        'LBX',           true),
  ('lexus-rz',            'lexus',        'RZ',            false),
  ('lexus-lm',            'lexus',        'LM',            false),
  ('lexus-es',            'lexus',        'ES',            false),
  ('lexus-ls',            'lexus',        'LS',            false),
  ('lexus-lc',            'lexus',        'LC',            false),

  -- Maserati
  ('maserati-ghibli',     'maserati',     'Ghibli',        false),
  ('maserati-quattroporte','maserati',    'Quattroporte',  false),
  ('maserati-levante',    'maserati',     'Levante',       false),
  ('maserati-grecale',    'maserati',     'Grecale',       true),
  ('maserati-mc20',       'maserati',     'MC20',          false),
  ('maserati-granturismo','maserati',     'GranTurismo',   false),
  ('maserati-grancabrio', 'maserati',     'GranCabrio',    false),

  -- Mazda
  ('mazda-2',             'mazda',        'Mazda2',        true),
  ('mazda-3',             'mazda',        'Mazda3',        true),
  ('mazda-6',             'mazda',        'Mazda6',        false),
  ('mazda-cx-3',          'mazda',        'CX-3',          true),
  ('mazda-cx-5',          'mazda',        'CX-5',          true),
  ('mazda-cx-30',         'mazda',        'CX-30',         true),
  ('mazda-cx-60',         'mazda',        'CX-60',         true),
  ('mazda-cx-80',         'mazda',        'CX-80',         false),
  ('mazda-mx-5',          'mazda',        'MX-5',          true),
  ('mazda-mx-30',         'mazda',        'MX-30',         false),
  ('mazda-6e',            'mazda',        '6e',            false),

  -- Mercedes-Benz
  ('mercedes-classe-a',   'mercedes-benz','Classe A',      true),
  ('mercedes-classe-b',   'mercedes-benz','Classe B',      true),
  ('mercedes-classe-c',   'mercedes-benz','Classe C',      true),
  ('mercedes-classe-e',   'mercedes-benz','Classe E',      true),
  ('mercedes-classe-s',   'mercedes-benz','Classe S',      true),
  ('mercedes-cla',        'mercedes-benz','CLA',           true),
  ('mercedes-cle',        'mercedes-benz','CLE',           true),
  ('mercedes-gla',        'mercedes-benz','GLA',           true),
  ('mercedes-glb',        'mercedes-benz','GLB',           true),
  ('mercedes-glc',        'mercedes-benz','GLC',           true),
  ('mercedes-gle',        'mercedes-benz','GLE',           true),
  ('mercedes-gls',        'mercedes-benz','GLS',           true),
  ('mercedes-g',          'mercedes-benz','Classe G',      true),
  ('mercedes-eqa',        'mercedes-benz','EQA',           true),
  ('mercedes-eqb',        'mercedes-benz','EQB',           true),
  ('mercedes-eqe',        'mercedes-benz','EQE',           true),
  ('mercedes-eqs',        'mercedes-benz','EQS',           true),
  ('mercedes-sl',         'mercedes-benz','SL',            false),
  ('mercedes-amg-gt',     'mercedes-benz','AMG GT',        false),
  ('mercedes-vito',       'mercedes-benz','Vito',          true),
  ('mercedes-sprinter',   'mercedes-benz','Sprinter',      true),
  ('mercedes-v-class',    'mercedes-benz','Classe V',      true),
  ('mercedes-citan',      'mercedes-benz','Citan',         true),
  ('mercedes-t-class',    'mercedes-benz','T-Class',       false),

  -- MG
  ('mg-zs',               'mg',           'ZS',            true),
  ('mg-mg3',              'mg',           'MG3',           true),
  ('mg-mg4',              'mg',           'MG4',           true),
  ('mg-mg5',              'mg',           'MG5',           true),
  ('mg-hs',               'mg',           'HS',            true),
  ('mg-ehs',              'mg',           'EHS',           false),
  ('mg-marvel-r',         'mg',           'Marvel R',      false),
  ('mg-cyberster',        'mg',           'Cyberster',     false),
  ('mg-mgs5-ev',          'mg',           'MGS5 EV',       false),

  -- MINI
  ('mini-cooper',         'mini',         'Cooper',        true),
  ('mini-cooper-cabrio',  'mini',         'Cooper Cabrio', true),
  ('mini-clubman',        'mini',         'Clubman',       false),
  ('mini-countryman',     'mini',         'Countryman',    true),
  ('mini-aceman',         'mini',         'Aceman',        true),
  ('mini-john-cooper-works','mini',       'John Cooper Works', false),

  -- Mitsubishi
  ('mitsubishi-asx',      'mitsubishi',   'ASX',           true),
  ('mitsubishi-eclipse-cross','mitsubishi','Eclipse Cross', true),
  ('mitsubishi-outlander','mitsubishi',   'Outlander',     true),
  ('mitsubishi-space-star','mitsubishi',  'Space Star',    true),
  ('mitsubishi-l200',     'mitsubishi',   'L200',          true),

  -- Nissan
  ('nissan-micra',        'nissan',       'Micra',         true),
  ('nissan-juke',         'nissan',       'Juke',          true),
  ('nissan-qashqai',      'nissan',       'Qashqai',       true),
  ('nissan-x-trail',      'nissan',       'X-Trail',       true),
  ('nissan-leaf',         'nissan',       'Leaf',          true),
  ('nissan-ariya',        'nissan',       'Ariya',         true),
  ('nissan-townstar',     'nissan',       'Townstar',      true),
  ('nissan-townstar-ev',  'nissan',       'Townstar EV',   false),
  ('nissan-navara',       'nissan',       'Navara',        false),
  ('nissan-350z',         'nissan',       '350Z',          false),
  ('nissan-370z',         'nissan',       '370Z',          false),
  ('nissan-gt-r',         'nissan',       'GT-R',          false),

  -- Opel
  ('opel-corsa',          'opel',         'Corsa',         true),
  ('opel-corsa-e',        'opel',         'Corsa-e',       true),
  ('opel-astra',          'opel',         'Astra',         true),
  ('opel-mokka',          'opel',         'Mokka',         true),
  ('opel-mokka-e',        'opel',         'Mokka-E',       true),
  ('opel-grandland',      'opel',         'Grandland',     true),
  ('opel-crossland',      'opel',         'Crossland',     true),
  ('opel-combo',          'opel',         'Combo',         true),
  ('opel-combo-life',     'opel',         'Combo Life',    true),
  ('opel-combo-e',        'opel',         'Combo-e',       false),
  ('opel-zafira',         'opel',         'Zafira',        true),
  ('opel-vivaro',         'opel',         'Vivaro',        true),
  ('opel-vivaro-e',       'opel',         'Vivaro-e',      false),
  ('opel-movano',         'opel',         'Movano',        true),
  ('opel-movano-e',       'opel',         'Movano-e',      false),
  ('opel-insignia',       'opel',         'Insignia',      false),
  ('opel-rocks-e',        'opel',         'Rocks-e',       false),

  -- Peugeot
  ('peugeot-108',         'peugeot',      '108',           false),
  ('peugeot-208',         'peugeot',      '208',           true),
  ('peugeot-e-208',       'peugeot',      'e-208',         true),
  ('peugeot-2008',        'peugeot',      '2008',          true),
  ('peugeot-e-2008',      'peugeot',      'e-2008',        true),
  ('peugeot-308',         'peugeot',      '308',           true),
  ('peugeot-408',         'peugeot',      '408',           true),
  ('peugeot-3008',        'peugeot',      '3008',          true),
  ('peugeot-5008',        'peugeot',      '5008',          true),
  ('peugeot-508',         'peugeot',      '508',           false),
  ('peugeot-rifter',      'peugeot',      'Rifter',        true),
  ('peugeot-e-rifter',    'peugeot',      'e-Rifter',      false),
  ('peugeot-partner',     'peugeot',      'Partner',       true),
  ('peugeot-traveller',   'peugeot',      'Traveller',     true),
  ('peugeot-e-traveller', 'peugeot',      'e-Traveller',   false),
  ('peugeot-expert',      'peugeot',      'Expert',        true),
  ('peugeot-e-expert',    'peugeot',      'e-Expert',      false),
  ('peugeot-boxer',       'peugeot',      'Boxer',         true),

  -- Polestar
  ('polestar-2',          'polestar',     'Polestar 2',    true),
  ('polestar-3',          'polestar',     'Polestar 3',    true),
  ('polestar-4',          'polestar',     'Polestar 4',    true),
  ('polestar-5',          'polestar',     'Polestar 5',    false),

  -- Porsche
  ('porsche-911',         'porsche',      '911',           true),
  ('porsche-718',         'porsche',      '718',           true),
  ('porsche-718-cayman',  'porsche',      '718 Cayman',    false),
  ('porsche-718-boxster', 'porsche',      '718 Boxster',   false),
  ('porsche-cayenne',     'porsche',      'Cayenne',       true),
  ('porsche-macan',       'porsche',      'Macan',         true),
  ('porsche-panamera',    'porsche',      'Panamera',      true),
  ('porsche-taycan',      'porsche',      'Taycan',        true),

  -- Renault
  ('renault-clio',        'renault',      'Clio',          true),
  ('renault-captur',      'renault',      'Captur',        true),
  ('renault-megane',      'renault',      'Megane',        true),
  ('renault-megane-e-tech','renault',     'Megane E-Tech', true),
  ('renault-scenic',      'renault',      'Scenic',        true),
  ('renault-arkana',      'renault',      'Arkana',        true),
  ('renault-austral',     'renault',      'Austral',       true),
  ('renault-rafale',      'renault',      'Rafale',        false),
  ('renault-symbioz',     'renault',      'Symbioz',       false),
  ('renault-espace',      'renault',      'Espace',        false),
  ('renault-zoe',         'renault',      'ZOE',           true),
  ('renault-twingo',      'renault',      'Twingo',        true),
  ('renault-kadjar',      'renault',      'Kadjar',        true),
  ('renault-koleos',      'renault',      'Koleos',        false),
  ('renault-kangoo',      'renault',      'Kangoo',        true),
  ('renault-kangoo-e-tech','renault',     'Kangoo E-TECH', false),
  ('renault-trafic',      'renault',      'Trafic',        true),
  ('renault-master',      'renault',      'Master',        true),

  -- SEAT
  ('seat-ibiza',          'seat',         'Ibiza',         true),
  ('seat-leon',           'seat',         'Leon',          true),
  ('seat-arona',          'seat',         'Arona',         true),
  ('seat-ateca',          'seat',         'Ateca',         true),
  ('seat-tarraco',        'seat',         'Tarraco',       true),
  ('seat-mii',            'seat',         'Mii',           false),
  ('seat-alhambra',       'seat',         'Alhambra',      false),

  -- Skoda
  ('skoda-fabia',         'skoda',        'Fabia',         true),
  ('skoda-scala',         'skoda',        'Scala',         true),
  ('skoda-kamiq',         'skoda',        'Kamiq',         true),
  ('skoda-karoq',         'skoda',        'Karoq',         true),
  ('skoda-kodiaq',        'skoda',        'Kodiaq',        true),
  ('skoda-superb',        'skoda',        'Superb',        true),
  ('skoda-octavia',       'skoda',        'Octavia',       true),
  ('skoda-enyaq',         'skoda',        'Enyaq',         true),
  ('skoda-elroq',         'skoda',        'Elroq',         true),
  ('skoda-citigo',        'skoda',        'Citigo',        false),

  -- Smart
  ('smart-fortwo',        'smart',        'forTwo',        true),
  ('smart-forfour',       'smart',        'forFour',       true),
  ('smart-1',             'smart',        '#1',            true),
  ('smart-3',             'smart',        '#3',            true),
  ('smart-5',             'smart',        '#5',            false),

  -- Subaru
  ('subaru-impreza',      'subaru',       'Impreza',       false),
  ('subaru-outback',      'subaru',       'Outback',       true),
  ('subaru-forester',     'subaru',       'Forester',      true),
  ('subaru-xv',           'subaru',       'XV',            false),
  ('subaru-crosstrek',    'subaru',       'Crosstrek',     true),
  ('subaru-solterra',     'subaru',       'Solterra',      true),
  ('subaru-brz',          'subaru',       'BRZ',           false),

  -- Suzuki
  ('suzuki-ignis',        'suzuki',       'Ignis',         true),
  ('suzuki-swift',        'suzuki',       'Swift',         true),
  ('suzuki-vitara',       'suzuki',       'Vitara',        true),
  ('suzuki-s-cross',      'suzuki',       'S-Cross',       true),
  ('suzuki-jimny',        'suzuki',       'Jimny',         true),
  ('suzuki-across',       'suzuki',       'Across',        false),
  ('suzuki-swace',        'suzuki',       'Swace',         false),

  -- Tesla
  ('tesla-model-s',       'tesla',        'Model S',       true),
  ('tesla-model-3',       'tesla',        'Model 3',       true),
  ('tesla-model-x',       'tesla',        'Model X',       true),
  ('tesla-model-y',       'tesla',        'Model Y',       true),
  ('tesla-cybertruck',    'tesla',        'Cybertruck',    false),

  -- Toyota
  ('toyota-aygo-x',       'toyota',       'Aygo X',        true),
  ('toyota-yaris',        'toyota',       'Yaris',         true),
  ('toyota-yaris-cross',  'toyota',       'Yaris Cross',   true),
  ('toyota-corolla',      'toyota',       'Corolla',       true),
  ('toyota-corolla-cross','toyota',       'Corolla Cross', true),
  ('toyota-c-hr',         'toyota',       'C-HR',          true),
  ('toyota-c-hr-plus',    'toyota',       'C-HR+',         false),
  ('toyota-rav4',         'toyota',       'RAV 4',         true),
  ('toyota-bz4x',         'toyota',       'bZ4X',          true),
  ('toyota-highlander',   'toyota',       'Highlander',    true),
  ('toyota-land-cruiser', 'toyota',       'Land Cruiser',  true),
  ('toyota-hilux',        'toyota',       'Hilux',         true),
  ('toyota-prius',        'toyota',       'Prius',         true),
  ('toyota-mirai',        'toyota',       'Mirai',         false),
  ('toyota-supra',        'toyota',       'Supra',         false),
  ('toyota-gr86',         'toyota',       'GR86',          false),
  ('toyota-proace',       'toyota',       'Proace',        true),
  ('toyota-proace-city',  'toyota',       'Proace City',   true),
  ('toyota-proace-max',   'toyota',       'Proace Max',    false),
  ('toyota-alphard',      'toyota',       'Alphard',       false),

  -- Volkswagen
  ('volkswagen-up',       'volkswagen',   'up!',           true),
  ('volkswagen-polo',     'volkswagen',   'Polo',          true),
  ('volkswagen-golf',     'volkswagen',   'Golf',          true),
  ('volkswagen-passat',   'volkswagen',   'Passat',        true),
  ('volkswagen-arteon',   'volkswagen',   'Arteon',        false),
  ('volkswagen-t-cross',  'volkswagen',   'T-Cross',       true),
  ('volkswagen-taigo',    'volkswagen',   'Taigo',         true),
  ('volkswagen-t-roc',    'volkswagen',   'T-Roc',         true),
  ('volkswagen-tiguan',   'volkswagen',   'Tiguan',        true),
  ('volkswagen-tayron',   'volkswagen',   'Tayron',        true),
  ('volkswagen-touareg',  'volkswagen',   'Touareg',       true),
  ('volkswagen-touran',   'volkswagen',   'Touran',        true),
  ('volkswagen-sharan',   'volkswagen',   'Sharan',        false),
  ('volkswagen-id3',      'volkswagen',   'ID.3',          true),
  ('volkswagen-id4',      'volkswagen',   'ID.4',          true),
  ('volkswagen-id5',      'volkswagen',   'ID.5',          true),
  ('volkswagen-id7',      'volkswagen',   'ID.7',          true),
  ('volkswagen-id-buzz',  'volkswagen',   'ID. Buzz',      true),
  ('volkswagen-caddy',    'volkswagen',   'Caddy',         true),
  ('volkswagen-amarok',   'volkswagen',   'Amarok',        true),
  ('volkswagen-crafter',  'volkswagen',   'Crafter',       true),
  ('volkswagen-transporter','volkswagen', 'Transporter',   true),
  ('volkswagen-multivan', 'volkswagen',   'Multivan',      true),
  ('volkswagen-california','volkswagen',  'California',    true),
  ('volkswagen-grand-california','volkswagen','Grand California', false),

  -- Volvo
  ('volvo-xc40',          'volvo',        'XC40',          true),
  ('volvo-xc60',          'volvo',        'XC60',          true),
  ('volvo-xc90',          'volvo',        'XC90',          true),
  ('volvo-s60',           'volvo',        'S60',           true),
  ('volvo-s90',           'volvo',        'S90',           false),
  ('volvo-v60',           'volvo',        'V60',           true),
  ('volvo-v90',           'volvo',        'V90',           true),
  ('volvo-c40',           'volvo',        'C40',           true),
  ('volvo-ex30',          'volvo',        'EX30',          true),
  ('volvo-ex40',          'volvo',        'EX40',          true),
  ('volvo-ec40',          'volvo',        'EC40',          false),
  ('volvo-ex90',          'volvo',        'EX90',          true),
  ('volvo-es90',          'volvo',        'ES90',          false),

  -- Alpine
  ('alpine-a110',         'alpine',       'A110',          true),
  ('alpine-a290',         'alpine',       'A290',          true),
  ('alpine-a390',         'alpine',       'A390',          false),

  -- Genesis
  ('genesis-g70',         'genesis',      'G70',           false),
  ('genesis-g80',         'genesis',      'G80',           false),
  ('genesis-gv60',        'genesis',      'GV60',          true),
  ('genesis-gv70',        'genesis',      'GV70',          true),
  ('genesis-gv80',        'genesis',      'GV80',          true),

  -- BYD
  ('byd-dolphin',         'byd',          'Dolphin',       true),
  ('byd-dolphin-surf',    'byd',          'Dolphin Surf',  true),
  ('byd-atto-3',          'byd',          'Atto 3',        true),
  ('byd-atto-2',          'byd',          'Atto 2',        true),
  ('byd-seal',            'byd',          'Seal',          true),
  ('byd-seal-u',          'byd',          'Seal U',        true),
  ('byd-seal-6',          'byd',          'Seal 6',        false),
  ('byd-sealion-7',       'byd',          'Sealion 7',     true),
  ('byd-han',             'byd',          'Han',           false),
  ('byd-tang',            'byd',          'Tang',          false),

  -- NIO / Xpeng / Leapmotor
  ('nio-et5',             'nio',          'ET5',           false),
  ('nio-et7',             'nio',          'ET7',           false),
  ('nio-el6',             'nio',          'EL6',           false),
  ('nio-el7',             'nio',          'EL7',           false),
  ('xpeng-p7',            'xpeng',        'P7',            false),
  ('xpeng-g6',            'xpeng',        'G6',            false),
  ('xpeng-g9',            'xpeng',        'G9',            false),
  ('leapmotor-c10',       'leapmotor',    'C10',           true),
  ('leapmotor-t03',       'leapmotor',    'T03',           true),
  ('leapmotor-b10',       'leapmotor',    'B10',           false),

  -- Omoda / Jaecoo
  ('omoda-5',             'omoda',        '5',             true),
  ('omoda-7',             'omoda',        '7',             false),
  ('omoda-9',             'omoda',        '9',             false),
  ('jaecoo-7',            'jaecoo',       'J7',            true),
  ('jaecoo-5',            'jaecoo',       'J5',            false),
  ('jaecoo-8',            'jaecoo',       'J8',            false),

  -- Lotus
  ('lotus-emira',         'lotus',        'Emira',         false),
  ('lotus-eletre',        'lotus',        'Eletre',        false),
  ('lotus-emeya',         'lotus',        'Emeya',         false),

  -- Premium sportive
  ('ferrari-296',         'ferrari',      '296',           false),
  ('ferrari-roma',        'ferrari',      'Roma',          false),
  ('ferrari-purosangue',  'ferrari',      'Purosangue',    false),
  ('ferrari-12cilindri',  'ferrari',      '12 Cilindri',   false),
  ('ferrari-amalfi',      'ferrari',      'Amalfi',        false),
  ('lamborghini-urus',    'lamborghini',  'Urus',          false),
  ('lamborghini-revuelto','lamborghini',  'Revuelto',      false),
  ('lamborghini-temerario','lamborghini', 'Temerario',     false),
  ('mclaren-artura',      'mclaren',      'Artura',        false),
  ('mclaren-gts',         'mclaren',      'GTS',           false),
  ('aston-martin-db12',   'aston-martin', 'DB12',          false),
  ('aston-martin-dbx',    'aston-martin', 'DBX',           false),
  ('aston-martin-vantage','aston-martin', 'Vantage',       false),
  ('bentley-continental-gt','bentley',    'Continental GT', false),
  ('bentley-bentayga',    'bentley',      'Bentayga',      false),
  ('bentley-flying-spur', 'bentley',      'Flying Spur',   false),
  ('rolls-royce-ghost',   'rolls-royce',  'Ghost',         false),
  ('rolls-royce-spectre', 'rolls-royce',  'Spectre',       false),
  ('rolls-royce-cullinan','rolls-royce',  'Cullinan',      false),
  ('rolls-royce-phantom', 'rolls-royce',  'Phantom',       false),

  -- VinFast / Lucid / Rivian / Zeekr / Lynk
  ('vinfast-vf6',         'vinfast',      'VF 6',          false),
  ('vinfast-vf7',         'vinfast',      'VF 7',          false),
  ('vinfast-vf8',         'vinfast',      'VF 8',          false),
  ('vinfast-vf9',         'vinfast',      'VF 9',          false),
  ('lucid-air',           'lucid',        'Air',           false),
  ('lucid-gravity',       'lucid',        'Gravity',       false),
  ('rivian-r1t',          'rivian',       'R1T',           false),
  ('rivian-r1s',          'rivian',       'R1S',           false),
  ('zeekr-001',           'zeekr',        '001',           false),
  ('zeekr-x',             'zeekr',        'X',             false),
  ('zeekr-7x',            'zeekr',        '7X',            false),
  ('lynk-co-01',          'lynk-co',      '01',            false),
  ('lynk-co-02',          'lynk-co',      '02',            false),
  ('lynk-co-08',          'lynk-co',      '08',            false),

  -- Ineos
  ('ineos-grenadier',     'ineos',        'Grenadier',     false),

  -- DR Automobiles (Italia)
  ('dr-1',                'dr-automobiles', 'DR1',         false),
  ('dr-3',                'dr-automobiles', 'DR3',         false),
  ('dr-5-0',              'dr-automobiles', 'DR 5.0',      false),
  ('dr-6-0',              'dr-automobiles', 'DR 6.0',      false),
  ('dr-7-0',              'dr-automobiles', 'DR 7.0',      false),
  ('dr-katay',            'dr-automobiles', 'KATAY',       false),

  -- Sportequipe / EVO (Italia)
  ('sportequipe-5',       'sportequipe',  'Sportequipe 5', false),
  ('sportequipe-6',       'sportequipe',  'Sportequipe 6', false),
  ('sportequipe-7',       'sportequipe',  'Sportequipe 7', false),
  ('sportequipe-8',       'sportequipe',  'Sportequipe 8', false),
  ('evo-3',               'evo',          'EVO3',          false),
  ('evo-4',               'evo',          'EVO4',          false),
  ('evo-5',               'evo',          'EVO5',          false),
  ('evo-6',               'evo',          'EVO6',          false),
  ('evo-cross4',          'evo',          'Cross4',        false),

  -- Maxus (van EV, presenti in flotte commerciali)
  ('maxus-edeliver-3',    'maxus',        'eDeliver 3',    false),
  ('maxus-edeliver-7',    'maxus',        'eDeliver 7',    false),
  ('maxus-edeliver-9',    'maxus',        'eDeliver 9',    false),
  ('maxus-mifa-9',        'maxus',        'Mifa 9',        false),
  ('maxus-t90',           'maxus',        'T90',           false),
  ('maxus-eterron-9',     'maxus',        'eTERRON 9',     false),

  -- GWM / Haval (cinesi mainstream EU)
  ('gwm-haval-h6',        'gwm',          'HAVAL H6',      false),
  ('gwm-haval-jolion',    'gwm',          'HAVAL Jolion Pro', false),
  ('gwm-ora-03',          'gwm',          'ORA 03',        false),
  ('gwm-ora-07',          'gwm',          'ORA 07',        false),
  ('gwm-wey-03',          'gwm',          'WEY 03',        false),
  ('gwm-wey-05',          'gwm',          'WEY 05',        false),
  ('haval-h6',            'haval',        'H6',            false),
  ('haval-h9',            'haval',        'H9',            false),

  -- Forthing
  ('forthing-t5-evo',     'forthing',     'T5 Evo',        false),
  ('forthing-s7',         'forthing',     'S7',            false),
  ('forthing-v9',         'forthing',     'V9',            false)
on conflict (id) do nothing;

-- ==========================================================
-- NOTA: NON serve importare il dataset AutoScout24 completo (288/4900).
-- Quel dataset include in massa: oldtimer, kit-car, quadricicli, camper,
-- placeholder "Others", marche fantasma — tutto fuori scope noleggio.
--
-- Se in futuro emerge una marca che gli host scrivono spesso in free-text:
-- 1. verifica che rispetti la policy in alto
-- 2. aggiungi una riga insert qui o tramite "Diventa noleggiatore"
--    (l'host può proporre nuove marche via free-text e l'admin promuove)
-- ==========================================================
