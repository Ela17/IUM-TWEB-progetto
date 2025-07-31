"""
Setup e popolamento PostgreSQL
"""

import os
import psycopg2
from psycopg2.extras import execute_batch, RealDictCursor
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class PostgreSQLSetup:
    """Setup PostgreSQL"""
    def __init__(self):
        # Leggi configurazioni da environment
        self.host = os.getenv('POSTGRES_HOST')
        self.port = os.getenv('POSTGRES_PORT') 
        self.database = os.getenv('POSTGRES_DB')
        self.user = os.getenv('POSTGRES_USER')
        self.password = os.getenv('POSTGRES_PASSWORD')
        
        if not all([self.host, self.port, self.database, self.user, self.password]):
            logger.error("❌ Configurazioni PostgreSQL incomplete")
            raise ValueError("Configurazioni PostgreSQL mancanti")
        
        self.conn = None
        self.cursor = None
        self.batch_size = int(os.getenv('POSTGRES_BATCH_SIZE', '1000'))

    def connect(self):
        """Connessione a PostgreSQL"""
        logger.info(f"🐘 Connettendo a PostgreSQL: {self.host}:{self.port}")
        
        try:
            self.conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                cursor_factory=RealDictCursor,
                connect_timeout=10
            )
            self.cursor = self.conn.cursor()

            # Test connessione
            self.cursor.execute("SELECT version();")
            version = self.cursor.fetchone()['version']
            logger.info(f"✅ PostgreSQL: {version.split(',')[0]}")

            # Test permessi scrittura
            
            self.cursor.execute("CREATE TEMP TABLE test_permissions (id INT);")
            self.cursor.execute("DROP TABLE test_permissions;")
            self.conn.commit()
            logger.info("✅ Permessi di scrittura verificati")
        
        except psycopg2.OperationalError as e:
            logger.error(f"❌ Errore di connessione PostgreSQL: {e}")
            logger.error("💡 Verifica che PostgreSQL sia avviato e accessibile.")
            raise ConnectionError(f"Impossibile connettersi a PostgreSQL: {e}")
        except psycopg2.InsufficientPrivilege as e:
            logger.error(f"❌ Permessi insufficienti PostgreSQL: {e}")
            logger.error("💡 L'utente deve avere permessi CREATE e INSERT")
            raise PermissionError(f"Permessi PostgreSQL insufficienti: {e}")
        except psycopg2.Error as e:
            logger.error(f"❌ Errore database PostgreSQL: {e}")
            raise RuntimeError(f"Errore database PostgreSQL: {e}")
        except Exception as e:
            logger.error(f"❌ Errore imprevisto PostgreSQL: {e}")
            raise RuntimeError(f"Errore imprevisto PostgreSQL: {e}")
        
    def create_schema(self):
        """Crea schema PostgreSQL"""
        logger.info("🏗️ Creando schema PostgreSQL...")
       
        schema_sql = """
        -- Drop e ricrea
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;

        -- Movies
        CREATE TABLE movies (
            id INTEGER PRIMARY KEY,
            name TEXT,
            date INTEGER,
            tagline TEXT,
            description TEXT,
            minute REAL,
            rating REAL
        );

        -- Tabelle correlate
        CREATE TABLE actors (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            name TEXT,
            role TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE countries (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            country TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE crews (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            role TEXT,
            name TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE genres (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            genre TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE languages (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            type TEXT,
            language TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE posters (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            link TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE releases ( 
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            country TEXT,
            date DATE,
            type TEXT,
            rating TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE studios (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            studio TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE themes (
            id SERIAL PRIMARY KEY,
            id_movie INTEGER,
            theme TEXT,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );

        CREATE TABLE oscars (
            id SERIAL PRIMARY KEY,
            year_film INTEGER,
            year_ceremony INTEGER,
            ceremony INTEGER,
            category TEXT,
            name TEXT,
            film TEXT,
            winner BOOL,
            id_movie INTEGER,
            FOREIGN KEY (id_movie) REFERENCES movies(id) ON DELETE CASCADE
        );
        """
                
        try:
            self.cursor.execute(schema_sql)
            self.conn.commit()
            logger.info("✅ Schema PostgreSQL creato")
        except psycopg2.Error as e:
            logger.error(f"❌ Errore creazione tabelle: {e}")
            self.conn.rollback()
            raise
       
    
    def insert_dataframe(self, df: pd.DataFrame, table_name: str, batch_size: int = 1000, if_exists: str = 'append'):
        """
        Inserisce un DataFrame in una tabella, con gestione dei tipi e dei valori nulli.

        :param df: DataFrame da inserire.
        :param table_name: Nome della tabella di destinazione.
        :param batch_size: Dimensione dei lotti per l'inserimento.
        :param if_exists: Comportamento se la tabella esiste già.
        """
        if df.empty:
            logger.warning(f"⚠️ {table_name}: DataFrame vuoto")
            return 0
        
        logger.info(f"📊 Inserendo {table_name}: {len(df):,} record...")
        
        try:
            # Preparazione query e dati
            columns = ', '.join(df.columns)
            placeholders = ', '.join(['%s'] * len(df.columns))
            query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
            
            # Conversione DataFrame in lista di tuple
            data = [tuple(row) for row in df.values]
            total_inserted = 0
            
            # Inserimento a batch
            for i in range(0, len(data), self.batch_size):
                batch = data[i:i + self.batch_size]
                execute_batch(self.cursor, query, batch)
                total_inserted += len(batch)

            self.conn.commit()
            
            if total_inserted == 0:
                logger.error(f"❌ {table_name}: Nessun record inserito")
                raise Exception(f"Inserimento fallito per {table_name}")

            logger.info(f"✅ {table_name}: {total_inserted:,} inseriti")
            return total_inserted
        
        except psycopg2.Error as e:
            logger.error(f"❌ Errore PostgreSQL in {table_name}: {e}")
            self.conn.rollback()
            raise RuntimeError(f"Inserimento fallito per {table_name}: {e}")
        except Exception as e:
            logger.error(f"❌ Errore inserimento {table_name}: {e}")
            self.conn.rollback()
            raise

    def create_indexes(self):
        """Crea indici per ottimizzare le query"""
        logger.info("📊 Creando indici PostgreSQL...")

        # INDICI PER QUERY FREQUENTI
        indexes = [
            # Movies - ricerche frequenti
            "CREATE INDEX IF NOT EXISTS idx_movies_id ON movies(id)",
            "CREATE INDEX IF NOT EXISTS idx_movies_name ON movies(name)",
            "CREATE INDEX IF NOT EXISTS idx_movies_date ON movies(date)", 
            "CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating)",
            "CREATE INDEX IF NOT EXISTS idx_posters_id_movie ON posters(id_movie)",

            # Actors - relazioni e ricerche
            "CREATE INDEX IF NOT EXISTS idx_actors_id_movie ON actors(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_actors_actor ON actors(name)",
            "CREATE INDEX IF NOT EXISTS idx_actors_actor_lower ON actors(LOWER(name))",
            
            # Countries - relazioni
            "CREATE INDEX IF NOT EXISTS idx_countries_id_movie ON countries(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_countries_country ON countries(country)",
            
            # Crews - ricerche registi/produttori
            "CREATE INDEX IF NOT EXISTS idx_crews_id_movie ON crews(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_crews_name ON crews(name)",
            "CREATE INDEX IF NOT EXISTS idx_crews_role ON crews(role)",
            "CREATE INDEX IF NOT EXISTS idx_crews_name_role ON crews(name, role)",
            
            # Releases - filtri geografici/temporali
            "CREATE INDEX IF NOT EXISTS idx_releases_id_movie ON releases(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_releases_country ON releases(country)",
            "CREATE INDEX IF NOT EXISTS idx_releases_date ON releases(date)",
            
            # Oscar - ricerche premi
            "CREATE INDEX IF NOT EXISTS idx_oscars_id_movie ON oscars(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_oscars_film ON oscars(film)",
            "CREATE INDEX IF NOT EXISTS idx_oscars_name ON oscars(name)",
            "CREATE INDEX IF NOT EXISTS idx_oscars_category ON oscars(category)",
            
            # Genres, Studios, Themes - filtri comuni
            "CREATE INDEX IF NOT EXISTS idx_genres_id_movie ON genres(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_genres_genre ON genres(genre)",
            "CREATE INDEX IF NOT EXISTS idx_studios_id_movie ON studios(id_movie)",
            "CREATE INDEX IF NOT EXISTS idx_themes_id_movie ON themes(id_movie)",
            
            #tringrammi per la ricerca suggestion 
            "CREATE EXTENSION IF NOT EXISTS pg_trgm",
            "CREATE INDEX idx_movies_name_trigram ON movies USING gin(name gin_trgm_ops)"
        ]

        for index_sql in indexes:
            try:
                self.cursor.execute(index_sql) 
            except psycopg2.Error as e:
                logger.warning(f"❌ Errore creazione indice: {e}")

        try:
            self.conn.commit()
            logger.info(f"🚀 Indici PostgreSQL creati.")
        except psycopg2.Error as e:
            logger.error(f"❌ Errore commit indici: {e}")
            raise

    def cleanup(self):
        """Chiudi connessioni"""
        try:
            if self.cursor:
                self.cursor.close()
            if self.conn:
                self.conn.close()
            logger.info("🔌 PostgreSQL disconnesso")
        except Exception as e:
            logger.warning(f"⚠️ Errore durante disconnessione: {e}")