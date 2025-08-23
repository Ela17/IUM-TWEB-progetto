package com.tweb.springboot_server.dto.response.metadata;

import org.springframework.data.domain.Page;

/**
 * DTO che incapsula i metadati di paginazione per le risposte API.
 * Fornisce informazioni sullo stato corrente della paginazione, come il numero di pagina,
 * il numero di elementi per pagina, il totale dei risultati e il numero totale di pagine.
 */
public class PaginationMetadataDto {
    private int currentPage;
    private int perPage;
    private long totalResults;
    private int totalPages;

    /**
     * Indica se esiste una pagina successiva. {@code true} se c'è una pagina successiva,
     * {@code false} altrimenti.
     */
    private boolean hasNext;

    public PaginationMetadataDto(Page<?> page) {
        this.currentPage = page.getNumber() + 1;    // Conversione da 0-based a 1-based
        this.perPage = page.getSize();
        this.totalResults = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.hasNext = page.hasNext();
    }

    public PaginationMetadataDto() {
    }

    /**
     * Restituisce il numero della pagina corrente (basato su 1).
     * @return Il numero della pagina corrente.
     */
    public int getCurrentPage() { return currentPage; }

    /**
     * Imposta il numero della pagina corrente.
     * @param currentPage Il numero della pagina corrente da impostare.
     */
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    /**
     * Restituisce il numero di elementi visualizzati per pagina.
     * @return Il numero di elementi per pagina.
     */
    public int getPerPage() { return perPage; }

    /**
     * Imposta il numero di elementi visualizzati per pagina.
     * @param perPage Il numero di elementi per pagina da impostare.
     */
    public void setPerPage(int perPage) { this.perPage = perPage; }

    /**
     * Restituisce il numero totale di risultati disponibili.
     * @return Il numero totale di risultati.
     */
    public long getTotalResults() { return totalResults; }

    /**
     * Imposta il numero totale di risultati disponibili.
     * @param totalResults Il numero totale di risultati da impostare.
     */
    public void setTotalResults(long totalResults) { this.totalResults = totalResults; }

    /**
     * Restituisce il numero totale di pagine disponibili.
     * @return Il numero totale di pagine.
     */
    public int getTotalPages() { return totalPages; }

    /**
     * Imposta il numero totale di pagine disponibili.
     * @param totalPages Il numero totale di pagine da impostare.
     */
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    /**
     * Indica se esiste una pagina successiva.
     * @return {@code true} se c'è una pagina successiva, {@code false} altrimenti.
     */
    public boolean isHasNext() { return hasNext; }

    /**
     * Imposta se esiste una pagina successiva.
     * @param hasNext {@code true} se c'è una pagina successiva, {@code false} altrimenti.
     */
    public void setHasNext(boolean hasNext) { this.hasNext = hasNext; }
}
