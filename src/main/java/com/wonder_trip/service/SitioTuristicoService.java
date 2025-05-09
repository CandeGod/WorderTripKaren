package com.wonder_trip.service;

import org.springframework.stereotype.Service;

import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.SitioTuristico;
import com.wonder_trip.repository.SitioTuristicoRepository;

import java.util.List;

@Service
public class SitioTuristicoService {

    private final SitioTuristicoRepository repository;

    public SitioTuristicoService(SitioTuristicoRepository repository) {
        this.repository = repository;
    }

    public List<SitioTuristico> getAll() {
        return repository.findAll();
    }

    public SitioTuristico getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con ID: " + id));
    }

    public SitioTuristico create(SitioTuristico sitio) {
        return repository.save(sitio);
    }

    public SitioTuristico update(Integer id, SitioTuristico details) {
        SitioTuristico sitio = getById(id);
        sitio.setNombre(details.getNombre());
        sitio.setDescripcion(details.getDescripcion());
        sitio.setUbicacion(details.getUbicacion());
        sitio.setHotel(details.getHotel());
        return repository.save(sitio);
    }

    public void delete(Integer id) {
        SitioTuristico sitio = getById(id);
        repository.delete(sitio);
    }
}