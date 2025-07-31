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
public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {

    /**
     * Recupera i dettagli completi di un film tramite il suo ID, includendo tutte le relazioni
     * tramite LEFT JOIN FETCH per caricare i dati correlati.
     * Assicura che il film abbia un nome non nullo e non vuoto.
     *
     * @param id L'ID del film da cercare.
     * @return Un {@link Optional} contenente l'entità {@link Movie} con tutti i dettagli,
     * o un {@link Optional#empty()} se non trovato o se il nome è nullo/vuoto.
     */
    @Query("SELECT m FROM Movie m " +
           "LEFT JOIN FETCH m.genres g " +
           "LEFT JOIN FETCH m.posters p " +
           "LEFT JOIN FETCH m.countries c " +
           "LEFT JOIN FETCH m.languages l " +
           "LEFT JOIN FETCH m.studios s " +
           "LEFT JOIN FETCH m.themes t " +
           "LEFT JOIN FETCH m.actors a " +
           "LEFT JOIN FETCH m.crews cr " +
           "LEFT JOIN FETCH m.releases r " +
           "LEFT JOIN FETCH m.oscars o " +
           "WHERE m.id = :id AND m.name IS NOT NULL AND m.name != ''")
    Optional<Movie> findMovieDetailsById(@Param("id") Long id);

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
    Page<Movie> findById(Long id, Pageable pageable);
    
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
     * Cerca film applicando vari filtri come titolo, rating minimo/massimo, anno di produzione e durata.
     * I risultati includono un JOIN FETCH sui poster per un caricamento ottimizzato.
     * Il nome del film non deve essere nullo o vuoto.
     *
     * @param title La stringa da cercare nel titolo del film (può essere {@code null} per ignorare).
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
           "LEFT JOIN FETCH m.genres g " +
           "LEFT JOIN FETCH m.posters " +
           "WHERE m.name IS NOT NULL AND m.name != '' " +
           "AND (:title IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:minRating IS NULL OR m.rating >= :minRating) AND " +
           "(:maxRating IS NULL OR m.rating <= :maxRating) AND " +
           "(:yearFrom IS NULL OR m.date >= :yearFrom) AND " +
           "(:yearTo IS NULL OR m.date <= :yearTo) AND " +
           "(:minDuration IS NULL OR m.minute >= :minDuration) AND " +
           "(:maxDuration IS NULL OR m.minute <= :maxDuration)")
    Page<Movie> searchMoviesWithFilters(
        @Param("title") String title,
        @Param("minRating") Double minRating,
        @Param("maxRating") Double maxRating,
        @Param("yearFrom") Integer yearFrom,
        @Param("yearTo") Integer yearTo,
        @Param("minDuration") Integer minDuration,
        @Param("maxDuration") Integer maxDuration,
        Pageable pageable);

}

