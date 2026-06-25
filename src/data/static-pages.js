// Contenuti delle pagine statiche linkate dal footer.
// Schema: blocks = array di { type, ... }
//   type 'h'     → { text } (sottotitolo h3)
//   type 'p'     → { text } (paragrafo)
//   type 'list'  → { items: [string|{strong, text}] }
//   type 'quote' → { text }
//   type 'cta'   → { label, href, mailto?: bool }
//   type 'kv'    → { items: [{ k, v }] }

export const STATIC_PAGES = {
  manifesto: {
    title: 'Manifesto',
    lead: "Perché esistiamo, come lavoriamo, cosa ci rifiutiamo di fare.",
    blocks: [
      { type: 'h', text: "L'auto è ferma il 95% del tempo" },
      { type: 'p', text: "Ogni auto in Italia sta parcheggiata 23 ore su 24. Costa migliaia di euro all'anno tra bollo, assicurazione, manutenzione, ammortamento. Eppure ne immatricoliamo più di un milione e mezzo ogni anno." },
      { type: 'p', text: "Quando ci serve davvero un'auto — per un weekend, un trasloco, sei mesi di trasferta — andiamo dal noleggiatore di un brand internazionale, ci spostiamo fino all'aeroporto, paghiamo sovrapprezzi che non avevamo previsto. Oppure rinunciamo." },

      { type: 'h', text: "Il noleggio non è solo Hertz, Avis o Europcar" },
      { type: 'p', text: "In Italia ci sono migliaia di piccoli noleggiatori indipendenti: autorimesse, concessionari, agenzie di paese. Conoscono i clienti per nome. Noleggiano auto da decenni. Hanno prezzi più bassi e flessibilità che le grandi catene non possono permettersi." },
      { type: 'p', text: "Ma online sono invisibili. Non hanno un sito moderno, non sanno fare SEO, non hanno un team marketing. E così il cliente continua a pensare che il noleggio coincida con quattro brand." },

      { type: 'h', text: "MoviQ è un aggregatore, non un intermediario" },
      { type: 'p', text: "Tu trovi l'auto su MoviQ. Il noleggiatore conferma la disponibilità. Il pagamento avviene direttamente tra te e lui — al ritiro, come è sempre stato fatto." },
      { type: 'p', text: "Noi non ci mettiamo in mezzo, non prendiamo commissioni sul prezzo dell'auto, non blocchiamo soldi sul tuo conto. Il rapporto contrattuale è tra te e il noleggiatore, esattamente come se lo avessi trovato per strada." },

      { type: 'h', text: "Tre principi" },
      { type: 'list', items: [
        { strong: 'Vicinanza', text: " — l'auto giusta è quella sotto casa, non a 30 km dall'aeroporto. Il default della ricerca è il tuo quartiere, non la categoria." },
        { strong: 'Trasparenza', text: " — niente sovrapprezzi sorpresa al ritiro. Il prezzo che vedi sulla scheda è quello che paghi. Cauzione, assicurazione, chilometraggio incluso: tutto scritto prima." },
        { strong: 'Indipendenza', text: " — i noleggiatori restano padroni dei loro prezzi, delle loro condizioni, dei loro clienti. Noi non imponiamo politiche commerciali, non blocchiamo recensioni, non penalizziamo chi non paga abbonamenti premium." },
      ] },

      { type: 'h', text: "Cosa NON facciamo" },
      { type: 'list', items: [
        'Non possediamo auto.',
        'Non gestiamo cauzioni né assicurazioni in vece dei noleggiatori.',
        'Non vendiamo i tuoi dati a terzi e non facciamo tracking pubblicitario.',
        'Non usiamo dark pattern per estorcerti upsell al checkout.',
        'Non penalizziamo i noleggiatori che ti danno il numero di telefono diretto.',
      ] },

      { type: 'h', text: "Da dove veniamo" },
      { type: 'p', text: "MoviQ nasce in Italia, nel 2026, da un team piccolo e indipendente. Ci finanziamo con un abbonamento mensile per i noleggiatori che vogliono apparire — non con commissioni sui clienti, non con pubblicità di terze parti." },
      { type: 'p', text: "Vogliamo costruire un'infrastruttura digitale per un comparto che esiste da decenni ma è rimasto fuori dalla rete. Niente di più, niente di meno." },

      { type: 'h', text: "Dove andiamo" },
      { type: 'p', text: "C'è bisogno di un ponte tra chi un'auto la possiede e la noleggia ogni giorno, e chi un'auto la cerca per una settimana e basta. Vogliamo essere quel ponte — pulito, leggero, fatto in Italia." },
      { type: 'quote', text: "L'auto giusta vicino a te. È tutto qui." },
    ],
  },

  'come-funziona': {
    title: 'Come funziona',
    lead: "Dalla ricerca alla riconsegna, tutto quello che devi sapere per noleggiare un'auto su MoviQ. Tempo di lettura: 4 minuti.",
    blocks: [
      { type: 'h', text: "In sintesi" },
      { type: 'p', text: "MoviQ è un motore di ricerca per noleggiatori auto indipendenti italiani. Cerchi un'auto, la prenoti, il noleggiatore conferma, ritiri al punto indicato e paghi direttamente a lui. Tra te e il noleggiatore non c'è nessun intermediario finanziario." },

      { type: 'h', text: "1 · Cerca" },
      { type: 'p', text: "Inserisci la città dove ti serve l'auto e le date di ritiro e riconsegna. MoviQ ti mostra tutte le auto disponibili dei noleggiatori della zona — non solo i grandi brand, ma anche le autorimesse di quartiere e le piccole flotte indipendenti che altrimenti non troveresti." },
      { type: 'p', text: "Il prezzo che vedi sulla card è il prezzo totale per il periodo che hai indicato. Niente sovrapprezzi sorpresa: tasse, chilometraggio incluso, assicurazione obbligatoria e fee di servizio sono già conteggiati. La cauzione, dove richiesta, è indicata separatamente." },

      { type: 'h', text: "2 · Confronta" },
      { type: 'p', text: "Filtra per categoria (citycar, SUV, elettrica, furgone, cabrio, lungo termine), alimentazione (benzina, diesel, ibrida, elettrica), fascia di prezzo, cambio (manuale/automatico). Ordina per prezzo, distanza dal tuo indirizzo, o auto più viste." },
      { type: 'p', text: "Apri la scheda di un'auto per vedere: foto e descrizione, chilometraggio incluso, eventuali extra opzionali (seggiolino, GPS, secondo guidatore), le condizioni del noleggio del singolo noleggiatore, i metodi di pagamento che accetta (carta, bonifico, contanti entro i limiti di legge), le sue recensioni e i suoi tempi di risposta medi." },

      { type: 'h', text: "3 · Prenota" },
      { type: 'p', text: "Premi \"Richiedi prenotazione\". Se è la prima volta che usi MoviQ ti chiediamo email, nome e numero di telefono — bastano questi tre dati. Riceverai un'email di conferma con un magic-link per accedere (niente password da ricordare)." },
      { type: 'p', text: "La tua richiesta viene inoltrata al noleggiatore, che ha 24 ore per confermare o rifiutare. La maggior parte dei noleggiatori risponde entro 2 ore nei giorni feriali. Riceverai una notifica via email e push appena lo stato cambia." },
      { type: 'p', text: "In questa fase non paghi nulla. La carta non viene addebitata, non c'è blocco preautorizzato. La prenotazione è una richiesta, non un acquisto." },

      { type: 'h', text: "4 · Ritira l'auto" },
      { type: 'p', text: "All'orario concordato ti presenti al punto di ritiro indicato sulla scheda della prenotazione — è l'indirizzo della sede del noleggiatore. Porta con te:" },
      { type: 'list', items: [
        'Documento d\'identità in corso di validità.',
        'Patente di guida valida per la categoria del veicolo (categoria B per le auto, ≥ 21 anni e patente da almeno 1 anno per la maggior parte dei noleggiatori).',
        'Una carta di credito intestata al guidatore per la cauzione (se il noleggiatore la richiede su carta) — oppure i contanti o il bonifico se accettati.',
      ] },
      { type: 'p', text: "Il noleggiatore controlla i documenti, ti fa firmare il contratto di noleggio (cartaceo o digitale, dipende da lui), incassa il prezzo concordato e l'eventuale cauzione, ti consegna le chiavi e ti fa il giro di consegna dell'auto (carburante, danni preesistenti, chilometraggio). Tempo medio del ritiro: 15-25 minuti." },

      { type: 'h', text: "5 · Guida" },
      { type: 'p', text: "Hai l'auto, è tua per il periodo concordato. Le condizioni d'uso (chilometraggio, zona geografica consentita, divieto di trasporto di animali o fumo, ecc.) sono quelle del contratto del noleggiatore — leggile prima di firmare." },
      { type: 'p', text: "In caso di problemi durante il noleggio (guasto, incidente, multa) il primo riferimento è sempre il noleggiatore — trovi il suo numero diretto nella scheda della prenotazione su MoviQ. Per assistenza supplementare, MoviQ è raggiungibile a support@moviq.it." },

      { type: 'h', text: "6 · Riconsegna" },
      { type: 'p', text: "Restituisci l'auto allo stesso punto, all'orario concordato, con il livello di carburante richiesto dal contratto (di solito uguale a quello del ritiro). Il noleggiatore controlla auto, chilometraggio e carburante, e restituisce la cauzione se tutto è in regola." },
      { type: 'p', text: "Entro 48 ore dalla riconsegna ricevi un'email per lasciare una recensione del noleggiatore. Le recensioni sono pubbliche e aiutano chi prenoterà dopo di te." },

      { type: 'h', text: "Annullamento" },
      { type: 'p', text: "Puoi annullare gratuitamente fino a 24 ore prima dell'orario di ritiro dalla tua pagina \"Prenotazioni\" o cliccando il link di annullamento nell'email di conferma. Non serve motivare l'annullamento." },
      { type: 'p', text: "Per annullamenti oltre questa soglia valgono le politiche del singolo noleggiatore, indicate sulla scheda dell'auto al momento della prenotazione e ricordate nell'email di conferma. Le politiche più comuni sono: trattenuta del 50% per annullamenti tra 24h e 6h dal ritiro, trattenuta del 100% per no-show o annullamenti meno di 6h prima." },

      { type: 'h', text: "Modifiche alla prenotazione" },
      { type: 'p', text: "Per cambiare date, durata o auto, contatta direttamente il noleggiatore (numero nella scheda) o scrivi a support@moviq.it indicando il numero di prenotazione. Le modifiche sono subordinate alla disponibilità del veicolo." },

      { type: 'h', text: "Il ruolo di MoviQ" },
      { type: 'p', text: "MoviQ è esclusivamente un servizio di intermediazione informativa: ti aiutiamo a trovare l'auto e a inviare la richiesta al noleggiatore. Il contratto di noleggio, il pagamento, le condizioni, la cauzione, l'assicurazione, l'assistenza durante il noleggio, la gestione di danni o sinistri sono interamente di competenza del noleggiatore. MoviQ non è parte del contratto e non risponde delle obbligazioni contrattuali tra te e il noleggiatore." },

      { type: 'h', text: "Domande frequenti" },
      { type: 'h', text: "Chi paga in caso di danno o sinistro?" },
      { type: 'p', text: "Il rapporto è esclusivamente tra te e il noleggiatore. Le coperture (RC obbligatoria, eventuali franchigie, kasko opzionale) e le procedure di gestione sinistro sono quelle previste dal contratto di noleggio del singolo noleggiatore. MoviQ non interviene nella gestione di sinistri, danni o controversie connesse all'uso del veicolo." },
      { type: 'h', text: "Quanti anni servono per noleggiare?" },
      { type: 'p', text: "Dipende dal noleggiatore. La maggioranza richiede ≥ 21 anni e patente B da almeno 1 anno. Per auto premium e SUV grandi, alcuni richiedono ≥ 25 anni. Il requisito specifico è indicato sulla scheda dell'auto." },
      { type: 'h', text: "Posso noleggiare per un altro guidatore?" },
      { type: 'p', text: "Sì, ma il secondo guidatore va dichiarato al noleggiatore (di solito con un piccolo sovrapprezzo) e deve presentarsi al ritiro con documento e patente." },
      { type: 'h', text: "Cosa succede se il noleggiatore non risponde entro 24h?" },
      { type: 'p', text: "La richiesta decade automaticamente, senza addebiti. Puoi inviare una nuova richiesta ad altri noleggiatori della zona usando la ricerca. MoviQ non garantisce risposta da parte dei noleggiatori, che restano liberi di accettare o rifiutare ogni richiesta." },

      { type: 'cta', label: "Trova un'auto vicino a te", href: '/' },
    ],
  },

  'per-noleggiatori': {
    title: 'Per i noleggiatori',
    lead: "MoviQ è il canale online dei piccoli noleggiatori auto indipendenti italiani. Senza commissioni sul prezzo, senza intermediazioni sul pagamento, senza esclusive.",
    blocks: [
      { type: 'h', text: "A chi parliamo" },
      { type: 'p', text: "Se hai una piccola o media attività di noleggio auto in Italia — un'autorimessa, una concessionaria con flotta noleggio, un'agenzia di paese, una società indipendente con 5-200 veicoli — MoviQ ti dà visibilità online senza chiederti di rinunciare al rapporto diretto con il cliente." },
      { type: 'p', text: "Non parliamo con le grandi catene internazionali. Loro hanno già i loro canali. Noi serviamo il segmento che oggi è invisibile sul web." },

      { type: 'h', text: "Cosa ottieni" },
      { type: 'list', items: [
        { strong: 'Visibilità nei risultati di ricerca', text: " — la tua flotta appare quando un utente cerca un'auto nella tua città, nelle date in cui hai disponibilità." },
        { strong: 'Zero commissioni sul prezzo del noleggio', text: ' — il cliente paga te, direttamente, con il metodo che tu accetti. MoviQ non incassa, non blocca, non scala nulla.' },
        { strong: 'Backoffice completo incluso', text: ' — gestisci flotta, prezzi (anche dinamici per stagione), calendario disponibilità per ogni veicolo, richieste in arrivo, prenotazioni confermate, recensioni clienti, statistiche e fatturato stimato da un\'unica dashboard.' },
        { strong: 'Controllo totale del rapporto cliente', text: ' — il numero di telefono e l\'email del cliente sono tuoi. Puoi richiamarlo, fidelizzarlo, offrirgli sconti per noleggi futuri direttamente da te. Nessun "muro" come fanno i grandi marketplace.' },
        { strong: 'Nessuna esclusiva', text: ' — continui a usare il tuo sito, il passaparola, altri portali, il telefono. MoviQ è un canale in più, non l\'unico.' },
        { strong: 'Termini di noleggio personalizzati', text: ' — pubblichi le tue condizioni (chilometraggio, età minima, franchigia, politica annullamento, metodi di pagamento accettati). Noi non imponiamo regole commerciali.' },
      ] },

      { type: 'h', text: "Come funziona dal tuo lato" },
      { type: 'p', text: "Dopo l'onboarding, accedi al backoffice MoviQ con il tuo magic-link via email. Da lì:" },
      { type: 'list', items: [
        { strong: 'Carichi la flotta', text: ' — per ogni auto inserisci foto (consigliate 5-8), marca/modello/anno, alimentazione, cambio, posti, bagagli, optional, chilometri inclusi, prezzo base giornaliero. Aggiungi una "nota interna" privata con targa, danni preesistenti e info gestionali — non visibile ai clienti.' },
        { strong: 'Imposti il calendario', text: ' — blocchi le date in cui un\'auto non è disponibile, fissi prezzi diversi per alta/bassa stagione o weekend.' },
        { strong: 'Ricevi richieste', text: ' — quando un utente prenota, ti arriva un\'email + push con il dettaglio. Tu hai 24h per confermare o rifiutare. Tempi di risposta veloci migliorano il tuo posizionamento nei risultati.' },
        { strong: 'Gestisci ritiri e riconsegne', text: ' — gestisci tutto al tuo punto vendita come fai oggi. MoviQ non interferisce con il contratto cartaceo o digitale che firmate.' },
        { strong: 'Leggi le tue metriche', text: ' — auto più viste, auto più salvate, periodi di alta richiesta, fatturato stimato, modello più richiesto per la tua città, prezzo medio per segmento (anche rispetto alla concorrenza locale, in forma aggregata).' },
      ] },

      { type: 'h', text: "Cosa ti chiediamo" },
      { type: 'list', items: [
        { strong: 'Partita IVA italiana attiva', text: ' nel settore noleggio veicoli (codice ATECO 77.11 o compatibile).' },
        { strong: 'Documento d\'identità del legale rappresentante', text: ' per la verifica anti-frode in fase di onboarding (una sola volta).' },
        { strong: 'Polizza RC valida', text: " su tutta la flotta esposta su MoviQ. Te lo chiediamo perché i nostri utenti si aspettano che ogni auto pubblicata sia assicurata — è la base di fiducia della piattaforma." },
        { strong: 'Condizioni di noleggio scritte', text: ' e accessibili al cliente prima della conferma (le pubblichi tu sul tuo profilo MoviQ — modifica libera in qualsiasi momento).' },
        { strong: 'Risposta entro 24h', text: ' alle richieste di prenotazione. Sotto questa soglia, le richieste scadono e i clienti vengono indirizzati altrove.' },
      ] },

      { type: 'h', text: "Quanto costa" },
      { type: 'p', text: "Abbonamento unico, flat, indipendente dal numero di auto in flotta e dal fatturato che generi. Nessuna commissione sul prezzo dei noleggi, nessuna fee per richiesta, nessuna soglia minima di transato." },
      { type: 'kv', items: [
        { k: 'Abbonamento mensile', v: '49 € + IVA / mese' },
        { k: 'Periodo di prova gratuito', v: '30 giorni alla prima attivazione' },
        { k: 'Rinnovo', v: 'Automatico ogni mese sulla data di attivazione' },
        { k: 'Disattivazione', v: 'In qualsiasi momento dal backoffice, senza penali' },
      ] },
      { type: 'p', text: "Al momento dell'iscrizione registri il metodo di pagamento (carta di credito o di debito Visa/Mastercard/Amex). Per i primi 30 giorni non viene effettuato alcun addebito — è il periodo di prova gratuito durante il quale puoi caricare la flotta, ricevere prenotazioni e valutare il ritorno." },
      { type: 'p', text: "Al termine dei 30 giorni, l'abbonamento si attiva automaticamente e viene addebitato il primo canone mensile. Da quel momento il rinnovo è automatico ogni mese sulla stessa data, finché non disattivi. La disattivazione avviene direttamente dal backoffice nella sezione \"Abbonamento\" — il tuo account resta attivo fino alla fine del ciclo pagato, poi viene sospeso senza alcun addebito ulteriore." },

      { type: 'h', text: "Quanto guadagno?" },
      { type: 'p', text: "Dipende dalla tua flotta, dalla tua città e dai tuoi prezzi. Sulla base dei test pilota la nostra stima è 8-15 prenotazioni aggiuntive per ogni 10 auto in flotta, nei primi 6 mesi, in una città di media dimensione (>200k abitanti). Il prezzo medio di un noleggio breve a Milano nel 2026 è circa 65 €/giorno per una citycar, 95 €/giorno per un SUV compatto." },
      { type: 'p', text: "Il break-even sull'abbonamento (49 €/mese) è 1 noleggio aggiuntivo al mese di una citycar per 1 giorno. Sopra questa soglia, è margine netto." },

      { type: 'h', text: "Come ti aiutiamo a partire" },
      { type: 'list', items: [
        'Onboarding assistito: ti aiutiamo noi a caricare le prime 5-10 auto sulla piattaforma, con foto professionali se ti servono (servizio gratuito nel periodo di lancio).',
        'Account manager dedicato per i primi 60 giorni: una persona reale, raggiungibile via email o telefono, che ti aiuta a impostare prezzi, calendario, condizioni.',
        'Materiale promozionale: badge "Trovami su MoviQ" per il tuo sito e i tuoi social, da scaricare gratis dalla dashboard.',
        'Webinar mensile per i partner: best practice, novità di piattaforma, feedback diretti dal team.',
      ] },

      { type: 'h', text: "Domande frequenti" },
      { type: 'h', text: "Posso disattivare l'account in qualsiasi momento?" },
      { type: 'p', text: "Sì, in qualsiasi momento dalle Impostazioni del backoffice. Le prenotazioni già confermate restano valide. Le nuove richieste si fermano immediatamente. L'abbonamento non si rinnova al ciclo successivo." },
      { type: 'h', text: "Posso variare i prezzi durante l'anno?" },
      { type: 'p', text: "Sì, tutti i prezzi sono editabili in qualsiasi momento. Puoi anche impostare prezzi diversi per periodi specifici (alta stagione, eventi, weekend) tramite il calendario." },
      { type: 'h', text: "MoviQ mi obbliga ad accettare tutti i clienti?" },
      { type: 'p', text: "No. Puoi rifiutare una richiesta senza darne motivazione. Tassi di rifiuto molto alti (>30%) penalizzano la tua visibilità nei risultati, ma non ti viene tolto l'accesso." },
      { type: 'h', text: "Cosa succede se un cliente non si presenta al ritiro (no-show)?" },
      { type: 'p', text: "Applichi la tua politica di no-show indicata nelle condizioni. MoviQ raccoglie la segnalazione dal tuo backoffice e penalizza l'utente sul rating della piattaforma. In caso di no-show ripetuti, sospendiamo l'account utente." },
      { type: 'h', text: "MoviQ vede i dati delle mie auto e dei miei clienti?" },
      { type: 'p', text: "Vediamo le auto che pubblichi (è quello il prodotto). Dei clienti vediamo email, nome, telefono e prenotazioni — usati esclusivamente per servire la piattaforma. Non li rivendiamo, non li condividiamo con altri partner, non li usiamo per pubblicità di terze parti." },

      { type: 'cta', label: 'Scrivi a partner@moviq.it', href: 'mailto:partner@moviq.it', mailto: true },
    ],
  },

  sicurezza: {
    title: 'Sicurezza',
    lead: "Come tuteliamo clienti e noleggiatori.",
    blocks: [
      { type: 'h', text: "Verifica dei noleggiatori" },
      { type: 'p', text: "Ogni noleggiatore su MoviQ viene verificato in fase di onboarding: documento d'identità del legale rappresentante, partita IVA con codice ATECO compatibile, polizza assicurativa RC sui veicoli. I noleggiatori verificati hanno un badge sulla scheda." },

      { type: 'h', text: "Verifica dei clienti" },
      { type: 'p', text: "Al primo accesso ti chiediamo email valida (link di conferma) e numero di telefono (codice SMS). I noleggiatori vedono questi dati solo dopo che confermi una prenotazione. Patente e documenti vengono mostrati direttamente al ritiro, non passano da noi." },

      { type: 'h', text: "Assicurazioni e cauzioni" },
      { type: 'p', text: "Ogni noleggiatore dichiara in fase di onboarding di disporre di copertura RC valida sui veicoli pubblicati. La verifica della validità della copertura al momento del noleggio resta in capo al cliente, che può chiederla al noleggiatore prima del ritiro. Le coperture aggiuntive (kasko, furto, riduzione franchigia) e la gestione della cauzione sono interamente decise dal noleggiatore, secondo le condizioni del proprio contratto di noleggio." },
      { type: 'p', text: "MoviQ non blocca importi sulla carta del cliente, non gestisce escrow, non interviene in alcun modo nella gestione dei depositi cauzionali o delle franchigie." },

      { type: 'h', text: "Pagamenti" },
      { type: 'p', text: "Il pagamento del noleggio avviene direttamente tra cliente e noleggiatore, secondo i metodi che il noleggiatore accetta — carta (Visa/MC/Amex/Maestro), bonifico, contanti fino al limite di legge. MoviQ non incassa, non elabora e non blocca pagamenti per conto del noleggiatore." },

      { type: 'h', text: "Il ruolo di MoviQ in caso di problemi" },
      { type: 'p', text: "MoviQ è una piattaforma di intermediazione informativa: NON è parte del contratto di noleggio. Le controversie relative al noleggio — auto non disponibile al ritiro, danni, sinistri, contestazioni di pagamento, qualità del servizio — vanno gestite direttamente tra te e il noleggiatore, secondo le condizioni del relativo contratto e la normativa applicabile." },
      { type: 'p', text: "Puoi segnalarci episodi gravi a support@moviq.it: useremo la segnalazione esclusivamente per finalità di moderazione e qualità del servizio (es. valutazione della permanenza del noleggiatore sulla piattaforma). MoviQ non offre servizi di mediazione, arbitrato o assistenza legale e non garantisce tempi di risposta operativi sulle controversie tra utente e noleggiatore." },
      { type: 'p', text: "Per le controversie con un noleggiatore puoi rivolgerti agli organismi di risoluzione alternativa (ADR) iscritti presso il MISE, alla piattaforma europea ODR (ec.europa.eu/consumers/odr) o all'autorità giudiziaria competente." },

      { type: 'h', text: "Sicurezza dell'account" },
      { type: 'p', text: "L'accesso avviene tramite magic-link via email — niente password da rubare. La sessione scade dopo 30 giorni di inattività. Puoi disconnettere tutte le sessioni attive dalla pagina \"Impostazioni\" del profilo." },
    ],
  },

  contatti: {
    title: 'Contatti',
    lead: "Scrivici. Rispondiamo entro 24h nei giorni feriali.",
    blocks: [
      { type: 'h', text: "Email" },
      { type: 'kv', items: [
        { k: 'Supporto clienti', v: 'support@moviq.it' },
        { k: 'Noleggiatori partner', v: 'partner@moviq.it' },
        { k: 'Stampa e comunicazione', v: 'press@moviq.it' },
        { k: 'Privacy e dati personali', v: 'privacy@moviq.it' },
        { k: 'Tutto il resto', v: 'hello@moviq.it' },
      ] },

      { type: 'h', text: "Durante un noleggio attivo" },
      { type: 'p', text: "Per qualsiasi necessità durante il noleggio (auto non consegnata, guasto, sinistro, danno, contestazione) il riferimento è sempre il noleggiatore — trovi il suo numero diretto nella scheda della prenotazione e nell'email di conferma. MoviQ non eroga assistenza durante il noleggio e non interviene nel rapporto contrattuale tra te e il noleggiatore." },
      { type: 'p', text: "Per problemi assicurativi o stradali puoi inoltre contattare il soccorso stradale previsto dalla tua polizza o il 112." },
      { type: 'p', text: "Puoi sempre scrivere a support@moviq.it per segnalarci episodi che ritieni rilevanti per la qualità della piattaforma: useremo la tua segnalazione per moderare i noleggiatori, ma non possiamo intervenire come mediatori della controversia." },

      { type: 'h', text: "Sede legale" },
      { type: 'p', text: "Le coordinate complete della società saranno pubblicate al momento del lancio pubblico." },
    ],
  },

  privacy: {
    title: 'Informativa Privacy',
    lead: "Ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 e successive modificazioni. Versione 1.0 — vigente dal 1 maggio 2026.",
    blocks: [
      { type: 'h', text: "1. Titolare del trattamento" },
      { type: 'p', text: "Il titolare del trattamento dei dati personali è MoviQ S.r.l., società in fase di costituzione, con sede legale in Italia. I dati di contatto del titolare e del responsabile della protezione dei dati (DPO), una volta nominato, saranno pubblicati al lancio pubblico del servizio." },
      { type: 'p', text: "Per qualsiasi questione relativa al trattamento dei tuoi dati personali puoi scrivere a privacy@moviq.it." },

      { type: 'h', text: "2. Categorie di dati trattati" },
      { type: 'p', text: "MoviQ tratta esclusivamente i dati strettamente necessari all'erogazione del servizio." },
      { type: 'list', items: [
        { strong: 'Dati identificativi', text: ' — nome, cognome, indirizzo email, numero di telefono mobile. Conferiti direttamente dall\'utente in fase di registrazione o di completamento del profilo.' },
        { strong: 'Dati di prenotazione', text: ' — date e città di noleggio, veicolo selezionato, importo, eventuali note testuali, identificativo del noleggiatore controparte, stato della richiesta.' },
        { strong: 'Dati di utilizzo del servizio', text: " — indirizzo IP (anonimizzato sugli ultimi due ottetti dopo 30 giorni), user-agent del browser, lingua dell'interfaccia, eventi essenziali di navigazione (login, prenotazione, errore) raccolti tramite Plausible Analytics in forma aggregata e priva di identificatori univoci." },
        { strong: 'Cookie tecnici', text: " — cookie di sessione strettamente necessari al funzionamento dell'autenticazione e al mantenimento delle preferenze utente. Vedi la nostra Cookie Policy per il dettaglio." },
      ] },
      { type: 'p', text: "MoviQ NON tratta in alcun caso: dati della patente di guida, dati della carta di credito o di pagamento, dati biometrici, dati relativi a salute, orientamento politico, religione, sindacato, vita sessuale. Questi dati restano interamente tra l'utente e il noleggiatore al momento del ritiro del veicolo." },

      { type: 'h', text: "3. Finalità e base giuridica del trattamento" },
      { type: 'kv', items: [
        { k: 'Erogazione del servizio (account, prenotazioni)', v: 'Esecuzione di un contratto — art. 6(1)(b) GDPR' },
        { k: 'Adempimenti fiscali, contabili, antiriciclaggio', v: 'Obbligo legale — art. 6(1)(c) GDPR' },
        { k: 'Sicurezza piattaforma e antifrode', v: 'Legittimo interesse — art. 6(1)(f) GDPR' },
        { k: 'Analytics aggregati (Plausible)', v: 'Legittimo interesse — art. 6(1)(f) GDPR' },
        { k: 'Comunicazioni promozionali (newsletter)', v: 'Consenso esplicito e revocabile — art. 6(1)(a) GDPR' },
      ] },

      { type: 'h', text: "4. Modalità del trattamento" },
      { type: 'p', text: "I dati sono trattati con strumenti informatici e telematici, con misure di sicurezza adeguate a garantire riservatezza, integrità e disponibilità. La piattaforma utilizza connessioni cifrate (HTTPS / TLS 1.2+), accessi protetti tramite magic-link (no password), e separazione logica dei dati a livello di database tramite Row Level Security." },
      { type: 'p', text: "I dati non sono trasferiti al di fuori dello Spazio Economico Europeo. Tutti i fornitori tecnici sono basati in UE o adottano garanzie equivalenti al GDPR (Standard Contractual Clauses, decisioni di adeguatezza)." },

      { type: 'h', text: "5. Destinatari dei dati" },
      { type: 'p', text: "I dati personali possono essere comunicati esclusivamente alle seguenti categorie di destinatari, nei limiti di quanto strettamente necessario:" },
      { type: 'list', items: [
        { strong: 'Noleggiatore controparte', text: " — al momento della conferma di una prenotazione, riceve nome, email, telefono e dettagli del noleggio. È titolare autonomo del trattamento per i dati che riceve." },
        { strong: 'Fornitori tecnici', text: ' — Supabase (database e autenticazione, EU), Hetzner Online GmbH (hosting, Germania), provider di invio email transazionali (UE). Tutti contrattualizzati come Responsabili del trattamento ex art. 28 GDPR.' },
        { strong: 'Autorità competenti', text: ' — in caso di richiesta legittima da parte di forze dell\'ordine o autorità giudiziaria, nei limiti di legge.' },
      ] },
      { type: 'p', text: "MoviQ NON vende, affitta o cede a titolo gratuito dati personali a soggetti terzi a scopo commerciale, pubblicitario o di profilazione." },

      { type: 'h', text: "6. Periodo di conservazione" },
      { type: 'kv', items: [
        { k: 'Account utente', v: 'Per la durata dell\'iscrizione, più 24 mesi dall\'ultimo accesso (chiusura per inattività)' },
        { k: 'Prenotazioni e log contabili', v: '10 anni dalla data della prenotazione (D.P.R. 600/1973, art. 22)' },
        { k: 'Log tecnici e di sicurezza', v: '12 mesi (D.Lgs. 196/2003, art. 132)' },
        { k: 'Cookie tecnici', v: 'Da scadenza sessione a 30 giorni' },
        { k: 'Newsletter (se sottoscritta)', v: 'Fino a revoca del consenso' },
      ] },

      { type: 'h', text: "7. Diritti dell'interessato" },
      { type: 'p', text: "Ai sensi degli articoli 15-22 GDPR, l'utente ha diritto in qualsiasi momento di:" },
      { type: 'list', items: [
        'accedere ai propri dati personali e ottenerne copia (diritto di accesso, art. 15);',
        'chiederne la rettifica se inesatti o incompleti (art. 16);',
        'chiederne la cancellazione, fatti salvi gli obblighi di legge (diritto all\'oblio, art. 17);',
        'chiederne la limitazione del trattamento (art. 18);',
        'ottenere i dati in formato strutturato e leggibile (portabilità, art. 20);',
        'opporsi al trattamento basato su legittimo interesse (art. 21);',
        'revocare in qualsiasi momento i consensi prestati, senza pregiudicare la liceità dei trattamenti precedenti (art. 7.3).',
      ] },
      { type: 'p', text: "I diritti possono essere esercitati gratuitamente scrivendo a privacy@moviq.it o dalla sezione \"Impostazioni → Privacy\" del proprio profilo. MoviQ risponde entro 30 giorni dalla richiesta." },
      { type: 'p', text: "L'utente ha inoltre diritto di proporre reclamo all'Autorità Garante per la protezione dei dati personali (Piazza Venezia 11, 00187 Roma — garanteprivacy.it)." },

      { type: 'h', text: "8. Natura del conferimento" },
      { type: 'p', text: "Il conferimento dei dati identificativi (email, nome, telefono) è facoltativo, ma necessario per la creazione dell'account e l'utilizzo del servizio. Il mancato conferimento impedisce la registrazione e la prenotazione di veicoli." },

      { type: 'h', text: "9. Processi decisionali automatizzati" },
      { type: 'p', text: "MoviQ NON utilizza processi decisionali interamente automatizzati che producano effetti giuridici rilevanti sull'utente ai sensi dell'art. 22 GDPR. Eventuali sistemi di scoring antifrode sono utilizzati come mero ausilio decisionale e ogni decisione finale (es. sospensione di un account) è validata da un operatore umano." },

      { type: 'h', text: "10. Modifiche all'informativa" },
      { type: 'p', text: "MoviQ si riserva il diritto di aggiornare la presente informativa per riflettere modifiche normative o evoluzioni del servizio. Le modifiche sostanziali saranno notificate agli utenti registrati via email con almeno 30 giorni di preavviso. La versione corrente è sempre consultabile su moviq.it/privacy con indicazione della data di ultimo aggiornamento." },
    ],
  },

  termini: {
    title: 'Termini di servizio',
    lead: "Condizioni Generali di Utilizzo della piattaforma MoviQ. Versione 1.0 — vigenti dal 1 maggio 2026.",
    blocks: [
      { type: 'h', text: "1. Definizioni" },
      { type: 'list', items: [
        { strong: '"Piattaforma"', text: ' — il sito web moviq.it, le sue eventuali versioni mobili e ogni servizio digitale erogato sotto il marchio MoviQ.' },
        { strong: '"MoviQ"', text: ' o "noi" — il soggetto giuridico titolare della Piattaforma, MoviQ S.r.l. (in fase di costituzione), con sede legale in Italia.' },
        { strong: '"Utente"', text: ' — qualsiasi persona fisica maggiorenne che acceda alla Piattaforma per ricercare, confrontare e prenotare un noleggio di veicoli.' },
        { strong: '"Noleggiatore"', text: ' — operatore economico, persona fisica titolare di partita IVA o persona giuridica, regolarmente abilitata in Italia all\'esercizio dell\'attività di noleggio veicoli senza conducente, che pubblica la propria offerta sulla Piattaforma.' },
        { strong: '"Servizio"', text: ' — l\'attività di pubblicazione di annunci di noleggio e di messa in contatto tra Utente e Noleggiatore resa da MoviQ tramite la Piattaforma.' },
        { strong: '"Contratto di noleggio"', text: ' — il contratto autonomo che si conclude direttamente tra Utente e Noleggiatore al momento del ritiro del veicolo, disciplinato dalle condizioni del singolo Noleggiatore e dalla legge italiana applicabile.' },
      ] },

      { type: 'h', text: "2. Oggetto e natura del Servizio" },
      { type: 'p', text: "MoviQ è una piattaforma di INTERMEDIAZIONE INFORMATIVA che consente agli Utenti di ricercare, confrontare e inviare richieste di prenotazione di veicoli a Noleggiatori professionali indipendenti operanti sul territorio italiano." },
      { type: 'p', text: "L'attività di MoviQ si qualifica come servizio della società dell'informazione ai sensi del D.Lgs. 70/2003 e della Direttiva 2000/31/CE, e come fornitore di servizi di intermediazione online ai sensi del Regolamento (UE) 2019/1150." },
      { type: 'p', text: "MoviQ NON è parte del Contratto di noleggio. MoviQ NON possiede veicoli, NON eroga il servizio di noleggio, NON incassa, blocca o elabora il pagamento del noleggio per conto del Noleggiatore, NON gestisce cauzioni, depositi, franchigie, polizze assicurative né sinistri. Il Contratto di noleggio si conclude e si esegue interamente tra Utente e Noleggiatore, è regolato dalle condizioni contrattuali stabilite dal singolo Noleggiatore e dalla normativa applicabile, e non produce alcun effetto giuridico in capo a MoviQ." },
      { type: 'p', text: "Tutto ciò che attiene al rapporto di noleggio — comprese ma non limitate a: politica di annullamento, importo e modalità della cauzione, copertura assicurativa, gestione di danni, multe, sinistri, contestazioni di pagamento, perdita o furto del veicolo, assistenza durante il noleggio — è disciplinato esclusivamente dal contratto del Noleggiatore e ricade nella esclusiva responsabilità di Utente e Noleggiatore." },

      { type: 'h', text: "3. Registrazione e account" },
      { type: 'p', text: "L'utilizzo delle funzionalità di prenotazione richiede la creazione di un account personale. La registrazione richiede l'inserimento di email valida, nome, cognome e numero di telefono, e l'accettazione dei presenti Termini e dell'Informativa Privacy." },
      { type: 'p', text: "L'Utente garantisce che i dati forniti sono veritieri, completi e aggiornati, e si impegna a mantenerli tali per tutta la durata dell'iscrizione. È vietato creare account utilizzando identità altrui, dati falsi o nomi di fantasia con intento ingannevole. L'accesso avviene tramite magic-link inviato all'indirizzo email registrato (autenticazione senza password)." },
      { type: 'p', text: "L'Utente è responsabile della custodia delle proprie credenziali (in particolare dell'accesso alla casella email associata all'account) e di ogni attività svolta tramite il proprio account. In caso di uso non autorizzato o sospetto, l'Utente deve segnalarlo tempestivamente a support@moviq.it." },

      { type: 'h', text: "4. Processo di prenotazione" },
      { type: 'p', text: "L'Utente sceglie un veicolo, indica date e orario di ritiro e riconsegna, e invia una richiesta di prenotazione. La richiesta NON costituisce conclusione del Contratto di noleggio, né determina addebito o blocco di somme sui mezzi di pagamento dell'Utente." },
      { type: 'p', text: "Il Noleggiatore ha 24 ore per accettare o rifiutare la richiesta. In caso di accettazione, l'Utente riceve conferma via email e push notification. Il Contratto di noleggio si perfeziona al momento del ritiro del veicolo, all'orario e nel luogo concordati, mediante firma del contratto cartaceo o digitale del Noleggiatore e pagamento del corrispettivo." },
      { type: 'p', text: "Il prezzo esposto sulla Piattaforma include il prezzo base del noleggio, la copertura assicurativa RC obbligatoria, le tasse applicabili e, ove indicato, il chilometraggio incluso. Eventuali extra (secondo guidatore, seggiolino, GPS, coperture accessorie, carburante) sono indicati separatamente. Il prezzo finale può variare in conseguenza di modifiche del periodo di noleggio richieste al ritiro o di danni accertati alla riconsegna." },

      { type: 'h', text: "5. Annullamento e modifica" },
      { type: 'p', text: "5.1 — Le politiche di annullamento, modifica, no-show e penali sono stabilite dal singolo Noleggiatore e indicate sulla scheda del veicolo al momento della prenotazione. MoviQ non determina, non incassa e non gestisce alcuna penale di annullamento." },
      { type: 'p', text: "5.2 — A titolo meramente illustrativo, la maggior parte dei Noleggiatori prevede annullamento gratuito fino a 24 ore prima del ritiro; oltre tale soglia possono applicarsi trattenute. Il valore esatto è sempre indicato dal Noleggiatore." },
      { type: 'p', text: "5.3 — Le modifiche alla prenotazione (date, durata, veicolo) richiedono il consenso del Noleggiatore e sono subordinate alla disponibilità. MoviQ non garantisce l'accettazione di modifiche." },

      { type: 'h', text: "6. Obblighi e responsabilità dell'Utente" },
      { type: 'list', items: [
        "Fornire dati veritieri al momento della registrazione e della prenotazione.",
        "Presentarsi al ritiro del veicolo con documento d'identità valido e patente di guida idonea alla categoria del veicolo prenotato.",
        "Rispettare le condizioni contrattuali stabilite dal Noleggiatore (chilometraggio, zona consentita, divieti d'uso, modalità di riconsegna).",
        "Utilizzare il veicolo conformemente al Codice della Strada e alla legge applicabile.",
        "Rispondere personalmente di sanzioni amministrative, multe, danni causati a terzi o al veicolo durante il periodo di noleggio, nei limiti previsti dal contratto e dalla copertura assicurativa.",
        "Non utilizzare la Piattaforma per scopi illeciti, fraudolenti o lesivi dei diritti di terzi.",
      ] },

      { type: 'h', text: "7. Obblighi e responsabilità ESCLUSIVE del Noleggiatore" },
      { type: 'p', text: "Il Noleggiatore è UNICO e ESCLUSIVO responsabile, nei confronti dell'Utente, dell'Autorità e di ogni terzo, di tutto ciò che attiene al veicolo e al Contratto di noleggio, inclusi a titolo esemplificativo e non esaustivo:" },
      { type: 'list', items: [
        "disponibilità e idoneità del veicolo all'orario, nel luogo e nelle condizioni concordate;",
        "manutenzione, revisione, omologazione e conformità del veicolo alle norme di sicurezza stradale;",
        "stipula e mantenimento di adeguata copertura assicurativa RC obbligatoria sul veicolo;",
        "gestione di franchigie, kasko, riduzioni franchigia e ogni altra copertura accessoria offerta o venduta al cliente;",
        "incasso del corrispettivo del noleggio e gestione della cauzione/deposito;",
        "emissione di scontrini, fatture e documenti fiscali al cliente;",
        "gestione di sinistri, danni, riparazioni, contestazioni, multe, ritiri amministrativi e ogni altro evento connesso all'uso del veicolo;",
        "rispetto della normativa fiscale, antiriciclaggio, privacy e di consumo nei rapporti con il cliente;",
        "correttezza, veridicità, completezza e aggiornamento di prezzi, foto, descrizione, condizioni e metodi di pagamento pubblicati sulla scheda MoviQ.",
      ] },
      { type: 'p', text: "Il Noleggiatore manleva e tiene indenne MoviQ da qualsiasi pretesa, danno, costo, sanzione o spesa legale (inclusi onorari di legali e periti) derivanti dalla propria attività di noleggio o dalla violazione delle norme applicabili." },

      { type: 'h', text: "8. Esclusione e limitazione di responsabilità di MoviQ" },
      { type: 'p', text: "8.1 — MoviQ è soggetto unicamente alle responsabilità del prestatore di servizi della società dell'informazione ai sensi degli artt. 14, 15 e 17 del D.Lgs. 70/2003. In nessun caso MoviQ assume obblighi propri del Noleggiatore o subentra in alcun rapporto contrattuale con l'Utente avente ad oggetto il noleggio del veicolo." },
      { type: 'p', text: "8.2 — Nei limiti consentiti dalla legge applicabile, MoviQ NON risponde, a titolo esemplificativo e non esaustivo, di: (a) indisponibilità, ritardo, difetti o guasti del veicolo; (b) sinistri stradali, danni a cose o persone, perdita o furto del veicolo; (c) controversie sorte tra Utente e Noleggiatore relative a pagamento, cauzione, franchigia, assicurazione, condizioni del noleggio o riconsegna; (d) condotte illecite, fraudolente o negligenti dell'Utente o del Noleggiatore; (e) inadempimenti, errori, omissioni o false dichiarazioni del Noleggiatore nei contenuti pubblicati sulla Piattaforma; (f) interruzioni del Servizio dovute a manutenzione, aggiornamenti o cause di forza maggiore; (g) danni indiretti, conseguenti, perdite di chance, di profitto, di reputazione." },
      { type: 'p', text: "8.3 — MoviQ non offre, sotto alcuna forma, servizi di assistenza durante il noleggio, mediazione di controversie o arbitrato. Le segnalazioni ricevute via support@moviq.it sono utilizzate ai soli fini di moderazione della piattaforma e qualità del servizio: non costituiscono assunzione di alcuna responsabilità da parte di MoviQ né diritto dell'Utente a uno specifico esito o tempo di risposta." },
      { type: 'p', text: "8.4 — Qualora una autorità competente accertasse — in deroga a quanto sopra — una responsabilità diretta di MoviQ, la stessa è in ogni caso limitata all'importo eventualmente percepito da MoviQ per la singola transazione contestata, e comunque non potrà superare 100 € per singolo evento o 500 € complessivi per anno solare. Restano salvi i diritti inderogabili dei consumatori previsti dalla legge applicabile." },

      { type: 'h', text: "9. Recensioni" },
      { type: 'p', text: "L'Utente che abbia portato a termine un noleggio può lasciare una recensione del Noleggiatore. Le recensioni devono essere veritiere, basate sull'esperienza personale, e prive di contenuti diffamatori, offensivi, discriminatori o illeciti. MoviQ si riserva il diritto di rimuovere recensioni che violino queste regole o che siano manifestamente false o manipolatorie." },

      { type: 'h', text: "10. Sospensione e chiusura dell'account" },
      { type: 'p', text: "MoviQ può sospendere o chiudere un account, con preavviso scritto via email e indicazione delle motivazioni, in caso di: violazione dei presenti Termini; condotta fraudolenta, lesiva o pericolosa per altri Utenti o Noleggiatori; mancato rispetto reiterato delle condizioni dei Noleggiatori (es. no-show ripetuti); inattività prolungata (oltre 36 mesi dall'ultimo accesso). L'Utente può chiudere il proprio account in qualsiasi momento dalla sezione \"Impostazioni → Account\" o scrivendo a support@moviq.it." },

      { type: 'h', text: "11. Proprietà intellettuale" },
      { type: 'p', text: "Il marchio \"MoviQ\", il logo, l'interfaccia, il codice sorgente, i testi editoriali, le grafiche e ogni altro contenuto originale della Piattaforma sono di proprietà esclusiva di MoviQ S.r.l. e tutelati dalla normativa sul diritto d'autore e sulla proprietà industriale. Foto e descrizioni dei veicoli restano di proprietà dei rispettivi Noleggiatori, che concedono a MoviQ una licenza limitata, non esclusiva e revocabile per la pubblicazione sulla Piattaforma." },

      { type: 'h', text: "12. Modifiche ai Termini" },
      { type: 'p', text: "MoviQ può modificare i presenti Termini in qualsiasi momento per adeguarli a evoluzioni del servizio o a modifiche normative. Le modifiche sostanziali sono comunicate agli Utenti registrati con almeno 30 giorni di preavviso via email. La versione vigente è sempre consultabile su moviq.it/termini. La prosecuzione dell'utilizzo della Piattaforma dopo l'entrata in vigore delle modifiche implica accettazione delle stesse; in caso contrario l'Utente può recedere chiudendo l'account." },

      { type: 'h', text: "13. Legge applicabile e foro competente" },
      { type: 'p', text: "I presenti Termini sono regolati dalla legge italiana. Per le controversie sorte tra MoviQ e Utenti qualificabili come consumatori ai sensi del D.Lgs. 206/2005, è competente in via esclusiva il foro del luogo di residenza o domicilio del consumatore. Per le controversie con Utenti non consumatori e con i Noleggiatori, è competente in via esclusiva il foro di Milano." },
      { type: 'p', text: "L'Utente consumatore può inoltre rivolgersi alla piattaforma europea ODR per la risoluzione alternativa delle controversie online: ec.europa.eu/consumers/odr." },

      { type: 'h', text: "14. Disposizioni finali" },
      { type: 'p', text: "Se una qualsiasi disposizione dei presenti Termini fosse dichiarata nulla, invalida o inapplicabile, le restanti disposizioni rimarranno pienamente efficaci. La tolleranza di MoviQ rispetto a inadempimenti dell'Utente non costituisce rinuncia ai diritti previsti dai Termini o dalla legge applicabile." },
    ],
  },

  cookie: {
    title: 'Cookie Policy',
    lead: "Quali cookie e tecnologie simili utilizziamo, perché, e come puoi gestirli. Conforme al Provvedimento del Garante Privacy del 10 giugno 2021 e alle linee guida EDPB 03/2022. Versione 1.0 — 1 maggio 2026.",
    blocks: [
      { type: 'h', text: "1. Cosa sono i cookie" },
      { type: 'p', text: "I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente per memorizzare informazioni utili al funzionamento del sito stesso, alla sicurezza, alle preferenze o alla rilevazione di statistiche di utilizzo. Tecnologie simili (storage locale del browser, pixel di tracciamento, fingerprinting) sono soggette alla stessa disciplina." },

      { type: 'h', text: "2. Tipologie di cookie utilizzati da MoviQ" },
      { type: 'p', text: "MoviQ utilizza esclusivamente cookie di prima parte (impostati dal dominio moviq.it) e non installa cookie di profilazione, di marketing o di terze parti pubblicitarie." },

      { type: 'h', text: "2.1 Cookie tecnici essenziali" },
      { type: 'p', text: "Necessari al funzionamento della Piattaforma. Non richiedono consenso ai sensi dell'art. 122 del Codice Privacy. Senza questi cookie l'utente non può autenticarsi o portare a termine una prenotazione." },
      { type: 'kv', items: [
        { k: 'sb-access-token', v: 'Token di sessione autenticazione (Supabase Auth) — durata 60 minuti — HttpOnly, Secure, SameSite=Lax' },
        { k: 'sb-refresh-token', v: 'Token di rinnovo sessione — durata 30 giorni — HttpOnly, Secure, SameSite=Lax' },
        { k: 'moviq_session', v: 'Identificativo sessione applicativa anonimo — durata sessione browser' },
        { k: 'cookie_consent', v: 'Memorizza le scelte di consenso dell\'utente — durata 12 mesi' },
      ] },

      { type: 'h', text: "2.2 Cookie funzionali (di preferenza)" },
      { type: 'p', text: "Memorizzano preferenze di interfaccia che l'Utente ha impostato attivamente. Attivati solo se l'Utente li imposta. Sono archiviati nel local storage del browser, non in cookie HTTP." },
      { type: 'kv', items: [
        { k: 'moviq.theme', v: 'Tema scelto (chiaro/scuro/automatico) — persistente fino a cancellazione locale' },
        { k: 'moviq.lang', v: 'Lingua interfaccia (it/en) — persistente fino a cancellazione locale' },
        { k: 'moviq.search.recent', v: 'Ultime ricerche dell\'utente (memorizzate solo localmente) — persistente fino a cancellazione locale' },
      ] },

      { type: 'h', text: "2.3 Cookie analitici aggregati" },
      { type: 'p', text: "MoviQ utilizza Plausible Analytics, soluzione di analytics europea privacy-friendly che NON utilizza cookie persistenti, NON traccia identificatori univoci dei dispositivi, NON utilizza fingerprinting del browser, NON condivide dati con terze parti. La raccolta è interamente aggregata e anonima." },
      { type: 'p', text: "Per questo motivo, in conformità alle linee guida del Garante Privacy del 2021, i nostri analytics aggregati sono qualificabili come strumenti tecnici equivalenti ai cookie tecnici e non richiedono consenso esplicito. L'Utente può comunque disattivarli dalle Impostazioni del profilo o tramite Do-Not-Track del proprio browser, che rispettiamo." },
      { type: 'p', text: "Dati raccolti in forma aggregata: pagina visitata, paese di accesso (a livello statale), tipo di browser e sistema operativo (a livello di famiglia), referrer (sito di provenienza, se presente)." },

      { type: 'h', text: "3. Cookie di terze parti" },
      { type: 'p', text: "MoviQ NON installa cookie di terze parti per finalità pubblicitarie, di profilazione o di marketing." },
      { type: 'p', text: "Alcune funzionalità della Piattaforma possono fare uso di servizi tecnici di terze parti necessari al loro funzionamento. Allo stato attuale:" },
      { type: 'list', items: [
        { strong: 'Supabase (Auth e Database)', text: ' — fornitore tecnico EU, gestisce la sessione di autenticazione tramite i token sopra elencati. Non utilizza cookie pubblicitari.' },
        { strong: 'Mappe (OpenStreetMap via Leaflet)', text: ' — caricamento di tile cartografiche da server OpenStreetMap. Non rilascia cookie sul tuo dispositivo. L\'IP viene visto dal provider della tile durante il caricamento.' },
        { strong: 'Cloudflare (CDN/protezione DDoS)', text: ' — fornitore di sicurezza dell\'infrastruttura. Può rilasciare cookie tecnici di sicurezza (es. __cf_bm, durata 30 minuti) per distinguere traffico umano da bot. Cookie tecnici, no profilazione.' },
      ] },

      { type: 'h', text: "4. Tabella riassuntiva" },
      { type: 'kv', items: [
        { k: 'Cookie tecnici essenziali', v: 'Sempre attivi · Nessun consenso richiesto · Durata: da sessione a 30gg' },
        { k: 'Cookie funzionali / preferenze', v: 'Attivi solo su scelta utente · Durata: persistente locale' },
        { k: 'Analytics aggregati Plausible', v: 'Attivi di default · Nessun ID utente raccolto · Opt-out disponibile' },
        { k: 'Cookie pubblicitari / profilazione', v: 'MAI installati' },
        { k: 'Cookie di terze parti adv', v: 'MAI installati' },
        { k: 'Cookie tecnici di sicurezza CDN', v: 'Attivi · Cloudflare __cf_bm · Durata 30 min' },
      ] },

      { type: 'h', text: "5. Come gestire i cookie" },
      { type: 'p', text: "L'Utente può in qualsiasi momento gestire e cancellare i cookie dalle impostazioni del proprio browser:" },
      { type: 'list', items: [
        'Chrome: Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti',
        'Firefox: Preferenze → Privacy e sicurezza → Cookie e dati dei siti',
        'Safari: Preferenze → Privacy → Gestisci dati siti web',
        'Edge: Impostazioni → Cookie e autorizzazioni sito',
      ] },
      { type: 'p', text: "L'opt-out analitico (disattivazione di Plausible) è disponibile direttamente dalla pagina \"Impostazioni → Privacy\" del profilo utente." },
      { type: 'p', text: "ATTENZIONE: la cancellazione dei cookie tecnici essenziali comporta la disconnessione dall'account; al successivo accesso sarà necessario autenticarsi nuovamente tramite magic-link. La disattivazione dei cookie funzionali comporta la perdita delle preferenze (tema, lingua) e dell'elenco ricerche recenti." },

      { type: 'h', text: "6. Trasferimenti extra-UE" },
      { type: 'p', text: "I dati raccolti tramite i cookie sopra elencati sono trattati esclusivamente all'interno dello Spazio Economico Europeo. Cloudflare, fornitore di CDN, opera in modalità conforme al GDPR mediante Clausole Contrattuali Standard. Nessun dato viene trasferito verso paesi privi di decisione di adeguatezza." },

      { type: 'h', text: "7. Aggiornamenti" },
      { type: 'p', text: "La presente Cookie Policy può essere aggiornata in caso di evoluzione delle tecnologie utilizzate o del quadro normativo. La versione vigente è sempre consultabile su moviq.it/cookie con indicazione della data di ultimo aggiornamento. Per qualsiasi quesito relativo all'uso dei cookie, l'Utente può scrivere a privacy@moviq.it." },
    ],
  },
};
