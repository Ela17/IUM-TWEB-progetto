package com.tweb.springboot_server.util;

/**
 * Classe di utilità che contiene costanti globali relative alla gestione dei film.
 * Include parametri di default e limiti per la paginazione e i suggerimenti.
 * Questa classe è dichiarata come {@code final} e il suo costruttore è privato
 * per impedire l'istanziamento, poiché contiene solo costanti statiche.
 */
public final class MovieConstants {
    
    // Paginazione
    public static final int DEFAULT_SUGGESTION_LIMIT = 10;
    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_PER_PAGE = 10;
    public static final int MAX_PER_PAGE = 100;
    public static final int MIN_PER_PAGE = 1;
    
    // Validazione
    public static final long MIN_MOVIE_ID = 1L;
    public static final double MIN_RATING = 0.0;
    public static final double MAX_RATING = 10.0;
    public static final int MIN_YEAR = 1900;
    public static final int MAX_YEAR = 2030;
    
    // Ordinamento
    public static final String DEFAULT_SORT_BY = "date";
    public static final String DEFAULT_ORDER_BY = "desc";
    
    private MovieConstants() {
    }
}