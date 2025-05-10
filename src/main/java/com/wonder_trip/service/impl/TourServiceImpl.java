package com.wonder_trip.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.TourDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.SitioTuristico;
import com.wonder_trip.model.Tour;
import com.wonder_trip.repository.SitioTuristicoRepository;
import com.wonder_trip.repository.TourRepository;
import com.wonder_trip.service.ITourService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements ITourService {

    private final TourRepository tourRepository;
    private final SitioTuristicoRepository sitioRepository;
    private final ModelMapper modelMapper;

    @Override
    public TourDTO createTour(TourDTO dto) {
        Tour tour = modelMapper.map(dto, Tour.class);
        SitioTuristico sitio = sitioRepository.findById(dto.getIdSitio())
            .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con id: " + dto.getIdSitio()));
        tour.setSitioTuristico(sitio);
        return modelMapper.map(tourRepository.save(tour), TourDTO.class);
    }

    @Override
    public TourDTO getTourById(Integer id) {
        Tour tour = tourRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tour no encontrado con id: " + id));
        TourDTO dto = modelMapper.map(tour, TourDTO.class);
        dto.setIdSitio(tour.getSitioTuristico().getId());
        return dto;
    }

    @Override
    public Page<TourDTO> getAllTours(Pageable pageable) {
        return tourRepository.findAll(pageable)
            .map(tour -> {
                TourDTO dto = modelMapper.map(tour, TourDTO.class);
                dto.setIdSitio(tour.getSitioTuristico().getId());
                return dto;
            });
    }

    @Override
    public TourDTO updateTour(Integer id, TourDTO dto) {
        Tour tour = tourRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tour no encontrado con id: " + id));
        SitioTuristico sitio = sitioRepository.findById(dto.getIdSitio())
            .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con id: " + dto.getIdSitio()));
        tour.setNombre(dto.getNombre());
        tour.setDescripcion(dto.getDescripcion());
        tour.setDuracion(dto.getDuracion());
        tour.setPrecio(dto.getPrecio());
        tour.setSitioTuristico(sitio);
        return modelMapper.map(tourRepository.save(tour), TourDTO.class);
    }

    @Override
    public void deleteTour(Integer id) {
        Tour tour = tourRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tour no encontrado con id: " + id));
        tourRepository.delete(tour);
    }
}
