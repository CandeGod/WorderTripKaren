package com.wonder_trip.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PaqueteDTO {

    @PositiveOrZero
    private Integer id;

    @NotBlank
    @Size(max = 100)
    private String nombre;

    private String descripcion;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser positivo.")
    private BigDecimal precio;
}
