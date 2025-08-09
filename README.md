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

### 3. **Avvia il setup dei db (da fare una volta sola)**

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
run_springboot
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
run_express_server
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
run_main_server
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

### 7. **Note importanti**

- Se non hai i database MongoDB e PostgreSQL già creati, creali prima di avviare il setup.
- Assicurati di avere i file `.env` nelle directories `solution/database`, `solution/main-server` e `solution/express-mongo-server`. Puoi copiare il contenuto dei file `.env.template` e personalizzarlo con le tue variabili d'ambiente.
- Se vuoi installare subito tutte le dipendenze, lancia `make setup_all` (ma viene fatto automaticamente all'avvio dei server).


