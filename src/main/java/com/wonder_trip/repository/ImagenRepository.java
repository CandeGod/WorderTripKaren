package com.wonder_trip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wonder_trip.model.Imagen;

@Repository
public interface ImagenRepository extends JpaRepository<Imagen, Integer> {
    List<Imagen> findByEventoIdEvento(Integer idEvento);
    
}