package com.tweb.springboot_server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.tweb.springboot_server.model.Oscar;

@Repository
public interface OscarRepository extends JpaRepository<Oscar, Integer> {

    // Conteggio totale record Oscar (nomination + vittorie)
    @Query("SELECT COUNT(o) FROM Oscar o")
    long countAllOscars();
}


