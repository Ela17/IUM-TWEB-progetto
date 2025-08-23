package com.tweb.springboot_server.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Rappresenta una data di rilascio di un film in un paese specifico nel sistema.
 * Questa entità è mappata alla tabella "releases" nel database.
 * Una data di rilascio è definita dal paese, dalla data, dal tipo di rilascio e dal rating associato,
 * con un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "releases")
public class Release {

    /**
     * Identificatore unico del rilascio. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * L'ID del film a cui il rilascio è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Integer idMovie;

    /**
     * Il paese di riferimento per questo rilascio.
     */
    @Column(name = "country")
    private String country;

    /**
     * La data di rilascio del film nel paese specificato.
     */
    @Column(name = "date")
    private LocalDate date;

    /**
     * Il tipo di rilascio (es. "Theater", "DVD").
     */
    @Column(name = "type")
    private String type;

    /**
     * Il rating del film in quel paese.
     */
    @Column(name = "rating")
    private String rating;

    /**
     * L'entità {@link Movie} a cui questo rilascio è associato.
     * È una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;

    /**
     * Costruttore di default. Richiesto da JPA.
     */
    public Release() {}

    /**
     * Restituisce l'identificatore unico del rilascio.
     * @return L'ID del rilascio.
     */
    public Integer getId() { return id; }

    /**
     * Imposta l'identificatore unico del rilascio.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) { this.id = id; }

    /**
     * Restituisce il paese di riferimento per questo rilascio.
     * @return Il paese.
     */
    public String getCountry() { return country; }

    /**
     * Imposta il paese di riferimento per questo rilascio.
     * @param country Il paese da impostare.
     */
    public void setCountry(String country) { this.country = country; }

    /**
     * Restituisce la data di rilascio del film.
     * @return La data.
     */
    public LocalDate getDate() { return date; }

    /**
     * Imposta la data di rilascio del film.
     * @param date La data da impostare.
     */
    public void setDate(LocalDate date) { this.date = date; }

    /**
     * Restituisce il tipo di rilascio.
     * @return Il tipo.
     */
    public String getType() { return type; }

    /**
     * Imposta il tipo di rilascio.
     * @param type Il tipo da impostare.
     */
    public void setType(String type) { this.type = type; }

    /**
     * Restituisce il rating del film in quel paese.
     * @return Il rating.
     */
    public String getRating() { return rating; }

    /**
     * Imposta il rating del film in quel paese.
     * @param rating Il rating da impostare.
     */
    public void setRating(String rating) { this.rating = rating; }

    /**
     * Restituisce l'entità {@link Movie} associata a questo rilascio.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo rilascio.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}