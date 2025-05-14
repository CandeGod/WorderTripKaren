package com.wonder_trip.service.impl;


import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Reporte;
import com.wonder_trip.model.Usuario;
import com.wonder_trip.repository.ReporteRepository;
import com.wonder_trip.repository.UsuarioRepository;
import com.wonder_trip.service.IReporteService;
import com.wonder_trip.dto.ReporteDTO;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements IReporteService {

    private final ReporteRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ModelMapper modelMapper;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public ReporteDTO create(ReporteDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));

        Reporte reporte = Reporte.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .fecha(LocalDate.parse(dto.getFecha(), formatter))
                .usuario(usuario)
                .build();

        return modelMapper.map(reporteRepository.save(reporte), ReporteDTO.class);
    }

    @Override
    public ReporteDTO getById(Integer id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado con ID: " + id));
        return modelMapper.map(reporte, ReporteDTO.class);
    }

    @Override
    public Page<ReporteDTO> getAll(Pageable pageable) {
        return reporteRepository.findAll(pageable).map(reporte -> modelMapper.map(reporte, ReporteDTO.class));
    }

    @Override
    public ReporteDTO update(Integer id, ReporteDTO dto) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado con ID: " + id));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));

        reporte.setTitulo(dto.getTitulo());
        reporte.setDescripcion(dto.getDescripcion());
        reporte.setFecha(LocalDate.parse(dto.getFecha(), formatter));
        reporte.setUsuario(usuario);

        return modelMapper.map(reporteRepository.save(reporte), ReporteDTO.class);
    }

    @Override
    public void delete(Integer id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado con ID: " + id));
        reporteRepository.delete(reporte);
    }

    @Override
    public Page<ReporteDTO> getByUsuarioId(Integer usuarioId, Pageable pageable) {
        // Verificar primero que el usuario existe
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId);
        }
        
        return reporteRepository.findByUsuarioId(usuarioId, pageable)
                .map(reporte -> modelMapper.map(reporte, ReporteDTO.class));
    }
}