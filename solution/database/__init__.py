"""
- Preprocessing e pulizia dati
- Setup PostgreSQL e MongoDB  
- Schema e configurazioni
"""

from .databases_setup import main
from .preprocessing.data_cleaning import clean_data
from .setupper.postgres_setup import PostgreSQLSetup
from .setupper.mongo_setup import MongoDBSetup

__all__ = [
    'main',
    'clean_data',
    'PostgreSQLSetup',
    'MongoDBSetup'
]