package com.wonder_trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HotelDTO {

    @PositiveOrZero(message = "El ID no puede ser negativo.")
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres.")
    private String nombre;

    @NotBlank(message = "La dirección no puede estar vacía.")
    @Size(max = 150, message = "La dirección no puede tener más de 150 caracteres.")
    private String direccion;

    @Size(max = 1000, message = "La descripción es demasiado larga.")
    private String descripcion;
}
