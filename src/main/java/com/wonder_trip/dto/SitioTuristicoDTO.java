package com.wonder_trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SitioTuristicoDTO {

    @PositiveOrZero(message = "El ID no puede ser negativo.")
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(max = 100, message = "El nombre no debe superar los 100 caracteres.")
    private String nombre;

    @Size(max = 255, message = "La descripción no debe superar los 255 caracteres.")
    private String descripcion;

    @Size(max = 150, message = "La ubicación no debe superar los 150 caracteres.")
    private String ubicacion;

    @NotNull(message = "Debe especificarse el ID del hotel.")
    @Positive(message = "El ID del hotel debe ser un número positivo.")
    private Integer hotelId;

     @NotBlank(message = "La imagen principal es obligatoria")
    private String imagenPrincipal;
}
