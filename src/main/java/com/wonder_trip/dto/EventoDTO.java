package com.wonder_trip.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoDTO {

    private Integer idEvento;

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 100, message = "El título no debe exceder los 100 caracteres")
    private String titulo;

    @Size(max = 255, message = "La descripción no debe exceder los 255 caracteres")
    private String descripcion;

    private String fechaInicio;
    private String fechaFin;

    @NotNull(message = "El ID del sitio turístico es obligatorio")
    private Integer idSitio;
}