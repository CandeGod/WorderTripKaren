package com.wonder_trip.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tours")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tour")
    private Integer idTour;

    @Column(length = 100, nullable = false)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    private Integer duracion;
    private BigDecimal precio;

    @ManyToOne
    @JoinColumn(name = "id_sitio")
    private SitioTuristico sitioTuristico;

    @Column(name = "imagen_portada")
    private String imagenPortada; 
}
