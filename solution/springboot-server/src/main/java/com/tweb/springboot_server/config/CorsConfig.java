package com.tweb.springboot_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * {@code CorsConfig} è una classe di configurazione Spring che abilita il Cross-Origin Resource Sharing (CORS)
 * per l'applicazione.
 * Questa configurazione permette al server centrale di effettuare richieste API al server springboot.
 * <p>
 * Utilizza le proprietà definite nel file di configurazione {@code application.properties}
 * per determinare l'origine consentita per le richieste CORS.
 * </p>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Value("${MAIN_SERVER_HOST:localhost}")
    private String host;
    
    @Value("${MAIN_SERVER_PORT:3000}")
    private String port;

    /**
     * Configura le mappature CORS per i percorsi API.
     * Consente l'accesso da {@code http://<host>:<port>} ai percorsi {@code /api/**}.
     * Supporta i metodi HTTP GET, POST, PUT, DELETE, tutti gli header e le credenziali.
     *
     * @param registry Il registro CORS a cui aggiungere le mappature.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String url = String.format("http://%s:%s", 
                                 host, port);
        
        registry.addMapping("/api/**")
                .allowedOrigins(
                    url
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}