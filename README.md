# Cascinar Mangiando — Sito evento

## Struttura
- `index.html` → locandina statica (home)
- `itinerario.html` → tappe, menù, link mappe/percorsi
- `tessera.html` → tessera digitale con QR personale (per i partecipanti)
- `scanner.html` → pagina per l'organizzatore, valida le tessere ad ogni tappa
- `functions/api/checkin.js` → backend (Cloudflare Pages Functions + KV)

## Deploy su Cloudflare Pages
1. Crea un repo GitHub con questi file (oppure carica la cartella direttamente
   da dashboard Cloudflare Pages > "Deploy directly / Upload assets").
2. Su Cloudflare dashboard → **Workers & Pages** → crea nuovo progetto Pages,
   collegalo al repo (build command: nessuno, output directory: `/`).

## Configurazione KV (per la tessera)
1. Vai su **Workers & Pages → KV** → crea un namespace, es. `cascinar-checkins`.
2. Vai sul progetto Pages → **Settings → Functions → KV namespace bindings**.
3. Aggiungi binding:
   - Variable name: `CHECKINS`
   - KV namespace: `cascinar-checkins`
4. Rideploy il progetto (le Functions partono automaticamente, non serve altro).

## Come si usa
- I partecipanti aprono `tessera.html` dal telefono, inseriscono il nome →
  ottengono un QR personale (salvato nel browser, persiste tra le visite).
- L'organizzatore apre `scanner.html`, seleziona la tappa attuale e inquadra
  il QR di ogni partecipante: il sistema registra il check-in su KV.
- I partecipanti vedono in tempo reale (ogni 8s) lo stato delle proprie tappe
  nella pagina `tessera.html`.

## Note
- Tutti i link mappa usano Google Maps (nessuna API key richiesta), modalità
  "a piedi" (`travelmode=walking`).
- Il pulsante "Apri il percorso completo" mostra l'intero giro con tappe
  intermedie come waypoint.
