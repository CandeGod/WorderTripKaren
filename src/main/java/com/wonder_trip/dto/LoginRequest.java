package com.wonder_trip.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String correo;
    private String contrasena;
    private String rol;
}