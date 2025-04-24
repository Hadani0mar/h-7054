
import { MapboxLocation } from "@/types";
import { toast } from "sonner";

// استخدم هذا المفتاح البديل للتطوير المحلي. للإنتاج، يجب استخدام مفتاح بيئي
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYm4wbWFyIiwiYSI6ImNscXhlZXVmdzFqY2kyam1xZ2x0eW85ZHQifQ.vGD9nLuMsFhwdMhbIMCdAw';

export function getMapboxToken() {
  return MAPBOX_ACCESS_TOKEN;
}

export async function searchLocation(query: string): Promise<MapboxLocation[]> {
  try {
    if (!query.trim()) return [];

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=ar&country=ly`
    );

    if (!response.ok) {
      throw new Error(`خطأ في البحث: ${response.statusText}`);
    }

    const data = await response.json();

    return data.features.map((feature: any) => ({
      placeName: feature.place_name,
      center: feature.center as [number, number]
    }));
  } catch (error) {
    console.error('خطأ في البحث عن المواقع:', error);
    toast.error('فشل في البحث عن المواقع');
    return [];
  }
}

export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=ar`
    );

    if (!response.ok) {
      throw new Error(`خطأ في التحويل العكسي: ${response.statusText}`);
    }

    const data = await response.json();

    return data.features[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('خطأ في التحويل العكسي للإحداثيات:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

export async function getRoute(start: [number, number], end: [number, number]) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`خطأ في الحصول على المسار: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.routes[0];
  } catch (error) {
    console.error('خطأ في الحصول على المسار:', error);
    toast.error('فشل في حساب المسار');
    return null;
  }
}
