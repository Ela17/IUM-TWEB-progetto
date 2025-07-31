package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un poster associato a un film nel sistema.
 * Questa entità è mappata alla tabella "posters" nel database.
 * Un poster è definito dal link all'immagine e da un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "posters")
public class Poster {

    /**
     * Identificatore unico del poster. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * L'ID del film a cui il poster è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Integer idMovie;

    /**
     * Il link (URL) all'immagine del poster.
     */
    @Column(name = "link")
    private String link;

    /**
     * L'entità {@link Movie} a cui questo poster è associato.
     * Questa è una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;

    /**
     * Costruttore di default. Richiesto da JPA.
     */
    public Poster() {}

    /**
     * Restituisce l'identificatore unico del poster.
     * @return L'ID del poster.
     */
    public Integer getId() { return id; }

    /**
     * Imposta l'identificatore unico del poster.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) { this.id = id; }

    /**
     * Restituisce il link (URL) del poster.
     * @return Il link del poster.
     */
    public String getLink() { return link; }

    /**
     * Imposta il link (URL) del poster.
     * @param link Il link da impostare.
     */
    public void setLink(String link) { this.link = link; }

    /**
     * Restituisce l'entità {@link Movie} associata a questo poster.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo poster.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}
