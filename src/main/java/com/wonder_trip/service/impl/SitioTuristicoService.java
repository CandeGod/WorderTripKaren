package com.wonder_trip.service.impl;

import com.wonder_trip.dto.SitioTuristicoDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Hotel;
import com.wonder_trip.model.SitioTuristico;
import com.wonder_trip.repository.HotelRepository;
import com.wonder_trip.repository.SitioTuristicoRepository;
import com.wonder_trip.service.ISitioTuristicoService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SitioTuristicoService implements ISitioTuristicoService{

    private final SitioTuristicoRepository repository;
    private final HotelRepository hotelRepository;

    public SitioTuristicoService(SitioTuristicoRepository repository, HotelRepository hotelRepository) {
        this.repository = repository;
        this.hotelRepository = hotelRepository;
    }

    @Override
    public List<SitioTuristicoDTO> getAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public SitioTuristicoDTO getById(Integer id) {
        SitioTuristico site = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));
        return toDTO(site);
    }

    @Override
    public SitioTuristicoDTO create(SitioTuristicoDTO dto) {
        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + dto.getHotelId()));

        SitioTuristico site = new SitioTuristico();
        site.setNombre(dto.getNombre());
        site.setDescripcion(dto.getDescripcion());
        site.setUbicacion(dto.getUbicacion());
        site.setHotel(hotel);

        return toDTO(repository.save(site));
    }

    @Override
    public SitioTuristicoDTO update(Integer id, SitioTuristicoDTO dto) {
        SitioTuristico site = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));

        Hotel hotel = hotelRepository.findById(dto.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + dto.getHotelId()));

        site.setNombre(dto.getNombre());
        site.setDescripcion(dto.getDescripcion());
        site.setUbicacion(dto.getUbicacion());
        site.setHotel(hotel);

        return toDTO(repository.save(site));
    }

    @Override
    public void delete(Integer id) {
        SitioTuristico site = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));
        repository.delete(site);
    }

    private SitioTuristicoDTO toDTO(SitioTuristico site) {
        SitioTuristicoDTO dto = new SitioTuristicoDTO();
        dto.setId(site.getId());
        dto.setNombre(site.getNombre());
        dto.setDescripcion(site.getDescripcion());
        dto.setUbicacion(site.getUbicacion());
        dto.setHotelId(site.getHotel().getId());
        dto.setImagenPrincipal(site.getImagenPrincipal());
        return dto;
    }
}
