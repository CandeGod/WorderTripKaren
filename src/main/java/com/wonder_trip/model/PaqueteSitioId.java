package com.wonder_trip.model;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaqueteSitioId implements Serializable {
    private Integer paqueteId;
    private Integer sitioId;
}