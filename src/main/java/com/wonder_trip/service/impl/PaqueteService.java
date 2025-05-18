package com.wonder_trip.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.PaqueteConSitiosDTO;
import com.wonder_trip.dto.PaqueteDTO;
import com.wonder_trip.dto.PaqueteSitioDTO;
import com.wonder_trip.dto.SitioTuristicoDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Paquete;
import com.wonder_trip.model.SitioTuristico;
import com.wonder_trip.repository.PaqueteRepository;
import com.wonder_trip.repository.SitioTuristicoRepository;
import com.wonder_trip.service.IPaqueteService;

@Service
public class PaqueteService implements IPaqueteService {

    private final PaqueteRepository repository;
    private final SitioTuristicoRepository sitioRepository;

    public PaqueteService(PaqueteRepository repository, SitioTuristicoRepository sitioRepository) {
        this.repository = repository;
        this.sitioRepository = sitioRepository;
    }

    @Override
    public List<PaqueteDTO> getAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public PaqueteDTO getById(Integer id) {
        return toDTO(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado con ID: " + id)));
    }

    @Override
    public PaqueteDTO create(PaqueteDTO dto) {
        Paquete entity = new Paquete();
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setPrecio(dto.getPrecio());
        return toDTO(repository.save(entity));
    }

    @Override
    public PaqueteDTO update(Integer id, PaqueteDTO dto) {
        Paquete entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado con ID: " + id));
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setPrecio(dto.getPrecio());
        return toDTO(repository.save(entity));
    }

    @Override
    public void delete(Integer id) {
        Paquete entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado con ID: " + id));
        repository.delete(entity);
    }

    @Override
    public void addSitioToPaquete(PaqueteSitioDTO dto) {
        Paquete paquete = repository.findById(dto.getPaqueteId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Paquete no encontrado con ID: " + dto.getPaqueteId()));
        SitioTuristico sitio = sitioRepository.findById(dto.getSitioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sitio turístico no encontrado con ID: " + dto.getSitioId()));
        paquete.getSitios().add(sitio);
        repository.save(paquete);
    }

    @Override
    public void removeSitioFromPaquete(PaqueteSitioDTO dto) {
        Paquete paquete = repository.findById(dto.getPaqueteId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Paquete no encontrado con ID: " + dto.getPaqueteId()));
        SitioTuristico sitio = sitioRepository.findById(dto.getSitioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sitio turístico no encontrado con ID: " + dto.getSitioId()));
        paquete.getSitios().remove(sitio);
        repository.save(paquete);
    }

    @Override
    public List<PaqueteConSitiosDTO> getAllWithSitios() {
        return repository.findAll().stream().map(this::toConSitiosDTO).collect(Collectors.toList());
    }

    @Override
    public List<PaqueteConSitiosDTO> findBySitio(Integer sitioId) {
        return repository.findBySitiosId(sitioId).stream().map(this::toConSitiosDTO).collect(Collectors.toList());
    }

    @Override
    public PaqueteConSitiosDTO getConSitiosById(Integer id) {
        Paquete paquete = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado con ID: " + id));
        return toConSitiosDTO(paquete);
    }

    private PaqueteDTO toDTO(Paquete entity) {
        PaqueteDTO dto = new PaqueteDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setPrecio(entity.getPrecio());
        return dto;
    }

    private PaqueteConSitiosDTO toConSitiosDTO(Paquete entity) {
        PaqueteConSitiosDTO dto = new PaqueteConSitiosDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setPrecio(entity.getPrecio());
        dto.setSitios(entity.getSitios().stream().map(s -> {
            SitioTuristicoDTO sitioDTO = new SitioTuristicoDTO();
            sitioDTO.setId(s.getId());
            sitioDTO.setNombre(s.getNombre());
            sitioDTO.setDescripcion(s.getDescripcion());
            sitioDTO.setUbicacion(s.getUbicacion());
            sitioDTO.setHotelId(s.getHotel().getId());
            return sitioDTO;
        }).collect(Collectors.toList()));
        return dto;
    }

    @Override
    public Page<PaqueteDTO> getAllPaged(Pageable pageable) {
        return repository.findAll(pageable).map(this::toDTO);
    }

}