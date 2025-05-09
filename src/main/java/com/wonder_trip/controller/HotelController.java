package com.wonder_trip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wonder_trip.model.Hotel;
import com.wonder_trip.service.HotelService;

import java.util.List;

@RestController
@RequestMapping("/api/hoteles")
public class HotelController {

    private final HotelService service;

    public HotelController(HotelService service) {
        this.service = service;
    }

    @GetMapping
    public List<Hotel> getAll() {
        return service.getAllHotels();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getHotelById(id));
    }

    @PostMapping
    public ResponseEntity<Hotel> create(@RequestBody Hotel hotel) {
        return ResponseEntity.ok(service.createHotel(hotel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Hotel> update(@PathVariable Integer id, @RequestBody Hotel hotel) {
        return ResponseEntity.ok(service.updateHotel(id, hotel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}