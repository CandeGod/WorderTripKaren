package com.wonder_trip.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.wonder_trip.dto.UsuarioDTO;
import com.wonder_trip.exception.ResourceNotFoundException;
import com.wonder_trip.model.Usuario;
import com.wonder_trip.repository.UsuarioRepository;
import com.wonder_trip.service.IUsuarioService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioServiceImpl implements IUsuarioService {

    private final UsuarioRepository repository;
    private final ModelMapper modelMapper;

    @Override
    public UsuarioDTO createUsuario(UsuarioDTO dto) {
        log.info("Creando usuario: {}", dto.getCorreo());

        if (repository.findByCorreo(dto.getCorreo()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }

        Usuario usuario = modelMapper.map(dto, Usuario.class);
        return modelMapper.map(repository.save(usuario), UsuarioDTO.class);
    }

    @Override
    public UsuarioDTO getUsuarioById(Integer id) {
        log.info("Buscando usuario con ID: {}", id);
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return modelMapper.map(usuario, UsuarioDTO.class);
    }

    @Override
    public Page<UsuarioDTO> getAllUsuarios(Pageable pageable) {
        log.info("Listando usuarios con paginación");
        return repository.findAll(pageable).map(u -> modelMapper.map(u, UsuarioDTO.class));
    }

    @Override
    public UsuarioDTO updateUsuario(Integer id, UsuarioDTO dto) {
        log.info("Actualizando usuario con ID: {}", id);
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        usuario.setNombre(dto.getNombre());
        usuario.setSexo(dto.getSexo());
        usuario.setCorreo(dto.getCorreo());
        usuario.setContrasena(dto.getContrasena());
        usuario.setRol(dto.getRol());

        return modelMapper.map(repository.save(usuario), UsuarioDTO.class);
    }

    @Override
    public void deleteUsuario(Integer id) {
        log.info("Eliminando usuario con ID: {}", id);
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        repository.delete(usuario);
    }
}
