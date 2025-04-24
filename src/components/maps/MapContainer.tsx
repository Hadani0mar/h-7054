
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '@/types';

interface MapContainerProps {
  userLocation?: Coordinates;
  pickupLocation?: Coordinates;
  destinationLocation?: Coordinates;
  driverLocation?: Coordinates;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

const MapContainer = ({
  userLocation,
  pickupLocation,
  destinationLocation,
  driverLocation,
  onMapClick,
}: MapContainerProps) => {
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

      if (onMapClick) {
        mapRef.current.on('click', (e) => {
          onMapClick({ lng: e.latlng.lng, lat: e.latlng.lat });
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation, onMapClick]);

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

    if (pickupLocation) {
      L.marker([pickupLocation.latitude, pickupLocation.longitude], {
        icon: L.divIcon({
          className: 'pickup-marker',
          html: '<div class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>'
        })
      }).addTo(map);
    }

    if (destinationLocation) {
      L.marker([destinationLocation.latitude, destinationLocation.longitude], {
        icon: L.divIcon({
          className: 'destination-marker',
          html: '<div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>'
        })
      }).addTo(map);
    }

    if (driverLocation) {
      L.marker([driverLocation.latitude, driverLocation.longitude], {
        icon: L.divIcon({
          className: 'driver-marker',
          html: '<div class="w-5 h-5 rounded-full bg-yellow-500 border-2 border-white shadow-md flex items-center justify-center"><svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg></div>'
        })
      }).addTo(map);
    }

    if (pickupLocation && destinationLocation) {
      const bounds = L.latLngBounds(
        [pickupLocation.latitude, pickupLocation.longitude],
        [destinationLocation.latitude, destinationLocation.longitude]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, pickupLocation, destinationLocation, driverLocation]);

  return (
    <div id="map" className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '100%' }} />
  );
};

export default MapContainer;
