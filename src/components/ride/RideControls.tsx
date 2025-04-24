
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Car, Route, Navigation, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { searchLocation, reverseGeocode, getRoute } from '@/lib/mapService';
import { Coordinates, MapboxLocation } from '@/types';
import { toast } from 'sonner';
import { calculateDistance } from '@/lib/utils';

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
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);

  // حساب المسافة والسعر والمدة عند تحديد موقع الانطلاق والوصول
  useEffect(() => {
    if (pickupLocation && destinationLocation) {
      // حساب المسافة بين موقع الانطلاق والوصول
      const distance = calculateDistance(
        pickupLocation,
        destinationLocation
      );
      
      setEstimatedDistance(distance);
      
      // حساب السعر التقريبي (نفس الخوارزمية المستخدمة في rideService)
      const basePrice = 5;
      const pricePerKm = 1.5;
      const totalPrice = basePrice + (distance * pricePerKm);
      const roundedPrice = Math.round(totalPrice * 2) / 2;
      
      setEstimatedPrice(roundedPrice);
      
      // حساب المدة التقريبية (افتراض متوسط سرعة 30 كم/ساعة)
      const speedKmPerHour = 30;
      const durationHours = distance / speedKmPerHour;
      const durationMinutes = Math.round(durationHours * 60);
      
      setEstimatedDuration(durationMinutes);
    } else {
      setEstimatedDistance(null);
      setEstimatedPrice(null);
      setEstimatedDuration(null);
    }
  }, [pickupLocation, destinationLocation]);

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
              onKeyPress={(e) => e.key === 'Enter' && handlePickupSearch()}
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
              <div className="mr-2 mt-1">
                <div className="bg-blue-500 h-4 w-4 rounded-full"></div>
              </div>
              <p className="text-sm">{pickupAddress || 'الموقع المحدد'}</p>
            </div>
          )}
          {pickupResults.length > 0 && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-60 overflow-y-auto">
              {pickupResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-right p-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start"
                  onClick={() => {
                    onPickupSelect(result);
                    setPickupResults([]);
                    setPickupSearch("");
                  }}
                >
                  <MapPin className="h-4 w-4 mt-0.5 ml-1 text-blue-500" />
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
              onKeyPress={(e) => e.key === 'Enter' && handleDestinationSearch()}
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
              <div className="mr-2 mt-1">
                <div className="bg-red-500 h-4 w-4 rounded-full"></div>
              </div>
              <p className="text-sm">{destinationAddress || 'الموقع المحدد'}</p>
            </div>
          )}
          {destinationResults.length > 0 && (
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shadow-lg max-h-60 overflow-y-auto">
              {destinationResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-right p-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start"
                  onClick={() => {
                    onDestinationSelect(result);
                    setDestinationResults([]);
                    setDestinationSearch("");
                  }}
                >
                  <MapPin className="h-4 w-4 mt-0.5 ml-1 text-red-500" />
                  <span className="text-sm">{result.placeName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {pickupLocation && destinationLocation && (
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <Route className="h-4 w-4" />
                المسافة التقريبية:
              </span>
              <span className="font-medium">{estimatedDistance ? `${estimatedDistance.toFixed(1)} كم` : 'جاري الحساب...'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                الوقت التقريبي:
              </span>
              <span className="font-medium">
                {estimatedDuration ? `${estimatedDuration} دقيقة` : 'جاري الحساب...'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">السعر التقريبي:</span>
              <span className="font-medium text-green-600 text-lg">
                {estimatedPrice ? `${estimatedPrice.toFixed(2)} د.ل` : 'جاري الحساب...'}
              </span>
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">رصيد المحفظة:</span>
            <span className="font-medium">{profile?.wallet_balance?.toFixed(2) || '0.00'} د.ل</span>
          </div>
          
          {estimatedPrice && profile?.wallet_balance && estimatedPrice > profile.wallet_balance && (
            <div className="mb-2 py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm rounded">
              الرصيد غير كافٍ لهذه الرحلة. يرجى شحن المحفظة.
            </div>
          )}
        </div>
        
        <Button
          className="w-full mt-4"
          disabled={
            !pickupLocation || 
            !destinationLocation || 
            isCreatingRide || 
            (estimatedPrice && profile?.wallet_balance && estimatedPrice > profile.wallet_balance)
          }
          onClick={onCreateRide}
        >
          {isCreatingRide ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <Car className="h-4 w-4 ml-2" />
          )}
          طلب رحلة
        </Button>
        
        <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-2">
          يمكنك تحديد المواقع بالضغط على الخريطة أو بالبحث
        </p>
      </CardContent>
    </Card>
  );
};

export default RideControls;
