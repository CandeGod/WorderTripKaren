package com.wonder_trip.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaqueteSitioDTO {

    @NotNull
    private Integer paqueteId;

    @NotNull
    private Integer sitioId;
}
