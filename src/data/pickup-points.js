/**
 * MoviQ — Dizionario dei punti di ritiro auto per città
 * ------------------------------------------------------
 * Per ogni città: stazione ferroviaria, aeroporto, porto (dove presente),
 * centro città. Pensato per alimentare il selettore "Dove" e i marker su /cerca.
 *
 * NOTA sulle coordinate: sono approssimate (centroide del punto di interesse).
 * Affidabili a livello di marker/zoom mappa, ma vanno verificate prima di
 * usarle per geofencing o calcolo distanze in produzione.
 */




export const PUNTI_RITIRO = {
  roma: {
    slug: "roma",
    nome: "Roma",
    regione: "Lazio",
    provincia: "RM",
    lat: 41.9028,
    lng: 12.4964,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Roma Termini", lat: 41.9009, lng: 12.5021 },
      { tipo: "aeroporto", nome: "Aeroporto di Roma Fiumicino", codiceIata: "FCO", lat: 41.8003, lng: 12.2389 },
      { tipo: "aeroporto", nome: "Aeroporto di Roma Ciampino", codiceIata: "CIA", lat: 41.7994, lng: 12.5949 },
      { tipo: "porto", nome: "Porto di Civitavecchia", lat: 42.0939, lng: 11.7889 },
      { tipo: "centro", nome: "Roma Centro", lat: 41.8986, lng: 12.4769 },
    ],
  },

  milano: {
    slug: "milano",
    nome: "Milano",
    regione: "Lombardia",
    provincia: "MI",
    lat: 45.4642,
    lng: 9.19,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Milano Centrale", lat: 45.4862, lng: 9.2049 },
      { tipo: "aeroporto", nome: "Aeroporto di Milano Malpensa", codiceIata: "MXP", lat: 45.6306, lng: 8.7281 },
      { tipo: "aeroporto", nome: "Aeroporto di Milano Linate", codiceIata: "LIN", lat: 45.4451, lng: 9.2767 },
      { tipo: "aeroporto", nome: "Aeroporto di Bergamo Orio al Serio", codiceIata: "BGY", lat: 45.6739, lng: 9.7042 },
      { tipo: "centro", nome: "Milano Centro (Duomo)", lat: 45.4642, lng: 9.19 },
    ],
  },

  napoli: {
    slug: "napoli",
    nome: "Napoli",
    regione: "Campania",
    provincia: "NA",
    lat: 40.8518,
    lng: 14.2681,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Napoli Centrale", lat: 40.8527, lng: 14.2724 },
      { tipo: "aeroporto", nome: "Aeroporto di Napoli Capodichino", codiceIata: "NAP", lat: 40.8843, lng: 14.2908 },
      { tipo: "porto", nome: "Porto di Napoli", lat: 40.8398, lng: 14.2588 },
      { tipo: "centro", nome: "Napoli Centro Storico", lat: 40.8518, lng: 14.2588 },
    ],
  },

  torino: {
    slug: "torino",
    nome: "Torino",
    regione: "Piemonte",
    provincia: "TO",
    lat: 45.0703,
    lng: 7.6869,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Torino Porta Nuova", lat: 45.0623, lng: 7.6786 },
      { tipo: "aeroporto", nome: "Aeroporto di Torino Caselle", codiceIata: "TRN", lat: 45.2008, lng: 7.6497 },
      { tipo: "centro", nome: "Torino Centro", lat: 45.0703, lng: 7.6869 },
    ],
  },

  venezia: {
    slug: "venezia",
    nome: "Venezia",
    regione: "Veneto",
    provincia: "VE",
    lat: 45.4408,
    lng: 12.3155,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Venezia Santa Lucia", lat: 45.4412, lng: 12.3208 },
      { tipo: "aeroporto", nome: "Aeroporto di Venezia Marco Polo", codiceIata: "VCE", lat: 45.5053, lng: 12.3519 },
      { tipo: "porto", nome: "Porto di Venezia", lat: 45.4339, lng: 12.2986 },
      { tipo: "centro", nome: "Venezia Centro (Piazzale Roma)", lat: 45.4381, lng: 12.3186 },
    ],
  },

  firenze: {
    slug: "firenze",
    nome: "Firenze",
    regione: "Toscana",
    provincia: "FI",
    lat: 43.7696,
    lng: 11.2558,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Firenze Santa Maria Novella", lat: 43.7766, lng: 11.2481 },
      { tipo: "aeroporto", nome: "Aeroporto di Firenze Peretola", codiceIata: "FLR", lat: 43.81, lng: 11.2051 },
      { tipo: "centro", nome: "Firenze Centro", lat: 43.7696, lng: 11.2558 },
    ],
  },

  bologna: {
    slug: "bologna",
    nome: "Bologna",
    regione: "Emilia-Romagna",
    provincia: "BO",
    lat: 44.4949,
    lng: 11.3426,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Bologna Centrale", lat: 44.5057, lng: 11.3431 },
      { tipo: "aeroporto", nome: "Aeroporto di Bologna Guglielmo Marconi", codiceIata: "BLQ", lat: 44.5354, lng: 11.2887 },
      { tipo: "centro", nome: "Bologna Centro", lat: 44.4938, lng: 11.3426 },
    ],
  },

  genova: {
    slug: "genova",
    nome: "Genova",
    regione: "Liguria",
    provincia: "GE",
    lat: 44.4056,
    lng: 8.9463,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Genova Piazza Principe", lat: 44.4179, lng: 8.9224 },
      { tipo: "aeroporto", nome: "Aeroporto di Genova Cristoforo Colombo", codiceIata: "GOA", lat: 44.4133, lng: 8.8375 },
      { tipo: "porto", nome: "Porto di Genova", lat: 44.4072, lng: 8.9117 },
      { tipo: "centro", nome: "Genova Centro", lat: 44.4056, lng: 8.9463 },
    ],
  },

  palermo: {
    slug: "palermo",
    nome: "Palermo",
    regione: "Sicilia",
    provincia: "PA",
    lat: 38.1157,
    lng: 13.3615,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Palermo Centrale", lat: 38.1085, lng: 13.3653 },
      { tipo: "aeroporto", nome: "Aeroporto di Palermo Falcone-Borsellino", codiceIata: "PMO", lat: 38.1759, lng: 13.0911 },
      { tipo: "porto", nome: "Porto di Palermo", lat: 38.1378, lng: 13.3686 },
      { tipo: "centro", nome: "Palermo Centro", lat: 38.1157, lng: 13.3615 },
    ],
  },

  catania: {
    slug: "catania",
    nome: "Catania",
    regione: "Sicilia",
    provincia: "CT",
    lat: 37.5079,
    lng: 15.083,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Catania Centrale", lat: 37.5103, lng: 15.1031 },
      { tipo: "aeroporto", nome: "Aeroporto di Catania Fontanarossa", codiceIata: "CTA", lat: 37.4668, lng: 15.0664 },
      { tipo: "porto", nome: "Porto di Catania", lat: 37.4969, lng: 15.0928 },
      { tipo: "centro", nome: "Catania Centro", lat: 37.5079, lng: 15.083 },
    ],
  },

  bari: {
    slug: "bari",
    nome: "Bari",
    regione: "Puglia",
    provincia: "BA",
    lat: 41.1171,
    lng: 16.8719,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Bari Centrale", lat: 41.1177, lng: 16.8694 },
      { tipo: "aeroporto", nome: "Aeroporto di Bari Karol Wojtyła", codiceIata: "BRI", lat: 41.1389, lng: 16.7606 },
      { tipo: "porto", nome: "Porto di Bari", lat: 41.1378, lng: 16.8636 },
      { tipo: "centro", nome: "Bari Centro", lat: 41.1258, lng: 16.8669 },
    ],
  },

  cagliari: {
    slug: "cagliari",
    nome: "Cagliari",
    regione: "Sardegna",
    provincia: "CA",
    lat: 39.2238,
    lng: 9.1217,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Cagliari", lat: 39.2156, lng: 9.1108 },
      { tipo: "aeroporto", nome: "Aeroporto di Cagliari Elmas", codiceIata: "CAG", lat: 39.2515, lng: 9.0543 },
      { tipo: "porto", nome: "Porto di Cagliari", lat: 39.2069, lng: 9.1119 },
      { tipo: "centro", nome: "Cagliari Centro", lat: 39.2238, lng: 9.1217 },
    ],
  },

  verona: {
    slug: "verona",
    nome: "Verona",
    regione: "Veneto",
    provincia: "VR",
    lat: 45.4384,
    lng: 10.9916,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Verona Porta Nuova", lat: 45.4289, lng: 10.9819 },
      { tipo: "aeroporto", nome: "Aeroporto di Verona Villafranca (Catullo)", codiceIata: "VRN", lat: 45.3957, lng: 10.8885 },
      { tipo: "centro", nome: "Verona Centro", lat: 45.4384, lng: 10.9916 },
    ],
  },

  pisa: {
    slug: "pisa",
    nome: "Pisa",
    regione: "Toscana",
    provincia: "PI",
    lat: 43.7159,
    lng: 10.4018,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Pisa Centrale", lat: 43.7086, lng: 10.3984 },
      { tipo: "aeroporto", nome: "Aeroporto di Pisa Galileo Galilei", codiceIata: "PSA", lat: 43.6839, lng: 10.3927 },
      { tipo: "centro", nome: "Pisa Centro", lat: 43.7159, lng: 10.4018 },
    ],
  },

  olbia: {
    slug: "olbia",
    nome: "Olbia",
    regione: "Sardegna",
    provincia: "SS",
    lat: 40.9236,
    lng: 9.4986,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Olbia", lat: 40.9217, lng: 9.5031 },
      { tipo: "aeroporto", nome: "Aeroporto di Olbia Costa Smeralda", codiceIata: "OLB", lat: 40.8987, lng: 9.5176 },
      { tipo: "porto", nome: "Porto di Olbia (Isola Bianca)", lat: 40.9281, lng: 9.5283 },
      { tipo: "centro", nome: "Olbia Centro", lat: 40.9236, lng: 9.4986 },
    ],
  },

  brindisi: {
    slug: "brindisi",
    nome: "Brindisi",
    regione: "Puglia",
    provincia: "BR",
    lat: 40.6384,
    lng: 17.9461,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Brindisi", lat: 40.6411, lng: 17.9436 },
      { tipo: "aeroporto", nome: "Aeroporto di Brindisi Papola Casale", codiceIata: "BDS", lat: 40.6576, lng: 17.947 },
      { tipo: "porto", nome: "Porto di Brindisi", lat: 40.6497, lng: 17.9636 },
      { tipo: "centro", nome: "Brindisi Centro", lat: 40.6384, lng: 17.9461 },
    ],
  },

  "lamezia-terme": {
    slug: "lamezia-terme",
    nome: "Lamezia Terme",
    regione: "Calabria",
    provincia: "CZ",
    lat: 38.9658,
    lng: 16.3094,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Lamezia Terme Centrale", lat: 38.9442, lng: 16.2581 },
      { tipo: "aeroporto", nome: "Aeroporto di Lamezia Terme", codiceIata: "SUF", lat: 38.9054, lng: 16.2423 },
      { tipo: "centro", nome: "Lamezia Terme Centro", lat: 38.9658, lng: 16.3094 },
    ],
  },

  "reggio-calabria": {
    slug: "reggio-calabria",
    nome: "Reggio Calabria",
    regione: "Calabria",
    provincia: "RC",
    lat: 38.1102,
    lng: 15.6612,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Reggio Calabria Centrale", lat: 38.1037, lng: 15.6431 },
      { tipo: "aeroporto", nome: "Aeroporto di Reggio Calabria (Tito Minniti)", codiceIata: "REG", lat: 38.0712, lng: 15.6516 },
      { tipo: "porto", nome: "Porto di Reggio Calabria", lat: 38.1281, lng: 15.6469 },
      { tipo: "centro", nome: "Reggio Calabria Centro", lat: 38.1102, lng: 15.6612 },
    ],
  },

  trieste: {
    slug: "trieste",
    nome: "Trieste",
    regione: "Friuli-Venezia Giulia",
    provincia: "TS",
    lat: 45.6495,
    lng: 13.7768,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Trieste Centrale", lat: 45.6573, lng: 13.7711 },
      { tipo: "aeroporto", nome: "Aeroporto di Trieste Ronchi dei Legionari", codiceIata: "TRS", lat: 45.8275, lng: 13.4722 },
      { tipo: "porto", nome: "Porto di Trieste", lat: 45.6469, lng: 13.7589 },
      { tipo: "centro", nome: "Trieste Centro", lat: 45.6495, lng: 13.7768 },
    ],
  },

  ancona: {
    slug: "ancona",
    nome: "Ancona",
    regione: "Marche",
    provincia: "AN",
    lat: 43.6158,
    lng: 13.5189,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Ancona", lat: 43.6064, lng: 13.5006 },
      { tipo: "aeroporto", nome: "Aeroporto delle Marche (Falconara)", codiceIata: "AOI", lat: 43.6163, lng: 13.3623 },
      { tipo: "porto", nome: "Porto di Ancona", lat: 43.6217, lng: 13.5036 },
      { tipo: "centro", nome: "Ancona Centro", lat: 43.6158, lng: 13.5189 },
    ],
  },

  rimini: {
    slug: "rimini",
    nome: "Rimini",
    regione: "Emilia-Romagna",
    provincia: "RN",
    lat: 44.0678,
    lng: 12.5695,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Rimini", lat: 44.0703, lng: 12.5642 },
      { tipo: "aeroporto", nome: "Aeroporto di Rimini Federico Fellini", codiceIata: "RMI", lat: 44.0203, lng: 12.6117 },
      { tipo: "porto", nome: "Porto di Rimini", lat: 44.0758, lng: 12.5781 },
      { tipo: "centro", nome: "Rimini Centro", lat: 44.0594, lng: 12.5683 },
    ],
  },

  pescara: {
    slug: "pescara",
    nome: "Pescara",
    regione: "Abruzzo",
    provincia: "PE",
    lat: 42.4618,
    lng: 14.2161,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Pescara Centrale", lat: 42.4631, lng: 14.2089 },
      { tipo: "aeroporto", nome: "Aeroporto d'Abruzzo (Pescara)", codiceIata: "PSR", lat: 42.4317, lng: 14.1811 },
      { tipo: "porto", nome: "Porto di Pescara", lat: 42.4694, lng: 14.2233 },
      { tipo: "centro", nome: "Pescara Centro", lat: 42.4618, lng: 14.2161 },
    ],
  },

  alghero: {
    slug: "alghero",
    nome: "Alghero",
    regione: "Sardegna",
    provincia: "SS",
    lat: 40.5589,
    lng: 8.3192,
    puntiRitiro: [
      { tipo: "aeroporto", nome: "Aeroporto di Alghero Fertilia", codiceIata: "AHO", lat: 40.6321, lng: 8.2908 },
      { tipo: "porto", nome: "Porto di Alghero", lat: 40.5611, lng: 8.3133 },
      { tipo: "centro", nome: "Alghero Centro", lat: 40.5589, lng: 8.3192 },
    ],
  },

  salerno: {
    slug: "salerno",
    nome: "Salerno",
    regione: "Campania",
    provincia: "SA",
    lat: 40.6824,
    lng: 14.7681,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Salerno", lat: 40.6789, lng: 14.7706 },
      { tipo: "aeroporto", nome: "Aeroporto di Salerno Costa d'Amalfi", codiceIata: "QSR", lat: 40.6204, lng: 14.9114 },
      { tipo: "porto", nome: "Porto di Salerno", lat: 40.6739, lng: 14.7558 },
      { tipo: "centro", nome: "Salerno Centro", lat: 40.6824, lng: 14.7681 },
    ],
  },

  trapani: {
    slug: "trapani",
    nome: "Trapani",
    regione: "Sicilia",
    provincia: "TP",
    lat: 38.0176,
    lng: 12.5365,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Trapani", lat: 38.0142, lng: 12.5364 },
      { tipo: "aeroporto", nome: "Aeroporto di Trapani Birgi (Vincenzo Florio)", codiceIata: "TPS", lat: 37.9114, lng: 12.488 },
      { tipo: "porto", nome: "Porto di Trapani", lat: 38.0156, lng: 12.5089 },
      { tipo: "centro", nome: "Trapani Centro", lat: 38.0176, lng: 12.5365 },
    ],
  },

  perugia: {
    slug: "perugia",
    nome: "Perugia",
    regione: "Umbria",
    provincia: "PG",
    lat: 43.1107,
    lng: 12.3908,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Perugia Fontivegge", lat: 43.1019, lng: 12.3853 },
      { tipo: "aeroporto", nome: "Aeroporto dell'Umbria (San Francesco d'Assisi)", codiceIata: "PEG", lat: 43.0959, lng: 12.5132 },
      { tipo: "centro", nome: "Perugia Centro", lat: 43.1107, lng: 12.3908 },
    ],
  },

  treviso: {
    slug: "treviso",
    nome: "Treviso",
    regione: "Veneto",
    provincia: "TV",
    lat: 45.6669,
    lng: 12.245,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Treviso Centrale", lat: 45.6597, lng: 12.2447 },
      { tipo: "aeroporto", nome: "Aeroporto di Treviso Antonio Canova", codiceIata: "TSF", lat: 45.6484, lng: 12.1944 },
      { tipo: "centro", nome: "Treviso Centro", lat: 45.6669, lng: 12.245 },
    ],
  },

  bergamo: {
    slug: "bergamo",
    nome: "Bergamo",
    regione: "Lombardia",
    provincia: "BG",
    lat: 45.6983,
    lng: 9.6773,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Bergamo", lat: 45.6906, lng: 9.6708 },
      { tipo: "aeroporto", nome: "Aeroporto di Bergamo Orio al Serio", codiceIata: "BGY", lat: 45.6739, lng: 9.7042 },
      { tipo: "centro", nome: "Bergamo Centro", lat: 45.6983, lng: 9.6773 },
    ],
  },

  parma: {
    slug: "parma",
    nome: "Parma",
    regione: "Emilia-Romagna",
    provincia: "PR",
    lat: 44.8015,
    lng: 10.3279,
    puntiRitiro: [
      { tipo: "stazione", nome: "Stazione di Parma", lat: 44.8108, lng: 10.3289 },
      { tipo: "aeroporto", nome: "Aeroporto di Parma Giuseppe Verdi", codiceIata: "PMF", lat: 44.8245, lng: 10.2964 },
      { tipo: "centro", nome: "Parma Centro", lat: 44.8015, lng: 10.3279 },
    ],
  },
};

/** Lista piatta di tutte le città (utile per ciclare/seedare il DB). */
export const CITTA_LIST = Object.values(PUNTI_RITIRO);

/** Lista piatta di tutti i punti di ritiro con riferimento alla città. */
export const PUNTI_RITIRO_FLAT = CITTA_LIST.flatMap((c) =>
  c.puntiRitiro.map((p) => ({ ...p, cittaSlug: c.slug, citta: c.nome, provincia: c.provincia }))
);
