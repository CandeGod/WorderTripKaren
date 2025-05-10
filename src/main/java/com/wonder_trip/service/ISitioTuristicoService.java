package com.wonder_trip.service;


import java.util.List;

import com.wonder_trip.dto.SitioTuristicoDTO;

public interface ISitioTuristicoService {

    List<SitioTuristicoDTO> getAll();

    SitioTuristicoDTO getById(Integer id);

    SitioTuristicoDTO create(SitioTuristicoDTO dto);

    SitioTuristicoDTO update(Integer id, SitioTuristicoDTO dto);

    void delete(Integer id);
}
