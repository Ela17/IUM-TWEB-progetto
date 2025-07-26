"""
Preprocessing e pulizia dati
"""

from .data_cleaning import DataCleaner, clean_data
from .scripts.normalization import (
    normalizza_descrizione,
    normalizza_valutazioni, 
    normalizza_titolo
)

__all__ = [
    'DataCleaner',
    'clean_data',
    'normalizza_descrizione',
    'normalizza_valutazioni',
    'normalizza_titolo'
]