# noleggio.it — Design & Prototipo

Aggregatore di noleggiatori privati italiani, mobile-first.

Questo repo contiene il lavoro di design e prototipazione frontend:
wireframe lo-fi, design hi-fi su canvas, e prototipo interattivo
del flusso utente.

---

## Cosa contiene

| File HTML | Cosa è |
|---|---|
| `noleggio Wireframes.html` | Wireframe lo-fi sketchy — 6 sezioni, ~28 artboard mobile + desktop. Esplora 3 varianti per home, listing e scheda veicolo. |
| `noleggio Wireframes-print.html` | Versione print-friendly dei wireframe (A4 landscape). |
| `noleggio Hi-Fi.html` | Design hi-fi su design canvas — direzione "Casa" (warm, giallo, Bricolage Grotesque). 18 schermate: sistema (logo, palette, tipografia, componenti) + frontend pubblico + area utente + area noleggiatore. Tweaks panel per cambiare accent color live. |
| `noleggio Prototipo.html` | Prototipo mobile interattivo del flusso utente: home → ricerca → listing → scheda veicolo → prenotazione → conferma. Filtri funzionanti, date picker, galleria, salvati persistenti. |

## Decisioni di design

- **Direzione visiva**: A · "Casa" — warm, ivory, accento giallo (#F5C518)
- **Tipografia**: Bricolage Grotesque (display) + Inter (body) + JetBrains Mono (data)
- **Logo**: Opzione A — simbolo + parola (placeholder, da rifinire)
- **Pattern di ricerca**: search bar dominante (V1)
- **Pattern listing**: split mappa + lista (V2 default), con toggle a lista classica (V1). Stato iniziale = noleggiatori vicini
- **Scheda veicolo**: galleria + sticky CTA mobile, sidebar prezzo sticky desktop

## Struttura del codice

Tutto è in `.jsx` con Babel inline — niente build step, niente node_modules. Apri qualsiasi `.html` direttamente nel browser e funziona.

```
hifi-tokens.jsx         Design tokens (colori, font, radius, shadow)
hifi-icons.jsx          Icon set line-stroke + render auto stilizzato
hifi-system.jsx         Primitive UI (Button, Card, Chip, Input, Price, Rating, Badge, Avatar, H, Txt, Logo)
hifi-frames.jsx         PhoneFrame, BrowserFrame, TabBar
hifi-system-display.jsx Showcase del sistema (palette, tipografia, componenti)
hifi-screens-*.jsx      Schermate hi-fi (home, listing, vehicle, user, rental)
hifi-app.jsx            Composizione del design canvas

proto-data.jsx          Dataset di esempio (auto, host, categorie, location)
proto-screens.jsx       Schermate del prototipo (home, location, date, listing)
proto-screens-2.jsx     Schermate del prototipo (vehicle, booking, confirmation)
proto-app.jsx           State machine + orchestratore

sketchy.jsx             Primitive sketchy per i wireframe
screens-*.jsx           Schermate dei wireframe (pubblico, utente, noleggiatore)
app.jsx                 Composizione canvas dei wireframe

design-canvas.jsx       Componente pan/zoom canvas (starter)
tweaks-panel.jsx        Pannello tweak (starter)
```

## Come visualizzare

Aprire qualsiasi `.html` con un browser moderno (Chrome / Safari / Firefox).

Per i wireframe e l'hi-fi: pan con trascinamento, zoom con scroll/pinch, click su un artboard per metterlo a tutto schermo, ←/→ per navigare nella sezione.

## Roadmap

- [ ] Logo finale (versione rifinita dell'opzione A)
- [ ] Imagery: sostituire le illustrazioni placeholder con foto reali
- [ ] Estendere il prototipo al flusso noleggiatore (signup → add veicolo)
- [ ] Dark mode
- [ ] Handoff per sviluppo (token export, spec sheet)

---

Stack: React 18 + JSX inline via Babel standalone. Nessun build.
Font: Google Fonts (Bricolage Grotesque, Inter, JetBrains Mono).
