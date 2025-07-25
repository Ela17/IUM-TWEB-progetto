"""
Data Cleaning Module
=====================================
Modulo di pulizia dati.
"""

import pandas as pd
from pathlib import Path
import logging
from .scripts.normalization import normalize_description, normalize_score, normalize_title

logger = logging.getLogger(__name__)

class DataCleaner:
    """Classe principale per pulizia dati"""
    
    def __init__(self, data_dir=None):
        if data_dir is None:
            self.data_path = Path(__file__).resolve().parent.parent.parent / 'data'
        else:
            self.data_path = Path(data_dir)
        
        if not self.data_path.exists():
            logger.error(f"❌ Directory dati non trovata: {self.data_path}")
            raise FileNotFoundError(f"Directory dati non trovata: {self.data_path}")
        
        if not self.data_path.is_dir():
            logger.error(f"❌ Percorso non è una directory: {self.data_path}")
            raise NotADirectoryError(f"Percorso non è una directory: {self.data_path}")
        
        self.data = {}

    def load_all_csv(self):
        """Carica tutti i CSV"""
        logger.info("📥 Caricando file CSV...")

        csv_files = list(self.data_path.glob('*.csv'))
        if not csv_files:
            logger.error(f"❌ Nessun file CSV trovato nella directory: {self.data_path}")
            raise FileNotFoundError(f"Nessun file CSV trovato nella directory: {self.data_path}. Impossibile procedere.")
        
        for file in csv_files:
            name = file.stem
            try:
                self.data[name] = pd.read_csv(file)
                logger.info(f"   ✅ {name}: {len(self.data[name]):,} record")
            except Exception as e:
                logger.error(f"   ❌ Errore {name}: {e}")
                raise RuntimeError(f"Errore durante il caricamento del file {file}: {e}")

    def clean_invalid_films(self):
        """Elimina film senza nome valido"""
        logger.info("🗑️  Eliminando record invalidi...")

        if 'the_oscar_awards' in self.data:
            self.data['the_oscar_awards'] = self.data['the_oscar_awards'].dropna(subset='film')
        
        if 'rotten_tomatoes_reviews' in self.data:
            self.data['rotten_tomatoes_reviews'] = self.data['rotten_tomatoes_reviews'].dropna(subset='movie_title')

    def normalize_data(self):
        """Normalizza le descrizioni, le recensioni e le date"""
        logger.info("🧹 Normalizzazione dati...")

        try:
            # Normalizzazione recensioni
            if 'rotten_tomatoes_reviews' in self.data:
                self.data['rotten_tomatoes_reviews'].review_score = self.data['rotten_tomatoes_reviews'].review_score.apply(normalize_score)

            # Normalizzazione film
            if 'movies' in self.data:
                # Descrizioni
                if 'description' in self.data['movies'].columns:
                    self.data['movies']['description'] = normalize_description(self.data['movies']['description'])
                
                # Date
                if 'date' in self.data['movies'].columns:
                    try:
                        self.data['movies'].date = self.data['movies'].date.astype('Int64')
                    except Exception as e:
                        logger.warning(f"⚠️ Errore conversione date: {e}")
                        RuntimeError(f"Errore durante la conversione delle date nel dataset 'movies': {e}")
                
        except Exception as e:
            logger.error(f"❌ Errore normalizzazione: {e}")
            raise

    def match_movie_ids(self):
        """Matching ID tra dataset"""
        if 'movies' not in self.data:
            logger.error("❌ Dataset 'movies' non disponibile. Impossibile procedere con il matching ID.")
            raise Exception("Dataset 'movies' non disponibile.")

        logger.info("🔗 Matching ID...")
        
        try:
            # Aggiunta colonna temporanea per matching
            self.data['movies']['name_clean'] = self.data['movies']['name'].apply(normalize_title)
            
            if 'rotten_tomatoes_reviews' in self.data:
                self.data['rotten_tomatoes_reviews']['movie_name_clean'] = self.data['rotten_tomatoes_reviews']['movie_title'].apply(lambda x: normalize_title(x, parentesi=True))

            if 'the_oscar_awards' in self.data:
                self.data['the_oscar_awards']['film_clean'] = self.data['the_oscar_awards']['film'].apply(lambda x: normalize_title(x, parentesi=True))

            # Merge dei dataset
            movies_unique = self.data['movies'].drop_duplicates(subset='name_clean')

            if 'rotten_tomatoes_reviews' in self.data:
                self.data['rotten_tomatoes_reviews'] = self.data['rotten_tomatoes_reviews'].merge(
                    movies_unique[['id', 'name_clean']], 
                    left_on='movie_name_clean', 
                    right_on='name_clean', 
                    how='left'
                ).drop(columns=['movie_name_clean','name_clean'])

                self.data['rotten_tomatoes_reviews'].id = self.data['rotten_tomatoes_reviews'].id.astype('Int64')

            if 'the_oscar_awards' in self.data:
                self.data['the_oscar_awards'] = self.data['the_oscar_awards'].merge(
                    movies_unique[['id', 'name_clean']], 
                    left_on='film_clean', 
                    right_on='name_clean', 
                    how='left'
                ).drop(columns=['film_clean','name_clean'])

                self.data['the_oscar_awards'].id = self.data['the_oscar_awards'].id.astype('Int64')

            # Pulizia colonna temporanea
            self.data['movies'] = self.data['movies'].drop(columns='name_clean')
        
        except Exception as e:
            logger.error(f"❌ Errore matching ID: {e}")
            raise

    def prepare_for_database(self):
        """Prepara dati per inserimento database"""
        logger.info("🔄 Preparando per database...")
        
        try:
            for name, df in self.data.items():
                # Rinomina 'id' in 'id_movie' per tabelle correlate
                if name != 'movies' and 'id' in df.columns:
                    self.data[name] = df.rename(columns={'id': 'id_movie'})

                # Converte tutti i tipi di NA (pd.NA, np.nan) in None, compatibile con i driver DB
                df_clean = self.data[name].replace({pd.NA: None})

                if df_clean.empty:
                    logger.warning(f"⚠️ {name} vuoto dopo preprocessing")
                    raise ValueError(f"Il dataset {name} è vuoto.")
                
                self.data[name] = df_clean
                logger.info(f"   ✅ {name}: null convertiti in None")
            
        except Exception as e:
            logger.error(f"❌ Errore peprocessing dei dati per l'inserimento nel database: {e}")
            raise

    def run_cleaning(self):
        """Esegue pulizia completa"""
        logger.info("🧹 Iniziando pulizia completa...")
        
        try:
            self.load_all_csv()
            self.clean_invalid_films()
            self.normalize_data()
            self.match_movie_ids()
            self.prepare_for_database()
            
            logger.info("✅ Pulizia completata!")
            return self.data
        
        except Exception as e:
            logger.error(f"❌ Errore durante pulizia dati: {e}")
            raise

def clean_data(data_dir=None):
    """Funzione helper per pulizia dati"""
    try:
        cleaner = DataCleaner(data_dir)
        return cleaner.run_cleaning()
    except Exception as e:
        logger.error(f"❌ Pulizia dati fallita: {e}")
        raise