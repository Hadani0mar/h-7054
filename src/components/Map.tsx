
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Coordinates } from "@/types";
import { getMapboxToken } from "@/lib/mapService";

// تكوين Mapbox - استخدام التوكن من mapService
mapboxgl.accessToken = getMapboxToken();

interface MapProps {
  userLocation?: Coordinates;
  pickupLocation?: Coordinates;
  destinationLocation?: Coordinates;
  driverLocation?: Coordinates;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

const Map: React.FC<MapProps> = ({
  userLocation,
  pickupLocation,
  destinationLocation,
  driverLocation,
  onMapClick,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // تهيئة الخريطة
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialLocation = userLocation || {
      latitude: 32.8872,
      longitude: 13.1913, // إحداثيات طرابلس كموقع افتراضي
    };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLocation.longitude, initialLocation.latitude],
      zoom: 13,
    });

    map.current.on("load", () => {
      setMapInitialized(true);
    });

    if (onMapClick) {
      map.current.on("click", (e) => {
        onMapClick(e.lngLat);
      });
    }

    // إضافة أزرار التحكم في الخريطة
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      "top-right"
    );

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation, onMapClick]);

  // إضافة موقع المستخدم
  useEffect(() => {
    if (!map.current || !mapInitialized || !userLocation) return;

    // إزالة الماركر القديم إن وجد
    const userMarkerElement = document.getElementById("user-marker");
    if (userMarkerElement) {
      userMarkerElement.remove();
    }

    // إنشاء عنصر HTML للماركر
    const markerElement = document.createElement("div");
    markerElement.id = "user-marker";
    markerElement.className = "user-marker";
    markerElement.style.width = "20px";
    markerElement.style.height = "20px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.backgroundColor = "#4F46E5";
    markerElement.style.border = "3px solid white";
    markerElement.style.boxShadow = "0 0 0 2px rgba(0, 0, 0, 0.1)";

    // إضافة الماركر إلى الخريطة
    new mapboxgl.Marker(markerElement)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map.current);

    // تحريك الخريطة إلى موقع المستخدم إذا لم يتم تحديد مواقع أخرى
    if (!pickupLocation && !destinationLocation) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        speed: 1.5,
      });
    }
  }, [userLocation, mapInitialized, pickupLocation, destinationLocation]);

  // إضافة موقع السائق
  useEffect(() => {
    if (!map.current || !mapInitialized || !driverLocation) return;

    // إزالة الماركر القديم إن وجد
    const driverMarkerElement = document.getElementById("driver-marker");
    if (driverMarkerElement) {
      driverMarkerElement.remove();
    }

    // إنشاء عنصر HTML للماركر
    const markerElement = document.createElement("div");
    markerElement.id = "driver-marker";
    markerElement.className = "driver-marker";
    markerElement.style.width = "24px";
    markerElement.style.height = "24px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.backgroundColor = "#10B981";
    markerElement.style.border = "3px solid white";
    markerElement.style.boxShadow = "0 0 0 2px rgba(0, 0, 0, 0.1)";
    markerElement.style.display = "flex";
    markerElement.style.alignItems = "center";
    markerElement.style.justifyContent = "center";

    // إضافة أيقونة السيارة
    const carIcon = document.createElement("div");
    carIcon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
        <circle cx="6.5" cy="16.5" r="2.5"></circle>
        <circle cx="16.5" cy="16.5" r="2.5"></circle>
      </svg>
    `;
    markerElement.appendChild(carIcon);

    // إضافة الماركر إلى الخريطة
    new mapboxgl.Marker(markerElement)
      .setLngLat([driverLocation.longitude, driverLocation.latitude])
      .addTo(map.current);
  }, [driverLocation, mapInitialized]);

  // إضافة موقع الانطلاق
  useEffect(() => {
    if (!map.current || !mapInitialized || !pickupLocation) return;

    // إزالة الماركر القديم إن وجد
    const pickupMarkerElement = document.getElementById("pickup-marker");
    if (pickupMarkerElement) {
      pickupMarkerElement.remove();
    }

    // إنشاء عنصر HTML للماركر
    const markerElement = document.createElement("div");
    markerElement.id = "pickup-marker";
    markerElement.className = "pickup-marker";
    markerElement.style.width = "22px";
    markerElement.style.height = "22px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.backgroundColor = "#3B82F6";
    markerElement.style.border = "3px solid white";
    markerElement.style.boxShadow = "0 0 0 2px rgba(0, 0, 0, 0.1)";

    // إضافة الماركر إلى الخريطة
    new mapboxgl.Marker(markerElement)
      .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
      .addTo(map.current);

    // إضافة مسار إذا كان هناك موقع وصول
    if (destinationLocation) {
      drawRoute(
        [pickupLocation.longitude, pickupLocation.latitude],
        [destinationLocation.longitude, destinationLocation.latitude]
      );
    } else {
      // تحريك الخريطة إلى موقع الانطلاق
      map.current.flyTo({
        center: [pickupLocation.longitude, pickupLocation.latitude],
        zoom: 15,
        speed: 1.5,
      });
    }
  }, [pickupLocation, destinationLocation, mapInitialized]);

  // إضافة موقع الوصول
  useEffect(() => {
    if (!map.current || !mapInitialized || !destinationLocation) return;

    // إزالة الماركر القديم إن وجد
    const destinationMarkerElement = document.getElementById(
      "destination-marker"
    );
    if (destinationMarkerElement) {
      destinationMarkerElement.remove();
    }

    // إنشاء عنصر HTML للماركر
    const markerElement = document.createElement("div");
    markerElement.id = "destination-marker";
    markerElement.className = "destination-marker";
    markerElement.style.width = "22px";
    markerElement.style.height = "22px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.backgroundColor = "#EF4444";
    markerElement.style.border = "3px solid white";
    markerElement.style.boxShadow = "0 0 0 2px rgba(0, 0, 0, 0.1)";

    // إضافة الماركر إلى الخريطة
    new mapboxgl.Marker(markerElement)
      .setLngLat([destinationLocation.longitude, destinationLocation.latitude])
      .addTo(map.current);

    // إضافة مسار إذا كان هناك موقع انطلاق
    if (pickupLocation) {
      drawRoute(
        [pickupLocation.longitude, pickupLocation.latitude],
        [destinationLocation.longitude, destinationLocation.latitude]
      );
    } else {
      // تحريك الخريطة إلى موقع الوصول
      map.current.flyTo({
        center: [destinationLocation.longitude, destinationLocation.latitude],
        zoom: 15,
        speed: 1.5,
      });
    }
  }, [destinationLocation, pickupLocation, mapInitialized]);

  // رسم المسار بين نقطتين
  const drawRoute = (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    // إزالة المسار القديم إن وجد
    if (map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    // الحصول على المسار من Mapbox Directions API
    fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (!data.routes || !data.routes.length) return;

        const route = data.routes[0].geometry;

        // إضافة مصدر وطبقة للمسار
        if (map.current) {
          if (!map.current.getSource("route")) {
            map.current.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route,
              },
            });

            map.current.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#4F46E5",
                "line-width": 6,
                "line-opacity": 0.75,
              },
            });
          } else {
            // تحديث المسار إذا كان موجوداً بالفعل
            const source = map.current.getSource("route") as mapboxgl.GeoJSONSource;
            source.setData({
              type: "Feature",
              properties: {},
              geometry: route,
            });
          }

          // ضبط الخريطة لتظهر المسار كاملاً
          const bounds = new mapboxgl.LngLatBounds()
            .extend([start[0], start[1]])
            .extend([end[0], end[1]]);

          map.current.fitBounds(bounds, {
            padding: 100,
            maxZoom: 15,
            duration: 1000,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching directions:", error);
      });
  };

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: "100%" }}
    />
  );
};

export default Map;
