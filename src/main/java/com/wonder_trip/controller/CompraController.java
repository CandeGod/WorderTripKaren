package com.wonder_trip.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wonder_trip.dto.CompraConDetallesDTO;
import com.wonder_trip.dto.CompraDTO;
import com.wonder_trip.service.ICompraService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
@Tag(name = "Compras", description = "Operaciones relacionadas con compras")
public class CompraController {

    private final ICompraService service;

    @Operation(summary = "Crear una nueva compra")
    @PostMapping
    public ResponseEntity<CompraConDetallesDTO> crear(@Valid @RequestBody CompraDTO dto) {
        return ResponseEntity.ok(service.createCompra(dto));
    }

    @Operation(summary = "Obtener compras de un usuario")
    @ApiResponse(responseCode = "200", description = "Lista de compras del usuario")
    @GetMapping("/{id}/compras")
    public ResponseEntity<List<CompraConDetallesDTO>> getComprasByUsuarioId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getComprasByUsuarioId(id));
    }

    @Operation(summary = "Obtener una compra por ID")
    @GetMapping("/{id}")
    public ResponseEntity<CompraConDetallesDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getCompraById(id));
    }

    @Operation(summary = "Listar compras por usuario")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CompraConDetallesDTO>> getByUsuario(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(service.getComprasPorUsuario(usuarioId));
    }

    @Operation(summary = "Listar compras por rango de fechas")
    @GetMapping("/fechas")
    public ResponseEntity<List<CompraConDetallesDTO>> getByFechas(@RequestParam LocalDate inicio,
            @RequestParam LocalDate fin) {
        return ResponseEntity.ok(service.getComprasPorRangoFechas(inicio, fin));
    }

    @Operation(summary = "Eliminar una compra por ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        service.deleteCompra(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obtener la suma total de todas las compras")
    @GetMapping("/suma-total")
    public ResponseEntity<BigDecimal> getSumaTotalCompras() {
        return ResponseEntity.ok(service.getSumaTotalCompras());
    }

    @Operation(summary = "Listar todas las compras con paginación")
    @GetMapping
    public ResponseEntity<Page<CompraConDetallesDTO>> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaCompra") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(service.getAllComprasPaginado(pageable));
    }

    @Operation(summary = "Obtener la suma total de compras de un usuario")
    @GetMapping("/suma-total/usuario/{usuarioId}")
    public ResponseEntity<BigDecimal> getSumaTotalPorUsuario(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(service.getSumaTotalPorUsuario(usuarioId));
    }

    @Operation(summary = "Contar el número de compras de un usuario")
    @GetMapping("/usuario/{usuarioId}/conteo")
    public ResponseEntity<Long> contarComprasPorUsuario(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(service.contarComprasPorUsuario(usuarioId));
    }

}
