package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta uno studio di produzione associato a un film nel sistema.
 * Questa entità è mappata alla tabella "studios" nel database.
 * Uno studio è definito dal suo nome e da un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "studios")
public class Studio {

    /**
     * Identificatore unico dello studio. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * L'ID del film a cui lo studio è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Long idMovie;

    /**
     * Il nome dello studio di produzione.
     */
    @Column(name = "studio")
    private String studio;

    /**
     * L'entità {@link Movie} a cui questo studio è associato.
     * Questa è una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;

    /**
     * Costruttore di default (richiesto da JPA).
     */
    public Studio() {}

    /**
     * Restituisce l'identificatore unico dello studio.
     * @return L'ID dello studio.
     */
    public Long getId() { return id; }

    /**
     * Imposta l'identificatore unico dello studio.
     * @param id L'ID da impostare.
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Restituisce il nome dello studio di produzione.
     * @return Il nome dello studio.
     */
    public String getStudio() { return studio; }

    /**
     * Imposta il nome dello studio di produzione.
     * @param studio Il nome dello studio da impostare.
     */
    public void setStudio(String studio) { this.studio = studio; }

    /**
     * Restituisce l'entità {@link Movie} associata a questo studio.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo studio.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}