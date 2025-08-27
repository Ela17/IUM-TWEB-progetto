package com.tweb.springboot_server.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tweb.springboot_server.model.Movie;

import java.util.List;
import java.util.Optional;

/**
 * Repository per l'entità {@link Movie}.
 * Estende {@link JpaRepository} per fornire operazioni CRUD di base e di paginazione,
 * ed estende {@link JpaSpecificationExecutor} per supportare query dinamiche basate su specifiche JPA.
 * Importante: Spring Data JPA genera automaticamente un'implementazione a runtime.
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer>, JpaSpecificationExecutor<Movie> {

    /**
     * Recupera i dettagli di un film tramite il suo ID.
     * Carica tutte le relazioni necessarie per evitare problemi di lazy loading.
     * 
     * @param id L'ID del film da cercare.
     * @return Un {@link Optional} contenente l'entità {@link Movie} con tutti i dettagli,
     * o un {@link Optional#empty()} se non trovato o se il nome è nullo/vuoto.
     */
    @Query("SELECT m FROM Movie m WHERE m.id = :id AND m.name IS NOT NULL AND m.name != ''")
    Optional<Movie> findMovieDetailsById(@Param("id") Integer id);
    
    /**
     * Recupera i dettagli di un film tramite il suo ID con query nativa per debug.
     * 
     * @param id L'ID del film da cercare.
     * @return Un {@link Optional} contenente l'entità {@link Movie} con tutti i dettagli.
     */
    @Query(value = "SELECT * FROM movies WHERE id = :id AND name IS NOT NULL AND name != ''", nativeQuery = true)
    Optional<Movie> findMovieDetailsByIdNative(@Param("id") Integer id);

    /**
     * Trova una lista di film il cui nome contiene la stringa specificata, ignorando maiuscole/minuscole.
     *
     * @param name La stringa da cercare nel nome del film.
     * @return Una lista di {@link Movie} che corrispondono al criterio.
     */
    List<Movie> findByNameContainingIgnoreCase(String name);
    
    /**
     * Trova una lista di film il cui nome contiene la stringa specificata (ignorando maiuscole/minuscole)
     * e la cui data di produzione rientra in un intervallo specificato.
     *
     * @param name La stringa da cercare nel nome del film.
     * @param dateStart L'anno di inizio dell'intervallo (incluso).
     * @param dateEnd L'anno di fine dell'intervallo (incluso).
     * @return Una lista di {@link Movie} che soddisfano i criteri.
     */
    List<Movie> findByNameContainingIgnoreCaseAndDateBetween(String name, Integer dateStart, Integer dateEnd);
    
    /**
     * Trova una pagina di film per un dato ID, con supporto alla paginazione.
     * Si noti che questo metodo potrebbe non essere ideale in contesti di ID singolo.
     *
     * @param id L'ID del film.
     * @param pageable Le informazioni di paginazione.
     * @return Una {@link Page} di {@link Movie} che corrispondono all'ID.
     */
    Page<Movie> findById(Integer id, Pageable pageable);
    
    /**
     * Trova una pagina di film il cui nome contiene la stringa specificata, ignorando maiuscole/minuscole.
     * Supporta la paginazione.
     *
     * @param name La stringa da cercare nel nome del film.
     * @param pageable Le informazioni di paginazione.
     * @return Una {@link Page} di {@link Movie} che corrispondono al criterio.
     */
    Page<Movie> findByNameContainingIgnoreCase(String name, Pageable pageable);

    /**
     * Trova una pagina di suggerimenti di film basati su una parte del loro nome.
     * I risultati includono un JOIN FETCH sui poster per un caricamento ottimizzato.
     * Vengono restituiti solo film con nome non nullo e non vuoto.
     * Supporta la paginazione.
     *
     * @param name La stringa parziale del nome da cercare per i suggerimenti.
     * @param pageable Le informazioni di paginazione.
     * @return Una {@link Page} di {@link Movie} che corrispondono ai suggerimenti.
     */
    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.posters p WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')) AND m.name IS NOT NULL AND m.name != ''")
    Page<Movie> findSuggestionsByName(@Param("name") String name, Pageable pageable);
    
    /**
     * Cerca film applicando vari filtri come titolo, genere, rating minimo/massimo, anno di produzione e durata.
     * Il nome del film non deve essere nullo o vuoto.
     *
     * @param title La stringa da cercare nel titolo del film (può essere {@code null} per ignorare).
     * @param titlePattern Il pattern per la ricerca nel titolo.
     * @param genre Il genere del film da filtrare (può essere {@code null} per ignorare).
     * @param minRating Il rating minimo del film (può essere {@code null} per ignorare).
     * @param maxRating Il rating massimo del film (può essere {@code null} per ignorare).
     * @param yearFrom L'anno di inizio dell'intervallo di produzione (può essere {@code null} per ignorare).
     * @param yearTo L'anno di fine dell'intervallo di produzione (può essere {@code null} per ignorare).
     * @param minDuration La durata minima del film in minuti (può essere {@code null} per ignorare).
     * @param maxDuration La durata massima del film in minuti (può essere {@code null} per ignorare).
     * @param pageable Le informazioni di paginazione.
     * @return Una {@link Page} di {@link Movie} che soddisfano tutti i criteri di filtro.
     */
    @Query("SELECT DISTINCT m FROM Movie m " +
           "LEFT JOIN m.genres g " +
           "LEFT JOIN m.oscars o " +
           "WHERE m.name IS NOT NULL AND m.name != '' " +
           "AND (:title IS NULL OR LOWER(m.name) LIKE LOWER(:titlePattern)) AND " +
           "(:genre IS NULL OR g.genre = :genre) AND " +
           "(:minRating IS NULL OR (m.rating IS NOT NULL AND m.rating >= :minRating)) AND " +
           "(:maxRating IS NULL OR (m.rating IS NOT NULL AND m.rating <= :maxRating)) AND " +
           "(:yearFrom IS NULL OR m.date >= :yearFrom) AND " +
           "(:yearTo IS NULL OR m.date <= :yearTo) AND " +
           "(:minDuration IS NULL OR m.minute >= :minDuration) AND " +
           "(:maxDuration IS NULL OR m.minute <= :maxDuration) AND " +
           "(:oscarWinner IS NULL OR (o.winner = TRUE))")
    Page<Movie> searchMoviesWithFilters(
        @Param("title") String title,
        @Param("titlePattern") String titlePattern,
        @Param("genre") String genre,
        @Param("minRating") Double minRating,
        @Param("maxRating") Double maxRating,
        @Param("yearFrom") Integer yearFrom,
        @Param("yearTo") Integer yearTo,
        @Param("minDuration") Integer minDuration,
        @Param("maxDuration") Integer maxDuration,
        @Param("oscarWinner") Boolean oscarWinner,
        Pageable pageable);

    /**
    * Carica i poster per una lista di film specificata.
    */
    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.posters WHERE m.id IN :movieIds")
    List<Movie> findMoviesWithPosters(@Param("movieIds") List<Integer> movieIds);

    /**
    * Carica i generi per una lista di film specificata.
    */
    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres WHERE m.id IN :movieIds")
    List<Movie> findMoviesWithGenres(@Param("movieIds") List<Integer> movieIds);

    // Conteggio totale film con nome valido
    @Query("SELECT COUNT(m) FROM Movie m WHERE m.name IS NOT NULL AND m.name <> ''")
    long countAllValidMovies();

}

