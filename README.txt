ORARIO FERMI WEB - v3
=====================

STRUTTURA
- index.html                  visualizzatore pubblico mobile
- Admin.html                  aggiornamento dei dati via GitHub API
- app-core.js                 parser e controlli
- sw.js                       notifiche di sistema quando la pagina e' attiva
- manifest.webmanifest        supporto installazione come web-app
- dati/orario_classi.html
- dati/orario_docenti.html
- dati/orario_sostegno.html   versione pubblica senza iniziali alunni
- dati/sorveglianze.html

FUNZIONI PRINCIPALI
- viste Classi / Docenti / Sostegno / Sorveglianze
- giorno / settimana
- profilo docente memorizzato sul singolo dispositivo
- avvisi sonori attivabili/disattivabili e memorizzati
- popup di cambio ora visibile per 10 minuti
- notifica di sistema dove supportata/autorizzata
- avvisi personali di sorveglianza in base al docente selezionato
- Admin con caricamento dei quattro HTML e controllo incrociato
- Admin rimuove automaticamente le iniziali degli alunni dal file di sostegno prima di pubblicarlo

ORARI AVVISI ATTUALI
07:55  1a ora
08:55  2a ora
09:50  Ricreazione 1 - R1 IN
09:58  Cambio sorveglianza - R1 OUT
10:05  3a ora
10:55  4a ora
11:50  Ricreazione 2 - R2 IN
11:58  Cambio sorveglianza - R2 OUT
12:05  5a ora
12:55  6a ora

NOTA: il cambio IN->OUT delle ricreazioni e' impostato provvisoriamente all'8° minuto (09:58 e 11:58). Se il cambio reale avviene a un altro minuto, basta modificare SCHOOL_EVENTS in index.html.

LIMITI DEL BROWSER MOBILE
Gli avvisi sono affidabili mentre la pagina e' aperta. Se Android sospende completamente il browser o la pagina viene chiusa, JavaScript non puo' garantire notifiche programmate. Il service worker serve a mostrare la notifica nativa quando la pagina sta ancora eseguendo il controllo.

GITHUB PAGES
Caricare l'intera cartella nel repository mantenendo la struttura. index.html e' l'indirizzo pubblico; Admin.html e' la pagina di amministrazione.
