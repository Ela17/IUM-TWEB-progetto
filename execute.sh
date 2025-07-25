#!/bin/bash

# Funzione per creare/aggiornare il file .env.db
create_env() {
    echo "Creazione/aggiornamento delle variabili d'ambiente in corso..."

    mkdir -p database

    if [ -f database/.env.db ]; then
        read -p "Il file 'database/.env.db' esiste già. Vuoi aggiornarlo? (S/N): " overwrite
        if [[ "$overwrite" != "s" && "$overwrite" != "S" ]]; then
            echo "Operazione annullata."
            return
        fi
    fi
    
    echo "Inserisci le variabili d'ambiente per il database PostgreSQL"
    read -p "PORT: " pg_port
    read -p "DB_NAME: " pg_name
    read -p "USER: " pg_user
    read -s -p "PASSWORD: " pg_pass
    echo
    echo "Inserisci le variabili d'ambiente per il database MongoDB"
    read -p "PORT: " mongo_port
    read -p "DB_NAME: " mongo_name

    # Scrivi le variabili d'ambiente nel file .env.db
    echo "POSTGRES_HOST=localhost" > database/.env.db
    echo "POSTGRES_PORT=$pg_port" >> database/.env.db
    echo "POSTGRES_DB=$pg_name" >> database/.env.db
    echo "POSTGRES_USER=$pg_user" >> database/.env.db
    echo "POSTGRES_PASSWORD=$pg_pass" >> database/.env.db
    echo "POSTGRES_BATCH_SIZE=1000" >> database/.env.db
    echo "MONGO_HOST=localhost" >> database/.env.db
    echo "MONGO_PORT=$mongo_port" >> database/.env.db
    echo "MONGO_DB=$mongo_name" >> database/.env.db
    echo "MONGO_BATCH_SIZE=1000" >> database/.env.db

    echo "Variabili d'ambiente salvate con successo."
}

# Funzione per aggiornare i database esistenti
update_databases() {
    echo "Installando le dipendenze..."
    pip install --upgrade pip
    pip install -r requirements.txt

    echo
    echo "Inserisci il path in cui si trovano i CSV:"
    read csv_path

    if [ -z "$csv_path" ]; then
        # Nessun path inserito, chiama lo script senza parametri
        python database/databases_setup.py
    else
        # Passa il path come parametro
        python database/databases_setup.py "$csv_path"
    fi
}

# Menu principale
while true; do
    echo "Seleziona un'azione:"
    echo "1. Avvia il sistema"
    echo "2. Esci"
    echo "---------------------------------------------"
    echo "ATTENZIONE: Se vuoi usare un virtual environment,"
    echo "attivalo PRIMA di eseguire questo script."
    echo "---------------------------------------------"
    read -p "Scelta: " choice

    case $choice in
        1)
            read -p "Hai già creato i database MongoDB e PostgreSQL? (S/N): " db_created
            if [[ "$db_created" == "s" || "$db_created" == "S" ]]; then
                read -p "Hai già effettuato il setup con i nuovi dati? (S/N): " update_choice
                if [[ "$update_choice" == "n" || "$update_choice" == "N" ]]; then
                    create_env
                    update_databases
                else
                    echo "Nessuna azione eseguita."
                fi
            elif [[ "$db_created" == "n" || "$db_created" == "N" ]]; then
                echo "Crea i database MongoDB e PostgreSQL prima di procedere."
            else
                echo "Scelta non valida. Riprova."
            fi
            ;;
        2)
            echo "Uscita dal programma."
            exit 0
            ;;
        *)
            echo "Scelta non valida. Riprova."
            ;;
    esac
done

# AGGIUNGERE ALTRE POSSIBILITà ANDANDO AVANTI CON IL PROGETTO