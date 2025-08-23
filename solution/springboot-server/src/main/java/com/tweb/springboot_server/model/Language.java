package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta una lingua associata a un film (es. lingua originale, doppiaggio, sottotitoli) nel sistema.
 * Questa entità è mappata alla tabella "languages" nel database.
 * Una lingua è definita dal suo tipo e dal nome della lingua stessa, con un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "languages")
public class Language {
    
    /**
     * Identificatore unico della lingua. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    /**
     * L'ID del film a cui la lingua è associata. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Integer idMovie;
    
    /**
     * Il tipo di lingua (es. "Original", "Dubbed", "Subtitled").
     */
    @Column(name = "type")
    private String type;
    
    /**
     * Il nome della lingua (es. "Italiano", "Inglese", "Spagnolo").
     */
    @Column(name = "language")
    private String language;
    
    /**
     * L'entità {@link Movie} a cui questa lingua è associata.
     * Questa è una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;
    
    /**
     * Costruttore di default (richiesto da JPA).
     */
    public Language() {}
    
    /**
     * Restituisce l'identificatore unico della lingua.
     * @return L'ID della lingua.
     */
    public Integer getId() { return id; }
    
    /**
     * Imposta l'identificatore unico della lingua.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) { this.id = id; }

    /**
     * Restituisce il tipo di lingua.
     * @return Il tipo di lingua.
     */
    public String getType() { return type; }

    /**
     * Imposta il tipo di lingua.
     * @param type Il tipo di lingua da impostare.
     */
    public void setType(String type) { this.type = type; }

    /**
     * Restituisce il nome della lingua.
     * @return Il nome della lingua.
     */
    public String getLanguage() { return language; }

    /**
     * Imposta il nome della lingua.
     * @param language Il nome della lingua da impostare.
     */
    public void setLanguage(String language) { this.language = language; }

    /**
     * Restituisce l'entità {@link Movie} associata a questa lingua.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questa lingua.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}