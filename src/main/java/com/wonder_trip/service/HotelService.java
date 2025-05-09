package com.wonder_trip.service;


import org.springframework.stereotype.Service;

import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Hotel;
import com.wonder_trip.repository.HotelRepository;

import java.util.List;

@Service
public class HotelService {

    private final HotelRepository repository;

    public HotelService(HotelRepository repository) {
        this.repository = repository;
    }

    public List<Hotel> getAllHotels() {
        return repository.findAll();
    }

    public Hotel getHotelById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + id));
    }

    public Hotel createHotel(Hotel hotel) {
        return repository.save(hotel);
    }

    public Hotel updateHotel(Integer id, Hotel hotelDetails) {
        Hotel hotel = getHotelById(id);
        hotel.setNombre(hotelDetails.getNombre());
        hotel.setDireccion(hotelDetails.getDireccion());
        hotel.setDescripcion(hotelDetails.getDescripcion());
        return repository.save(hotel);
    }

    public void deleteHotel(Integer id) {
        Hotel hotel = getHotelById(id);
        repository.delete(hotel);
    }
}
