package com.wonder_trip.repository;

import com.wonder_trip.model.TouristSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TouristSiteRepository extends JpaRepository<TouristSite, Integer> {
    List<TouristSite> findByHotelId(Integer hotelId);
}
