package com.wonder_trip.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wonder_trip.dto.EventoDTO;

public interface IEventoService {
    EventoDTO createEvento(EventoDTO eventoDTO);
    EventoDTO getEventoById(Integer id);
    Page<EventoDTO> getAllEventos(Pageable pageable); 
    EventoDTO updateEvento(Integer id, EventoDTO eventoDTO);
    void deleteEvento(Integer id);
}