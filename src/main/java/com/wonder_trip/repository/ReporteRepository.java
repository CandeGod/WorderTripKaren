package com.wonder_trip.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wonder_trip.model.Reporte;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Integer> {
    Page<Reporte> findByUsuarioId(Integer usuarioId, Pageable pageable);
}