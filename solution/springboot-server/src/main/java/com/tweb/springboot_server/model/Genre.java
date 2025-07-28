package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un genere associato a un film nel sistema.
 * Questa entità è mappata alla tabella "genres" nel database.
 * Un genere è definito dal suo nome e da un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "genres")
public class Genre {
    
    /**
     * Identificatore unico del genere. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
   
    /**
     * L'ID del film a cui il genere è associato. Questa colonna è la chiave esterna.
     */ 
    @Column(name = "id_movie")
    private Long idMovie;
    
    /**
     * Il nome del genere (es. "Azione", "Commedia", "Drammatico").
     */
    @Column(name = "genre")
    private String genre;
    
    /**
     * L'entità {@link Movie} a cui questo genere è associato.
     * Questa è una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;
    
    /**
     * Costruttore di default. Richiesto da JPA.
     */
    public Genre() {}
    
    /**
     * Restituisce l'identificatore unico del genere.
     * @return L'ID del genere.
     */
    public Long getId() { return id; }

    /**
     * Imposta l'identificatore unico del genere.
     * @param id L'ID da impostare.
     */
    public void setId(Long id) { this.id = id; }
    
    /**
     * Restituisce il nome del genere.
     * @return Il nome del genere.
     */
    public String getGenre() { return genre; }
    
    /**
     * Imposta il nome del genere.
     * @param genre Il nome del genere da impostare.
     */
    public void setGenre(String genre) { this.genre = genre; }
    
    /**
     * Restituisce l'entità {@link Movie} associata a questo genere.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }
    
    /**
     * Imposta l'entità {@link Movie} associata a questo genere.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}