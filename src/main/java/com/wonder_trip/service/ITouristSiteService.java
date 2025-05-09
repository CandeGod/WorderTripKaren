package com.wonder_trip.service;

import com.wonder_trip.dto.TouristSiteDTO;

import java.util.List;

public interface ITouristSiteService {

    List<TouristSiteDTO> getAll();

    TouristSiteDTO getById(Integer id);

    TouristSiteDTO create(TouristSiteDTO dto);

    TouristSiteDTO update(Integer id, TouristSiteDTO dto);

    void delete(Integer id);
}
