"""
Script per creare backup dei database PostgreSQL e MongoDB
"""

import os
import sys
import subprocess
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class DatabaseBackup:
    """Gestisce il backup di PostgreSQL e MongoDB"""
    
    def __init__(self):
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
        self.backup_dir = Path(__file__).parent / 'backups'
        self.backup_dir.mkdir(exist_ok=True)
        
        # Timestamp per il backup
        self.timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    def backup_postgresql(self):
        """Crea backup di PostgreSQL"""
        logger.info("🐘 Creando backup PostgreSQL...")
        
        backup_file = self.backup_dir / f"postgresql_backup_{self.timestamp}.sql"
        
        # Comando pg_dump
        cmd = [
            'pg_dump',
            f'--host={self.pg_host}',
            f'--port={self.pg_port}',
            f'--username={self.pg_user}',
            f'--dbname={self.pg_database}',
            '--verbose',
            '--clean',
            '--no-owner',
            '--no-privileges',
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
            
            # Verifica dimensione file
            file_size = backup_file.stat().st_size / (1024 * 1024)  # MB
            logger.info(f"✅ Backup PostgreSQL completato: {backup_file.name} ({file_size:.1f} MB)")
            
            return backup_file
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Errore backup PostgreSQL: {e}")
            logger.error(f"Stderr: {e.stderr}")
            raise RuntimeError(f"Backup PostgreSQL fallito: {e}")
        except FileNotFoundError:
            logger.error("❌ pg_dump non trovato. Verifica che PostgreSQL sia installato e nel PATH")
            raise RuntimeError("pg_dump non disponibile")
    
    def backup_mongodb(self):
        """Crea backup di MongoDB"""
        logger.info("🍃 Creando backup MongoDB...")
        
        backup_dir = self.backup_dir / f"mongodb_backup_{self.timestamp}"
        backup_dir.mkdir(exist_ok=True)
        
        # Comando mongodump
        cmd = [
            'mongodump',
            f'--host={self.mongo_host}:{self.mongo_port}',
            f'--db={self.mongo_database}',
            f'--out={backup_dir}'
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            # Verifica che il backup sia stato creato
            if backup_dir.exists() and any(backup_dir.iterdir()):
                logger.info(f"✅ Backup MongoDB completato: {backup_dir.name}")
                return backup_dir
            else:
                raise RuntimeError("Directory backup MongoDB vuota")
                
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Errore backup MongoDB: {e}")
            logger.error(f"Stderr: {e.stderr}")
            raise RuntimeError(f"Backup MongoDB fallito: {e}")
        except FileNotFoundError:
            logger.error("❌ mongodump non trovato. Verifica che MongoDB sia installato e nel PATH")
            raise RuntimeError("mongodump non disponibile")
    
    def create_restore_instructions(self):
        """Crea file con istruzioni per il restore"""
        instructions_file = self.backup_dir / f"RESTORE_INSTRUCTIONS_{self.timestamp}.md"
        
        instructions = f"""# Istruzioni per il Restore del Database

## Backup creato il: {datetime.now().strftime('%d/%m/%Y alle %H:%M:%S')}

### Prerequisiti
- PostgreSQL installato e configurato
- MongoDB installato e configurato
- Variabili d'ambiente configurate nel file `.env`

### Restore PostgreSQL

1. **Crea il database se non esiste:**
   ```sql
   CREATE DATABASE {self.pg_database};
   ```

2. **Ripristina il backup:**
   ```bash
   psql -h {self.pg_host} -p {self.pg_port} -U {self.pg_user} -d {self.pg_database} -f postgresql_backup_{self.timestamp}.sql
   ```

### Restore MongoDB

1. **Ripristina le collezioni:**
   ```bash
   mongorestore --host {self.mongo_host}:{self.mongo_port} --db {self.mongo_database} mongodb_backup_{self.timestamp}/{self.mongo_database}/
   ```

### Verifica

Dopo il restore, puoi verificare che tutto funzioni correttamente avviando i server:

1. **Spring Boot Server** (porta 8080)
2. **Express Server** (porta 3000)
3. **Main Server** (porta 5000)

### Note

- Il backup include tutti i dati puliti e processati
- Gli indici sono già creati e ottimizzati
- Non è necessario eseguire lo script di setup completo
"""
        
        with open(instructions_file, 'w', encoding='utf-8') as f:
            f.write(instructions)
        
        logger.info(f"📝 Istruzioni di restore create: {instructions_file.name}")
        return instructions_file
    
    def create_backup(self):
        """Crea backup completo di entrambi i database"""
        logger.info("💾" + "="*50)
        logger.info("💾 Creazione Backup Database")
        logger.info("💾" + "="*50)
        
        try:
            # Backup PostgreSQL
            pg_backup = self.backup_postgresql()
            
            # Backup MongoDB
            mongo_backup = self.backup_mongodb()
            
            # Istruzioni di restore
            instructions = self.create_restore_instructions()
            
            logger.info("\n🎉 Backup completato con successo!")
            logger.info(f"📁 Directory backup: {self.backup_dir}")
            logger.info(f"📄 Istruzioni: {instructions.name}")
            
            return {
                'postgresql': pg_backup,
                'mongodb': mongo_backup,
                'instructions': instructions
            }
            
        except Exception as e:
            logger.error(f"❌ Errore durante il backup: {e}")
            raise

def main():
    """Script principale"""
    try:
        backup_manager = DatabaseBackup()
        backup_manager.create_backup()
    except Exception as e:
        logger.error(f"❌ Backup fallito: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
