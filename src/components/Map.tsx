
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '@/types';

interface MapProps {
  userLocation?: Coordinates;
}

const Map = ({ userLocation }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const initialLocation = userLocation || {
        latitude: 32.8872,
        longitude: 13.1913,
      };

      mapRef.current = L.map('map').setView(
        [initialLocation.latitude, initialLocation.longitude],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (userLocation) {
      L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.divIcon({
          className: 'user-marker',
          html: '<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>'
        })
      }).addTo(map);
    }
  }, [userLocation]);

  return (
    <div id="map" className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '100%' }} />
  );
};

export default Map;
