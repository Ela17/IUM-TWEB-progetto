package com.tweb.springboot_server.dto.response;

import com.tweb.springboot_server.dto.response.metadata.PaginationMetadataDto;

/**
 * Classe che rappresenta una risposta paginata per le API.
 * Estende {@link ApiResponse} e include metadati di paginazione.
 *
 * @param <T> Il tipo di dati contenuti nella risposta.
 * @see ApiResponse
 * @see PaginationMetadataDto
 */
public class PagedApiResponse<T> extends ApiResponse<T> {
    private PaginationMetadataDto pagination;

    public PagedApiResponse() {
        super();
    }

    public PagedApiResponse(boolean success, T data, String error, PaginationMetadataDto pagination) {
        super(success, data, error);
        this.pagination = pagination;
    }

    /**
     * Restituisce i metadati di paginazione della risposta.
     * @return L'oggetto {@link PaginationMetadataDto} contenente le informazioni di paginazione.
     */
    public PaginationMetadataDto getPagination() {
        return pagination;
    }

    /**
     * Imposta i metadati di paginazione della risposta.
     * @param pagination L'oggetto {@link PaginationMetadataDto} da impostare.
     */
    public void setPagination(PaginationMetadataDto pagination) {
        this.pagination = pagination;
    }
}