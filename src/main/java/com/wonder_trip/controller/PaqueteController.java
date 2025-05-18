package com.wonder_trip.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wonder_trip.dto.PaqueteConSitiosDTO;
import com.wonder_trip.dto.PaqueteDTO;
import com.wonder_trip.dto.PaqueteSitioDTO;
import com.wonder_trip.service.IPaqueteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/paquetes")
@Tag(name = "Paquetes Turísticos", description = "Gestión completa de paquetes turísticos y su relación con sitios de interés")
public class PaqueteController {

    private final IPaqueteService service;

    public PaqueteController(IPaqueteService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Obtener todos los paquetes", description = "Retorna una lista de todos los paquetes turísticos disponibles")
    @ApiResponse(responseCode = "200", description = "Lista de paquetes encontrada", content = @Content(schema = @Schema(implementation = PaqueteDTO.class)))
    public ResponseEntity<List<PaqueteDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/con-sitios")
    @Operation(summary = "Obtener paquetes con sitios incluidos", description = "Retorna paquetes con la información completa de los sitios turísticos que incluyen")
    @ApiResponse(responseCode = "200", description = "Lista de paquetes con sitios encontrada", content = @Content(schema = @Schema(implementation = PaqueteConSitiosDTO.class)))
    public ResponseEntity<List<PaqueteConSitiosDTO>> getAllWithSitios() {
        return ResponseEntity.ok(service.getAllWithSitios());
    }

    @GetMapping("/por-sitio/{idSitio}")
    @Operation(summary = "Buscar paquetes por sitio", description = "Retorna los paquetes que incluyen un sitio turístico específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paquetes encontrados"),
            @ApiResponse(responseCode = "404", description = "Sitio no encontrado")
    })
    public ResponseEntity<List<PaqueteConSitiosDTO>> getBySitio(
            @Parameter(description = "ID del sitio turístico", example = "1", required = true) @PathVariable Integer idSitio) {
        return ResponseEntity.ok(service.findBySitio(idSitio));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener paquete por ID", description = "Retorna los detalles básicos de un paquete específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paquete encontrado"),
            @ApiResponse(responseCode = "404", description = "Paquete no encontrado")
    })
    public ResponseEntity<PaqueteDTO> getById(
            @Parameter(description = "ID del paquete", example = "1", required = true) @PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/con-sitios")
    @Operation(summary = "Obtener paquete con sitios por ID", description = "Retorna un paquete específico con la lista completa de sitios incluidos")
    @ApiResponse(responseCode = "200", description = "Paquete con sitios encontrado", content = @Content(schema = @Schema(implementation = PaqueteConSitiosDTO.class)))
    public ResponseEntity<PaqueteConSitiosDTO> getByIdConSitios(
            @Parameter(description = "ID del paquete", example = "1", required = true) @PathVariable Integer id) {
        return ResponseEntity.ok(service.getConSitiosById(id));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo paquete", description = "Registra un nuevo paquete turístico en el sistema")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Paquete creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<PaqueteDTO> create(
            @Parameter(description = "Datos del paquete a crear", required = true) @RequestBody @Valid PaqueteDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar paquete", description = "Actualiza la información de un paquete existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paquete actualizado"),
            @ApiResponse(responseCode = "404", description = "Paquete no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<PaqueteDTO> update(
            @Parameter(description = "ID del paquete a actualizar", example = "1", required = true) @PathVariable Integer id,
            @Parameter(description = "Datos actualizados del paquete", required = true) @RequestBody @Valid PaqueteDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar paquete", description = "Elimina un paquete del sistema")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Paquete eliminado"),
            @ApiResponse(responseCode = "404", description = "Paquete no encontrado")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID del paquete a eliminar", example = "1", required = true) @PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/agregar-sitio")
    @Operation(summary = "Agregar sitio a paquete", description = "Añade un sitio turístico a un paquete existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sitio agregado al paquete"),
            @ApiResponse(responseCode = "404", description = "Paquete o sitio no encontrado"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<Void> addSitio(
            @Parameter(description = "Relación paquete-sitio a crear", required = true) @RequestBody @Valid PaqueteSitioDTO dto) {
        service.addSitioToPaquete(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remover-sitio")
    @Operation(summary = "Remover sitio de paquete", description = "Elimina un sitio turístico de un paquete existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sitio removido del paquete"),
            @ApiResponse(responseCode = "404", description = "Relación paquete-sitio no encontrada"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<Void> removeSitio(
            @Parameter(description = "Relación paquete-sitio a eliminar", required = true) @RequestBody @Valid PaqueteSitioDTO dto) {
        service.removeSitioFromPaquete(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/paginado")
    @Operation(summary = "Obtener paquetes turísticos paginados", description = "Retorna una página de paquetes turísticos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de paquetes encontrada")
    })
    public ResponseEntity<Page<PaqueteDTO>> getPaged(
            @Parameter(description = "Número de página", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de la página", example = "20") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.getAllPaged(pageable));
    }

}