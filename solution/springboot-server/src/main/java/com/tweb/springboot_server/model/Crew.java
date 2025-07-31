package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un membro della troupe associato a un film nel sistema.
 * Questa entità è mappata alla tabella "crews" nel database.
 * Un membro della troupe è definito dal suo nome e dal ruolo ricoperto nel film,
 * con un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "crews")
public class Crew {
    
    /**
     * Identificatore unico del membro della troupe. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    /**
     * L'ID del film a cui il membro della troupe è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Integer idMovie;
    
    /**
     * Il ruolo del membro della troupe.
     */
    @Column(name = "role")
    private String role;
    
    /**
     * Il nome del membro della troupe.
     */
    @Column(name = "name")
    private String name;
    
    /**
     * L'entità {@link Movie} a cui questo membro della troupe è associato.
     * Questa è una relazione Many-to-One.
     */ 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;
    
    /**
     * Costruttore di default (richiesto da JPA)
     */
    public Crew() {}
    
    /**
     * Restituisce l'identificatore unico del membro della troupe.
     * @return L'ID del membro della troupe.
     */
    public Integer getId() { return id; }

    /**
     * Imposta l'identificatore unico del membro della troupe.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) { this.id = id; }
    
    /**
     * Restituisce il ruolo del membro della troupe.
     * @return Il ruolo del membro della troupe.
     */
    public String getRole() { return role; }
    
    /**
     * Imposta il ruolo del membro della troupe.
     * @param role Il ruolo da impostare.
     */ 
    public void setRole(String role) { this.role = role; }
    
    /**
     * Restituisce il nome del membro della troupe.
     * @return Il nome del membro della troupe.
     */
    public String getName() { return name; }
    
    /**
     * Imposta il nome del membro della troupe.
     * @param name Il nome da impostare.
     */
    public void setName(String name) { this.name = name; }
    
    /**
     * Restituisce l'entità {@link Movie} associata a questo membro della troupe.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }
    
    /**
     * Imposta l'entità {@link Movie} associata a questo membro della troupe.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}
