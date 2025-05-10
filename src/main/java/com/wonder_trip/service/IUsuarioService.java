package com.wonder_trip.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.wonder_trip.dto.UsuarioDTO;

public interface IUsuarioService {
    UsuarioDTO createUsuario(UsuarioDTO dto);
    UsuarioDTO getUsuarioById(Integer id);
    Page<UsuarioDTO> getAllUsuarios(Pageable pageable);
    UsuarioDTO updateUsuario(Integer id, UsuarioDTO dto);
    void deleteUsuario(Integer id);
}
