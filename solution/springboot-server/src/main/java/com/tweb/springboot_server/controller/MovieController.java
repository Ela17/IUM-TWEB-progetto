package com.tweb.springboot_server.controller;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tweb.springboot_server.dto.request.MovieFilterRequestDto;
import com.tweb.springboot_server.dto.response.ApiResponse;
import com.tweb.springboot_server.dto.response.PagedApiResponse;
import com.tweb.springboot_server.dto.response.content.MovieDetailDto;
import com.tweb.springboot_server.dto.response.content.MovieSummaryDto;
import com.tweb.springboot_server.dto.response.content.SuggestionsResponse;
import com.tweb.springboot_server.dto.response.metadata.PaginationMetadataDto;
import com.tweb.springboot_server.service.MovieService;
import com.tweb.springboot_server.util.MovieConstants;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.tweb.springboot_server.model.Movie;
import com.tweb.springboot_server.repository.MovieRepository;
import com.tweb.springboot_server.repository.OscarRepository;

/**
 * Controller RESTful per la gestione delle operazioni relative ai film.
 * Fornisce endpoint API per:
 * - recuperare dettagli specifici di film,
 * - ottenere suggerimenti,
 * - cercare film con filtri avanzati e paginazione.
 * Le risposte sono incapsulate in oggetti {@link ApiResponse} o {@link PagedApiResponse}
 * per garantire un formato coerente.
 */
@RestController
@RequestMapping("/api/movies")
public class MovieController {
    private static final Logger logger = LoggerFactory.getLogger(MovieController.class);

    private static final int SUGGESTION_LIMIT = MovieConstants.DEFAULT_SUGGESTION_LIMIT;

    @Autowired
    private MovieService movieService;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private OscarRepository oscarRepository;

    /**
     * Endpoint API per recuperare i dettagli completi di un film tramite il suo ID.
     *
     * @param movieId L'ID del film da cercare. Deve essere un numero positivo.
     * @return Una {@link ResponseEntity} contenente un {@link ApiResponse} con {@link MovieDetailDto}
     * in caso di successo (status 200 OK), o un messaggio di errore.
     * 
     * @apiNote GET /api/movies/{movieId}
     */
    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<MovieDetailDto>> getMovieDetails(
            @PathVariable 
            @Min(value = MovieConstants.MIN_MOVIE_ID, message = "Movie ID must be positive") 
            Integer movieId) {
        try {
            Optional<MovieDetailDto> movieDetail = movieService.getMovieDetails(movieId);

            if (movieDetail.isPresent()) {
                logger.debug("Movie found for ID: {}", movieId);
                return ResponseEntity.ok(new ApiResponse<>(true, movieDetail.get(), null));
            } else {
                logger.warn("Movie found for ID: {}", movieId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, null, "Movie ID " + movieId + " not found"));
            }

        } catch (Exception e) {
            logger.error("❌ Error in getMovieDetails for ID {}: {}", movieId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Server Internal Error"));
        }
    }

