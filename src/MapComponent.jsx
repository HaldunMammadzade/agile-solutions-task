import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapComponent({ latitude, longitude }) {
  useEffect(() => {
    const map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

   
    const customIcon = L.icon({
      iconUrl: 'https://www.svgrepo.com/show/302636/map-marker.svg',
      iconSize: [10, 32], 
      iconAnchor: [16, 32], 
    });

    
    L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div id="map" style={{ height: '400px', width: "100%", marginTop: "30px", borderRadius:  "20px" }}></div>;
}

export default MapComponent;
