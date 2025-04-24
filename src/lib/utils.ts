
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Coordinates } from "@/types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDistance(point1: Coordinates, point2: Coordinates) {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}
