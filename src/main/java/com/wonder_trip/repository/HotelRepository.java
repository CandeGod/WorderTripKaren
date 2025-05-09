package com.wonder_trip.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wonder_trip.model.Hotel;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Integer> {
}