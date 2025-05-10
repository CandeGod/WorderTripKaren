package com.wonder_trip.service.impl;

import java.time.LocalDate;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.EventoDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Evento;
import com.wonder_trip.model.SitioTuristico;
import com.wonder_trip.repository.EventoRepository;
import com.wonder_trip.repository.SitioTuristicoRepository;
import com.wonder_trip.service.IEventoService;

@Service
public class EventoServiceImpl implements IEventoService {

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private SitioTuristicoRepository sitioRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public EventoDTO createEvento(EventoDTO dto) {
        Evento evento = modelMapper.map(dto, Evento.class);
        SitioTuristico sitio = sitioRepository.findById(dto.getIdSitio())
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con id: " + dto.getIdSitio()));
        evento.setSitioTuristico(sitio);
        evento.setFechaInicio(dto.getFechaInicio() != null ? LocalDate.parse(dto.getFechaInicio()) : null);
        evento.setFechaFin(dto.getFechaFin() != null ? LocalDate.parse(dto.getFechaFin()) : null);

        return modelMapper.map(eventoRepository.save(evento), EventoDTO.class);
    }

    @Override
    public EventoDTO getEventoById(Integer id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con id: " + id));
        EventoDTO dto = modelMapper.map(evento, EventoDTO.class);
        dto.setIdSitio(evento.getSitioTuristico().getId());
        return dto;
    }

    @Override
    public Page<EventoDTO> getAllEventos(Pageable pageable) {
        return eventoRepository.findAll(pageable)
                .map(evento -> {
                    EventoDTO dto = modelMapper.map(evento, EventoDTO.class);
                    dto.setIdSitio(evento.getSitioTuristico().getId());
                    return dto;
                });
    }

    @Override
    public EventoDTO updateEvento(Integer id, EventoDTO dto) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con id: " + id));

        SitioTuristico sitio = sitioRepository.findById(dto.getIdSitio())
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con id: " + dto.getIdSitio()));

        evento.setTitulo(dto.getTitulo());
        evento.setDescripcion(dto.getDescripcion());
        evento.setFechaInicio(dto.getFechaInicio() != null ? LocalDate.parse(dto.getFechaInicio()) : null);
        evento.setFechaFin(dto.getFechaFin() != null ? LocalDate.parse(dto.getFechaFin()) : null);
        evento.setSitioTuristico(sitio);

        return modelMapper.map(eventoRepository.save(evento), EventoDTO.class);
    }

    @Override
    public void deleteEvento(Integer id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con id: " + id));
        eventoRepository.delete(evento);
    }
}