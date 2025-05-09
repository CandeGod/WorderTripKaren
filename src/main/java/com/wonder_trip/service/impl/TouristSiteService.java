package com.wonder_trip.service.impl;

import com.wonder_trip.dto.TouristSiteDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Hotel;
import com.wonder_trip.model.TouristSite;
import com.wonder_trip.repository.HotelRepository;
import com.wonder_trip.repository.TouristSiteRepository;
import com.wonder_trip.service.ITouristSiteService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TouristSiteService implements ITouristSiteService{

    private final TouristSiteRepository repository;
    private final HotelRepository hotelRepository;

    public TouristSiteService(TouristSiteRepository repository, HotelRepository hotelRepository) {
        this.repository = repository;
        this.hotelRepository = hotelRepository;
    }

    public List<TouristSiteDTO> getAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TouristSiteDTO getById(Integer id) {
        TouristSite site = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));
        return toDTO(site);
    }

    public TouristSiteDTO create(TouristSiteDTO dto) {
        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + dto.getHotelId()));

        TouristSite site = new TouristSite();
        site.setNombre(dto.getNombre());
        site.setDescripcion(dto.getDescripcion());
        site.setUbicacion(dto.getUbicacion());
        site.setHotel(hotel);

        return toDTO(repository.save(site));
    }

    public TouristSiteDTO update(Integer id, TouristSiteDTO dto) {
        TouristSite site = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));

        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + dto.getHotelId()));

        site.setNombre(dto.getNombre());
        site.setDescripcion(dto.getDescripcion());
        site.setUbicacion(dto.getUbicacion());
        site.setHotel(hotel);

        return toDTO(repository.save(site));
    }

    public void delete(Integer id) {
        TouristSite site = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));
        repository.delete(site);
    }

    private TouristSiteDTO toDTO(TouristSite site) {
        TouristSiteDTO dto = new TouristSiteDTO();
        dto.setId(site.getId());
        dto.setNombre(site.getNombre());
        dto.setDescripcion(site.getDescripcion());
        dto.setUbicacion(site.getUbicacion());
        dto.setHotelId(site.getHotel().getId());
        return dto;
    }
}
