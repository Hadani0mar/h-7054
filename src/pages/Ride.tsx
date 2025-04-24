import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import Map from "@/components/Map";
import MapContainer from "@/components/maps/MapContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, MapPin, Search, Car, User, Phone, Star, Check, X, Clock, CreditCard, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  acceptRide, 
  createRide, 
  getNearbyDrivers, 
  getRideDetails, 
  rateRide, 
  updateRideStatus 
} from "@/lib/rideService";
import { searchLocation, reverseGeocode } from "@/lib/mapService";
import { Coordinates, MapboxLocation, RideStatus } from "@/types";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import RideControls from "@/components/ride/RideControls";
import ChatBox from "@/components/chat/ChatBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Ride = () => {
  const { profile, userType } = useAuth();
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get("id");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [rideDetails, setRideDetails] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | undefined>(undefined);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);

  const [pickupSearch, setPickupSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [pickupResults, setPickupResults] = useState<MapboxLocation[]>([]);
  const [destinationResults, setDestinationResults] = useState<MapboxLocation[]>([]);
  const [pickupLocation, setPickupLocation] = useState<Coordinates | undefined>(undefined);
  const [destinationLocation, setDestinationLocation] = useState<Coordinates | undefined>(undefined);
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [isCreatingRide, setIsCreatingRide] = useState(false);

  const [rating, setRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ latitude, longitude });
              
              if (!rideId && userType === 'rider') {
                setPickupLocation({ latitude, longitude });
                
                try {
                  const address = await reverseGeocode(longitude, latitude);
                  setPickupAddress(address);
                } catch (error) {
                  console.error("خطأ في الحصول على العنوان:", error);
                }
              }
              
              if (!rideId && userType === 'driver') {
                const { drivers } = await getNearbyDrivers(latitude, longitude);
                setNearbyDrivers(drivers || []);
              }
            },
            (error) => {
              console.error("خطأ في تحديد الموقع:", error);
              toast.error("فشل في تحديد موقعك الحالي. يرجى السماح بالوصول إلى موقعك.");
            }
          );
        }
        
        if (rideId) {
          const { ride, error } = await getRideDetails(rideId);
          
          if (error) {
            console.error("خطأ في جلب تفاصيل الرحلة:", error);
            toast.error("فشل في جلب تفاصيل الرحلة");
            navigate("/dashboard");
            return;
          }
          
          setRideDetails(ride);
          
          if (ride) {
            setPickupLocation({
              latitude: ride.pickup_latitude,
              longitude: ride.pickup_longitude
            });
            
            setDestinationLocation({
              latitude: ride.destination_latitude,
              longitude: ride.destination_longitude
            });
            
            setPickupAddress(ride.pickup_address || "");
            setDestinationAddress(ride.destination_address || "");
          }
        }
      } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [rideId, userType, navigate]);

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

  const selectPickupLocation = (location: MapboxLocation) => {
    setPickupLocation({
      latitude: location.center[1],
      longitude: location.center[0]
    });
    setPickupAddress(location.placeName);
    setPickupResults([]);
    setPickupSearch("");
  };

  const selectDestinationLocation = (location: MapboxLocation) => {
    setDestinationLocation({
      latitude: location.center[1],
      longitude: location.center[0]
    });
    setDestinationAddress(location.placeName);
    setDestinationResults([]);
    setDestinationSearch("");
  };

  const handleMapClick = async (lngLat: { lng: number; lat: number }) => {
    if (!userType || userType !== 'rider' || rideId) return;
    
    if (!pickupLocation) {
      setPickupLocation({
        latitude: lngLat.lat,
        longitude: lngLat.lng
      });
      
      try {
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        setPickupAddress(address);
      } catch (error) {
        console.error("خطأ في الحصول على العنوان:", error);
      }
      return;
    }
    
    if (!destinationLocation) {
      setDestinationLocation({
        latitude: lngLat.lat,
        longitude: lngLat.lng
      });
      
      try {
        const address = await reverseGeocode(lngLat.lng, lngLat.lat);
        setDestinationAddress(address);
      } catch (error) {
        console.error("خطأ في الحصول على العنوان:", error);
      }
    }
  };

  const createRideRequest = async () => {
    if (!pickupLocation || !destinationLocation) {
      toast.error("يرجى تحديد موقع الانطلاق والوصول");
      return;
    }
    
    try {
      setIsCreatingRide(true);
      
      const { ride, error } = await createRide(
        pickupLocation,
        destinationLocation,
        pickupAddress,
        destinationAddress
      );
      
      if (error) {
        if (error === "رصيد غير كافٍ") {
          return;
        }
        console.error("خطأ في إنشاء الرحلة:", error);
        toast.error("فشل في إنشاء طلب الرحلة");
        return;
      }
      
      toast.success("تم إنشاء طلب الرحلة بنجاح");
      navigate(`/ride?id=${ride.id}`);
    } catch (error) {
      console.error("خطأ في إنشاء الرحلة:", error);
      toast.error("حدث خطأ أثناء إنشاء طلب الرحلة");
    } finally {
      setIsCreatingRide(false);
    }
  };

  const acceptRideRequest = async () => {
    if (!rideId) return;
    
    try {
      const { ride, error } = await acceptRide(rideId);
      
      if (error) {
        console.error("خطأ في قبول الرحلة:", error);
        toast.error("فشل في قبول الرحلة");
        return;
      }
      
      toast.success("تم قبول الرحلة بنجاح");
      setRideDetails(ride);
    } catch (error) {
      console.error("خطأ في قبول الرحلة:", error);
      toast.error("حدث خطأ أثناء قبول الرحلة");
    }
  };

  const updateStatus = async (status: RideStatus) => {
    if (!rideId) return;
    
    try {
      const { ride, error } = await updateRideStatus(rideId, status);
      
      if (error) {
        console.error(`خطأ في تحديث حالة الرحلة إلى ${status}:`, error);
        toast.error("فشل في تحديث حالة الرحلة");
        return;
      }
      
      toast.success("تم تحديث حالة الرحلة بنجاح");
      setRideDetails(ride);
      
      if (status === 'cancelled') {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(`خطأ في تحديث حالة الرحلة إلى ${status}:`, error);
      toast.error("حدث خطأ أثناء تحديث حالة الرحلة");
    }
  };

  const submitRating = async () => {
    if (!rideId || !rating || !rideDetails) return;
    
    try {
      setIsSubmittingRating(true);
      
      const ratedUserId = userType === 'rider' 
        ? rideDetails.driver?.id 
        : rideDetails.rider?.id;
      
      if (!ratedUserId) {
        toast.error("لا يمكن تحديد المستخدم المراد تقييمه");
        return;
      }
      
      const { error } = await rateRide(
        rideId,
        ratedUserId,
        rating,
        ratingComment
      );
      
      if (error) {
        console.error("خطأ في إرسال التقييم:", error);
        toast.error("فشل في إرسال التقييم");
        return;
      }
      
      toast.success("تم إرسال التقييم بنجاح");
      navigate("/dashboard");
    } catch (error) {
      console.error("خطأ في إرسال التقييم:", error);
      toast.error("حدث خطأ أثناء إرسال التقييم");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp", { locale: ar });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">قيد الانتظار</Badge>;
      case 'accepted':
        return <Badge variant="default">تم القبول</Badge>;
      case 'in_progress':
        return <Badge variant="warning">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="success">مكتملة</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغاة</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (rideId && rideDetails) {
    const otherPartyId = userType === 'rider' ? rideDetails.driver?.id : rideDetails.rider?.id;
    const showChatTab = rideDetails.status === 'accepted' || rideDetails.status === 'in_progress';

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-2/3">
            <CardHeader>
              <CardTitle>تفاصيل الرحلة</CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>
                  رقم الرحلة: {rideId}
                </CardDescription>
                {getStatusBadge(rideDetails.status)}
              </div>
            </CardHeader>
            <CardContent>
              {showChatTab ? (
                <Tabs defaultValue="map" className="mb-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="map" className="flex-1">الخريطة</TabsTrigger>
                    <TabsTrigger value="chat" className="flex-1">المحادثة</TabsTrigger>
                  </TabsList>
                  <TabsContent value="map" className="mt-4">
                    <div className="h-[350px] rounded-lg overflow-hidden mb-4">
                      <MapContainer
                        pickupLocation={{
                          latitude: rideDetails.pickup_latitude,
                          longitude: rideDetails.pickup_longitude
                        }}
                        destinationLocation={{
                          latitude: rideDetails.destination_latitude,
                          longitude: rideDetails.destination_longitude
                        }}
                        userLocation={userLocation}
                        driverLocation={
                          userType === 'rider' && rideDetails.driver && rideDetails.status !== 'pending'
                            ? { latitude: profile?.latitude || 0, longitude: profile?.longitude || 0 }
                            : undefined
                        }
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="chat" className="mt-4">
                    <div className="h-[350px]">
                      <ChatBox 
                        rideId={rideId} 
                        recipientId={otherPartyId}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-[350px] rounded-lg overflow-hidden mb-4">
                  <MapContainer
                    pickupLocation={{
                      latitude: rideDetails.pickup_latitude,
                      longitude: rideDetails.pickup_longitude
                    }}
                    destinationLocation={{
                      latitude: rideDetails.destination_latitude,
                      longitude: rideDetails.destination_longitude
                    }}
                    userLocation={userLocation}
                    driverLocation={
                      userType === 'rider' && rideDetails.driver && rideDetails.status !== 'pending'
                        ? { latitude: profile?.latitude || 0, longitude: profile?.longitude || 0 }
                        : undefined
                    }
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">تفاصيل الرحلة</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <div className="ml-2 mt-1">
                        <div className="bg-blue-500 h-4 w-4 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">موقع الانطلاق</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {rideDetails.pickup_address || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="ml-2 mt-1">
                        <div className="bg-red-500 h-4 w-4 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">موقع الوصول</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {rideDetails.destination_address || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">تفاصيل إضافية</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">تاريخ الطلب:</p>
                      <p className="font-medium">
                        {formatDate(rideDetails.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">سعر الرحلة:</p>
                      <p className="font-medium flex items-center">
                        <CreditCard className="h-4 w-4 ml-1" />
                        {rideDetails.price?.toFixed(2) || '10.00'} د.ل
                      </p>
                    </div>
                    {rideDetails.status === 'completed' && rideDetails.completed_at && (
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">تاريخ الإكمال:</p>
                        <p className="font-medium">
                          {formatDate(rideDetails.completed_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {rideDetails.status !== 'completed' && rideDetails.status !== 'cancelled' && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      {userType === 'driver' && (
                        <div className="space-y-3">
                          {rideDetails.status === 'pending' && (
                            <Button 
                              className="w-full" 
                              onClick={acceptRideRequest}
                            >
                              <Check className="ml-2 h-5 w-5" />
                              قبول الرحلة
                            </Button>
                          )}
                          
                          {rideDetails.status === 'accepted' && (
                            <Button 
                              className="w-full" 
                              onClick={() => updateStatus('in_progress')}
                            >
                              <Car className="ml-2 h-5 w-5" />
                              بدء الرحلة
                            </Button>
                          )}
                          
                          {rideDetails.status === 'in_progress' && (
                            <Button 
                              className="w-full" 
                              onClick={() => updateStatus('completed')}
                            >
                              <Check className="ml-2 h-5 w-5" />
                              إكمال الرحلة
                            </Button>
                          )}
                          
                          {rideDetails.status !== 'completed' && rideDetails.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => updateStatus('cancelled')}
                            >
                              <X className="ml-2 h-5 w-5" />
                              إلغاء الرحلة
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {userType === 'rider' && (
                        <div className="space-y-3">
                          {rideDetails.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => updateStatus('cancelled')}
                            >
                              <X className="ml-2 h-5 w-5" />
                              إلغاء الطلب
                            </Button>
                          )}
                          
                          {(rideDetails.status === 'accepted' || rideDetails.status === 'in_progress') && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => document.querySelector('[data-value="chat"]')?.dispatchEvent(new Event('click'))}
                            >
                              <MessageCircle className="ml-2 h-5 w-5" />
                              التحدث مع السائق
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {rideDetails.status === 'completed' && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      <h3 className="font-medium mb-3">تقييم الرحلة</h3>
                      
                      <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="mx-1"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                value <= (rating || 0)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      
                      <Input
                        placeholder="اترك تعليقًا (اختياري)"
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className="mb-4"
                      />
                      
                      <Button
                        className="w-full"
                        disabled={!rating || isSubmittingRating}
                        onClick={submitRating}
                      >
                        {isSubmittingRating ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        ) : (
                          <Star className="h-4 w-4 ml-2" />
                        )}
                        إرسال التقييم
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:w-1/3">
            <CardHeader>
              <CardTitle>
                {userType === 'rider' ? 'معلومات السائق' : 'معلومات الراكب'}
              </CardTitle>
              <CardDescription>
                {rideDetails.status === 'pending' && userType === 'rider'
                  ? 'في انتظار قبول السائق'
                  : 'تفاصيل الاتصال'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userType === 'rider' && rideDetails.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p>جاري البحث عن سائق...</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    سيتم إشعارك عند قبول أحد السائقين للرحلة
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  {userType === 'rider' ? (
                    rideDetails.driver ? (
                      <>
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={rideDetails.driver?.avatar_url || ''} alt={rideDetails.driver?.full_name || 'السائق'} />
                          <AvatarFallback>
                            <Car className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-xl">{rideDetails.driver?.full_name || 'السائق'}</h3>
                          {rideDetails.driver?.rating !== null && (
                            <div className="flex items-center justify-center mt-1">
                              <span className="font-medium ml-1">
                                {rideDetails.driver?.rating?.toFixed(1) || '0.0'}
                              </span>
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </div>
                          )}
                          <div className="mt-4 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              السيارة: {rideDetails.driver?.car_model || 'غير محدد'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              رقم اللوحة: {rideDetails.driver?.car_plate || 'غير محدد'}
                            </p>
                          </div>
                          {rideDetails.status !== 'pending' && (
                            <div className="mt-4 space-y-2">
                              <Button 
                                className="w-full"
                                variant="outline"
                                onClick={() => {
                                  if (rideDetails.driver?.phone) {
                                    window.location.href = `tel:${rideDetails.driver.phone}`;
                                  } else {
                                    toast.error("رقم الهاتف غير متوفر");
                                  }
                                }}
                              >
                                <Phone className="ml-2 h-5 w-5" />
                                اتصال بالسائق
                              </Button>
                              
                              {showChatTab && (
                                <Button 
                                  className="w-full"
                                  onClick={() => document.querySelector('[data-value="chat"]')?.dispatchEvent(new Event('click'))}
                                >
                                  <MessageCircle className="ml-2 h-5 w-5" />
                                  محادثة مع السائق
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p>لم يتم تعيين سائق بعد</p>
                    )
                  ) : (
                    <>
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={rideDetails.rider?.avatar_url || ''} alt={rideDetails.rider?.full_name || 'الراكب'} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-xl">{rideDetails.rider?.full_name || 'الراكب'}</h3>
                        <div className="mt-4 space-y-2">
                          <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => {
                              if (rideDetails.rider?.phone) {
                                window.location.href = `tel:${rideDetails.rider.phone}`;
                              } else {
                                toast.error("رقم الهاتف غير متوفر");
                              }
                            }}
                          >
                            <Phone className="ml-2 h-5 w-5" />
                            اتصال بالراكب
                          </Button>
                          
                          {showChatTab && (
                            <Button 
                              className="w-full"
                              onClick={() => document.querySelector('[data-value="chat"]')?.dispatchEvent(new Event('click'))}
                            >
                              <MessageCircle className="ml-2 h-5 w-5" />
                              محادثة مع الراكب
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {rideDetails.status === 'in_progress' && (
                    <div className="mt-4 w-full">
                      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                        <h4 className="flex items-center font-medium mb-2">
                          <Clock className="h-5 w-5 ml-2 text-blue-600 dark:text-blue-400" />
                          الرحلة قيد التنفيذ
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          يرجى البقاء على اتصال مع {userType === 'rider' ? 'السائق' : 'الراكب'} حتى نهاية الرحلة
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (userType === 'rider') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">طلب رحلة جديدة</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <RideControls 
              profile={profile}
              pickupLocation={pickupLocation}
              destinationLocation={destinationLocation}
              pickupAddress={pickupAddress}
              destinationAddress={destinationAddress}
              onPickupSelect={(location) => {
                selectPickupLocation(location);
              }}
              onDestinationSelect={(location) => {
                selectDestinationLocation(location);
              }}
              onCreateRide={createRideRequest}
              isCreatingRide={isCreatingRide}
            />
          </div>
          
          <Card className="md:w-2/3">
            <CardHeader>
              <CardTitle>الخريطة</CardTitle>
              <CardDescription>
                {!pickupLocation
                  ? "اضغط على الخريطة لتحديد موقع الانطلاق"
                  : !destinationLocation
                    ? "اضغط على الخريطة لتحديد موقع الوصول"
                    : "تم تحديد مواقع الرحلة"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[450px] rounded-lg overflow-hidden">
                <MapContainer
                  userLocation={userLocation}
                  pickupLocation={pickupLocation}
                  destinationLocation={destinationLocation}
                  onMapClick={handleMapClick}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">البحث عن رحلات</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>الرحلات المتاحة</CardTitle>
            <CardDescription>رحلات في انتظار قبول سائق</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nearbyDrivers.length > 0 ? (
                <p>هناك {nearbyDrivers.length} سائقين قريبين منك</p>
              ) : (
                <p>لا يوجد سائقين قريبين</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-2/3">
          <CardHeader>
            <CardTitle>منطقة التغطية</CardTitle>
            <CardDescription>موقعك الحالي وتحركاتك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[450px] rounded-lg overflow-hidden">
              <Map userLocation={userLocation} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Ride;
