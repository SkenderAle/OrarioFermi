ORARIO FERMI - PACCHETTO WEB
===========================

Contenuto:
- index.html                 pagina pubblica da condividere con i colleghi
- Admin.html                 pagina amministratore per caricare i due nuovi HTML
- app-core.js                parser e controllo incrociato comune alle due pagine
- dati/orario_classi.html    sorgente classi attuale
- dati/orario_docenti.html   sorgente docenti attuale

COME PUBBLICARE SU GITHUB PAGES
1. Crea un repository (pubblico, se vuoi usare GitHub Pages gratuitamente con le normali impostazioni disponibili al tuo account).
2. Carica TUTTI i file mantenendo esattamente la cartella "dati".
3. Attiva GitHub Pages sul branch che userai (normalmente main, cartella root).
4. La pagina pubblica sarà l'indirizzo base del sito; index.html viene aperto automaticamente.
5. Admin.html sarà raggiungibile aggiungendo /Admin.html all'indirizzo.

PRIMO USO DI ADMIN.HTML
- Apri Admin.html.
- In "Impostazioni GitHub" inserisci username/proprietario, nome repository e branch.
  Se Admin è già su GitHub Pages, username e repository vengono normalmente rilevati da soli.
- Inserisci un Fine-grained Personal Access Token autorizzato SOLO a quel repository con permesso:
  Contents: Read and write.
- Il token NON viene salvato da Admin.html. Username, repository e branch sì, localmente nel browser.

AGGIORNARE L'ORARIO
1. Produci i due file HTML dal tuo sistema: uno classi e uno docenti.
2. Apri Admin.html.
3. Seleziona i due file.
4. Premi "Analizza e confronta".
5. Se il controllo è coerente, premi "Pubblica nuovo orario".
6. Admin crea UN SOLO commit che sostituisce:
   dati/orario_classi.html
   dati/orario_docenti.html
7. index.html legge automaticamente i nuovi dati. Non va modificato né rigenerato.

CONTROLLO INCROCIATO
Il parser confronta le assegnazioni classe-giorno-ora-docente-disciplina presenti nei due HTML.
Gestisce anche POT/POT AGG. e le coppie TEDESCO/FRANCESE con classi/docenti accoppiati.
Se trova differenze o sovrapposizioni, le mostra prima della pubblicazione.

NOTA SUL FORMATO
Il sistema è costruito per gli HTML con la stessa struttura dei due file forniti il 9/09/2026:
titolo <h2> seguito da una tabella con 6 righe orarie e 5 colonne lunedì-venerdì.
Se in futuro cambia la struttura del generatore HTML, potrebbe essere necessario aggiornare app-core.js.
