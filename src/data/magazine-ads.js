// Spazi pubblicitari del Magazine. Ogni slot vuoto (null) non viene renderizzato:
// niente box vuoti online finché non c'è un inserzionista. Quando uno slot è
// configurato, lo spazio è riservato con width/height fissi (niente layout shift).
//
// Formato di uno slot:
//   { href, alt, sponsor, image, mobileImage? }
//   image       → creatività desktop alla misura dello slot (vedi SIZES)
//   mobileImage → creatività mobile (solo top/bottom/infeed); senza, su mobile
//                 lo slot non compare.
//
// Esempio:
//   top: { href: 'https://…', alt: 'Veltra AllSeason 4', sponsor: 'Veltra',
//          image: 'https://res.cloudinary.com/…/970x250.jpg',
//          mobileImage: 'https://res.cloudinary.com/…/320x100.jpg' },

export const MAGAZINE_AD_SIZES = {
  top:     { desktop: [970, 250], mobile: [320, 100] },
  infeed:  { desktop: [728, 90],  mobile: [300, 250] },
  sidebar: { desktop: [300, 600], mobile: null },   // mai su mobile
  mid:     { desktop: [970, 250], mobile: null },   // mai su mobile
  bottom:  { desktop: [970, 90],  mobile: [320, 100] },
};

export const MAGAZINE_ADS = {
  top: null,
  infeed: null,
  sidebar: null,
  mid: null,
  bottom: null,
};
