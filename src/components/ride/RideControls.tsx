
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Car } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { searchLocation, reverseGeocode } from '@/lib/mapService';
import { Coordinates, MapboxLocation } from '@/types';
import { toast } from 'sonner';

interface RideControlsProps {
  profile: any;
  pickupLocation?: Coordinates;
  destinationLocation?: Coordinates;
  pickupAddress: string;
  destinationAddress: string;
  onPickupSelect: (location: MapboxLocation) => void;
  onDestinationSelect: (location: MapboxLocation) => void;
  onCreateRide: () => void;
  isCreatingRide: boolean;
}

const RideControls = ({
  profile,
  pickupLocation,
  destinationLocation,
  pickupAddress,
  destinationAddress,
  onPickupSelect,
  onDestinationSelect,
  onCreateRide,
  isCreatingRide
}: RideControlsProps) => {
  const [pickupSearch, setPickupSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [pickupResults, setPickupResults] = useState<MapboxLocation[]>([]);
  const [destinationResults, setDestinationResults] = useState<MapboxLocation[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);

  const handlePickupSearch = async () => {
    if (!pickupSearch.trim()) return;
    
    try {
      setIsSearchingPickup(true);
      const results = await searchLocation(pickupSearch);
      setPickupResults(results);
    } catch (error) {
      console.error("خطأ في البحث عن موقع الانطلاق:", error);
      toast.error("فشل في البحث عن الموقع");
    } finally {
      setIsSearchingPickup(false);
    }
  };

  const handleDestinationSearch = async () => {
    if (!destinationSearch.trim()) return;
    
    try {
      setIsSearchingDestination(true);
      const results = await searchLocation(destinationSearch);
      setDestinationResults(results);
    } catch (error) {
      console.error("خطأ في البحث عن موقع الوصول:", error);
      toast.error("فشل في البحث عن الموقع");
    } finally {
      setIsSearchingDestination(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تفاصيل الرحلة</CardTitle>
        <CardDescription>اختر مواقع الانطلاق والوصول</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">موقع الانطلاق</label>
          <div className="relative">
            <Input
              placeholder="ابحث عن موقع الانطلاق"
              value={pickupSearch}
              onChange={(e) => setPickupSearch(e.target.value)}
              className="pr-10"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
              onClick={handlePickupSearch}
              disabled={isSearchingPickup}
            >
              {isSearchingPickup ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {pickupLocation && (
            <div className="flex items-start bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <MapPin className="h-4 w-4 mt-0.5 mr-1 text-blue-500" />
              <p className="text-sm">{pickupAddress || 'الموقع المحدد'}</p>
            </div>
          )}
          {pickupResults.length > 0 && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-60 overflow-y-auto">
              {pickupResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start"
                  onClick={() => {
                    onPickupSelect(result);
                    setPickupResults([]);
                    setPickupSearch("");
                  }}
                >
                  <MapPin className="h-4 w-4 mt-0.5 mr-1 text-blue-500" />
                  <span className="text-sm">{result.placeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">موقع الوصول</label>
          <div className="relative">
            <Input
              placeholder="ابحث عن موقع الوصول"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              className="pr-10"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3"
              onClick={handleDestinationSearch}
              disabled={isSearchingDestination}
            >
              {isSearchingDestination ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {destinationLocation && (
            <div className="flex items-start bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <MapPin className="h-4 w-4 mt-0.5 mr-1 text-red-500" />
              <p className="text-sm">{destinationAddress || 'الموقع المحدد'}</p>
            </div>
          )}
          {destinationResults.length > 0 && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-60 overflow-y-auto">
              {destinationResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start"
                  onClick={() => {
                    onDestinationSelect(result);
                    setDestinationResults([]);
                    setDestinationSearch("");
                  }}
                >
                  <MapPin className="h-4 w-4 mt-0.5 mr-1 text-red-500" />
                  <span className="text-sm">{result.placeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">السعر التقريبي:</span>
            <span className="font-medium">10.00 د.ل</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">الرصيد:</span>
            <span className="font-medium">{profile?.wallet_balance?.toFixed(2) || '0.00'} د.ل</span>
          </div>
        </div>
        
        <Button
          className="w-full mt-4"
          disabled={!pickupLocation || !destinationLocation || isCreatingRide}
          onClick={onCreateRide}
        >
          {isCreatingRide ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Car className="h-4 w-4 mr-2" />
          )}
          طلب رحلة
        </Button>
        
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-2">
          يمكنك تحديد المواقع بالضغط على الخريطة
        </p>
      </CardContent>
    </Card>
  );
};

export default RideControls;
