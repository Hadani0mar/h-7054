
import { Database } from "@/integrations/supabase/types";

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Ride = Database['public']['Tables']['rides']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];

export type UserType = 'driver' | 'rider';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type RideStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type MapboxLocation = {
  placeName: string;
  center: [number, number]; // [longitude, latitude]
};
