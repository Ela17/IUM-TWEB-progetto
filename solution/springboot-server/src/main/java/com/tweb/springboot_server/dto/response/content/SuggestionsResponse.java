package com.tweb.springboot_server.dto.response.content;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO che incapsula una lista di suggerimenti di film.
 * Utilizzata nelle risposte API per fornire un elenco di film suggeriti all'utente.
 */
public class SuggestionsResponse {
    private List<MovieSuggestion> suggestions;

    public SuggestionsResponse() {
    }

    public SuggestionsResponse(List<MovieSuggestion> suggestions) {
        this.suggestions = suggestions;
    }

    /**
     * Classe interna statica che rappresenta un singolo suggerimento di film.
     * Contiene le informazioni essenziali per un suggerimento, come l'ID, il nome del film
     * e l'URL del poster.
     */
    public static class MovieSuggestion {
        private Integer id;
        private String name;
        
        @JsonProperty("poster_url")
        private String posterUrl;

        public MovieSuggestion() {
        }

        public MovieSuggestion(Integer id, String name, String posterUrl) {
            this.id = id;
            this.name = name;
            this.posterUrl = posterUrl;
        }

        /**
         * Restituisce l'identificatore unico del film suggerito.
         * @return L'ID del film.
         */
        public Integer getId() {
            return id;
        }

        /**
         * Imposta l'identificatore unico del film suggerito.
         * @param id L'ID da impostare.
         */
        public void setId(Integer id) {
            this.id = id;
        }

        /**
         * Restituisce il nome del film suggerito.
         * @return Il nome del film.
         */
        public String getName() {
            return name;
        }

        /**
         * Imposta il nome del film suggerito.
         * @param name Il nome da impostare.
         */
        public void setName(String name) {
            this.name = name;
        }

        /**
         * Restituisce l'URL del poster del film suggerito.
         * @return L'URL del poster.
         */
        public String getPosterUrl() {
            return posterUrl;
        }

        /**
         * Imposta l'URL del poster del film suggerito.
         * @param posterUrl L'URL del poster da impostare.
         */
        public void setPosterUrl(String posterUrl) {
            this.posterUrl = posterUrl;
        }
    }

    /**
     * Restituisce la lista dei suggerimenti di film.
     * @return La lista di {@link MovieSuggestion}.
     */
    public List<MovieSuggestion> getSuggestions() {
        return suggestions;
    }

    /**
     * Imposta la lista dei suggerimenti di film.
     * @param suggestions La lista di {@link MovieSuggestion} da impostare.
     */
    public void setSuggestions(List<MovieSuggestion> suggestions) {
        this.suggestions = suggestions;
    }
}
