package com.wonder_trip.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wonder_trip.dto.ReporteDTO;

public interface IReporteService {

    ReporteDTO create(ReporteDTO dto);

    ReporteDTO getById(Integer id);

    Page<ReporteDTO> getAll(Pageable pageable);

    ReporteDTO update(Integer id, ReporteDTO dto);

    void delete(Integer id);
}