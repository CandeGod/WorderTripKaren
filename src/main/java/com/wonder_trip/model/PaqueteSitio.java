package com.wonder_trip.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paquete_sitios")
@Data
@NoArgsConstructor
@IdClass(PaqueteSitioId.class)
public class PaqueteSitio {

    @Id
    @Column(name = "id_paquete")
    private Integer paqueteId;

    @Id
    @Column(name = "id_sitio")
    private Integer sitioId;
}