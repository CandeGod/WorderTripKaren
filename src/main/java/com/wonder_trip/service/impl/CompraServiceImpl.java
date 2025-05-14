package com.wonder_trip.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.CompraConDetallesDTO;
import com.wonder_trip.dto.CompraDTO;
import com.wonder_trip.dto.PaqueteDTO;
import com.wonder_trip.dto.UsuarioDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Compra;
import com.wonder_trip.model.Paquete;
import com.wonder_trip.model.Usuario;
import com.wonder_trip.repository.CompraRepository;
import com.wonder_trip.repository.PaqueteRepository;
import com.wonder_trip.repository.UsuarioRepository;
import com.wonder_trip.service.ICompraService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompraServiceImpl implements ICompraService {

    private final CompraRepository compraRepository;
    private final PaqueteRepository paqueteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ModelMapper modelMapper;

    @Override
    public CompraConDetallesDTO createCompra(CompraDTO dto) {
        log.info("Creando compra: {}", dto);

        Paquete paquete = paqueteRepository.findById(dto.getPaqueteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paquete no encontrado"));

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Compra compra = new Compra();
        compra.setFechaCompra(dto.getFechaCompra());
        compra.setMetodoPago(dto.getMetodoPago());
        compra.setPaquete(paquete);
        compra.setUsuario(usuario);

        Compra guardada = compraRepository.save(compra);
        return convertirADetallesDTO(guardada);
    }

    @Override
    public List<CompraConDetallesDTO> getComprasByUsuarioId(Integer usuarioId) {
        log.info("Buscando compras para usuario con ID: {}", usuarioId);
        List<Compra> compras = compraRepository.findByUsuarioId(usuarioId);
        return compras.stream()
                .map(compra -> modelMapper.map(compra, CompraConDetallesDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public CompraConDetallesDTO getCompraById(Integer id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));
        return convertirADetallesDTO(compra);
    }

    @Override
    public List<CompraConDetallesDTO> getComprasPorUsuario(Integer usuarioId) {
        return compraRepository.findByUsuarioId(usuarioId).stream()
                .map(this::convertirADetallesDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompraConDetallesDTO> getComprasPorRangoFechas(LocalDate inicio, LocalDate fin) {
        return compraRepository.findByFechaCompraBetween(inicio, fin).stream()
                .map(this::convertirADetallesDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCompra(Integer id) {
        Compra compra = compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));
        compraRepository.delete(compra);
    }

    private CompraConDetallesDTO convertirADetallesDTO(Compra compra) {
        CompraConDetallesDTO dto = new CompraConDetallesDTO();
        dto.setId(compra.getId());
        dto.setFechaCompra(compra.getFechaCompra());
        dto.setMetodoPago(compra.getMetodoPago());
        dto.setUsuario(modelMapper.map(compra.getUsuario(), UsuarioDTO.class));
        dto.setPaquete(modelMapper.map(compra.getPaquete(), PaqueteDTO.class));
        return dto;
    }
}
