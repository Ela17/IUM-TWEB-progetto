import numpy as np
import pycountry_convert as pc

def categorize_movie(df):
    if df['minute'] < 40:
        return 'corto'
    elif df['minute'] >= 40 and df['minute'] < 60:
        return 'medio'
    #mettiamo una threshold di 4 ore per considerare un record un non-film
    elif df['minute'] >= 60 and df['minute'] < 4*60:
        return 'lungo'
    else:
        return 'altro'


def converter(value):
    # Mappatura delle lettere
    mappa_lettere = {
        'A': 10,
        'A-': 9,
        'B+': 8.5,
        'B': 8,
        'B-': 7.5,
        'C+': 7,
        'C': 6,
        'C-': 5.5,
        'D+': 5,
        'D': 4,
        'D-': 3.5,
        'F': 1
    }
    if type(value) == int or type(value) == float:
        if value > 10 or value < 0:
            return np.nan
        else:
            return value
    else:
        if '/' in value:
            num, denom = value.split('/')
            try:
                num = float(num)
                denom = float(denom)
                # check se il denominatore è pari a zero
                if denom == 0:
                    return np.nan
                else:
                    normalized_score = (num / denom) * 10
                    if normalized_score > 10:
                        return np.nan
                    else:
                        return round(normalized_score, 1)
            except ValueError:
                return np.nan

        # Se è una valutazione alfanumerica
        elif value in mappa_lettere:
            return mappa_lettere[value]

        else:
            return np.nan



def graphic_settings(plt):
  plt.rcParams.update({
      'figure.figsize': (6, 3),  # Dimensione predefinita delle figure
      'axes.facecolor': 'white',  # Sfondo degli assi
      'axes.edgecolor': 'black',  # Colore bordo degli assi
      'axes.grid': True,          # Attivazione griglia
      'grid.color': '#b0b0b0',    # Colore della griglia
      'grid.alpha': 0.5,
      'grid.linestyle': '--',     # Stile linee della griglia
      'grid.linewidth': 0.7,      # Spessore linee della griglia
      'axes.titlesize': 10,      # Dimensione del titolo
      'axes.titleweight': 'bold', # peso titolo
      'axes.labelsize': 8,       # Dimensione etichette assi
      'axes.labelweight':'bold',
      'legend.fontsize': 6,
      'legend.title_fontsize':8,
      # Dimensione font legenda
      'lines.linewidth': 2,       # Spessore delle linee
      'lines.markersize': 3,      # Dimensione dei marker
      'lines.markeredgewidth': 0.5,
      'lines.markeredgecolor':'black',
      'font.family': 'sans-serif',# Tipo di font
      'figure.dpi': 200,# Risoluzione figur

  })


countries = [
    'UK', 'USA', 'South Korea', 'Germany', 'Hong Kong', 'Canada',
    'Sweden', 'Ireland', 'Japan', 'China', 'France', 'Brazil', 'Italy',
    'Czechia', 'New Zealand', 'Australia', 'India', 'Spain', 'Austria',
    'Greece', 'Netherlands', 'Poland', 'Taiwan', 'Denmark', 'Norway',
    'Mexico', 'Switzerland', 'Turkey', 'Finland', 'USSR', 'Singapore',
    'Chile', 'Belgium', 'United Arab Emirates', 'Malta', 'Hungary',
    'South Africa', 'Bulgaria', 'Czechoslovakia', 'Argentina',
    'Iceland', 'Indonesia', 'Slovenia', 'Iran', 'Luxembourg',
    'Philippines', 'Russian Federation', 'nan', 'Malaysia', 'Portugal'
]

special_mapping = {'UK': 'EU',
    'USSR': 'AS',  
    'Czechoslovakia': 'EU',  
    'nan': np.nan,  
    'Yugoslavia': 'EU', 
    'State of Palestine': 'AS',
    'Netherlands Antilles': 'NA',
    'East Germany': 'EU',  
    'Kosovo': 'EU',
    'Democratic Republic of Congo': 'AF',
    'Serbia and Montenegro': 'EU',
    'Antarctica': 'AN',
    'Timor-Leste': 'AS',
    'US Virgin Islands': 'NA',
    'Vatican City': 'EU',
    'Western Sahara': 'AF',
    'French Southern Territories': 'AN',
    'Pitcairn': 'OC',
    'United States Minor Outlying Islands': 'OC'
}

def get_continent(country_name):
    # Se il paese è nella mappatura manuale, restituisci il continente
    if country_name in special_mapping:
        return special_mapping[country_name]
    try:
        # Recupera il codice ISO del paese
        country_alpha2 = pc.country_name_to_country_alpha2(country_name)
        # Usa pycountry_convert per ottenere il continente
        continent = pc.country_alpha2_to_continent_code(country_alpha2)
        return continent
    except:
        return np.nan


def is_major_studio(studio_name):
    major_studios = {
        "Walt Disney Studios": ["Walt Disney Pictures", "Pixar", "Marvel Studios", "Lucasfilm", "20th Century Studios", "Searchlight Pictures"],
        "Warner Bros. Pictures": ["Warner Bros. Pictures", "DC Films", "New Line Cinema", "HBO Films"],
        "Universal Pictures": ["Universal Pictures", "DreamWorks Animation", "Illumination Entertainment", "Focus Features"],
        "Paramount Pictures": ["Paramount Pictures", "Paramount Animation", "Nickelodeon Movies", "Miramax"],
        "Sony Pictures Entertainment": ["Columbia Pictures", "TriStar Pictures", "Sony Pictures Animation"]
    }
    
    # Creiamo un set per una ricerca più veloce
    all_major_studios = set()
    for major, substudios in major_studios.items():
        all_major_studios.add(major)
        all_major_studios.update(substudios)
    
    return studio_name in all_major_studios

