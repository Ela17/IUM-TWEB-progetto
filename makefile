# Variabili
PYTHON_ENV_NAME = .venv
PYTHON = $(PYTHON_ENV_NAME)/bin/python
PIP = $(PYTHON_ENV_NAME)/bin/pip
REQUIREMENTS = requirements.txt
SPRINGBOOT_DIR = solution/springboot-server
MAIN_SERVER_DIR = solution/main-server

# Regola predefinita: setup e avvio di tutti i componenti
all: setup_all run_all

---

## Gestione dell'ambiente virtuale Python
.PHONY: venv install_python_deps clean_venv

# Crea l'ambiente virtuale Python se non esiste
venv:
	@echo "Creazione dell'ambiente virtuale '$(PYTHON_ENV_NAME)'..."
	python3 -m venv $(PYTHON_ENV_NAME)
	@echo "Ambiente virtuale Python creato."

# Installa le dipendenze Python specificate in requirements.txt
install_python_deps: venv
	@echo "Installazione delle dipendenze Python da $(REQUIREMENTS)..."
	$(PIP) install -r $(REQUIREMENTS)
	@echo "Dipendenze Python installate."

# Rimuove l'ambiente virtuale Python
clean_venv:
	@echo "Rimozione dell'ambiente virtuale Python '$(PYTHON_ENV_NAME)'..."
	rm -rf $(PYTHON_ENV_NAME)
	@echo "Ambiente virtuale Python rimosso."

---

## Gestione del server Spring Boot (Java)
.PHONY: compile_springboot run_springboot clean_springboot install_java_deps

# Installa le dipendenze Maven per il progetto Spring Boot.
# Questo comando risolve e scarica le dipendenze necessarie.
install_java_deps:
	@echo "Installazione delle dipendenze Maven per Spring Boot..."
	cd $(SPRINGBOOT_DIR) && mvn dependency:resolve
	@echo "Dipendenze Maven installate."

# Compila il server Spring Boot e crea il file JAR eseguibile.
# -DskipTests salta l'esecuzione dei test durante la compilazione.
compile_springboot: install_java_deps
	@echo "Compilazione del server Spring Boot..."
	cd $(SPRINGBOOT_DIR) && mvn package -DskipTests
	@echo "Server Spring Boot compilato."

# Avvia il server Spring Boot in background.
# Il wildcard `*.jar` assume che ci sia un solo file JAR nella directory target.
run_springboot: compile_springboot
	@echo "Avvio del server Spring Boot..."
	cd $(SPRINGBOOT_DIR) && java -jar target/*.jar &
	@echo "Server Spring Boot avviato in background."

# Pulisce i file di build di Spring Boot generati da Maven.
clean_springboot:
	@echo "Pulizia dei file di build di Spring Boot..."
	cd $(SPRINGBOOT_DIR) && mvn clean
	@echo "File di build di Spring Boot rimossi."

---

## Gestione del server principale (Express Node.js)
.PHONY: install_main_server_deps run_main_server clean_main_server

# Installa le dipendenze Node.js specificate in package.json.
install_main_server_deps:
	@echo "Installazione delle dipendenze Node.js per il server principale..."
	cd $(MAIN_SERVER_DIR) && npm install
	@echo "Dipendenze Node.js installate."

# Avvia il server principale (Node.js) in background.
run_main_server: install_main_server_deps
	@echo "Avvio del server principale (Node.js)..."
	cd $(MAIN_SERVER_DIR) && npm start &
	@echo "Server principale avviato in background."

# Pulisce le dipendenze Node.js rimuovendo la cartella node_modules.
clean_main_server:
	@echo "Pulizia delle dipendenze Node.js..."
	rm -rf $(MAIN_SERVER_DIR)/node_modules
	@echo "Dipendenze Node.js rimosse."

---

## Esecuzione di script Python
.PHONY: run_db_setup

# Esegue lo script di setup del database Python.
# $(PATH_PARAM) è una variabile che puoi passare da riga di comando (es. make run_db_setup PATH_PARAM=/path/to/data)
run_db_setup: install_python_deps
	@echo "Esecuzione dello script di setup del database..."
	$(PYTHON) solution/database/databases_setup.py $(PATH_PARAM)
	@echo "Setup del database completato."

---

## Regole composite per setup e avvio
.PHONY: setup_all run_all

# Target per installare tutte le dipendenze di tutti i componenti
setup_all: install_python_deps install_java_deps install_main_server_deps
	@echo "Tutte le dipendenze sono state installate."

# Target per avviare tutti i servizi del progetto.
# I server vengono avviati in background.
run_all: run_springboot run_main_server
	@echo "Tutti i servizi sono stati avviati."
	@echo "Il makefile ha completato l'esecuzione. I server sono in background."
	@echo "Potrebbe essere necessario terminare i processi manualmente (es. con 'killall java' o 'killall node')."

---

## Pulizia generale del progetto
.PHONY: clean

# Pulisce tutti i file temporanei, cache e dipendenze generate da tutti i componenti.
clean: clean_venv clean_springboot clean_main_server
	@echo "Pulizia dei file temporanei e dei cache Python..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .pytest_cache .mypy_cache # Rimuove cache di pytest e mypy se presenti
	@echo "Pulizia generale completata."