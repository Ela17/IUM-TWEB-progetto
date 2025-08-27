# 🎬 Sistema di Gestione Film - IUMT Web Project

### 🔗 Link rapidi
- `solution/database/.env.template`
- `solution/express-mongo-server/.env.template`
- `solution/main-server/.env.template`
- `solution/springboot-server/src/main/resources/application.properties`
- Sezione: [⚙️ Variabili d'ambiente](#-variabili-dambiente)
- Sezione: [📄 Esempi di `.env.template`](#-esempi-di-envtemplate)

## 📋 Panoramica

Sistema completo per gestione ed esplorazione dei film con architettura a microservizi:

- Main Server (Express, Node.js): gateway centrale, UI Handlebars, Socket.IO, proxy verso i servizi
- Express Mongo Server (Node.js): dati dinamici in MongoDB
- Spring Boot Server (Java): API per dati statici su PostgreSQL

### 🚀 Funzionalità principali
- Ricerca film con suggerimenti
- Dettagli film con cast, recensioni e premi
- Chat in tempo reale (Socket.IO)
- Interfaccia web responsive
- API REST per integrazione

---

## 🧰 Prerequisiti
- Node.js >= 22.15 e npm >= 9
- Python 3.10+
- Java 17 e Maven 3.9+
- PostgreSQL 14+ in esecuzione
- MongoDB 6+ in esecuzione

---

## 🟢 Avvio rapido
1) Facoltativo ma consigliato: crea un virtual environment Python
```bash
make venv
```
Oppure:
```bash
# Linux/macOS/WSL
python3 -m venv .venv
source .venv/bin/activate

# Windows PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Setup database dai CSV (usa i file in `./data` o specifica un percorso)
```bash
# Usa i CSV in ./data
make run_db_setup

# Oppure specifica un percorso personalizzato ai CSV
make run_db_setup PATH_PARAM="C:/percorso/ai/csv"

# Alternativa senza make
python solution/database/databases_setup.py C:/percorso/ai/csv
```

3) Avvia tutti i server (in background)
```bash
make run_all
```

Nota: Se preferisci, avvia i server singolarmente con `make run_springboot`, `make run_express_server`, `make run_main_server`.

---

## ⚙️ Variabili d'ambiente

### Database setup (script Python)
Richieste dal comando di setup:
- POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
- MONGO_HOST, MONGO_PORT, MONGO_DB

Esempi esportazione:
```bash
# Bash/WSL
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=admin

# PowerShell
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="admin"
```

### Main Server (Express)
- Configurazione in `solution/main-server/.env`
  - MAIN_SERVER_PORT (default 3000)
  - NODE_ENV (opzionale)

### Express Mongo Server
- Configurazione in `solution/express-mongo-server/.env`
  - PORT (default 3001)
  - MONGODB_URI
  - MAIN_SERVER_URL per CORS (default http://localhost:3000)

### Spring Boot Server
- Configurazione in `solution/springboot-server/src/main/resources/application.properties`
  - Porta: 8081 (property `server.port`)
  - Datasource: username da `POSTGRES_USER` (default postgres), password da `POSTGRES_PASSWORD` (default admin)

---

## 🌐 Accesso ai servizi
- Interfaccia web principale (Main Server): `http://localhost:3000`
  - Documentazione API (Swagger del Main): `http://localhost:3000/api-docs`
- API Express (Mongo/Chat/Reviews): `http://localhost:3001`
- API Spring Boot (PostgreSQL): `http://localhost:8081`

---

## 🧭 Struttura del progetto
```
solution/
├── database/              # Setup e preprocess CSV (Python)
│   ├── preprocessing/
│   └── setupper/
├── springboot-server/     # API Java (porta 8081)
├── express-mongo-server/  # API Mongo/Chat (porta 3001)
├── main-server/           # Gateway + UI + Swagger (porta 3000)
└── ium-data-analysis/     # Analisi dati
```

---

## 🛠️ Comandi utili

### Database
```bash
# Setup completo database (usa ./data se non passi il percorso)
make run_db_setup

# Passa un percorso personalizzato
make run_db_setup PATH_PARAM="C:/percorso/ai/csv"
```

### Server
```bash
# Avvia tutti i server
make run_all

# Avvia singoli server
make run_springboot
make run_express_server
make run_main_server

# Ferma i server Node
make stop_all
# (Per Spring Boot, interrompi il processo Java manualmente)
```

### Pulizia
```bash
make clean
```

---

## 🗂️ Backup
È fornito un archivio `backups.zip` in `solution/database/` a scopo di consegna, in alternativa allo script di setup.

---

## ℹ️ Note
- Assicurati che PostgreSQL e MongoDB siano attivi prima del setup.
- Puoi creare un file `.env` nelle cartelle dei server Node per impostare variabili (caricato da `dotenv`).
- `make setup_all` installa le dipendenze di tutti i moduli.

---

## 📄 Esempi di `.env.template`
Copiali nei rispettivi percorsi e rinominali in `.env` se necessario.

### solution/database/.env.template
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=cinema_db # change to your database name if needed
POSTGRES_USER=postgres # change to your database user if needed
POSTGRES_PASSWORD=my_password # change me!

MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=cinema_db

POSTGRES_BATCH_SIZE=1000
MONGO_BATCH_SIZE=1000
```

### solution/main-server/.env.template
```env
MAIN_SERVER_PORT=3000   # change if needed
MAIN_SERVER_HOST=localhost
MAIN_SERVER_TIMEOUT=5000
MAIN_SERVER_LOG_LEVEL=info

MAIN_SERVER_URL=http://localhost:3000

SPRING_BOOT_SERVER_URL=http://localhost:8081    # change if needed
SPRING_BOOT_SERVER_TIMEOUT=8000

OTHER_EXPRESS_SERVER_URL=http://localhost:3001  # change if needed
OTHER_EXPRESS_SERVER_TIMEOUT=5000
```

### solution/express-mongo-server/.env.template
```env
PORT=3001   # change if needed
HOST=localhost  # change if needed

MAIN_SERVER_URL=http://localhost:3000 # change if needed

MONGODB_URI=mongodb://localhost:27017 
DB_NAME=cinema_db # change if needed

NODE_ENV=development
```

### Spring Boot (application.properties)
Percorso: `solution/springboot-server/src/main/resources/application.properties`

Chiavi rilevanti già impostate di default:
```properties
server.port=8081
spring.datasource.url=jdbc:postgresql://localhost:5432/cinema_db
spring.datasource.username=${POSTGRES_USER:postgres}
spring.datasource.password=${POSTGRES_PASSWORD:admin}
```


