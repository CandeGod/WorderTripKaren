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

import com.wonder_trip.dto.LoginRequest;
import com.wonder_trip.dto.UsuarioDTO;
import com.wonder_trip.service.IUsuarioService;
import com.wonder_trip.service.impl.UsuarioServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Operaciones relacionadas con usuarios")
public class UsuarioController {

    private final IUsuarioService service;
    private final UsuarioServiceImpl serviceimpl;

    @Operation(summary = "Crear un nuevo usuario")
    @ApiResponse(responseCode = "200", description = "Usuario creado exitosamente")
    @PostMapping
    public ResponseEntity<UsuarioDTO> createUsuario(@Valid @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(service.createUsuario(dto));
    }

    @Operation(summary = "Obtener un usuario por ID")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getUsuario(@PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(service.getUsuarioById(id));
    }

    @Operation(summary = "Listar todos los usuarios")
    @ApiResponse(responseCode = "200", description = "Lista de usuarios")
    @GetMapping
    public ResponseEntity<Page<UsuarioDTO>> getAllUsuarios(Pageable pageable) {
        return ResponseEntity.ok(service.getAllUsuarios(pageable));
    }

    @Operation(summary = "Actualizar un usuario por ID")
    @ApiResponse(responseCode = "200", description = "Usuario actualizado")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> updateUsuario(@PathVariable @Min(1) Integer id, @Valid @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(service.updateUsuario(id, dto));
    }

    @Operation(summary = "Eliminar un usuario por ID")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable @Min(1) Integer id) {
        service.deleteUsuario(id);
        return ResponseEntity.noContent().build();
    }


     @Operation(summary = "Autenticar un usuario")
    @ApiResponse(responseCode = "200", description = "Usuario autenticado")
    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> loginUsuario(@RequestBody LoginRequest loginRequest) {
        // Validar las credenciales (correo y contraseña) y obtener el usuario con su rol
        UsuarioDTO usuarioDTO = serviceimpl.authenticateUser(loginRequest.getCorreo(), loginRequest.getContrasena(), loginRequest.getRol());
        
        if (usuarioDTO != null) {
            return ResponseEntity.ok(usuarioDTO);  // Autenticación exitosa
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);  // Credenciales incorrectas
        }
    }
}
