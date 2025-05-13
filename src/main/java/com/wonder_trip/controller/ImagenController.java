package com.wonder_trip.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wonder_trip.dto.ImagenDTO;
import com.wonder_trip.service.IImagenService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/imagenes")
@RequiredArgsConstructor
@Tag(name = "Imágenes", description = "Operaciones relacionadas con imágenes")
public class ImagenController {

    private final IImagenService imagenService;

    @Operation(summary = "Crear una nueva imagen")
    @ApiResponse(responseCode = "201", description = "Imagen creada exitosamente")
    @PostMapping
    public ResponseEntity<ImagenDTO> createImagen(@Valid @RequestBody ImagenDTO dto) {
        return ResponseEntity.ok(imagenService.createImagen(dto));
    }

    @Operation(summary = "Obtener una imagen por ID")
    @ApiResponse(responseCode = "200", description = "Imagen encontrada")
    @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    @GetMapping("/{id}")
    public ResponseEntity<ImagenDTO> getImagen(@PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(imagenService.getImagenById(id));
    }

    @Operation(summary = "Obtener imágenes por evento")
    @ApiResponse(responseCode = "200", description = "Lista de imágenes obtenida correctamente")
    @GetMapping("/evento/{idEvento}")
    public ResponseEntity<List<ImagenDTO>> getImagenesByEvento(@PathVariable @Min(1) Integer idEvento) {
        return ResponseEntity.ok(imagenService.getImagenesByEvento(idEvento));
    }

    @Operation(summary = "Eliminar una imagen por ID")
    @ApiResponse(responseCode = "204", description = "Imagen eliminada correctamente")
    @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImagen(@PathVariable @Min(1) Integer id) {
        imagenService.deleteImagen(id);
        return ResponseEntity.noContent().build();
    }
}