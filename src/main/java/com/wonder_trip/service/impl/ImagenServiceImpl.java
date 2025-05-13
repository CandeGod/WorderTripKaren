package com.wonder_trip.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.ImagenDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Evento;
import com.wonder_trip.model.Imagen;
import com.wonder_trip.model.Reporte;
import com.wonder_trip.model.SitioTuristico;
import com.wonder_trip.model.Tour;
import com.wonder_trip.repository.EventoRepository;
import com.wonder_trip.repository.ImagenRepository;
import com.wonder_trip.repository.ReporteRepository;
import com.wonder_trip.repository.SitioTuristicoRepository;
import com.wonder_trip.repository.TourRepository;
import com.wonder_trip.service.IImagenService;

@Service
public class ImagenServiceImpl implements IImagenService {

    @Autowired
    private ImagenRepository imagenRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @Autowired
    private SitioTuristicoRepository sitioRepository;
    
    @Autowired
    private TourRepository tourRepository;
    
    @Autowired
    private ReporteRepository reporteRepository;
    
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ImagenDTO createImagen(ImagenDTO dto) {
        Imagen imagen = modelMapper.map(dto, Imagen.class);
        
        if (dto.getIdEvento() != null) {
            Evento evento = eventoRepository.findById(dto.getIdEvento())
                .orElseThrow(() -> new ResourceNotFoundException("Evento no encontrado con id: " + dto.getIdEvento()));
            imagen.setEvento(evento);
        }
        
        if (dto.getIdSitio() != null) {
            SitioTuristico sitio = sitioRepository.findById(dto.getIdSitio())
                .orElseThrow(() -> new ResourceNotFoundException("Sitio turístico no encontrado con id: " + dto.getIdSitio()));
            imagen.setSitioTuristico(sitio);
        }
        
        if (dto.getIdTour() != null) {
            Tour tour = tourRepository.findById(dto.getIdTour())
                .orElseThrow(() -> new ResourceNotFoundException("Tour no encontrado con id: " + dto.getIdTour()));
            imagen.setTour(tour);
        }
        
        if (dto.getIdReporte() != null) {
            Reporte reporte = reporteRepository.findById(dto.getIdReporte())
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado con id: " + dto.getIdReporte()));
            imagen.setReporte(reporte);
        }
        
        return modelMapper.map(imagenRepository.save(imagen), ImagenDTO.class);
    }

    @Override
    public ImagenDTO getImagenById(Integer id) {
        Imagen imagen = imagenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada con id: " + id));
        return modelMapper.map(imagen, ImagenDTO.class);
    }

    @Override
    public List<ImagenDTO> getImagenesByEvento(Integer idEvento) {
        List<Imagen> imagenes = imagenRepository.findByEventoIdEvento(idEvento);
        return imagenes.stream()
                .map(imagen -> modelMapper.map(imagen, ImagenDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteImagen(Integer id) {
        Imagen imagen = imagenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen no encontrada con id: " + id));
        imagenRepository.delete(imagen);
    }

    
}