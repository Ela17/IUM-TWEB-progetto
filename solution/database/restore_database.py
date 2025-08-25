"""
Script per ripristinare backup dei database PostgreSQL e MongoDB
"""

import os
import sys
import subprocess
import logging
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class DatabaseRestore:
    """Gestisce il restore di PostgreSQL e MongoDB"""
    
    def __init__(self, backup_dir=None):
        # Carica configurazioni
        script_dir = Path(__file__).parent
        env_path = script_dir / '.env'
        if env_path.exists():
            load_dotenv(env_path)
        else:
            load_dotenv('.env')
        
        # Configurazioni PostgreSQL
        self.pg_host = os.getenv('POSTGRES_HOST')
        self.pg_port = os.getenv('POSTGRES_PORT')
        self.pg_database = os.getenv('POSTGRES_DB')
        self.pg_user = os.getenv('POSTGRES_USER')
        self.pg_password = os.getenv('POSTGRES_PASSWORD')
        
        # Configurazioni MongoDB
        self.mongo_host = os.getenv('MONGO_HOST')
        self.mongo_port = os.getenv('MONGO_PORT')
        self.mongo_database = os.getenv('MONGO_DB')
        
        # Directory backup
        if backup_dir:
            self.backup_dir = Path(backup_dir)
        else:
            self.backup_dir = Path(__file__).parent / 'backups'
        
        if not self.backup_dir.exists():
            raise FileNotFoundError(f"Directory backup non trovata: {self.backup_dir}")
    
    def find_latest_backup(self):
        """Trova l'ultimo backup disponibile"""
        logger.info(f"🔍 Cercando backup in: {self.backup_dir}")
        
        # Cerca file PostgreSQL
        pg_files = list(self.backup_dir.glob("postgresql_backup_*.sql"))
        if not pg_files:
            raise FileNotFoundError("Nessun backup PostgreSQL trovato")
        
        # Cerca directory MongoDB
        mongo_dirs = list(self.backup_dir.glob("mongodb_backup_*"))
        if not mongo_dirs:
            raise FileNotFoundError("Nessun backup MongoDB trovato")
        
        # Prendi l'ultimo backup (più recente)
        latest_pg = max(pg_files, key=lambda x: x.stat().st_mtime)
        latest_mongo = max(mongo_dirs, key=lambda x: x.stat().st_mtime)
        
        logger.info(f"📁 Backup PostgreSQL: {latest_pg.name}")
        logger.info(f"📁 Backup MongoDB: {latest_mongo.name}")
        
        return latest_pg, latest_mongo
    
    def restore_postgresql(self, backup_file):
        """Ripristina backup PostgreSQL"""
        logger.info("🐘 Ripristinando backup PostgreSQL...")
        
        # Comando psql per il restore
        cmd = [
            'psql',
            f'--host={self.pg_host}',
            f'--port={self.pg_port}',
            f'--username={self.pg_user}',
            f'--dbname={self.pg_database}',
            '--quiet',
            f'--file={backup_file}'
        ]
        
        # Setta la password come variabile d'ambiente
        env = os.environ.copy()
        env['PGPASSWORD'] = self.pg_password
        
        try:
            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info("✅ Restore PostgreSQL completato")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Errore restore PostgreSQL: {e}")
            logger.error(f"Stderr: {e.stderr}")
            raise RuntimeError(f"Restore PostgreSQL fallito: {e}")
        except FileNotFoundError:
            logger.error("❌ psql non trovato. Verifica che PostgreSQL sia installato e nel PATH")
            raise RuntimeError("psql non disponibile")
    
    def restore_mongodb(self, backup_dir):
        """Ripristina backup MongoDB"""
        logger.info("🍃 Ripristinando backup MongoDB...")
        
        # Trova la directory del database specifico
        db_backup_dir = backup_dir / self.mongo_database
        if not db_backup_dir.exists():
            raise FileNotFoundError(f"Directory backup database non trovata: {db_backup_dir}")
        
        # Comando mongorestore
        cmd = [
            'mongorestore',
            f'--host={self.mongo_host}:{self.mongo_port}',
            f'--db={self.mongo_database}',
            '--drop',  # Elimina collezioni esistenti
            str(db_backup_dir)
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            logger.info("✅ Restore MongoDB completato")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Errore restore MongoDB: {e}")
            logger.error(f"Stderr: {e.stderr}")
            raise RuntimeError(f"Restore MongoDB fallito: {e}")
        except FileNotFoundError:
            logger.error("❌ mongorestore non trovato. Verifica che MongoDB sia installato e nel PATH")
            raise RuntimeError("mongorestore non disponibile")
    
    def verify_restore(self):
        """Verifica che il restore sia andato a buon fine"""
        logger.info("🔍 Verificando restore...")
        
        try:
            # Test connessione PostgreSQL
            import psycopg2
            conn = psycopg2.connect(
                host=self.pg_host,
                port=self.pg_port,
                database=self.pg_database,
                user=self.pg_user,
                password=self.pg_password
            )
            cursor = conn.cursor()
            
            # Conta record nelle tabelle principali
            cursor.execute("SELECT COUNT(*) FROM movies")
            movies_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM actors")
            actors_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM oscars")
            oscars_count = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
            logger.info(f"✅ PostgreSQL: {movies_count:,} film, {actors_count:,} attori, {oscars_count:,} Oscar")
            
            # Test connessione MongoDB
            from pymongo import MongoClient
            client = MongoClient(f"mongodb://{self.mongo_host}:{self.mongo_port}")
            db = client[self.mongo_database]
            
            reviews_count = db.reviews.count_documents({})
            
            client.close()
            
            logger.info(f"✅ MongoDB: {reviews_count:,} recensioni")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Errore verifica restore: {e}")
            return False
    
    def restore(self):
        """Esegue il restore completo"""
        logger.info("🔄" + "="*50)
        logger.info("🔄 Restore Database")
        logger.info("🔄" + "="*50)
        
        try:
            # Trova backup
            pg_backup, mongo_backup = self.find_latest_backup()
            
            # Restore PostgreSQL
            self.restore_postgresql(pg_backup)
            
            # Restore MongoDB
            self.restore_mongodb(mongo_backup)
            
            # Verifica
            if self.verify_restore():
                logger.info("\n🎉 Restore completato con successo!")
                logger.info("🚀 Puoi ora avviare i server:")
                logger.info("   - Spring Boot Server (porta 8080)")
                logger.info("   - Express Server (porta 3000)")
                logger.info("   - Main Server (porta 5000)")
            else:
                logger.warning("⚠️ Restore completato ma la verifica ha fallito")
            
        except Exception as e:
            logger.error(f"❌ Errore durante il restore: {e}")
            raise

def main():
    """Script principale"""
    parser = argparse.ArgumentParser(description='Ripristina backup dei database')
    parser.add_argument('--backup-dir', help='Directory contenente i backup')
    args = parser.parse_args()
    
    try:
        restore_manager = DatabaseRestore(args.backup_dir)
        restore_manager.restore()
    except Exception as e:
        logger.error(f"❌ Restore fallito: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
