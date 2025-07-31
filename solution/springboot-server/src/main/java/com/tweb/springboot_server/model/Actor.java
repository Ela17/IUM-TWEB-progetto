package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un attore associato a un film nel sistema.
 * Questa entità è mappata alla tabella "actors" nel database.
 * Un attore è definito dal suo nome, dal ruolo ricoperto nel film e da un riferimento al film.
 *
 * @see Movie
 */
@Entity
@Table(name = "actors")
public class Actor {
    
    /**
     * Identificatore unico dell'attore. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * L'ID del film a cui l'attore è associato (è la chiave esterna).
     */
    @Column(name = "id_movie")
    private Long idMovie;
    
    /**
     * Il nome dell'attore.
     */
    @Column(name = "actor")
    private String actor;
    
    /**
     * Il ruolo interpretato dall'attore nel film.
     */
    @Column(name = "role")
    private String role;
    
    /**
     * L'entità {@link Movie} a cui questo attore è associato.
     * È una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;
    
    /**
     * Costruttore di default (richiesto da JPA)
     */
    public Actor() {}
    
    /**
     * Restituisce l'identificatore unico dell'attore.
     * @return L'ID dell'attore.
     */
    public Long getId() { return id; }

    /**
     * Imposta l'identificatore unico dell'attore.
     * @param id L'ID da impostare.
     */
    public void setId(Long id) { this.id = id; }
    
    /**
     * Restituisce il nome dell'attore.
     * @return Il nome dell'attore.
     */
    public String getName() { return actor; }

    /**
     * Imposta il nome dell'attore.
     * @param actor Il nome dell'attore da impostare.
     */
    public void setName(String actor) { this.actor = actor; }
    
    /**
     * Restituisce il ruolo interpretato dall'attore.
     * @return Il ruolo dell'attore.
     */
    public String getRole() { return role; }

    /**
     * Imposta il ruolo interpretato dall'attore.
     * @param role Il ruolo da impostare.
     */
    public void setRole(String role) { this.role = role; }
    
    /**
     * Restituisce l'entità {@link Movie} associata a questo attore.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo attore.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}