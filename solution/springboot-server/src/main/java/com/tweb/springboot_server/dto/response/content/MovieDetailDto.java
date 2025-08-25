package com.tweb.springboot_server.dto.response.content;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * DTO che rappresenta i dettagli completi di un film.
 * Questo DTO aggrega le informazioni principali del film e le sue relazioni
 * con altre entità (generi, attori, paesi, ecc.) in un formato ottimizzato per le risposte API.
 */
public class MovieDetailDto {

    private Integer id;
    private String name;
    private Integer date;
    private String tagline;
    private String description;
    @JsonProperty("minute")
    private Double minute;
    
    @JsonProperty("rating")
    private Double rating;

    /**
     * L'URL del poster principale del film.
     * Mappato al campo JSON "poster_url".
     */
    @JsonProperty("poster_url")
    private String posterUrl;

    // Relazioni come liste di stringhe
    private List<String> genres;
    private List<String> studios;
    private List<String> themes;
    private List<String> countries;

    // Relazioni complesse come Map (ruolo/tipo -> lista nomi)
    private Map<String, List<String>> actors;
    private Map<String, List<String>> crews;
    private Map<String, List<String>> languages;

    // Relazioni complesse con DTO specifici annidati

    /**
     * Mappa che associa il nome di un paese (Key) a una lista di DTO di dettagli di release
     * per quel paese.
     * (Nota: la chiave della mappa rappresenta il paese, ma un film può avere più rilasci nello stesso paese,
     * quindi il valore è una lista di {@link ReleaseDetailDto}).
     */
    private Map<String, List<ReleaseDetailDto>> releases; // la Key rappresenta country
    
    /**
     * Una lista di DTO che rappresentano i dettagli dei premi Oscar (nomination e vittorie)
     * associati a questo film.
     * @see OscarDetailDto
     */
    private List<OscarDetailDto> oscars;

    // Constructors
    public MovieDetailDto() {
    }

