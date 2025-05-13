package com.wonder_trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImagenDTO {
    private Integer idImagen;
    private String url;
    private Integer idSitio;
    private Integer idEvento;
    private Integer idTour;
    private Integer idReporte;
}