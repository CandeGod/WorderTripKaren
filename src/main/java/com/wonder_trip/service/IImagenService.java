package com.wonder_trip.service;

import java.util.List;

import com.wonder_trip.dto.ImagenDTO;

public interface IImagenService {
    ImagenDTO createImagen(ImagenDTO imagenDTO);
    ImagenDTO getImagenById(Integer id);
    List<ImagenDTO> getImagenesByEvento(Integer idEvento);
    void deleteImagen(Integer id);
}