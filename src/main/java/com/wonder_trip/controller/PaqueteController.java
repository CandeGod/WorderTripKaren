package com.wonder_trip.controller;

import java.util.List;

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

import com.wonder_trip.dto.PaqueteConSitiosDTO;
import com.wonder_trip.dto.PaqueteDTO;
import com.wonder_trip.dto.PaqueteSitioDTO;
import com.wonder_trip.service.IPaqueteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/paquetes")
@Tag(name = "Paquetes", description = "Operaciones relacionadas con paquetes turísticos")
public class PaqueteController {

    private final IPaqueteService service;

    public PaqueteController(IPaqueteService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar todos los paquetes")
    public ResponseEntity<List<PaqueteDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/con-sitios")
    @Operation(summary = "Listar todos los paquetes con sitios incluidos")
    public ResponseEntity<List<PaqueteConSitiosDTO>> getAllWithSitios() {
        return ResponseEntity.ok(service.getAllWithSitios());
    }

    @GetMapping("/por-sitio/{idSitio}")
    @Operation(summary = "Buscar paquetes que contienen un sitio específico")
    public ResponseEntity<List<PaqueteConSitiosDTO>> getBySitio(@PathVariable Integer idSitio) {
        return ResponseEntity.ok(service.findBySitio(idSitio));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaqueteDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<PaqueteDTO> create(@RequestBody @Valid PaqueteDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaqueteDTO> update(@PathVariable Integer id, @RequestBody @Valid PaqueteDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/agregar-sitio")
    public ResponseEntity<Void> addSitio(@RequestBody @Valid PaqueteSitioDTO dto) {
        service.addSitioToPaquete(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remover-sitio")
    public ResponseEntity<Void> removeSitio(@RequestBody @Valid PaqueteSitioDTO dto) {
        service.removeSitioFromPaquete(dto);
        return ResponseEntity.ok().build();
    }
}
