package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un paese di produzione associato a un film nel sistema.
 * Questa entità è mappata alla tabella "countries" nel database.
 * Un paese è definito dal suo nome e da un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "countries")
public class Country {
    
    /**
     * Identificatore unico del paese. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * L'ID del film a cui il paese è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Long idMovie;
    
    /**
     * Il nome del paese.
     */
    @Column(name = "country")
    private String country;
    
    /**
     * L'entità {@link Movie} a cui questo paese è associato.
     * È una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;
    
    /**
     * Costruttore di default (richiesto da JPA)
     */
    public Country() {}
    
    /**
     * Restituisce l'identificatore unico del paese.
     * @return L'ID del paese.
     */
    public Long getId() { return id; }

    /**
     * Imposta l'identificatore unico del paese.
     * @param id L'ID da impostare.
     */
    public void setId(Long id) { this.id = id; }
    
    /**
     * Restituisce il nome del paese.
     * @return Il nome del paese.
     */
    public String getCountry() { return country; }

    /**
     * Imposta il nome del paese.
     * @param country Il nome del paese da impostare.
     */
    public void setCountry(String country) { this.country = country; }
    
    /**
     * Restituisce l'entità {@link Movie} associata a questo paese.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo paese.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}