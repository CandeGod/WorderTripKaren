package com.wonder_trip.service.impl;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.HotelDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Hotel;
import com.wonder_trip.repository.HotelRepository;
import com.wonder_trip.service.IHotelService;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelServiceImpl implements IHotelService {

    private final HotelRepository repository;
    private final ModelMapper modelMapper;

    @Override
    public HotelDTO createHotel(HotelDTO dto) {
        log.info("Creando hotel: {}", dto.getNombre());
        Hotel hotel = modelMapper.map(dto, Hotel.class);
        return modelMapper.map(repository.save(hotel), HotelDTO.class);
    }

    @Override
    public HotelDTO getHotelById(Integer id) {
        log.info("Buscando hotel con ID: {}", id);
        Hotel hotel = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + id));
        return modelMapper.map(hotel, HotelDTO.class);
    }

    @Override
    public Page<HotelDTO> getAllHotels(Pageable pageable) {
        log.info("Listando hoteles con paginación");
        return repository.findAll(pageable).map(h -> modelMapper.map(h, HotelDTO.class));
    }

    @Override
    public HotelDTO updateHotel(Integer id, HotelDTO dto) {
        log.info("Actualizando hotel con ID: {}", id);
        Hotel hotel = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + id));

        hotel.setNombre(dto.getNombre());
        hotel.setDireccion(dto.getDireccion());
        hotel.setDescripcion(dto.getDescripcion());

        return modelMapper.map(repository.save(hotel), HotelDTO.class);
    }

    @Override
    public void deleteHotel(Integer id) {
        log.info("Eliminando hotel con ID: {}", id);
        Hotel hotel = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel no encontrado con ID: " + id));
        repository.delete(hotel);
    }
}
