package com.tweb.springboot_server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Controller REST per la gestione del "health check" del server.
 * Offre un endpoint per verificare lo stato del server Spring Boot e la connessione al database.
 * Le risposte includono lo stato del servizio, della connessione al database, e un timestamp.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);

    /**
     * {@link DataSource} per accedere alle informazioni sulla connessione al database.
     */
    @Autowired
    private DataSource dataSource;
    
    /**
     * Esegue un controllo dello stato di salute del servizio.
     * Tenta di stabilire una connessione al database per verificarne la disponibilità.
     * Restituisce lo stato del servizio e del database, insieme ad altre informazioni.
     *
     * @return {@link ResponseEntity} contenente una mappa con lo stato del servizio e del database.
     * Restituisce HTTP 200 OK se il servizio è sano e il database connesso.
     * Restituisce HTTP 503 SERVICE UNAVAILABLE in caso di errori.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            // Test connessione database
            try (Connection connection = dataSource.getConnection()) {
                connection.createStatement().execute("SELECT 1");
                logger.info("Database connection successful.");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "healthy");
            response.put("message", "Spring Boot server is running");
            response.put("database", "connected");
            response.put("service", "springboot-microservice");
            response.put("timestamp", LocalDateTime.now());
            
            logger.debug("Health check successful: {}", response);

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error during health check: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("service", "springboot-microservice");
            response.put("database", "disconnected");
            response.put("error", e.getMessage());
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}