package com.wonder_trip.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class PaqueteConSitiosDTO {

    private Integer id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private List<SitioTuristicoDTO> sitios;
}
