package com.wonder_trip.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wonder_trip.model.Compra;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {
    List<Compra> findByUsuarioId(Integer usuarioId);

    List<Compra> findByFechaCompraBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT SUM(c.paquete.precio) FROM Compra c")
    BigDecimal obtenerSumaTotalCompras();

}