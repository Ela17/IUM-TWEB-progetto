"""
Preprocessing e pulizia dati
"""

from .data_cleaning import DataCleaner, clean_data
from .scripts.normalization import (
    normalize_description,
    normalize_score, 
    normalize_title
)

__all__ = [
    'DataCleaner',
    'clean_data',
    'normalize_description',
    'normalize_score',
    'normalize_title'
]