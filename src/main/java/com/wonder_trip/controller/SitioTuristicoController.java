package com.wonder_trip.controller;

import com.wonder_trip.dto.SitioTuristicoDTO;
import com.wonder_trip.service.ISitioTuristicoService;
import com.wonder_trip.service.impl.SitioTuristicoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sitios-turisticos")
@Tag(name = "Sitios Turísticos", description = "Operaciones relacionadas con sitios turísticos")
public class SitioTuristicoController {

    private final ISitioTuristicoService service;

    public SitioTuristicoController(SitioTuristicoService service) {
        this.service = service;
    }

    @Operation(summary = "Listar todos los sitios turísticos")
    @ApiResponse(responseCode = "200", description = "Lista de sitios turísticos")
    @GetMapping
    public ResponseEntity<List<SitioTuristicoDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Obtener un sitio turístico por ID")
    @ApiResponse(responseCode = "200", description = "Sitio turístico encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<SitioTuristicoDTO> getById(@PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Crear un nuevo sitio turístico")
    @ApiResponse(responseCode = "200", description = "Sitio creado exitosamente")
    @PostMapping
    public ResponseEntity<SitioTuristicoDTO> create(@Valid @RequestBody SitioTuristicoDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @Operation(summary = "Actualizar un sitio turístico por ID")
    @ApiResponse(responseCode = "200", description = "Sitio actualizado")
    @PutMapping("/{id}")
    public ResponseEntity<SitioTuristicoDTO> update(@PathVariable @Min(1) Integer id, @Valid @RequestBody SitioTuristicoDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Operation(summary = "Eliminar un sitio turístico por ID")
    @ApiResponse(responseCode = "204", description = "Sitio eliminado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable @Min(1) Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/paginado")
    @Operation(summary = "Obtener sitios turísticos paginados", description = "Retorna una página de sitios turísticos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de sitios encontrada")
    })
    public ResponseEntity<Page<SitioTuristicoDTO>> getPaged(
            @Parameter(description = "Número de página", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de la página", example = "20") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getAllPaged(pageable));
    }
}
