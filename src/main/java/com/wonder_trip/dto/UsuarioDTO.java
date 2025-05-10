package com.wonder_trip.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioDTO {

    @PositiveOrZero(message = "El ID no puede ser negativo.")
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres.")
    private String nombre;

    @NotBlank(message = "El sexo no puede estar vacío.")
    @Pattern(regexp = "^(Masculino|Femenino|Otro)$", message = "Sexo debe ser Masculino, Femenino u Otro.")
    private String sexo;

    @NotBlank(message = "El correo no puede estar vacío.")
    @Email(message = "Correo inválido.")
    @Size(max = 100, message = "El correo no puede tener más de 100 caracteres.")
    private String correo;

    @NotBlank(message = "La contraseña no puede estar vacía.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    private String contrasena;

    @NotBlank(message = "El rol no puede estar vacío.")
    @Pattern(regexp = "^(ADMINISTRADOR|USUARIO)$", message = "Rol debe ser ADMINISTRADOR o USUARIO.")
    private String rol;
    
    private List<ReporteDTO> reportes;

}