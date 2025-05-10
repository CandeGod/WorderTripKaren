package com.wonder_trip.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wonder_trip.model.Paquete;

@Repository
public interface PaqueteRepository extends JpaRepository<Paquete, Integer> {
    List<Paquete> findBySitiosId(Integer sitioId);
}
