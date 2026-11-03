// Stili del MoviQ Magazine (homepage /magazine). Struttura editoriale: griglie a
// ritmo variabile, bordi sottili, niente ombre; colori e font del brand MoviQ.
// Tutte le classi sono prefissate `.mq` e scoped sotto il root del magazine.

// Bricolage Grotesque variabile (larghezza + pesi 600–800) solo per il
// magazine: index.html carica il solo peso 600 per il resto del sito.
export const MAGAZINE_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,600..800&display=swap';

export function magazineCss(T) {
  const red = T.alert;      // accento testuale (contrasto AA su bianco)
  const D = T.fontDisplay;
  return `
.mq{background:${T.surface};color:${T.ink1};font-family:${T.fontBody};font-size:15px;line-height:1.5;flex:1}
.mq *{box-sizing:border-box}
.mq a{color:inherit;text-decoration:none}
.mq-wrap{max-width:1320px;margin:0 auto;padding:0 40px}
.mq-hd{font-family:${D};font-weight:800;font-stretch:85%;letter-spacing:-0.015em;line-height:1.1;margin:0;color:${T.ink1}}
.mq-kick{font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:${red}}
.mq-meta{font-size:12.5px;color:${T.ink3}}
.mq-dek{color:${T.ink2};margin:0}
.mq-img{display:block;overflow:hidden;background:${T.surfaceAlt}}
.mq-img img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.mq-img .mq-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:${D};font-weight:800;font-size:28px;color:${T.lineStrong}}
.mq-card{display:flex;flex-direction:column;gap:10px;min-width:0}
.mq-card:hover .mq-img img{transform:scale(1.035)}
.mq-card:hover .mq-hd{color:${red}}
.mq-r169{aspect-ratio:16/9}.mq-r32{aspect-ratio:3/2}.mq-r43{aspect-ratio:4/3}.mq-r1610{aspect-ratio:16/10}
.mq-sec{padding-top:72px}
.mq-sech{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;border-top:3px solid ${T.ink1};padding-top:14px;margin-bottom:28px;flex-wrap:wrap}
.mq-sech h2{font-family:${D};font-stretch:75%;font-weight:800;font-size:40px;letter-spacing:-.01em;line-height:1;margin:0;text-transform:uppercase}
.mq-more{font-size:13px;font-weight:600;border-bottom:1px solid currentColor;padding-bottom:1px}
.mq-more:hover{color:${red}}

/* masthead */
.mq-mast{border-bottom:1px solid ${T.line}}
.mq-mast-top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:28px;padding-bottom:18px}
.mq-brand{display:flex;align-items:center;gap:14px}
.mq-brand-t{font-family:${D};font-stretch:75%;font-weight:800;font-size:52px;line-height:.9;letter-spacing:-.02em;text-transform:uppercase}
.mq-mast-r{display:flex;align-items:center;gap:24px;position:relative;z-index:5}
.mq-date{font-size:12.5px;color:${T.ink3};display:inline-block}
.mq-date::first-letter{text-transform:uppercase}
.mq-nav{border-top:1px solid ${T.line}}
.mq-nav .mq-wrap{display:flex;gap:26px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.mq-nav a{font-family:${D};font-stretch:90%;font-weight:700;font-size:14px;letter-spacing:.06em;text-transform:uppercase;padding:14px 0 12px;border-bottom:3px solid transparent}
.mq-nav a:hover{color:${red}}
.mq-nav a.on{border-color:${T.accent}}
.mq-hot{border-top:1px solid ${T.line};background:${T.bg}}
.mq-hot .mq-wrap{display:flex;align-items:center;gap:20px;height:44px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.mq-hot .lbl{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${red};display:flex;align-items:center;gap:8px}
.mq-hot .lbl::before{content:"";width:7px;height:7px;border-radius:50%;background:${red}}
.mq-hot a{font-size:13.5px;font-weight:600;color:${T.ink2}}
.mq-hot a:hover,.mq-hot a.on{color:${T.ink1};text-decoration:underline;text-underline-offset:3px}

/* ads */
.mq-ad{padding:36px 0;text-align:center}
.mq-adlabel{font-size:10px;font-weight:600;letter-spacing:.16em;color:${T.ink3};text-transform:uppercase;margin-bottom:8px}
.mq-ad a{display:inline-block;max-width:100%}
.mq-ad img{display:block;max-width:100%;height:auto;border:1px solid ${T.line}}

/* hero */
.mq-g12{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:32px}
.mq-heromain{grid-column:span 8}
.mq-heromain h1{font-size:48px;font-stretch:80%;margin:16px 0 12px}
.mq-heromain .mq-dek{font-size:17px;max-width:720px}
.mq-side{grid-column:span 4;display:flex;flex-direction:column;gap:22px}
.mq-side .mq-card h3{font-size:22px}
.mq-cmp{display:flex;flex-direction:column;gap:6px;padding-top:20px;border-top:1px solid ${T.line}}
.mq-cmp h3{font-size:19px}
.mq-cmp:hover .mq-hd{color:${red}}

/* ticker */
.mq-tick{margin-top:48px;border-top:1px solid ${T.ink1};border-bottom:1px solid ${T.line};display:grid;grid-template-columns:150px repeat(5,minmax(0,1fr))}
.mq-tick .h{padding:16px 0;font-family:${D};font-stretch:75%;font-weight:800;font-size:22px;line-height:1;text-transform:uppercase}
.mq-tick a{padding:16px 18px;border-left:1px solid ${T.line};display:flex;flex-direction:column;gap:6px}
.mq-tick time{font-family:${D};font-weight:800;font-size:13px;color:${red}}
.mq-tick b{font-weight:600;font-size:14px;line-height:1.35}
.mq-tick a:hover b{color:${red}}

/* ultime + sidebar */
.mq-main{grid-column:span 8;display:flex;flex-direction:column;gap:40px;min-width:0}
.mq-aside{grid-column:span 4;display:flex;flex-direction:column;gap:40px}
.mq-lead{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:28px;align-items:center}
.mq-lead h3{font-size:30px;margin:10px 0}
.mq-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.mq-three h3{font-size:20px}
.mq-list2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:36px}
.mq-li{display:grid;grid-template-columns:62px minmax(0,1fr);gap:14px;padding:16px 0;border-top:1px solid ${T.line}}
.mq-li time{font-family:${D};font-weight:800;font-size:14px;color:${T.ink1}}
.mq-li h4{font-weight:600;font-size:15.5px;line-height:1.35;margin:4px 0 0}
.mq-li:hover h4{color:${red}}
.mq-boxh{font-family:${D};font-stretch:75%;font-weight:800;font-size:26px;text-transform:uppercase;margin:0 0 6px;padding-top:12px;border-top:3px solid ${T.accent};line-height:1}
.mq-rank a{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;padding:16px 0;border-top:1px solid ${T.line};align-items:start}
.mq-rank .n{font-family:${D};font-stretch:75%;font-weight:800;font-size:46px;line-height:.85;color:${T.surface};-webkit-text-stroke:1.2px ${T.ink1}}
.mq-rank a:first-child .n{color:${T.accent}}
.mq-rank h4{font-family:${D};font-stretch:92%;font-weight:700;font-size:17px;line-height:1.22;margin:0 0 4px}
.mq-rank a:hover h4{color:${red}}
.mq-sticky{position:sticky;top:24px;display:flex;flex-direction:column;align-items:center}
.mq-sticky .mq-ad{padding:0}

/* in primo piano */
.mq-pp{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:32px}
.mq-pp .big{grid-column:span 7}.mq-pp .tall{grid-column:span 5}
.mq-pp .half{grid-column:span 6;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:start}
.mq-pp .big h3{font-size:38px}.mq-pp .tall h3,.mq-pp .half h3{font-size:26px}

/* sezioni categoria: varianti */
.mq-std{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:40px}
.mq-std .mq-card h3{font-size:34px}
.mq-band{margin-top:80px;padding:64px 0 72px}
.mq-dark{background:${T.ink1};color:#F4F1EA}
.mq-dark .mq-sech{border-color:#fff}
.mq-dark .mq-hd,.mq-dark .mq-sech h2{color:#fff}
.mq-dark .mq-meta{color:#B5AC9C}.mq-dark .mq-dek{color:#D6CFC1}
.mq-dark .mq-kick{color:${T.accent}}
.mq-dark .mq-card:hover .mq-hd,.mq-dark .mq-cmp:hover .mq-hd{color:${T.accent}}
.mq-dark .mq-cmp{border-color:#3A332A}
.mq-dark .mq-more:hover{color:${T.accent}}
.mq-mgrid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr);gap:28px}
.mq-mgrid .m1{grid-row:span 2}
.mq-mgrid .m1 h3{font-size:32px}
.mq-mgrid h3{font-size:19px}
.mq-soft{background:${T.surfaceAlt}}
.mq-tgrid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:36px}
.mq-tgrid .mq-card.lg h3{font-size:32px}
.mq-tsub{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.mq-tsub h3{font-size:18px}
.mq-black{background:#0B0A08;color:#fff}
.mq-black .mq-sech{border-color:${T.accent}}
.mq-black .mq-sech h2{font-size:52px;font-style:italic}
.mq-black .mq-hd{color:#fff}.mq-black .mq-meta{color:#A39B8D}.mq-black .mq-dek{color:#D6CFC1}
.mq-black .mq-kick{color:${T.accent}}
.mq-black .mq-card:hover .mq-hd{color:${T.accent}}
.mq-black .mq-more:hover{color:${T.accent}}
.mq-msg{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px}
.mq-msbig{grid-column:span 8;position:relative;align-self:start}
.mq-msbig .ov{position:absolute;left:0;bottom:0;max-width:78%;padding:26px 30px;background:rgba(11,10,8,.88)}
.mq-msbig h3{font-size:38px;font-stretch:78%;font-style:italic}
.mq-msside{grid-column:span 4;display:flex;flex-direction:column;gap:24px}
.mq-msside h3{font-size:20px;font-stretch:84%}
.mq-guide{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.mq-gd{border:1px solid ${T.line};padding:22px;display:flex;flex-direction:column;gap:14px;min-height:220px;justify-content:space-between;transition:border-color .2s}
.mq-gd:hover{border-color:${T.ink1}}
.mq-gd .n{font-family:${D};font-stretch:75%;font-weight:800;font-size:34px;line-height:1;color:${T.accentDeep}}
.mq-gd h3{font-family:${D};font-stretch:90%;font-weight:700;font-size:20px;line-height:1.2;margin:0}
.mq-gd:hover h3{color:${red}}

/* promo MoviQ */
.mq-promo{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);background:${T.ink1};color:#fff;overflow:hidden}
.mq-promo .tx{padding:44px;display:flex;flex-direction:column;gap:14px;justify-content:center}
.mq-promo h2{font-family:${D};font-stretch:80%;font-weight:800;font-size:44px;line-height:1.02;margin:0;color:#fff}
.mq-promo p{color:#D6CFC1;margin:0;font-size:16px}
.mq-promo .cta{display:inline-flex;align-items:center;gap:8px;width:fit-content;height:48px;padding:0 22px;background:${T.accent};color:${T.ink1};font-weight:700;font-size:14px;border-radius:${T.r.pill}px;margin-top:6px}
.mq-promo .cta:hover{background:${T.accentSoft}}
.mq-promo-art{background:${T.bg};min-height:340px;display:flex;align-items:center;justify-content:center}
.mq-promo .lbl{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${T.accent}}

/* archivio / vista categoria */
.mq-cathead{padding:40px 0 8px}
.mq-cathead h1{font-family:${D};font-stretch:75%;font-weight:800;font-size:64px;line-height:.95;margin:6px 0 10px;text-transform:uppercase}
.mq-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:40px 28px}
.mq-grid3 h3{font-size:21px}
.mq-empty{padding:60px 0;color:${T.ink3}}
.mq-end{height:80px}

/* responsive (viewport) */
@media (max-width:1180px){
  .mq-heromain h1{font-size:40px}
  .mq-guide{grid-template-columns:repeat(2,minmax(0,1fr))}
  .mq-tick{grid-template-columns:repeat(3,minmax(0,1fr))}
  .mq-tick .h{grid-column:1/-1}
  .mq-tick a:nth-child(3n+2){border-left:0;padding-left:0}
}

/* mobile (layout app ≤ 900px) */
.mq-m .mq-wrap{padding:0 16px}
.mq-m .mq-sec{padding-top:48px}
.mq-m .mq-sech h2{font-size:28px}
.mq-m .mq-mast-top{padding-top:20px;padding-bottom:14px}
.mq-m .mq-brand-t{font-size:38px}
.mq-m .mq-date{display:none}
.mq-m .mq-g12,.mq-m .mq-pp,.mq-m .mq-msg{display:flex;flex-direction:column;gap:28px}
.mq-m .mq-heromain h1{font-size:30px}
.mq-m .mq-heromain .mq-dek{font-size:15.5px}
.mq-m .mq-tick{grid-template-columns:minmax(0,1fr)}
.mq-m .mq-tick a{border-left:0;padding:14px 0;border-top:1px solid ${T.line}}
.mq-m .mq-lead,.mq-m .mq-three,.mq-m .mq-list2,.mq-m .mq-std,.mq-m .mq-mgrid,.mq-m .mq-tgrid,.mq-m .mq-tsub,.mq-m .mq-guide,.mq-m .mq-promo,.mq-m .mq-grid3,.mq-m .mq-pp .half{grid-template-columns:minmax(0,1fr)}
.mq-m .mq-lead h3{font-size:24px}
.mq-m .mq-pp .big h3{font-size:28px}.mq-m .mq-pp .tall h3,.mq-m .mq-pp .half h3{font-size:22px}
.mq-m .mq-std .mq-card h3,.mq-m .mq-mgrid .m1 h3,.mq-m .mq-tgrid .mq-card.lg h3{font-size:26px}
.mq-m .mq-mgrid .m1{grid-row:auto}
.mq-m .mq-band{margin-top:56px;padding:44px 0 48px}
.mq-m .mq-black .mq-sech h2{font-size:34px}
.mq-m .mq-msbig .ov{position:static;max-width:none;padding:16px 0 0;background:transparent}
.mq-m .mq-msbig h3{font-size:26px}
.mq-m .mq-promo .tx{padding:26px 22px}
.mq-m .mq-promo h2{font-size:30px}
.mq-m .mq-promo-art{min-height:180px}
.mq-m .mq-cathead h1{font-size:42px}
.mq-m .mq-aside .mq-sticky{display:none}
`;
}
