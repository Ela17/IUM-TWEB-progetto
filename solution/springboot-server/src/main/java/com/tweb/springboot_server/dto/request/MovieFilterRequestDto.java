package com.tweb.springboot_server.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.lang.Nullable;
import com.tweb.springboot_server.util.MovieConstants;

/**
 * DTO per la richiesta di filtri di ricerca dei film.
 * Utilizzato per incapsulare i parametri di ricerca e paginazione che un utente
 * può specificare per filtrare un elenco di film.
 * Implementa validazioni robuste.
 */
public class MovieFilterRequestDto {

    /**
     * Titolo o parte del titolo del film da cercare.
     * La ricerca è case-insensitive e utilizza pattern matching.
     * Accetta valori {@code null}.
     */
    @Nullable
    private String title;

    /**
     * Rating minimo del film (0.0 - 10.0).
     * Se specificato, vengono restituiti solo i film con rating >= a questo valore.
     * Accetta valori {@code null}.
     */
    @Nullable
    @DecimalMin(value = "0.0", message = "Minimum rating must be at least 0.0")
    @DecimalMax(value = "10.0", message = "Minimum rating cannot exceed 10.0")
    private Double minRating;

    /**
     * Rating massimo del film (0.0 - 10.0).
     * Se specificato, vengono restituiti solo i film con rating <= a questo valore.
     * Accetta valori {@code null}.
     */
    @Nullable
    @DecimalMin(value = "0.0", message = "Maximum rating must be at least 0.0")
    @DecimalMax(value = "10.0", message = "Maximum rating cannot exceed 10.0")
    private Double maxRating;

    /**
     * Anno di inizio per il filtro temporale.
     * Se specificato, vengono restituiti solo i film prodotti dall'anno specificato in poi.
     * Accetta valori {@code null}.
     */
    @Nullable
    @Min(value = MovieConstants.MIN_YEAR, message = "Start year cannot be before " + MovieConstants.MIN_YEAR)
    @Max(value = MovieConstants.MAX_YEAR, message = "Start year cannot be after " + MovieConstants.MAX_YEAR)
    private Integer yearFrom;

    /**
     * Anno di fine per il filtro temporale.
     * Se specificato, vengono restituiti solo i film prodotti fino all'anno specificato.
     * Accetta valori {@code null}.
     */
    @Nullable
    @Min(value = MovieConstants.MIN_YEAR, message = "End year cannot be before " + MovieConstants.MIN_YEAR)
    @Max(value = MovieConstants.MAX_YEAR, message = "End year cannot be after " + MovieConstants.MAX_YEAR)
    private Integer yearTo;

    /**
     * Durata minima del film in minuti.
     * Se specificato, vengono restituiti solo i film con durata >= a questo valore.
     * Accetta valori {@code null}.
     */
    @Nullable
    @Min(value = 0, message = "Minimum duration cannot be negative")
    private Integer minDuration;

    /**
     * Durata massima del film in minuti.
     * Se specificato, vengono restituiti solo i film con durata <= a questo valore.
     * Accetta valori {@code null}.
     */
    @Nullable
    @Min(value = 0, message = "Maximum duration cannot be negative")
    private Integer maxDuration;

    /**
     * Campo per l'ordinamento dei risultati.
     * Valori consentiti: base, rating, date, name, duration, random.
     * Default: "base".
     * Accetta valori {@code null}.
     */
    @Nullable
    @Pattern(regexp = "base|rating|date|name|duration|random", 
             message = "Invalid 'sortBy' value. Allowed values: base, rating, date, name, duration, random")
    private String sortBy = MovieConstants.DEFAULT_SORT_BY;

    /**
     * Direzione dell'ordinamento.
     * Valori consentiti: asc (crescente), desc (decrescente).
     * Default: "desc".
     * Accetta valori {@code null}.
     */
    @Nullable
    @Pattern(regexp = "asc|desc", 
             message = "Invalid 'orderBy' value. Allowed values: asc, desc")
    private String orderBy = MovieConstants.DEFAULT_ORDER_BY;

    /**
     * Numero di pagina per la paginazione (inizia da 1).
     * Default: 1.
     */
    @Min(value = MovieConstants.DEFAULT_PAGE, message = "Page number must be at least 1")
    private int page = MovieConstants.DEFAULT_PAGE;

    /**
     * Numero di elementi per pagina.
     * Range consentito: 1-100.
     * Default: 10.
     */
    @Min(value = MovieConstants.MIN_PER_PAGE, message = "Items per page must be at least " + MovieConstants.MIN_PER_PAGE)
    @Max(value = MovieConstants.MAX_PER_PAGE, message = "Items per page cannot exceed " + MovieConstants.MAX_PER_PAGE)
    private int perPage = MovieConstants.DEFAULT_PER_PAGE;

