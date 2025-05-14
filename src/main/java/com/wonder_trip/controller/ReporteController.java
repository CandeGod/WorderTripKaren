package com.wonder_trip.controller;


import com.wonder_trip.dto.ReporteDTO;
import com.wonder_trip.service.IReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Operaciones relacionadas con reportes")
public class ReporteController {

    private final IReporteService reporteService;

    @Operation(summary = "Crear un nuevo reporte")
    @PostMapping
    public ResponseEntity<ReporteDTO> create(@Valid @RequestBody ReporteDTO dto) {
        return ResponseEntity.ok(reporteService.create(dto));
    }

    @Operation(summary = "Obtener un reporte por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<ReporteDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(reporteService.getById(id));
    }

    @Operation(summary = "Obtener todos los reportes con paginación")
    @GetMapping
    public ResponseEntity<Page<ReporteDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(reporteService.getAll(pageable));
    }

    @Operation(summary = "Actualizar un reporte existente")
    @PutMapping("/{id}")
    public ResponseEntity<ReporteDTO> update(@PathVariable Integer id, @Valid @RequestBody ReporteDTO dto) {
        return ResponseEntity.ok(reporteService.update(id, dto));
    }

    @Operation(summary = "Eliminar un reporte por su ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        reporteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener reportes por ID de usuario")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Page<ReporteDTO>> getByUsuarioId(
            @PathVariable Integer usuarioId,
            Pageable pageable) {
        return ResponseEntity.ok(reporteService.getByUsuarioId(usuarioId, pageable));
    }
}