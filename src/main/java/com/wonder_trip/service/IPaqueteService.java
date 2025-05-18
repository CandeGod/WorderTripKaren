package com.wonder_trip.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wonder_trip.dto.PaqueteConSitiosDTO;
import com.wonder_trip.dto.PaqueteDTO;
import com.wonder_trip.dto.PaqueteSitioDTO;

public interface IPaqueteService {
    List<PaqueteDTO> getAll();
    PaqueteDTO getById(Integer id);
    PaqueteDTO create(PaqueteDTO dto);
    PaqueteDTO update(Integer id, PaqueteDTO dto);
    void delete(Integer id);

    void addSitioToPaquete(PaqueteSitioDTO dto);
    void removeSitioFromPaquete(PaqueteSitioDTO dto);

    List<PaqueteConSitiosDTO> getAllWithSitios();
    List<PaqueteConSitiosDTO> findBySitio(Integer sitioId);
    PaqueteConSitiosDTO getConSitiosById(Integer id);

    Page<PaqueteDTO> getAllPaged(Pageable pageable);

}