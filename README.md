# 🎬 Sistema di Gestione Film - IUMT Web Project

## 📋 Panoramica

Questo progetto implementa un sistema completo di gestione film con architettura a microservizi:

- **Spring Boot Server** (Java) - API REST per gestione film e ricerca avanzata
- **Express Server** (Node.js) - API per chat in tempo reale e recensioni
- **Main Server** (Node.js) - Server principale con interfaccia web responsive
- **PostgreSQL** - Database relazionale per film, attori, generi, etc.
- **MongoDB** - Database NoSQL per recensioni e premi Oscar

### 🚀 Funzionalità Principali
- Ricerca film con suggerimenti in tempo reale
- Dettagli completi dei film con cast, recensioni e premi
- Sistema di chat in tempo reale
- Interfaccia web responsive e moderna
- API RESTful complete per integrazione

---

## 🟢 ISTRUZIONI AVVIO SISTEMA

### 1. **(Consigliato) Crea e attiva un virtual environment Python**

Questo è un passo fortemente consigliato per gestire le dipendenze in modo isolato.

**Con makefile**
```bash
make venv
```

**Comando alternativo da terminale:**
**Con Git Bash, WSL o terminale Linux/Mac:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Con Git Bash su Windows:**
```bash
python -m venv .venv
source .venv/Scripts/activate
```

> Se non vuoi usare un virtual environment, puoi saltare questo passaggio, ma è fortemente consigliato!

---

### 2. **Installa Bash se non lo hai già**

