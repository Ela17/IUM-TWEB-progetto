package com.tweb.springboot_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.jdbc.DataSourceBuilder;

import javax.sql.DataSource;

/**
 * Configurazione Spring per la connessione al database PostgreSQL.
 * Definisce un bean {@link javax.sql.DataSource} utilizzando i parametri di connessione.
 */
@Configuration
public class DatabaseConfig {
    
    @Value("${POSTGRES_HOST:localhost}")
    private String postgresHost;
    
    @Value("${POSTGRES_PORT:5432}")
    private String postgresPort;
    
    @Value("${POSTGRES_DB:cinema_db}")
    private String postgresDb;
    
    @Value("${POSTGRES_USER:postgres}")
    private String postgresUser;
    
    @Value("${POSTGRES_PASSWORD}")
    private String postgresPassword;
    
    /**
     * Crea e configura un bean {@link javax.sql.DataSource} per la connessione al database PostgreSQL.
     * L'URL di connessione viene costruito utilizzando i valori iniettati per host, porta e nome del database.
     *
     * @return Un'istanza di {@link javax.sql.DataSource} configurata per PostgreSQL.
     */
    @Bean
    public DataSource dataSource() {
        String url = String.format("jdbc:postgresql://%s:%s/%s", 
                                 postgresHost, postgresPort, postgresDb);
        
        return DataSourceBuilder.create()
                .url(url)
                .username(postgresUser)
                .password(postgresPassword)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}
