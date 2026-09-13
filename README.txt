ORARIO FERMI WEB - v3.5
=======================

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

CORREZIONI v3.5 — SORVEGLIANZE
- Ordine unico: R1 OUT -> R1 IN -> R2 OUT -> R2 IN.
- OUT = docente della 2a/4a ora che accompagna la classe fuori.
- IN  = docente della 3a/5a ora che subentra dopo 5 minuti.
- Avvisi: 09:50 R1 OUT, 09:55 R1 IN, 11:50 R2 OUT, 11:55 R2 IN.
- Il bip/vibrazione scatta SOLO se il docente del profilo ha una sorveglianza assegnata in quella fase.
- Nessun segnale sonoro per i normali cambi d'ora delle lezioni.
- Il pulsante Sorveglianze ON/OFF memorizza la scelta sul dispositivo.
- Prova suono riproduce la sequenza bip bip bip - bip bip bip.
- La vista Adesso usa le stesse quattro fasi e gli stessi orari.
- Il parser riconosce le colonne R1/R2 dall'intestazione, quindi accetta anche file HTML con colonne in ordine diverso.
- dati/sorveglianze.html e' stato rigenerato dal quadro unico autorevole con ordine OUT/IN.

ORARI AVVISI
09:50  R1 OUT
09:55  R1 IN
11:50  R2 OUT
11:55  R2 IN

LIMITI DEL BROWSER MOBILE
Gli avvisi sono affidabili mentre la pagina e' aperta. Se Android sospende completamente
il browser o la pagina viene chiusa, JavaScript non puo' garantire notifiche programmate.
Dopo aver attivato Sorveglianze ON conviene usare una volta Prova suono per sbloccare
l'audio del browser. Le notifiche di sistema restano una funzione separata.

GITHUB PAGES
Caricare l'intera cartella nel repository mantenendo la struttura.
index.html e' l'indirizzo pubblico; Admin.html e' la pagina di amministrazione.


PATCH v3.5.1
- Corretto ordine visuale sorveglianze: R1 OUT, R1 IN, R2 OUT, R2 IN.
- Nessuna modifica alle assegnazioni/luoghi.
- Aggiunto cache-busting app-core.js?v=3.5.1 per evitare che il browser mostri ancora il vecchio ordine IN/OUT.
