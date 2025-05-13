package com.wonder_trip.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sitios_turisticos")
@Getter
@Setter
@NoArgsConstructor
public class SitioTuristico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sitio")
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(length = 150)
    private String ubicacion;

    @ManyToOne
    @JoinColumn(name = "id_hotel")
    private Hotel hotel;

    @Column(name = "imagen_principal", nullable = false)
    private String imagenPrincipal;
}