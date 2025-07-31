package com.tweb.springboot_server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.tweb.springboot_server.dto.response.content.MovieDetailDto;
import com.tweb.springboot_server.dto.response.content.MovieSummaryDto;
import com.tweb.springboot_server.dto.response.content.OscarDetailDto;
import com.tweb.springboot_server.dto.response.content.ReleaseDetailDto;
import com.tweb.springboot_server.model.*;
import com.tweb.springboot_server.repository.MovieRepository;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servizio per la gestione delle operazioni relative ai film.
 * Fornisce metodi per recuperare dettagli specifici di film, gestire suggerimenti,
 * e ricercare film con filtri complessi, mappando le entità del database a DTO (Data Transfer Objects)
 * per le risposte API.
 */
@Service
public class MovieService {
    private static final Logger logger = LoggerFactory.getLogger(MovieService.class);
    
    /**
     * Repository per l'accesso ai dati dei film nel database.
     */
    @Autowired
    private MovieRepository movieRepository;

    /**
     * Formattatore per le date, utilizzato per convertire oggetti {@code LocalDate} in stringhe
     * nel formato "yyyy-MM-dd".
     */
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Recupera i dettagli completi di un film tramite il suo ID.
     * Utilizza {@link MovieRepository#findMovieDetailsById(Long)} per ottenere l'entità
     * {@link Movie} e poi la mappa a un {@link MovieDetailDto}.
     *
     * @param movieId L'ID del film da cercare.
     * @return Un {@link Optional} contenente {@link MovieDetailDto} se il film è trovato,
     * o un {@link Optional#empty()} se non esiste.
     * @throws RuntimeException Se si verifica un errore durante l'accesso al database o la mappatura.
     */
    public Optional<MovieDetailDto> getMovieDetails(Long movieId) {
        try {
            Optional<Movie> movieOptional = movieRepository.findMovieDetailsById(movieId);
            return movieOptional.map(this::mapToMovieDetailDto);
        } catch (Exception e) {
            logger.error("Error in getMovieDetails for ID {}: {}", movieId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Recupera una lista di suggerimenti di film basati su una stringa parziale del nome.
     * Limita il numero di risultati restituiti in base al parametro {@code limit}.
     *
     * @param query La stringa di ricerca parziale per il nome del film.
     * @param limit Il numero massimo di suggerimenti da restituire.
     * @return Una {@link List} di {@link MovieSummaryDto} che rappresentano i film suggeriti.
     * @throws RuntimeException Se si verifica un errore durante l'accesso al database o la mappatura.
     */
    public List<MovieSummaryDto> getSuggestions(String query, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            return movieRepository.findSuggestionsByName(query, pageable)
                    .stream()
                    .map(this::mapToMovieSummaryDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error in getSuggestions for query '{}': {}", query, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Ricerca film applicando vari filtri e criteri di paginazione/ordinamento.
     * Utilizza {@link MovieRepository#searchMoviesWithFilters(String, Double, Double, Integer, Integer, Integer, Integer, Pageable)}
     * per eseguire la query sul database.
     *
     * @param filters Una {@link Map} contenente i parametri di filtro come "title", "min_rating", "max_rating",
     * "year_from", "year_to", "min_duration", "max_duration", "sort_by" e "order_by".
     * @param page Il numero della pagina desiderata (1-based).
     * @param perPage Il numero di elementi per pagina.
     * @return Una {@link Page} di {@link MovieSummaryDto} che corrispondono ai criteri di ricerca e paginazione.
     * @throws RuntimeException Se si verifica un errore durante l'accesso al database o la mappatura.
     */
    public Page<MovieSummaryDto> searchMovies(Map<String, Object> filters, int page, int perPage) {
        try {
            // Nota: la validazione dei parametri viene fatta nel controller

            // Creazione Pageable con ordinamento
            Sort sort = createSortFromFilters(filters);
            Pageable pageable = PageRequest.of(page - 1, perPage, sort);

            String title = (String) filters.get("title");
            Double minRating = (Double) filters.get("min_rating");
            Double maxRating = (Double) filters.get("max_rating");
            Integer yearFrom = (Integer) filters.get("year_from");
            Integer yearTo = (Integer) filters.get("year_to");
            Integer minDuration = (Integer) filters.get("min_duration");
            Integer maxDuration = (Integer) filters.get("max_duration");
            
            // Esegue la query con filtri
            Page<Movie> moviePage = movieRepository.searchMoviesWithFilters(
                title, minRating, maxRating, yearFrom, yearTo,
                minDuration, maxDuration, pageable
            );

            return moviePage.map(this::mapToMovieSummaryDto);
        } catch (Exception e) {
            logger.error("Error in searchMovies: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Crea un oggetto {@link Sort} basato sui parametri di ordinamento nei filtri.
     * I parametri "sort_by" e "order_by" vengono utilizzati per definire la colonna e la direzione
     * dell'ordinamento.
     *
     * @param filters Una {@link Map} contenente i parametri "sort_by" (es. "rating", "date", "name", "duration")
     * e "order_by" (es. "asc", "desc").
     * @return Un oggetto {@link Sort} configurato. Il default è ordinare per data discendente, poi per rating discendente.
     */
    private Sort createSortFromFilters(Map<String, Object> filters) {
        String sortBy = (String) filters.getOrDefault("sort_by", "base");
        String orderBy = (String) filters.getOrDefault("order_by", "desc");

        Sort.Direction direction = "asc".equals(orderBy) ?
                                   Sort.Direction.ASC : Sort.Direction.DESC;

        switch (sortBy) {
            case "rating":
                return Sort.by(direction, "rating");
            case "date":
                return Sort.by(direction, "date");
            case "name":
                return Sort.by(direction, "name");
            case "duration":
                return Sort.by(direction, "minute"); // Mappa "duration" a "minute" nel modello Movie
            default:
                // Ordinamento di default per data (più recente) e poi rating (più alto)
                return Sort.by(Sort.Direction.DESC, "date").and(Sort.by(Sort.Direction.DESC, "rating"));
        }
    }

    /**
     * Mappa un'entità {@link Movie} a un {@link MovieDetailDto}.
     * Trasforma le relazioni in formati adatti per il DTO di dettaglio.
     *
     * @param movie L'entità {@link Movie} da mappare.
     * @return Un {@link MovieDetailDto} popolato con i dati del film.
     */
    private MovieDetailDto mapToMovieDetailDto(Movie movie) {
        MovieDetailDto dto = new MovieDetailDto();

        dto.setId(movie.getId());
        dto.setName(movie.getName());
        dto.setDate(movie.getDate()); // Anno
        dto.setTagline(movie.getTagline());
        dto.setDescription(movie.getDescription());
        dto.setMinute(movie.getMinute());
        dto.setRating(movie.getRating());

        // Poster URL (primo disponibile)
        if (movie.getPosters() != null && !movie.getPosters().isEmpty()) {
            dto.setPosterUrl(movie.getPosters().get(0).getLink());
        } else {
            dto.setPosterUrl(null); // O un URL di placeholder se preferito
        }

        // Relazioni semplici (liste di stringhe)
        dto.setGenres(movie.getGenres().stream().map(Genre::getGenre).collect(Collectors.toList()));
        dto.setStudios(movie.getStudios().stream().map(Studio::getStudio).collect(Collectors.toList()));
        dto.setThemes(movie.getThemes().stream().map(Theme::getTheme).collect(Collectors.toList()));
        dto.setCountries(movie.getCountries().stream().map(Country::getCountry).collect(Collectors.toList()));

        // Relazioni complesse (Map<String, List<String>>)

        // Attori (Map<String, List<String>>) raggruppati per ruolo
        Map<String, List<String>> actorsMap = movie.getActors().stream()
                .collect(Collectors.groupingBy(Actor::getRole,
                        Collectors.mapping(Actor::getName, Collectors.toList())));
        dto.setActors(actorsMap);

        // Troupe (Map<String, List<String>>) raggruppata per ruolo
        Map<String, List<String>> crewsMap = movie.getCrews().stream()
                .collect(Collectors.groupingBy(Crew::getRole,
                        Collectors.mapping(Crew::getName, Collectors.toList())));
        dto.setCrews(crewsMap);

        // Lingue (Map<String, List<String>>) raggruppate per tipo
        Map<String, List<String>> languagesMap = movie.getLanguages().stream()
                .collect(Collectors.groupingBy(Language::getType,
                        Collectors.mapping(Language::getLanguage, Collectors.toList())));
        dto.setLanguages(languagesMap);

        // Release (Map<String, List<ReleaseDetailDto>>) raggruppate per paese
        Map<String, List<ReleaseDetailDto>> releasesMap = movie.getReleases().stream()
                .collect(Collectors.groupingBy(
                        Release::getCountry, // Raggruppa per paese
                        Collectors.mapping(
                                release -> new ReleaseDetailDto( // Conversione LocalDate -> String
                                        release.getDate() != null ? release.getDate().format(DATE_FORMATTER) : null,
                                        release.getRating(),
                                        release.getType()
                                ),
                                Collectors.toList()
                        )
                ));
        dto.setReleases(releasesMap);

        // Oscars (List<OscarDetailDto>)
        List<OscarDetailDto> oscarsList = movie.getOscars().stream()
                .map(oscar -> new OscarDetailDto(
                        oscar.getYearFilm(),
                        oscar.getCategory(),
                        oscar.getName(),
                        oscar.getFilm(),
                        oscar.getWinner()
                ))
                .collect(Collectors.toList());
        dto.setOscars(oscarsList);

        return dto;
    }

    /**
     * Mappa un'entità {@link Movie} a un {@link MovieSummaryDto}.
     * Estrae solo le informazioni essenziali per un riepilogo del film.
     *
     * @param movie L'entità {@link Movie} da mappare.
     * @return Un {@link MovieSummaryDto} popolato con i dati riassuntivi del film.
     */
    private MovieSummaryDto mapToMovieSummaryDto(Movie movie) {
        MovieSummaryDto dto = new MovieSummaryDto();

        dto.setId(movie.getId());
        dto.setName(movie.getName());
        dto.setDate(movie.getDate());
        dto.setRating(movie.getRating());

        // Poster URL (primo disponibile)
        if (movie.getPosters() != null && !movie.getPosters().isEmpty()) {
            dto.setPosterUrl(movie.getPosters().get(0).getLink());
        } else {
            dto.setPosterUrl(null); // O un URL di placeholder
        }

        return dto;
    }
}
