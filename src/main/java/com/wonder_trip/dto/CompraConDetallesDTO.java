package com.wonder_trip.dto;

import java.time.LocalDate;

import com.wonder_trip.model.MetodoPago;

import lombok.Data;

@Data
public class CompraConDetallesDTO {
    private Integer id;
    private LocalDate fechaCompra;
    private MetodoPago metodoPago;
    private PaqueteDTO paquete;
    private UsuarioDTO usuario;
}