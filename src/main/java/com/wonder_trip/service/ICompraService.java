package com.wonder_trip.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wonder_trip.dto.CompraConDetallesDTO;
import com.wonder_trip.dto.CompraDTO;

public interface ICompraService {
    CompraConDetallesDTO createCompra(CompraDTO dto);
    List<CompraConDetallesDTO> getComprasByUsuarioId(Integer usuarioId);
    CompraConDetallesDTO getCompraById(Integer id);
    List<CompraConDetallesDTO> getComprasPorUsuario(Integer usuarioId);
    List<CompraConDetallesDTO> getComprasPorRangoFechas(LocalDate inicio, LocalDate fin);
    void deleteCompra(Integer id);

    BigDecimal getSumaTotalCompras();
    Page<CompraConDetallesDTO> getAllComprasPaginado(Pageable pageable);

    BigDecimal getSumaTotalPorUsuario(Integer usuarioId);
    long contarComprasPorUsuario(Integer usuarioId);

}