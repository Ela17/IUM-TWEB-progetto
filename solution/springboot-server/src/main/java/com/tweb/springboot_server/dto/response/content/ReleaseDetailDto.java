package com.tweb.springboot_server.dto.response.content;

/**
 * DTO che rappresenta i dettagli di un rilascio di un film
 * in un contesto specifico, come una data, un rating e un tipo di rilascio.
 * Viene utilizzato all'interno di un {@link MovieDetailDto}
 * per fornire informazioni granulari sulle releases del film.
 */
public class ReleaseDetailDto {
    private String date;    // Formato "YYYY-MM-DD"
    private String rating;
    private String type;

    public ReleaseDetailDto() {
    }

    public ReleaseDetailDto(String date, String rating, String type) {
        this.date = date;
        this.rating = rating;
        this.type = type;
    }

    /**
     * Restituisce la data del rilascio.
     * @return La data del rilascio in formato stringa.
     */
    public String getDate() {
        return date;
    }

    /**
     * Imposta la data del rilascio.
     * @param date La data del rilascio da impostare.
     */
    public void setDate(String date) {
        this.date = date;
    }

    /**
     * Restituisce il rating associato a questo rilascio.
     * @return Il rating.
     */
    public String getRating() {
        return rating;
    }

    /**
     * Imposta il rating associato a questo rilascio.
     * @param rating Il rating da impostare.
     */
    public void setRating(String rating) {
        this.rating = rating;
    }

    /**
     * Restituisce il tipo di rilascio.
     * @return Il tipo di rilascio.
     */
    public String getType() {
        return type;
    }

    /**
     * Imposta il tipo di rilascio.
     * @param type Il tipo di rilascio da impostare.
     */
    public void setType(String type) {
        this.type = type;
    }
}
