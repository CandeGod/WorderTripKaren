package com.wonder_trip.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wonder_trip.dto.EventoDTO;
import com.wonder_trip.service.IEventoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@Tag(name = "Eventos", description = "Operaciones relacionadas con eventos")
public class EventoController {

    private final IEventoService eventoService;

    @Operation(summary = "Crear un nuevo evento")
    @ApiResponse(responseCode = "201", description = "Evento creado exitosamente")
    @PostMapping
    public ResponseEntity<EventoDTO> createEvento(@Valid @RequestBody EventoDTO dto) {
        return ResponseEntity.ok(eventoService.createEvento(dto));
    }

    @Operation(summary = "Obtener un evento por ID")
    @ApiResponse(responseCode = "200", description = "Evento encontrado")
    @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> getEvento(@PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(eventoService.getEventoById(id));
    }

    @Operation(summary = "Listar todos los eventos")
    @ApiResponse(responseCode = "200", description = "Lista de eventos obtenida correctamente")
    @GetMapping
    public ResponseEntity<Page<EventoDTO>> getAllEventos(Pageable pageable) {
        return ResponseEntity.ok(eventoService.getAllEventos(pageable));
    }

    @Operation(summary = "Actualizar un evento por ID")
    @ApiResponse(responseCode = "200", description = "Evento actualizado correctamente")
    @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> updateEvento(
            @PathVariable @Min(1) Integer id, 
            @Valid @RequestBody EventoDTO dto) {
        return ResponseEntity.ok(eventoService.updateEvento(id, dto));
    }

    @Operation(summary = "Eliminar un evento por ID")
    @ApiResponse(responseCode = "204", description = "Evento eliminado correctamente")
    @ApiResponse(responseCode = "404", description = "Evento no encontrado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvento(@PathVariable @Min(1) Integer id) {
        eventoService.deleteEvento(id);
        return ResponseEntity.noContent().build();
    }
}