"""
Setup e popolamento MongoDB
"""
import os
import pandas as pd
from pymongo import MongoClient
import logging
from tqdm import tqdm

logger = logging.getLogger(__name__)

class MongoDBSetup:
    """Setup MongoDB"""
    
    def __init__(self):
        self.host = os.getenv('MONGO_HOST')
        self.port = int(os.getenv('MONGO_PORT'))
        self.database = os.getenv('MONGO_DB')

        if not all([self.host, self.database]):
            logger.error("❌ Configurazioni MongoDB incomplete")
            raise ValueError("Configurazioni MongoDB mancanti")
        
        self.client = None
        self.db = None
        self.batch_size = int(os.getenv('MONGO_BATCH_SIZE', '1000'))
    
    def connect(self):
        """Connessione a MongoDB"""
        logger.info(f"🍃 Connettendo a MongoDB: {self.host}:{self.port}")

        try:
            self.client = MongoClient(
                host=self.host, 
                port=self.port, 
                serverSelectionTimeoutMS=5000
            )
            self.db = self.client[self.database]
            
            try:
                # Test connessione con ping
                self.client.admin.command('ping')
                server_info = self.client.server_info()
                logger.info(f"✅ MongoDB: v{server_info['version']}")
            except Exception as ping_error:
                logger.error(f"❌ Errore ping MongoDB: {ping_error}")
                logger.warning("💡 Verifica che MongoDB sia avviato e accessibile.")
                raise ConnectionError("Database MongoDB")
            
            # Accesso al database
            self.db = self.client[self.database]
            
            try:
                # Test permessi scrittura
                test_collection = self.db.test_permissions
                test_collection.insert_one({"test": "permissions"})
                test_collection.delete_one({"test": "permissions"})
                logger.info("✅ Permessi di scrittura verificati")
            except Exception as e:
                logger.error(f"❌ Errore permessi scrittura MongoDB: {e}")
                logger.warning("💡 Verifica i permessi del database")
                raise PermissionError(f"Permessi MongoDB insufficienti: {e}")
            
        except Exception as e:
            raise RuntimeError(f"Errore MongoDB: {e}")
    
    def create_collections(self):
        """Crea collezioni"""
        logger.info("📦 Creando collezioni MongoDB...")

        try:
            # Drop database esistente
            self.client.drop_database(self.database)
            self.db = self.client[self.database]

            # Crea collezioni
            collections = ['reviews', 'oscar_awards', 'messages']
            for collection in collections:
                try:
                    self.db.create_collection(collection)
                    logger.info(f"✅ Collezione {collection} creata")
                except Exception as e:
                    logger.error(f"❌ Errore creazione collezione {collection}: {e}")
                    raise

        except Exception as e:
            logger.error(f"❌ Errore creazione collezioni: {e}")
            raise

    def insert_dataframe(self, df, collection_name):
        """Inserisce DataFrame in collezione"""
        if df.empty:
            logger.warning(f"⚠️ {collection_name}: DataFrame vuoto")
            return 0
        
        logger.info(f"📊 Inserendo {collection_name}: {len(df):,} documenti...")
        
        try:
            df = df.where(pd.notnull(df), None)
            documents = df.to_dict('records')
            
            collection = self.db[collection_name]
            total_inserted = 0
            
            # Inserimento a batch
            for i in tqdm(range(0, len(documents), self.batch_size), desc=f"Mongo {collection_name}"):
                batch = documents[i:i + self.batch_size]
                try:
                    collection.insert_many(batch, ordered=False)
                    total_inserted += len(batch)
                except Exception as e:
                    logger.error(f"❌ Errore inserimento batch {i // self.batch_size + 1} in {collection_name}: {e}")
                    raise RuntimeError(f"Errore inserimento batch in {collection_name}: {e}")
            
            logger.info(f"✅ {collection_name}: {total_inserted:,} inseriti")
            return total_inserted
        
        except Exception as e:
            raise
    
    def create_indexes(self):
        """Crea indici per ottimizzare le performance"""
        logger.info("📊 Creando indici MongoDB...")

        try:
            logger.info("📝 Indici per recensioni...")
            
            self.db.reviews.create_index("movie_title")
            self.db.reviews.create_index("critic_name")
            self.db.reviews.create_index("review_date")
            self.db.reviews.create_index("review_type")
            self.db.reviews.create_index("review_score")
            self.db.reviews.create_index("publisher_name")
            self.db.reviews.create_index([("movie_title", 1), ("review_date", -1)])
            
            logger.info("✅ Indici recensioni creati")

            logger.info("💬 Indici per messaggi chat...")
            
            # ID messaggio univoco
            self.db.messages.create_index("messageId", unique=True)
            self.db.messages.create_index("roomName")
            self.db.messages.create_index("timestamp")
            self.db.messages.create_index([("roomName", 1), ("timestamp", -1)])
            self.db.messages.create_index("userName")
            
            logger.info("✅ Indici messaggi creati")
            logger.info("🚀 Tutti gli indici MongoDB creati - performance ottimizzate!")
            
        except Exception as e:
            logger.warning(f"❌ Errore creazione indici MongoDB: {e}")
            raise RuntimeError(f"Errore creazione indici MongoDB: {e}")
    
    def cleanup(self):
        """Chiudi connessioni"""
        try:
            if self.client:
                self.client.close()
            logger.info("🔌 MongoDB disconnesso")
        except Exception as e:
            logger.warning(f"⚠️ Errore durante disconnessione: {e}")
            