    /**
     * Costruttore di default.
     */
    public MovieFilterRequestDto() {
    }

    /**
     * Restituisce il titolo del film per il filtro.
     * @return Il titolo del film.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Imposta il titolo del film per il filtro.
     * @param title Il titolo del film da impostare.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Restituisce il rating minimo per il filtro.
     * @return Il rating minimo.
     */
    public Double getMinRating() {
        return minRating;
    }

    /**
     * Imposta il rating minimo per il filtro.
     * @param minRating Il rating minimo da impostare.
     */
    public void setMinRating(Double minRating) {
        this.minRating = minRating;
    }

    /**
     * Restituisce il rating massimo per il filtro.
     * @return Il rating massimo.
     */
    public Double getMaxRating() {
        return maxRating;
    }

    /**
     * Imposta il rating massimo per il filtro.
     * @param maxRating Il rating massimo da impostare.
     */
    public void setMaxRating(Double maxRating) {
        this.maxRating = maxRating;
    }

    /**
     * Restituisce l'anno di inizio per il filtro di produzione.
     * @return L'anno di inizio.
     */
    public Integer getYearFrom() {
        return yearFrom;
    }

    /**
     * Imposta l'anno di inizio per il filtro di produzione.
     * @param yearFrom L'anno di inizio da impostare.
     */
    public void setYearFrom(Integer yearFrom) {
        this.yearFrom = yearFrom;
    }

    /**
     * Restituisce l'anno di fine per il filtro di produzione.
     * @return L'anno di fine.
     */
    public Integer getYearTo() {
        return yearTo;
    }

    /**
     * Imposta l'anno di fine per il filtro di produzione.
     * @param yearTo L'anno di fine da impostare.
     */
    public void setYearTo(Integer yearTo) {
        this.yearTo = yearTo;
    }

    /**
     * Restituisce la durata minima del film per il filtro.
     * @return La durata minima.
     */
    public Integer getMinDuration() {
        return minDuration;
    }

    /**
     * Imposta la durata minima del film per il filtro.
     * @param minDuration La durata minima da impostare.
     */
    public void setMinDuration(Integer minDuration) {
        this.minDuration = minDuration;
    }

    /**
     * Restituisce la durata massima del film per il filtro.
     * @return La durata massima.
     */
    public Integer getMaxDuration() {
        return maxDuration;
    }

    /**
     * Imposta la durata massima del film per il filtro.
     * @param maxDuration La durata massima da impostare.
     */
    public void setMaxDuration(Integer maxDuration) {
        this.maxDuration = maxDuration;
    }

    /**
     * Restituisce il criterio di ordinamento per i risultati.
     * @return Il criterio di ordinamento.
     */
    public String getSortBy() {
        return sortBy;
    }

    /**
     * Imposta il criterio di ordinamento per i risultati.
     * @param sortBy Il criterio di ordinamento da impostare.
     */
    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    /**
     * Restituisce l'ordine di ordinamento (ascendente/discendente).
     * @return L'ordine di ordinamento.
     */
    public String getOrderBy() {
        return orderBy;
    }

    /**
     * Imposta l'ordine di ordinamento.
     * @param orderBy L'ordine di ordinamento da impostare.
     */
    public void setOrderBy(String orderBy) {
        this.orderBy = orderBy;
    }

    /**
     * Restituisce il numero della pagina corrente.
     * @return Il numero della pagina.
     */
    public int getPage() {
        return page;
    }

    /**
     * Imposta il numero della pagina corrente.
     * @param page Il numero della pagina da impostare.
     */
    public void setPage(int page) {
        this.page = page;
    }

    /**
     * Restituisce il numero di elementi da visualizzare per pagina.
     * @return Il numero di elementi per pagina.
     */
    public int getPerPage() {
        return perPage;
    }

    /**
     * Imposta il numero di elementi da visualizzare per pagina.
     * @param perPage Il numero di elementi per pagina da impostare.
     */
    public void setPerPage(int perPage) {
        this.perPage = perPage;
    }

    /**
     * Metodo toString per debugging e logging.
     * @return Rappresentazione testuale dell'oggetto.
     */
    @Override
    public String toString() {
        return "MovieFilterRequestDto{" +
                "title='" + title + '\'' +
                ", minRating=" + minRating +
                ", maxRating=" + maxRating +
                ", yearFrom=" + yearFrom +
                ", yearTo=" + yearTo +
                ", minDuration=" + minDuration +
                ", maxDuration=" + maxDuration +
                ", sortBy='" + sortBy + '\'' +
                ", orderBy='" + orderBy + '\'' +
                ", page=" + page +
                ", perPage=" + perPage +
                '}';
    }
}
