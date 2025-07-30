package com.tweb.springboot_server.dto.response.content;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO che rappresenta i dettagli di un premio Oscar
 * associato a un film, inclusi l'anno del film, la categoria, il nome della persona
 * o del film nominato/vincitore, e l'indicazione se sia stato un vincitore.
 */
public class OscarDetailDto {
    /**
     * L'anno del film a cui si riferisce l'Oscar.
     * Mappato al campo JSON "year_film".
     */
    @JsonProperty("year_film")
    private Integer yearFilm;

    private String category;
    private String name; // Nome della persona nominata/vincitrice
    private String film; // Titolo del film (dal dataset Oscar)
    private Boolean winner;

    public OscarDetailDto() {
    }

    public OscarDetailDto(Integer yearFilm, String category, String name, String film, Boolean winner) {
        this.yearFilm = yearFilm;
        this.category = category;
        this.name = name;
        this.film = film;
        this.winner = winner;
    }

     /**
     * Restituisce l'anno del film a cui si riferisce l'Oscar.
     * @return L'anno del film.
     */
    public Integer getYearFilm() {
        return yearFilm;
    }

    /**
     * Imposta l'anno del film a cui si riferisce l'Oscar.
     * @param yearFilm L'anno del film da impostare.
     */
    public void setYearFilm(Integer yearFilm) {
        this.yearFilm = yearFilm;
    }

    /**
     * Restituisce la categoria del premio Oscar.
     * @return La categoria.
     */
    public String getCategory() {
        return category;
    }

    /**
     * Imposta la categoria del premio Oscar.
     * @param category La categoria da impostare.
     */
    public void setCategory(String category) {
        this.category = category;
    }

    /**
     * Restituisce il nome della persona o del film nominata/vincitrice.
     * @return Il nome.
     */
    public String getName() {
        return name;
    }

    /**
     * Imposta il nome della persona o del film nominata/vincitrice.
     * @param name Il nome da impostare.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Restituisce il titolo del film (dal dataset Oscar).
     * @return Il titolo del film.
     */
    public String getFilm() {
        return film;
    }

    /**
     * Imposta il titolo del film (dal dataset Oscar).
     * @param film Il titolo del film da impostare.
     */
    public void setFilm(String film) {
        this.film = film;
    }

    /**
     * Indica se la nomination ha portato a una vittoria.
     * @return {@code true} se vincitore, {@code false} altrimenti.
     */
    public Boolean getWinner() {
        return winner;
    }

    /**
     * Imposta se la nomination ha portato a una vittoria.
     * @param winner {@code true} se vincitore, {@code false} altrimenti.
     */
    public void setWinner(Boolean winner) {
        this.winner = winner;
    }

}
