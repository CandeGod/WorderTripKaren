package com.wonder_trip.controller;

import com.wonder_trip.dto.HotelDTO;
import com.wonder_trip.service.IHotelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoteles")
@RequiredArgsConstructor
@Tag(name = "Hoteles", description = "Operaciones relacionadas con hoteles")
public class HotelController {

    private final IHotelService service;

    @Operation(summary = "Crear un nuevo hotel")
    @ApiResponse(responseCode = "200", description = "Hotel creado exitosamente")
    @PostMapping
    public ResponseEntity<HotelDTO> createHotel(@Valid @RequestBody HotelDTO dto) {
        return ResponseEntity.ok(service.createHotel(dto));
    }

    @Operation(summary = "Obtener un hotel por ID")
    @ApiResponse(responseCode = "200", description = "Hotel encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotel(@PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(service.getHotelById(id));
    }

    @Operation(summary = "Listar todos los hoteles")
    @ApiResponse(responseCode = "200", description = "Lista de hoteles")
    @GetMapping
    public ResponseEntity<Page<HotelDTO>> getAllHotels(Pageable pageable) {
        return ResponseEntity.ok(service.getAllHotels(pageable));
    }

    @Operation(summary = "Actualizar un hotel por ID")
    @ApiResponse(responseCode = "200", description = "Hotel actualizado")
    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable @Min(1) Integer id, @Valid @RequestBody HotelDTO dto) {
        return ResponseEntity.ok(service.updateHotel(id, dto));
    }

    @Operation(summary = "Eliminar un hotel por ID")
    @ApiResponse(responseCode = "204", description = "Hotel eliminado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable @Min(1) Integer id) {
        service.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
