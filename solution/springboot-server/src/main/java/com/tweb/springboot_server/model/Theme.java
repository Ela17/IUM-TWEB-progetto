package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un tema associato a un film nel sistema.
 * Questa entità è mappata alla tabella "themes" nel database.
 * Un tema è definito dal suo nome e da un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "themes")
public class Theme {

    /**
     * Identificatore unico del tema. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /**
     * L'ID del film a cui il tema è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Integer idMovie;

    /**
     * Il nome del tema (es. "Amore", "Guerra", "Avventura").
     */
    @Column(name = "theme")
    private String theme;

    /**
     * L'entità {@link Movie} a cui questo tema è associato.
     * Questa è una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;

    /**
     * Costruttore di default. Richiesto da JPA.
     */
    public Theme() {}

    /**
     * Restituisce l'identificatore unico del tema.
     * @return L'ID del tema.
     */
    public Integer getId() { return id; }

    /**
     * Imposta l'identificatore unico del tema.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) { this.id = id; }

    /**
     * Restituisce il nome del tema.
     * @return Il nome del tema.
     */
    public String getTheme() { return theme; }

    /**
     * Imposta il nome del tema.
     * @param theme Il nome del tema da impostare.
     */
    public void setTheme(String theme) { this.theme = theme; }

    /**
     * Restituisce l'entità {@link Movie} associata a questo tema.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo tema.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}