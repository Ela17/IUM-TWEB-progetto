package com.tweb.springboot_server.model;

import jakarta.persistence.*;
import java.util.List;

/**
 * Rappresenta un film nel sistema, contenendo tutte le sue informazioni principali
 * e le relazioni con le entità correlate come generi, attori, paesi, troupe,
 * lingue, poster, date di rilascio, studi e temi, nonché i premi Oscar.
 * Questa entità è mappata alla tabella "movies" nel database.
 */
@Entity
@Table(name = "movies")
public class Movie {

    /**
     * Identificatore unico del film. È la chiave primaria auto-generata.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Il titolo del film.
     */
    @Column(name = "name")
    private String name;

    /**
     * L'anno di produzione del film.
     */
    @Column(name = "date")
    private Integer date;

    /**
     * La tagline (slogan) del film.
     */
    @Column(name = "tagline")
    private String tagline;

    /**
     * Una descrizione dettagliata o la trama del film.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * La durata del film in minuti.
     */
    @Column(name = "minute")
    private Integer minute;

    /**
     * La valutazione del film.
     */
    @Column(name = "rating")
    private Double rating;

    // Relationships

    /**
     * Una lista di {@link Genre} associati a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */ 
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Genre> genres;

    /**
     * Una lista di {@link Actor} che hanno recitato in questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Actor> actors;

    /**
     * Una lista di {@link Country} di produzione o associati a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Country> countries;

    /**
     * Una lista di membri della {@link Crew} (troupe) che hanno lavorato a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Crew> crews;

    /**
     * Una lista di {@link Language} associate a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Language> languages;

    /**
     * Una lista di {@link Poster} del film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Poster> posters;

    /**
     * Una lista di {@link Release} (date di rilascio) del film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Release> releases;

    /**
     * Una lista di {@link Studio} di produzione associati a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Studio> studios;

    /**
     * Una lista di {@link Theme} (temi) associati a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Theme> themes;

    /**
     * Una lista di {@link Oscar} (premi/nomination) associati a questo film.
     * È una relazione One-to-Many.
     * Le operazioni a cascata sono abilitate per tutti i tipi di operazioni.
     */
    @OneToMany(mappedBy = "movie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Oscar> oscars;

    /**
     * Costruttore di default. Richiesto da JPA.
     */
    public Movie() {}

    /**
     * Restituisce l'identificatore unico del film.
     * @return L'ID del film.
     */
    public Long getId() { return id; }

    /**
     * Imposta l'identificatore unico del film.
     * @param id L'ID da impostare.
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Restituisce il titolo del film.
     * @return Il titolo del film.
     */
    public String getName() { return name; }

    /**
     * Imposta il titolo del film.
     * @param name Il titolo del film da impostare.
     */
    public void setName(String name) { this.name = name; }

    /**
     * Restituisce l'anno di produzione del film.
     * @return L'anno di produzione.
     */
    public Integer getDate() { return date; }

    /**
     * Imposta l'anno di produzione del film.
     * @param date L'anno di produzione da impostare.
     */
    public void setDate(Integer date) { this.date = date; }

    /**
     * Restituisce la tagline del film.
     * @return La tagline del film.
     */
    public String getTagline() { return tagline; }

    /**
     * Imposta la tagline del film.
     * @param tagline La tagline da impostare.
     */
    public void setTagline(String tagline) { this.tagline = tagline; }

    /**
     * Restituisce la descrizione dettagliata del film.
     * @return La descrizione del film.
     */
    public String getDescription() { return description; }

    /**
     * Imposta la descrizione dettagliata del film.
     * @param description La descrizione da impostare.
     */
    public void setDescription(String description) { this.description = description; }

    /**
     * Restituisce la durata del film in minuti.
     * @return La durata del film.
     */
    public Integer getMinute() { return minute; }

    /**
     * Imposta la durata del film in minuti.
     * @param minute La durata da impostare.
     */
    public void setMinute(Integer minute) { this.minute = minute; }

    /**
     * Restituisce il rating medio del film.
     * @return Il rating del film.
     */
    public Double getRating() { return rating; }

    /**
     * Imposta il rating medio del film.
     * @param rating Il rating da impostare.
     */
    public void setRating(Double rating) { this.rating = rating; }

    /**
     * Restituisce la lista dei generi associati a questo film.
     * @return La lista di {@link Genre}.
     */
    public List<Genre> getGenres() { return genres; }

    /**
     * Imposta la lista dei generi associati a questo film.
     * @param genres La lista di {@link Genre} da impostare.
     */
    public void setGenres(List<Genre> genres) { this.genres = genres; }

    /**
     * Restituisce la lista degli attori associati a questo film.
     * @return La lista di {@link Actor}.
     */
    public List<Actor> getActors() { return actors; }

    /**
     * Imposta la lista degli attori associati a questo film.
     * @param actors La lista di {@link Actor} da impostare.
     */
    public void setActors(List<Actor> actors) { this.actors = actors; }

    /**
     * Restituisce la lista dei poster associati a questo film.
     * @return La lista di {@link Poster}.
     */
    public List<Poster> getPosters() { return posters; }

    /**
     * Imposta la lista dei poster associati a questo film.
     * @param posters La lista di {@link Poster} da impostare.
     */
    public void setPosters(List<Poster> posters) { this.posters = posters; }

    /**
     * Restituisce la lista dei temi associati a questo film.
     * @return La lista di {@link Theme}.
     */
    public List<Theme> getThemes() { return themes; }

    /**
     * Imposta la lista dei temi associati a questo film.
     * @param themes La lista di {@link Theme} da impostare.
     */
    public void setThemes(List<Theme> themes) { this.themes = themes; }

    /**
     * Restituisce la lista degli studi associati a questo film.
     * @return La lista di {@link Studio}.
     */
    public List<Studio> getStudios() { return studios; }

    /**
     * Imposta la lista degli studi associati a questo film.
     * @param studios La lista di {@link Studio} da impostare.
     */
    public void setStudios(List<Studio> studios) { this.studios = studios; }

    /**
     * Restituisce la lista dei paesi associati a questo film.
     * @return La lista di {@link Country}.
     */
    public List<Country> getCountries() { return countries; }

    /**
     * Imposta la lista dei paesi associati a questo film.
     * @param countries La lista di {@link Country} da impostare.
     */
    public void setCountries(List<Country> countries) { this.countries = countries; }

    /**
     * Restituisce la lista dei membri della troupe associati a questo film.
     * @return La lista di {@link Crew}.
     */
    public List<Crew> getCrews() { return crews; }

    /**
     * Imposta la lista dei membri della troupe associati a questo film.
     * @param crews La lista di {@link Crew} da impostare.
     */
    public void setCrews(List<Crew> crews) { this.crews = crews; }

    /**
     * Restituisce la lista delle lingue associate a questo film.
     * @return La lista di {@link Language}.
     */
    public List<Language> getLanguages() { return languages; }

    /**
     * Imposta la lista delle lingue associate a questo film.
     * @param languages La lista di {@link Language} da impostare.
     */
    public void setLanguages(List<Language> languages) { this.languages = languages; }

    /**
     * Restituisce la lista delle date di rilascio associate a questo film.
     * @return La lista di {@link Release}.
     */
    public List<Release> getReleases() { return releases; }

    /**
     * Imposta la lista delle date di rilascio associate a questo film.
     * @param releases La lista di {@link Release} da impostare.
     */
    public void setReleases(List<Release> releases) { this.releases = releases; }

    /**
     * Restituisce la lista dei premi Oscar associati a questo film.
     * @return La lista di {@link Oscar}.
     */
    public List<Oscar> getOscars() { return oscars; }

    /**
     * Imposta la lista dei premi Oscar associati a questo film.
     * @param oscars La lista di {@link Oscar} da impostare.
     */
    public void setOscars(List<Oscar> oscars) { this.oscars = oscars; }
}