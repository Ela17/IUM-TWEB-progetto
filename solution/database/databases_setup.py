"""
Script principale per setup completo database
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import logging

# Setup path
sys.path.append(str(Path(__file__).parent))

from preprocessing.data_cleaning import clean_data
from setupper.postgres_setup import PostgreSQLSetup
from setupper.mongo_setup import MongoDBSetup

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

def validate_environment():
    """Valida che tutte le variabili d'ambiente necessarie siano presenti"""
    logger.info("🔍 Validazione variabili d'ambiente...")
    
    required_vars = [
        'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 
        'POSTGRES_USER', 'POSTGRES_PASSWORD',
        'MONGO_HOST', 'MONGO_PORT', 'MONGO_DB'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"❌ Variabili d'ambiente mancanti: {', '.join(missing_vars)}")
        logger.error("💡 Verifica il file .env")
        sys.exit(1)
    
    logger.info("✅ Tutte le variabili d'ambiente sono presenti")

def validate_data_directory(data_path):
    """Valida che la directory dei dati esista e contenga i file necessari"""
    logger.info("📂 Validazione directory dati...")
    
    if not data_path.exists():
        logger.error(f"❌ Directory dati non trovata: {data_path}")
        logger.error("💡 Assicurati che la directory esista e contenga i file CSV")
        sys.exit(1)
    
    # File CSV richiesti
    required_files = [
        'movies.csv', 'actors.csv', 'crew.csv', 'countries.csv', 
        'genres.csv', 'languages.csv', 'studios.csv', 'themes.csv',
        'releases.csv', 'posters.csv', 'rotten_tomatoes_reviews.csv',
        'the_oscar_awards.csv'
    ]
    
    missing_files = []
    for file_name in required_files:
        file_path = data_path / file_name
        if not file_path.exists():
            missing_files.append(file_name)
        else:
            # Verifica che il file non sia vuoto
            if file_path.stat().st_size == 0:
                logger.error(f"❌ File vuoto: {file_name}")
                sys.exit(1)
    
    if missing_files:
        logger.error(f"❌ File CSV mancanti: {', '.join(missing_files)}")
        logger.error(f"💡 Directory dati: {data_path}")
        logger.error("💡 Assicurati che tutti i file CSV siano presenti")
        sys.exit(1)
    
    logger.info(f"✅ Tutti i file CSV trovati in: {data_path}")

def main():
    """Setup completo database"""
    logger.info("🎬" + "="*50)
    logger.info("🎬 Setup Database Film Project")
    logger.info("🎬" + "="*50)

    if len(sys.argv) > 1:
        data_path = sys.argv[1]
    else:
        data_path = Path(__file__).resolve().parent.parent.parent / 'data'

    try:
        # Carica configurazioni
        load_dotenv('.env')
        validate_environment()

        validate_data_directory(data_path)
    
        # Pulizia dati
        logger.info("\n" + "="*30)
        logger.info("PULIZIA DATI")
        logger.info("="*30)
        try:
            cleaned_data = clean_data(str(data_path))
        except Exception as e:
            logger.error(f"❌ Errore critico durante pulizia dati: {e}")
            sys.exit(1)
    
        # Setup PostgreSQL
        logger.info("\n" + "="*30)
        logger.info("SETUP POSTGRESQL")
        logger.info(f"🐘 PostgreSQL: {os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}")
        logger.info("="*30)
        try:
            postgres = PostgreSQLSetup()
            pg_total = 0

            postgres.connect()
            
            postgres.create_schema()

            # Tabelle PostgreSQL
            pg_tables = [
                ('movies', 'movies'),
                ('actors', 'actors'),
                ('crew', 'crews'),
                ('countries', 'countries'),
                ('genres', 'genres'),
                ('languages', 'languages'),
                ('studios', 'studios'),
                ('themes', 'themes'),
                ('releases', 'releases'),
                ('posters', 'posters')
            ]

            for data_key, table_name in pg_tables:
                if data_key in cleaned_data:
                    if cleaned_data[data_key].empty:
                        logger.error(f"⚠️ Dataset {data_key} vuoto.")
                        continue
                    
                    inserted = postgres.insert_dataframe(cleaned_data[data_key], table_name)
                    if inserted == 0:
                        logger.error(f"❌ Nessun record inserito in {table_name}")
                        postgres.cleanup()
                        raise Exception(f"Inserimento fallito per tabella {table_name}")
                    
                    pg_total += inserted
                
                if pg_total == 0:
                    logger.error("❌ Nessun record inserito in PostgreSQL.")
                    postgres.cleanup()
                    raise Exception("Nessun record inserito in PostgreSQL.")
        
            postgres.create_indexes()
            postgres.cleanup()

            logger.info(f"✅ PostgreSQL: {pg_total:,} record inseriti con successo.")
        except Exception as e:
            logger.error(f"❌ Errore critico PostgreSQL: {e}")
            raise
    
        # Setup MongoDB
        logger.info("\n" + "="*30)
        logger.info("SETUP MONGODB")
        logger.info(f"🍃 MongoDB: {os.getenv('MONGO_HOST')}:{os.getenv('MONGO_PORT')}")
        logger.info("="*30)
        try:
            mongo = MongoDBSetup()
            mongo_total = 0
            
            mongo.connect() # lancia eccezione se non riesce a connettersi
            
            mongo.create_collections()
                
            # Collezioni MongoDB
            if 'rotten_tomatoes_reviews' in cleaned_data:
                inserted = mongo.insert_dataframe(cleaned_data['rotten_tomatoes_reviews'], 'reviews')
                if inserted == 0:
                    logger.error("❌ Nessuna recensione inserita.")
                    mongo.cleanup()
                    raise Exception("Inserimento recensioni fallito.")
                mongo_total += inserted

            if 'the_oscar_awards' in cleaned_data:
                inserted = mongo.insert_dataframe(cleaned_data['the_oscar_awards'], 'oscar_awards')
                if inserted == 0:
                    logger.error("❌ Nessun premio Oscar inserito")
                    mongo.cleanup()
                    raise Exception("Inserimento Oscar fallito")
                mongo_total += inserted

            if mongo_total == 0:
                logger.error("❌ Nessun record inserito in MongoDB")
                mongo.cleanup()
                raise Exception("Nessun record inserito in MongoDB")
            
            mongo.create_indexes()
            mongo.cleanup()
            logger.info(f"✅ MongoDB: {mongo_total:,} record inseriti")
        
        except Exception as e:
            logger.error(f"❌ Errore critico MongoDB: {e}")
            raise
        
        logger.info("\n🎉 Setup terminato!")

    except KeyboardInterrupt:
        logger.error("\n❌ Setup interrotto dall'utente")
        sys.exit(1)
    except SystemExit:
        # Re-raise SystemExit per mantenere il codice di uscita
        raise
    except Exception as e:
        logger.error(f"❌ Errore imprevisto: {e}")
        logger.error("💡 Verifica la configurazione e riprova")
        sys.exit(1)

if __name__ == "__main__":
    main()
