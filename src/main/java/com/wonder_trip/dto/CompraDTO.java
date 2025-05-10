package com.wonder_trip.dto;

import java.time.LocalDate;

import com.wonder_trip.model.MetodoPago;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

@Data
public class CompraDTO {
    
    @PastOrPresent(message = "La fecha no puede ser futura.")
    private LocalDate fechaCompra;

    @NotNull(message = "El método de pago es obligatorio.")
    private MetodoPago metodoPago;

    @NotNull(message = "El ID del paquete es obligatorio.")
    private Integer paqueteId;

    @NotNull(message = "El ID del usuario es obligatorio.")
    private Integer usuarioId;
}