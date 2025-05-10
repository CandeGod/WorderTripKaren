package com.wonder_trip.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wonder_trip.dto.TourDTO;

public interface ITourService {
    TourDTO createTour(TourDTO tourDTO);
    TourDTO getTourById(Integer id);
    Page<TourDTO> getAllTours(Pageable pageable);
    TourDTO updateTour(Integer id, TourDTO tourDTO);
    void deleteTour(Integer id);
}
