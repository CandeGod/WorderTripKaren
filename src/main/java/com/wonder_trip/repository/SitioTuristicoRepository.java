package com.wonder_trip.repository;

import com.wonder_trip.model.SitioTuristico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SitioTuristicoRepository extends JpaRepository<SitioTuristico , Integer> {
    List<SitioTuristico > findByHotelId(Integer hotelId);
}
