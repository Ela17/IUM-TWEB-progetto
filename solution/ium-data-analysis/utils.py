import numpy as np
import pandas as pd
import pycountry
import pycountry_convert as pc
import seaborn as sns

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

def get_pastel_palette_light(n=24):
    """Palette leggermente più pastello per sfondi chiari.

    Colori più desaturati e più chiari rispetto a `get_elegant_palette_light`,
    mantenendo però una buona leggibilità su bianco.
    """
    return sns.husl_palette(n_colors=n, s=0.55, l=0.65)


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

alias_to_iso3 = {
    "UK": "GBR",
    "USA": "USA",
    "South Korea": "KOR",
    "Hong Kong": "HKG",
    "Russian Federation": "RUS",
    "Czechia": "CZE",
    "Taiwan": "TWN",
    "United Arab Emirates": "ARE",
    # storici: meglio escluderli o mappare a stati attuali se ha senso
    "USSR": None,
    "Czechoslovakia": None,
    "nan": None,
}

def name_to_iso3(name: str):
    if not name or pd.isna(name):
        return None
    if name in alias_to_iso3:
        return alias_to_iso3[name]
    try:
        return pycountry.countries.lookup(name).alpha_3
    except:
        return None

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


def canonical_global_group(studio_name):
    """Mappa un'etichetta di studio al relativo gruppo globale canonico.

    La mappatura include grandi gruppi USA, Giappone, Europa e Asia.
    Restituisce np.nan se il nome non è riconosciuto.
    """
    groups_aliases = {
        # USA majors
        "Walt Disney Studios": [
            "Walt Disney Studios", "Walt Disney Pictures", "Walt Disney Studios Motion Pictures",
            "Buena Vista", "Buena Vista Pictures", "Touchstone Pictures", "Pixar",
            "Marvel Studios", "Lucasfilm", "20th Century Studios", "20th Century Fox",
            "Fox 2000 Pictures", "Fox Searchlight Pictures", "Searchlight Pictures"
        ],
        "Warner Bros. Pictures": [
            "Warner Bros. Pictures", "Warner Bros.", "Warner Bros", "New Line Cinema",
            "DC Films", "HBO Films", "HBO Max Films"
        ],
        "Universal Pictures": [
            "Universal Pictures", "Universal", "Focus Features", "Illumination",
            "Illumination Entertainment", "DreamWorks Animation"
        ],
        "Paramount Pictures": [
            "Paramount Pictures", "Paramount", "Paramount Vantage", "Paramount Animation",
            "Nickelodeon Movies", "DreamWorks Pictures", "Miramax"
        ],
        "Sony Pictures Entertainment": [
            "Sony Pictures Entertainment", "Sony Pictures Releasing", "Sony Pictures Classics",
            "Columbia Pictures", "TriStar Pictures", "Screen Gems"
        ],
        "Lionsgate": [
            "Lionsgate", "Lions Gate Films", "Summit Entertainment"
        ],

        # Japan
        "Toho": ["Toho", "Toho Co", "Toho Company", "Toho Pictures", "Toho-Towa"],
        "Toei": ["Toei", "Toei Company", "Toei Animation"],
        "Shochiku": ["Shochiku", "Shochiku Co", "Shochiku Company"],
        "Kadokawa": ["Kadokawa", "KADOKAWA", "Kadokawa Pictures", "Kadokawa Shoten"],
        "Nikkatsu": ["Nikkatsu", "Nikkatsu Corporation"],
        "Studio Ghibli": ["Studio Ghibli", "Ghibli"],

        # United Kingdom / Ireland
        "Working Title": ["Working Title", "Working Title Films"],
        "BBC Films": ["BBC Films"],
        "Film4": ["Film4", "Film4 Productions"],
        "Eon Productions": ["Eon Productions"],

        # France
        "Pathé": ["Pathé", "Pathé Films"],
        "Gaumont": ["Gaumont", "Gaumont Film Company"],
        "StudioCanal": ["StudioCanal", "Canal+", "CANAL+"],
        "EuropaCorp": ["EuropaCorp"],

        # Germany
        "Constantin Film": ["Constantin Film"],
        "UFA": ["UFA", "UFA Film"],

        # Italy
        "Rai Cinema": ["Rai Cinema", "01 Distribution"],
        "Medusa Film": ["Medusa Film"],

        # Spain
        "Telecinco Cinema": ["Telecinco Cinema"],
        "El Deseo": ["El Deseo"],
        "Filmax": ["Filmax"],

        # Nordics
        "SF Studios": ["SF Studios", "Svensk Filmindustri"],
        "Nordisk Film": ["Nordisk Film"],

        # China
        "China Film Group": ["China Film Group", "China Film Co.", "China Film Company"],
        "Huayi Brothers": ["Huayi Brothers"],
        "Bona Film Group": ["Bona Film Group"],
        "Enlight Media": ["Enlight Media"],
        "Wanda Pictures": ["Wanda Pictures", "Legendary Pictures"],

        # South Korea
        "CJ ENM": ["CJ ENM", "CJ Entertainment"],
        "Showbox": ["Showbox"],
        "Lotte Entertainment": ["Lotte Entertainment"],

        # Hong Kong
        "Golden Harvest": ["Golden Harvest"],
        "Shaw Brothers": ["Shaw Brothers"] ,

        # Canada / Australia
        "Entertainment One": ["Entertainment One", "eOne", "Alliance Films"],
        "Village Roadshow": ["Village Roadshow", "Village Roadshow Pictures"],
    }

    if studio_name is None:
        return np.nan

    for group_name, aliases in groups_aliases.items():
        if studio_name in aliases:
            return group_name
    return np.nan
