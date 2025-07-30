package com.tweb.springboot_server.dto.response;

/**
 * Classe generica per standardizzare le risposte API del server.
 * Incapsula lo stato di successo, i dati restituiti e eventuali messaggi di errore.
 * Progettata per fornire un formato di risposta consistente per tutte le chiamate API.
 *
 * @param <T> Il tipo di dato specifico che verrà incapsulato nella risposta.
 */
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String error;

    public ApiResponse(boolean success, T data, String error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    public ApiResponse() {
    }

    /**
     * Restituisce lo stato di successo della risposta API.
     * @return {@code true} se la richiesta è riuscita, {@code false} altrimenti.
     */
    public boolean isSuccess() { return success; }

    /**
     * Imposta lo stato di successo della risposta API.
     * @param success Lo stato di successo da impostare.
     */
    public void setSuccess(boolean success) { this.success = success; }

    /**
     * Restituisce i dati incapsulati nella risposta API.
     * @return I dati specifici del tipo {@code T}.
     */
    public T getData() { return data; }

    /**
     * Imposta i dati da incapsulare nella risposta API.
     * @param data I dati del tipo {@code T} da impostare.
     */
    public void setData(T data) { this.data = data; }

    /**
     * Restituisce il messaggio di errore della risposta API.
     * @return Il messaggio di errore, o {@code null} se non ci sono errori.
     */
    public String getError() { return error; }

    /**
     * Imposta il messaggio di errore della risposta API.
     * @param error Il messaggio di errore da impostare.
     */
    public void setError(String error) { this.error = error; }
}
