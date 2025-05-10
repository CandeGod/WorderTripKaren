package com.wonder_trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteDTO {

    private Integer idReporte;

    @NotBlank(message = "El título no puede estar en blanco")
    @Size(max = 100, message = "El título no debe exceder los 100 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción no puede estar en blanco")
    @Size(max = 500, message = "La descripción no debe exceder los 500 caracteres")
    private String descripcion;

    @NotBlank(message = "La fecha no puede estar en blanco")
    private String fecha; // Se convertirá a LocalDate en el servicio

    private Integer idUsuario;
}