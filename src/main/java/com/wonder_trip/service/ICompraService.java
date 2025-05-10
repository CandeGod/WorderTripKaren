package com.wonder_trip.service;

import java.time.LocalDate;
import java.util.List;

import com.wonder_trip.dto.CompraConDetallesDTO;
import com.wonder_trip.dto.CompraDTO;

public interface ICompraService {
    CompraConDetallesDTO createCompra(CompraDTO dto);
    CompraConDetallesDTO getCompraById(Integer id);
    List<CompraConDetallesDTO> getComprasPorUsuario(Integer usuarioId);
    List<CompraConDetallesDTO> getComprasPorRangoFechas(LocalDate inicio, LocalDate fin);
    void deleteCompra(Integer id);
}