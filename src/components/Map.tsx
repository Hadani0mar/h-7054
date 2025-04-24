
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapService";
import { Coordinates } from "@/types";

interface MapProps {
  userLocation?: Coordinates;
  driverLocation?: Coordinates;
  pickupLocation?: Coordinates;
  destinationLocation?: Coordinates;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  className?: string;
  interactive?: boolean;
}

const Map = ({
  userLocation,
  driverLocation,
  pickupLocation,
  destinationLocation,
  onMapClick,
  className = "",
  interactive = true,
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [routeSource, setRouteSource] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = getMapboxToken();

    const initialLocation = userLocation || { latitude: 32.887, longitude: 13.191 }; // موقع افتراضي: طرابلس، ليبيا

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLocation.longitude, initialLocation.latitude],
      zoom: 13,
    });

    if (interactive) {
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } else {
      map.current.scrollZoom.disable();
      map.current.boxZoom.disable();
      map.current.dragRotate.disable();
      map.current.dragPan.disable();
      map.current.keyboard.disable();
      map.current.doubleClickZoom.disable();
      map.current.touchZoomRotate.disable();
    }

    map.current.on("load", () => {
      map.current?.resize();

      // إعداد مصدر ومسار للمسار بين النقاط
      map.current?.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: []
          }
        }
      });

      map.current?.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75
        }
      });

      setRouteSource(true);

      if (onMapClick) {
        map.current?.on("click", (e) => {
          onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // تحديث موقع المستخدم
  useEffect(() => {
    if (!map.current || !userLocation) return;
    
    if (!userMarker.current) {
      const el = document.createElement("div");
      el.className = "relative flex h-8 w-8 items-center justify-center";
      el.innerHTML = `
        <div class="absolute h-8 w-8 animate-ping rounded-full bg-blue-400 opacity-75"></div>
        <div class="relative h-6 w-6 rounded-full bg-blue-500 border-2 border-white"></div>
      `;
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userLocation.longitude, userLocation.latitude]);
    }
    
    map.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
    });
  }, [userLocation]);

  // تحديث موقع السائق
  useEffect(() => {
    if (!map.current || !driverLocation) return;
    
    if (!driverMarker.current) {
      const el = document.createElement("div");
      el.className = "relative flex h-8 w-8 items-center justify-center";
      el.innerHTML = `
        <div class="absolute h-8 w-8 animate-ping rounded-full bg-green-400 opacity-75"></div>
        <div class="relative h-6 w-6 rounded-full bg-green-600 border-2 border-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-4 w-4 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-4-4v8m-8 0h12a2 2 0 002-2v-4a2 2 0 00-2-2H8a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
        </div>
      `;
      driverMarker.current = new mapboxgl.Marker(el)
        .setLngLat([driverLocation.longitude, driverLocation.latitude])
        .addTo(map.current);
    } else {
      driverMarker.current.setLngLat([driverLocation.longitude, driverLocation.latitude]);
    }
  }, [driverLocation]);

  // تحديث موقع الانطلاق
  useEffect(() => {
    if (!map.current || !pickupLocation) return;
    
    if (!pickupMarker.current) {
      const el = document.createElement("div");
      el.className = "flex h-10 w-10 items-center justify-center";
      el.innerHTML = `
        <div class="h-10 w-10 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center text-white font-bold">
          A
        </div>
      `;
      pickupMarker.current = new mapboxgl.Marker(el)
        .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
        .addTo(map.current);
    } else {
      pickupMarker.current.setLngLat([pickupLocation.longitude, pickupLocation.latitude]);
    }
  }, [pickupLocation]);

  // تحديث موقع الوصول
  useEffect(() => {
    if (!map.current || !destinationLocation) return;
    
    if (!destinationMarker.current) {
      const el = document.createElement("div");
      el.className = "flex h-10 w-10 items-center justify-center";
      el.innerHTML = `
        <div class="h-10 w-10 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold">
          B
        </div>
      `;
      destinationMarker.current = new mapboxgl.Marker(el)
        .setLngLat([destinationLocation.longitude, destinationLocation.latitude])
        .addTo(map.current);
    } else {
      destinationMarker.current.setLngLat([destinationLocation.longitude, destinationLocation.latitude]);
    }
  }, [destinationLocation]);

  // رسم المسار بين موقع الانطلاق والوصول
  useEffect(() => {
    if (!map.current || !routeSource || !pickupLocation || !destinationLocation) return;

    // تحديث مصدر بيانات المسار
    const routeCoordinates = [
      [pickupLocation.longitude, pickupLocation.latitude],
      [destinationLocation.longitude, destinationLocation.latitude]
    ];
    
    map.current.getSource("route").setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: routeCoordinates
      }
    });

    // ضبط مدى الخريطة ليشمل المسار كامل
    const bounds = new mapboxgl.LngLatBounds()
      .extend([pickupLocation.longitude, pickupLocation.latitude])
      .extend([destinationLocation.longitude, destinationLocation.latitude]);

    map.current.fitBounds(bounds, {
      padding: 100,
      maxZoom: 15
    });
  }, [pickupLocation, destinationLocation, routeSource]);

  return <div ref={mapContainer} className={`w-full h-full min-h-[300px] rounded-lg ${className}`} />;
};

export default Map;