- Su Windows puoi usare [Git Bash](https://gitforwindows.org/) oppure WSL per eseguire i comandi da terminale.

---

### 3. **Setup Database (Opzioni disponibili)**

#### **Opzione A: Setup completo (Consigliato per sviluppo)**
Questo setup popola i database con i dati iniziali dai file CSV puliti e normalizzati.

**Con makefile**
Apri il terminale nella cartella del progetto e lancia:

```bash
make run_db_setup path_data_csv
```

dove `path_data_csv` è il path alla directory dove conservi i csv originali.
Se lo lasci vuoto, il sistema utilizzerà il path di default `./data`

**Comando alternativo da terminale**
Apri il terminale nella cartella del progetto e lancia:

```bash
python3 solution/database/databases_setup.py path_data_csv
```

#### **Opzione B: Restore da backup (Consigliato per valutazione)**
Se hai a disposizione un backup del database già popolato, puoi ripristinarlo rapidamente:

**Con makefile**
```bash
make restore_db
```

**Comando alternativo da terminale**
```bash
python3 solution/database/restore_database.py
```

> **💡 Per i docenti**: È disponibile un backup completo del database nella directory `solution/database/backups/` per evitare il lungo processo di setup. Vedi sezione "Backup e Restore" per maggiori dettagli.

---

### 4. **Avvia tutti i server**

Questo comando avvierà tutti i server necessari per il corretto funzionamento del sistema.

1. Esporta le variabili d'ambiente per il database:
```bash
export POSTGRES_USER="il_tuo_utente" # necessario solo se non è quello di default (postgres)
export POSTGRES_PASSWORD="la_tua_password"
```
In alternativa, puoi configurare queste variabili nel file `solution/springboot-server/src/main/resources/application.properties`.
Senza questo primo passaggio, il server Spring Boot non può collegarsi al database.

2. Avvia i server in background:
**Con makefile**
Apri il terminale nella cartella del progetto e lancia:
```bash
make run_all
```
Questo comando installerà prima le dipendenze necessarie e poi avvierà tutti i servizi in background.

**Comandi alternativi da terminale**
```bash
# Spring Boot Server
cd solution/springboot-server && mvn package -DskipTests && java -jar target/*.jar &
# Express Mongo Server
cd ../express-mongo-server && npm install --production && npm start &
# Main Server
cd ../main-server && npm install --production && npm start &
```

---

### 5. Avvia i singoli server

Se preferisci avviare ogni server singolarmente in terminali separati, puoi usare i seguenti comandi.

##### **Avvio del server Spring Boot (Java)**
1. Esporta le variabili d'ambiente per il database:
```bash
export POSTGRES_USER="il_tuo_utente" # necessario solo se non è quello di default (postgres)
export POSTGRES_PASSWORD="la_tua_password"
```
In alternativa, puoi configurare queste variabili nel file `solution/springboot-server/src/main/resources/application.properties`.
Senza questo primo passaggio, il server Spring Boot non può collegarsi al database.

2. Compila e avvia il server:
**Con makefile**
```bash
make run_springboot
```

**Comando alternativo da terminale**
```bash
cd solution/springboot-server
mvn package -DskipTests
java -jar target/*.jar &
```

##### **Avvio del server Express (Node.js) per MongoDB**
**Con makefile**
```bash
make run_express_server
```

**Comando alternativo da terminale**
```bash
cd solution/express-mongo-server
npm install --production
npm start &
```

##### **Avvio del server principale (Node.js)**
**Con makefile**
```bash
make run_main_server
```

**Comando alternativo da terminale**
```bash
cd solution/main-server
npm install --production
npm start &
```

---

### 6. **Pulizia del sistema**

Per pulire i file temporanei, le cache e le dipendenze generate, esegui:

**Con makefile**
```bash
make clean
```

**Comandi alternativi da terminale:**
```bash
rm -rf .venv
cd solution/springboot-server && mvn clean
cd ../express-mongo-server && rm -rf node_modules
cd ../main-server && rm -rf node_modules
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -delete
rm -rf .pytest_cache .mypy_cache
```

---

### 7. **Backup e Restore Database**

#### **Creazione Backup**
Per creare un backup completo dei database (utile per la consegna):

**Con makefile**
```bash
make backup_db
```

**Comando alternativo da terminale**
```bash
python3 solution/database/backup_database.py
```

Il backup verrà salvato in `solution/database/backups/` con timestamp.

#### **Restore da Backup**
Per ripristinare un backup esistente:

**Con makefile**
```bash
make restore_db
```

**Comando alternativo da terminale**
```bash
python3 solution/database/restore_database.py
```

> **📋 Per i docenti**: Nella directory `solution/database/backups/` è disponibile un backup completo del database già popolato. Questo evita il lungo processo di setup (circa 1.5GB di dati da processare). Il backup include tutti i dati puliti, normalizzati e gli indici ottimizzati.

---

### 8. **Note importanti**

- Se non hai i database MongoDB e PostgreSQL già creati, creali prima di avviare il setup.
- Assicurati di avere i file `.env` nelle directories `solution/database`, `solution/main-server` e `solution/express-mongo-server`. Puoi copiare il contenuto dei file `.env.template` e personalizzarlo con le tue variabili d'ambiente.
- Se vuoi installare subito tutte le dipendenze, lancia `make setup_all` (ma viene fatto automaticamente all'avvio dei server).

---

## 🌐 Accesso ai Servizi

Dopo aver avviato tutti i server, puoi accedere ai seguenti servizi:

### **Interfaccia Web Principale**
- **URL**: http://localhost:5000
- **Descrizione**: Interfaccia utente completa con ricerca, dettagli film e chat

### **API Spring Boot (Java)**
- **URL**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Descrizione**: API REST per gestione film, ricerca e filtri avanzati

### **API Express (Node.js)**
- **URL**: http://localhost:3000
- **Descrizione**: API per chat in tempo reale e gestione recensioni

---

## 📁 Struttura Progetto

```
solution/
├── database/              # Script setup, backup e pulizia dati
│   ├── backups/           # Backup dei database
│   ├── preprocessing/     # Pulizia e normalizzazione dati
│   └── setupper/         # Setup database
├── springboot-server/     # API REST Java (porta 8080)
├── express-mongo-server/  # API Node.js per MongoDB (porta 3000)
├── main-server/          # Server principale con UI (porta 5000)
└── ium-data-analysis/    # Analisi dati e report
```

---

## 🛠️ Comandi Utili

### **Gestione Database**
```bash
# Setup completo database
make run_db_setup

# Backup database
make backup_db

# Restore database
make restore_db
```

### **Gestione Server**
```bash
# Avvia tutti i server
make run_all

# Avvia singoli server
make run_springboot
make run_express_server
make run_main_server
```

### **Pulizia**
```bash
# Pulizia completa
make clean
```


