package com.wonder_trip.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wonder_trip.dto.TourDTO;
import com.wonder_trip.service.ITourService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@Tag(name = "Tours", description = "Operaciones relacionadas con los tours")
public class TourController {

    private final ITourService tourService;

    @PostMapping
    @Operation(summary = "Crear un nuevo tour")
    public ResponseEntity<TourDTO> createTour(@Valid @RequestBody TourDTO dto) {
        return new ResponseEntity<>(tourService.createTour(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un tour por ID")
    public ResponseEntity<TourDTO> getTourById(@PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(tourService.getTourById(id));
    }

    @GetMapping
    @Operation(summary = "Listar todos los tours")
    public ResponseEntity<Page<TourDTO>> getAllTours(Pageable pageable) {
        return ResponseEntity.ok(tourService.getAllTours(pageable));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tour")
    public ResponseEntity<TourDTO> updateTour(@PathVariable @Min(1) Integer id, @Valid @RequestBody TourDTO dto) {
        return ResponseEntity.ok(tourService.updateTour(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un tour")
    public ResponseEntity<Void> deleteTour(@PathVariable @Min(1) Integer id) {
        tourService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }
}
