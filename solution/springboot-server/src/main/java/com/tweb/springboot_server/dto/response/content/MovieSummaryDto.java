package com.tweb.springboot_server.dto.response.content;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO che rappresenta un riepilogo conciso di un film.
 * È progettato per le liste in cui sono necessarie solo le informazioni
 * essenziali di un film, come l'ID, il titolo, l'anno, il rating e l'URL del poster.
 */
public class MovieSummaryDto {
    private Integer id;
    private String name;
    private Integer date;   // Anno di uscita del film
    private Double rating;

    /**
     * L'URL del poster principale del film.
     * Mappato al campo JSON "poster_url".
     */
    @JsonProperty("poster_url")
    private String posterUrl;

    public MovieSummaryDto() {
    }

    public MovieSummaryDto(Integer id, String name, Integer date, Double rating, String posterUrl) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.rating = rating;
        this.posterUrl = posterUrl;
    }

    /**
     * Restituisce l'identificatore unico del film.
     * @return L'ID del film.
     */
    public Integer getId() {
        return id;
    }

    /**
     * Restituisce il titolo del film.
     * @return Il titolo del film.
     */
    public String getName() {
        return name;
    }

    /**
     * Restituisce l'anno di uscita del film.
     * @return L'anno di uscita.
     */
    public Integer getDate() {
        return date;
    }

    /**
     * Restituisce il rating del film.
     * @return Il rating del film.
     */
    public Double getRating() {
        return rating;
    }

    /**
     * Restituisce l'URL del poster principale del film.
     * @return L'URL del poster.
     */
    public String getPosterUrl() {
        return posterUrl;
    }

    /**
     * Imposta l'identificatore unico del film.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Imposta il titolo del film.
     * @param name Il titolo da impostare.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Imposta l'anno di uscita del film.
     * @param date L'anno da impostare.
     */
    public void setDate(Integer date) {
        this.date = date;
    }

    /**
     * Imposta il rating del film.
     * @param rating Il rating da impostare.
     */
    public void setRating(Double rating) {
        this.rating = rating;
    }

    /**
     * Imposta l'URL del poster principale del film.
     * @param posterUrl L'URL del poster da impostare.
     */
    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }
}