    /**
     * Endpoint di test per verificare il mapping JPA dei campi base.
     *
     * @param movieId L'ID del film da testare.
     * @return Una {@link ResponseEntity} con i campi base del film per debug.
     * 
     * @apiNote GET /api/movies/{movieId}/test
     */
    @GetMapping("/{movieId}/test")
    public ResponseEntity<Map<String, Object>> testMovieMapping(
            @PathVariable 
            @Min(value = MovieConstants.MIN_MOVIE_ID, message = "Movie ID must be positive") 
            Integer movieId) {
        try {
            Optional<Movie> movieOptional = movieRepository.findMovieDetailsByIdNative(movieId);
            
            Map<String, Object> result = new HashMap<>();
            
            if (movieOptional.isPresent()) {
                Movie movie = movieOptional.get();
                result.put("success", true);
                result.put("id", movie.getId());
                result.put("name", movie.getName());
                result.put("date", movie.getDate());
                result.put("rating", movie.getRating());
                result.put("minute", movie.getMinute());
                result.put("tagline", movie.getTagline());
                result.put("description", movie.getDescription());
                
                logger.debug("Test mapping for movie ID {}: date={}, rating={}", 
                           movieId, movie.getDate(), movie.getRating());
            } else {
                result.put("success", false);
                result.put("message", "Movie not found");
            }
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            logger.error("❌ Error in testMovieMapping for ID {}: {}", movieId, e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Server Internal Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Endpoint API per ottenere suggerimenti di film basati su una query di ricerca parziale.
     * I suggerimenti sono limitati a un numero predefinito ({@code SUGGESTION_LIMIT}).
     *
     * @param query La stringa di ricerca parziale per il nome del film.
     * @return Una {@link ResponseEntity} contenente un {@link SuggestionsResponse} con una lista
     * di {@link SuggestionsResponse.MovieSuggestion} (status 200 OK), o una lista vuota
     * e status 500 Internal Server Error in caso di errore.
     * 
     * @apiNote GET /api/movies/suggestions?q={query}
     */
    @GetMapping("/suggestions")
    public ResponseEntity<SuggestionsResponse> getMovieSuggestions(
            @RequestParam(value = "q") 
            @jakarta.validation.constraints.NotBlank(message = "Query parameter 'q' cannot be empty") 
            String query) {

        try {
            List<MovieSummaryDto> suggestions = movieService.getSuggestions(query, SUGGESTION_LIMIT);

            List<SuggestionsResponse.MovieSuggestion> mappedSuggestions = suggestions.stream()
                    .map(s -> new SuggestionsResponse.MovieSuggestion(s.getId(), s.getName(), s.getPosterUrl()))
                    .collect(Collectors.toList());
                    
            logger.debug("Returning {} suggestions for query: '{}'", mappedSuggestions.size(), query);
            return ResponseEntity.ok(new SuggestionsResponse(mappedSuggestions));
            
        } catch (Exception e) {
            logger.error("❌ Error in getSuggestions for query '{}': {}", query, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new SuggestionsResponse(List.of()));
        }
    }

    /**
     * Endpoint API per la ricerca avanzata di film con supporto per filtri, paginazione e ordinamento.
     * I parametri di filtro sono passati tramite un {@link MovieFilterRequestDto} e validati.
     *
     * @param filterDto Un DTO {@link MovieFilterRequestDto} contenente i parametri di filtro,
     * paginazione e ordinamento. Annotato con {@link Valid} per la validazione automatica.
     * @return Una {@link ResponseEntity} contenente un {@link PagedApiResponse} con una lista
     * di {@link MovieSummaryDto} e metadati di paginazione (status 200 OK),
     * o un messaggio di errore.
     * 
     * @apiNote GET /api/movies/search?title={title}&minRating={rating}&page={page}&perPage={perPage}...
     */
    @GetMapping("/search")
    public ResponseEntity<PagedApiResponse<List<MovieSummaryDto>>> searchMovies(
            @Valid @ModelAttribute MovieFilterRequestDto filterDto) {
        
        try {
            // Validazione range rating
            if (filterDto.getMinRating() != null && filterDto.getMaxRating() != null) {
                if (filterDto.getMinRating() > filterDto.getMaxRating()) {
                    logger.warn("Invalid rating range: min={}, max={}", filterDto.getMinRating(), filterDto.getMaxRating());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new PagedApiResponse<>(false, null, 
                                "Invalid rating range: minimum rating (" + filterDto.getMinRating() + 
                                ") must be less than or equal to maximum rating (" + filterDto.getMaxRating() + ")", null));
                }
            }
            
            // Validazione range anni
            if (filterDto.getYearFrom() != null && filterDto.getYearTo() != null) {
                if (filterDto.getYearFrom() > filterDto.getYearTo()) {
                    logger.warn("Invalid year range: from={}, to={}", filterDto.getYearFrom(), filterDto.getYearTo());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new PagedApiResponse<>(false, null, 
                                "Invalid year range: start year (" + filterDto.getYearFrom() + 
                                ") must be less than or equal to end year (" + filterDto.getYearTo() + ")", null));
                }
            }
            
            // Validazione range durata
            if (filterDto.getMinDuration() != null && filterDto.getMaxDuration() != null) {
                if (filterDto.getMinDuration() > filterDto.getMaxDuration()) {
                    logger.warn("Invalid duration range: min={}, max={}", filterDto.getMinDuration(), filterDto.getMaxDuration());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new PagedApiResponse<>(false, null, 
                                "Invalid duration range: minimum duration (" + filterDto.getMinDuration() + 
                                ") must be less than or equal to maximum duration (" + filterDto.getMaxDuration() + ")", null));
                }
            }
            
            // Converte il DTO in Map per il Service
            Map<String, Object> filters = buildFiltersMap(filterDto);
            
            Page<MovieSummaryDto> moviePage = movieService.searchMovies(
                filters, filterDto.getPage(), filterDto.getPerPage()
            );

            // Crea metadata di paginazione
            PaginationMetadataDto pagination = new PaginationMetadataDto(
                moviePage
            );

            return ResponseEntity.ok(new PagedApiResponse<>(
                true, 
                moviePage.getContent(), 
                null, 
                pagination
            ));
            
        } catch (Exception e) {
            logger.error("❌ Error in searchMovies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PagedApiResponse<>(false, null, "Server Internal Error", null));
        }
    }

    /**
     * Endpoint API per statistiche globali: conteggi totali di movies e oscars.
     *
     * @return ApiResponse con { totalMovies, totalOscars }
     *
     * @apiNote GET /api/movies/stats/global
     */
    @GetMapping("/stats/global")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getGlobalStats() {
        try {
            long totalMovies = movieRepository.countAllValidMovies();
            long totalOscars = oscarRepository.countAllOscars();

            Map<String, Long> payload = new HashMap<>();
            payload.put("totalMovies", totalMovies);
            payload.put("totalOscars", totalOscars);

            return ResponseEntity.ok(new ApiResponse<>(true, payload, null));
        } catch (Exception e) {
            logger.error("❌ Error in getGlobalStats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, null, "Server Internal Error"));
        }
    }

    /**
     * Metodo helper: converte il DTO dei filtri in una Map per il Service.
     *
     * @param filterDto Il DTO contenente i filtri.
     * @return Map con i filtri pronti per il Service.
     */
    private Map<String, Object> buildFiltersMap(MovieFilterRequestDto filterDto) {
        Map<String, Object> filters = new HashMap<>();
        
        // Filtri di ricerca
        filters.put("title", filterDto.getTitle());
        filters.put("genre", filterDto.getGenre());
        filters.put("min_rating", filterDto.getMinRating());
        filters.put("max_rating", filterDto.getMaxRating());
        filters.put("year_from", filterDto.getYearFrom());
        filters.put("year_to", filterDto.getYearTo());
        filters.put("min_duration", filterDto.getMinDuration());
        filters.put("max_duration", filterDto.getMaxDuration());
        filters.put("oscar_winner", filterDto.getOscarWinner());
        
        // Parametri di ordinamento
        filters.put("sort_by", filterDto.getSortBy());
        filters.put("order_by", filterDto.getOrderBy());
        
        return filters;
    }

}
