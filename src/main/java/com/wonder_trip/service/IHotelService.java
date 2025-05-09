package com.wonder_trip.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import com.wonder_trip.dto.HotelDTO;

public interface IHotelService {
    HotelDTO createHotel(HotelDTO dto);
    HotelDTO getHotelById(Integer id);
    Page<HotelDTO> getAllHotels(Pageable pageable);
    HotelDTO updateHotel(Integer id, HotelDTO dto);
    void deleteHotel(Integer id);
}