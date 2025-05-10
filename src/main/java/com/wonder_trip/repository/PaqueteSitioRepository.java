package com.wonder_trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wonder_trip.model.PaqueteSitio;
import com.wonder_trip.model.PaqueteSitioId;

@Repository
public interface PaqueteSitioRepository extends JpaRepository<PaqueteSitio, PaqueteSitioId> {
}