    public MovieDetailDto(Integer id, String name, Integer date, String tagline, String description,
                          Double minute, Double rating, String posterUrl, List<String> genres,
                          List<String> studios, List<String> themes, List<String> countries,
                          Map<String, List<String>> actors, Map<String, List<String>> crews,
                          Map<String, List<String>> languages, Map<String, List<ReleaseDetailDto>> releases,
                          List<OscarDetailDto> oscars) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.tagline = tagline;
        this.description = description;
        this.minute = minute;
        this.rating = rating;
        this.posterUrl = posterUrl;
        this.genres = genres;
        this.studios = studios;
        this.themes = themes;
        this.countries = countries;
        this.actors = actors;
        this.crews = crews;
        this.languages = languages;
        this.releases = releases;
        this.oscars = oscars;
    }

    /**
     * Restituisce l'identificatore unico del film.
     * @return L'ID del film.
     */
    public Integer getId() {
        return id;
    }

    /**
     * Restituisce il titolo del film.
     * @return Il titolo del film.
     */
    public String getName() {
        return name;
    }

    /**
     * Restituisce l'anno di produzione del film.
     * @return L'anno di produzione.
     */
    public Integer getDate() {
        return date;
    }

    /**
     * Restituisce la tagline del film.
     * @return La tagline del film.
     */
    public String getTagline() {
        return tagline;
    }

    /**
     * Restituisce la descrizione o trama del film.
     * @return La descrizione del film.
     */
    public String getDescription() {
        return description;
    }

    /**
     * Restituisce la durata del film in minuti.
     * @return La durata del film.
     */
    public Double getMinute() {
        return minute;
    }

    /**
     * Restituisce il rating medio del film.
     * @return Il rating del film.
     */
    public Double getRating() {
        return rating;
    }

    /**
     * Restituisce l'URL del poster principale del film.
     * @return L'URL del poster.
     */
    public String getPosterUrl() {
        return posterUrl;
    }

    /**
     * Restituisce la lista dei generi del film.
     * @return Una lista di stringhe rappresentanti i generi.
     */
    public List<String> getGenres() {
        return genres;
    }

    /**
     * Restituisce la lista degli studi di produzione del film.
     * @return Una lista di stringhe rappresentanti gli studi.
     */
    public List<String> getStudios() {
        return studios;
    }

    /**
     * Restituisce la lista dei temi del film.
     * @return Una lista di stringhe rappresentanti i temi.
     */
    public List<String> getThemes() {
        return themes;
    }

    /**
     * Restituisce la lista dei paesi associati al film.
     * @return Una lista di stringhe rappresentanti i paesi.
     */
    public List<String> getCountries() {
        return countries;
    }

    /**
     * Restituisce la mappa degli attori del film, raggruppati per ruolo.
     * @return Una mappa dove la chiave è il ruolo e il valore è una lista di nomi di attori.
     */
    public Map<String, List<String>> getActors() {
        return actors;
    }

    /**
     * Restituisce la mappa dei membri della troupe del film, raggruppati per ruolo.
     * @return Una mappa dove la chiave è il ruolo e il valore è una lista di nomi di membri della troupe.
     */
    public Map<String, List<String>> getCrews() {
        return crews;
    }

    /**
     * Restituisce la mappa delle lingue del film, raggruppate per tipo.
     * @return Una mappa dove la chiave è il tipo di lingua e il valore è una lista di nomi di lingue.
     */
    public Map<String, List<String>> getLanguages() {
        return languages;
    }

    /**
     * Restituisce la mappa dei rilasci del film, raggruppati per paese.
     * @return Una mappa dove la chiave è il nome del paese e il valore è una lista di {@link ReleaseDetailDto}.
     */
    public Map<String, List<ReleaseDetailDto>> getReleases() {
        return releases;
    }

    /**
     * Restituisce la lista dei premi Oscar associati al film.
     * @return Una lista di {@link OscarDetailDto}.
     */
    public List<OscarDetailDto> getOscars() {
        return oscars;
    }

    /**
     * Imposta l'identificatore unico del film.
     * @param id L'ID da impostare.
     */
    public void setId(Integer id) {
        this.id = id;
    }

    /**
     * Imposta il titolo del film.
     * @param name Il titolo da impostare.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Imposta l'anno di produzione del film.
     * @param date L'anno da impostare.
     */
    public void setDate(Integer date) {
        this.date = date;
    }

    /**
     * Imposta la tagline del film.
     * @param tagline La tagline da impostare.
     */
    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    /**
     * Imposta la descrizione o trama del film.
     * @param description La descrizione da impostare.
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Imposta la durata del film in minuti.
     * @param minute La durata da impostare.
     */
    public void setMinute(Double minute) {
        this.minute = minute;
    }

    /**
     * Imposta il rating medio del film.
     * @param rating Il rating da impostare.
     */
    public void setRating(Double rating) {
        this.rating = rating;
    }

    /**
     * Imposta l'URL del poster principale del film.
     * @param posterUrl L'URL del poster da impostare.
     */
    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    /**
     * Imposta la lista dei generi del film.
     * @param genres La lista di generi da impostare.
     */
    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    /**
     * Imposta la lista degli studi di produzione del film.
     * @param studios La lista di studi da impostare.
     */
    public void setStudios(List<String> studios) {
        this.studios = studios;
    }

    /**
     * Imposta la lista dei temi del film.
     * @param themes La lista di temi da impostare.
     */
    public void setThemes(List<String> themes) {
        this.themes = themes;
    }

    /**
     * Imposta la lista dei paesi associati al film.
     * @param countries La lista di paesi da impostare.
     */
    public void setCountries(List<String> countries) {
        this.countries = countries;
    }

    /**
     * Imposta la mappa degli attori del film, raggruppati per ruolo.
     * @param actors La mappa di attori da impostare.
     */
    public void setActors(Map<String, List<String>> actors) {
        this.actors = actors;
    }

    /**
     * Imposta la mappa dei membri della troupe del film, raggruppati per ruolo.
     * @param crews La mappa di membri della troupe da impostare.
     */
    public void setCrews(Map<String, List<String>> crews) {
        this.crews = crews;
    }

    /**
     * Imposta la mappa delle lingue del film, raggruppate per tipo.
     * @param languages La mappa di lingue da impostare.
     */
    public void setLanguages(Map<String, List<String>> languages) {
        this.languages = languages;
    }

    /**
     * Imposta la mappa dei rilasci del film, raggruppati per paese.
     * @param releases La mappa di rilasci da impostare.
     */
    public void setReleases(Map<String, List<ReleaseDetailDto>> releases) {
        this.releases = releases;
    }

    /**
     * Imposta la lista dei premi Oscar associati al film.
     * @param oscars La lista di premi Oscar da impostare.
     */
    public void setOscars(List<OscarDetailDto> oscars) {
        this.oscars = oscars;
    }
}
