package com.tweb.springboot_server.model;

import jakarta.persistence.*;

/**
 * Rappresenta un'assegnazione o una nomination al premio Oscar nel sistema.
 * Questa entità è mappata alla tabella "oscars" nel database.
 * Un Oscar è definito dall'anno del film, l'anno della cerimonia, il numero della cerimonia,
 * la categoria, il nome della persona/film nominata, il titolo del film e se ha vinto o meno,
 * con un riferimento al film correlato.
 *
 * @see Movie
 */
@Entity
@Table(name = "oscars")
public class Oscar {
    
    /**
     * Identificatore unico del record Oscar. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * L'anno in cui è stato rilasciato il film.
     */
    @Column(name = "year_film")
    private Integer yearFilm;

    /**
     * L'anno in cui si è tenuta la cerimonia di premiazione.
     */
    @Column(name = "year_ceremony")
    private Integer yearCeremony;

    /**
     * Il numero della cerimonia degli Oscar (es. 93 per la 93ª edizione).
     */
    @Column(name = "ceremony")
    private Integer ceremony;

    /**
     * La categoria del premio (es. "BEST PICTURE", "ACTOR IN A LEADING ROLE").
     */
    @Column(name = "category")
    private String category;

    /**
     * Il nome della persona o del film nominato/vincitore in questa categoria.
     */
    @Column(name = "name")
    private String name;

    /**
     * Il titolo del film associato a questa nomination/vittoria.
     */
    @Column(name = "film")
    private String film;

    /**
     * Indica se la nomination ha vinto il premio (true) o meno (false).
     */
    @Column(name = "winner")
    private Boolean winner;

    /**
     * L'ID del film a cui l'Oscar è associato. Questa colonna è la chiave esterna.
     */
    @Column(name = "id_movie")
    private Long idMovie;

    /**
     * L'entità {@link Movie} a cui questo Oscar è associato.
     * Questa è una relazione Many-to-One.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movie", insertable = false, updatable = false)
    private Movie movie;

    /**
     * Costruttore di default (richiesto da JPA).
     */
    public Oscar() {}

    /**
     * Restituisce l'identificatore unico del record Oscar.
     * @return L'ID del record Oscar.
     */
    public Long getId() { return id; }

    /**
     * Imposta l'identificatore unico del record Oscar.
     * @param id L'ID da impostare.
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Restituisce l'anno in cui è stato rilasciato il film.
     * @return L'anno del film.
     */
    public Integer getYearFilm() { return yearFilm; }

    /**
     * Imposta l'anno in cui è stato rilasciato il film.
     * @param yearFilm L'anno del film da impostare.
     */
    public void setYearFilm(Integer yearFilm) { this.yearFilm = yearFilm; }

    /**
     * Restituisce l'anno in cui si è tenuta la cerimonia di premiazione.
     * @return L'anno della cerimonia.
     */
    public Integer getYearCeremony() { return yearCeremony; }

    /**
     * Imposta l'anno in cui si è tenuta la cerimonia di premiazione.
     * @param yearCeremony L'anno della cerimonia da impostare.
     */
    public void setYearCeremony(Integer yearCeremony) { this.yearCeremony = yearCeremony; }

    /**
     * Restituisce il numero della cerimonia degli Oscar.
     * @return Il numero della cerimonia.
     */
    public Integer getCeremony() { return ceremony; }

    /**
     * Imposta il numero della cerimonia degli Oscar.
     * @param ceremony Il numero della cerimonia da impostare.
     */
    public void setCeremony(Integer ceremony) { this.ceremony = ceremony; }

    /**
     * Restituisce la categoria del premio.
     * @return La categoria.
     */
    public String getCategory() { return category; }

    /**
     * Imposta la categoria del premio.
     * @param category La categoria da impostare.
     */
    public void setCategory(String category) { this.category = category; }

    /**
     * Restituisce il nome della persona o del film nominato/vincitore.
     * @return Il nome.
     */
    public String getName() { return name; }

    /**
     * Imposta il nome della persona o del film nominato/vincitore.
     * @param name Il nome da impostare.
     */
    public void setName(String name) { this.name = name; }

    /**
     * Restituisce il titolo del film associato a questa nomination/vittoria.
     * @return Il titolo del film.
     */
    public String getFilm() { return film; }

    /**
     * Imposta il titolo del film associato a questa nomination/vittoria.
     * @param film Il titolo del film da impostare.
     */
    public void setFilm(String film) { this.film = film; }

    /**
     * Restituisce lo stato di vincita della nomination.
     * @return {@code true} se ha vinto, {@code false} altrimenti.
     */
    public Boolean getWinner() { return winner; }

    /**
     * Imposta lo stato di vincita della nomination.
     * @param winner {@code true} se ha vinto, {@code false} altrimenti.
     */
    public void setWinner(Boolean winner) { this.winner = winner; }

    /**
     * Restituisce l'entità {@link Movie} associata a questo Oscar.
     * @return L'oggetto {@link Movie}.
     */
    public Movie getMovie() { return movie; }

    /**
     * Imposta l'entità {@link Movie} associata a questo Oscar.
     * @param movie L'oggetto {@link Movie} da associare.
     */
    public void setMovie(Movie movie) { this.movie = movie; }
}