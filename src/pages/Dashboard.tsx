import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Map from "@/components/Map";
import { getActiveRide, getUserRides } from "@/lib/rideService";
import { updateDriverAvailability } from "@/lib/authService";
import { Link } from "react-router-dom";
import { CalendarClock, Car, CreditCard, MapPin, User, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const Dashboard = () => {
  const { profile, userType } = useAuth();
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // جلب الرحلة النشطة
        const { ride: currentRide } = await getActiveRide();
        setActiveRide(currentRide);

        // جلب آخر الرحلات
        const { rides } = await getUserRides();
        setRecentRides(rides?.slice(0, 3) || []);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleAvailability = async () => {
    try {
      const newStatus = !profile?.available;
      const { error } = await updateDriverAvailability(newStatus);
      
      if (error) {
        toast.error("فشل تحديث حالة التوفر");
        return;
      }
      
      toast.success(newStatus ? "أنت الآن متاح للرحلات" : "أنت الآن غير متاح للرحلات");
    } catch (error) {
      console.error("خطأ في تبديل حالة التوفر:", error);
      toast.error("حدث خطأ أثناء تحديث حالة التوفر");
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp", { locale: ar });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="h-[300px] w-full md:w-2/3 rounded-lg" />
          <Skeleton className="h-[300px] w-full md:w-1/3 rounded-lg" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col-reverse md:flex-row gap-6">
        <Card className="md:w-2/3">
          <CardHeader>
            <CardTitle>الموقع الحالي</CardTitle>
            <CardDescription>
              {profile?.latitude && profile?.longitude
                ? "موقعك الحالي على الخريطة"
                : "لم يتم تحديد موقعك بعد"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] rounded-lg overflow-hidden">
              <Map
                userLocation={
                  profile?.latitude && profile?.longitude
                    ? { latitude: profile.latitude, longitude: profile.longitude }
                    : undefined
                }
              />
            </div>
            {activeRide && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  رحلة نشطة
                </h3>
                <div className="mt-2 text-sm">
                  <p className="flex items-center gap-1 mb-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    من: {activeRide.pickup_address || 'غير محدد'}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-red-500" />
                    إلى: {activeRide.destination_address || 'غير محدد'}
                  </p>
                  <Button 
                    className="w-full mt-2" 
                    onClick={() => navigate(`/ride?id=${activeRide.id}`)}
                  >
                    عرض تفاصيل الرحلة
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>الملف الشخصي</CardTitle>
            <CardDescription>معلومات حسابك الشخصي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'المستخدم'} />
                <AvatarFallback className="text-2xl">
                  {profile?.user_type === 'driver' ? <Car className="h-8 w-8" /> : <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-xl">{profile?.full_name || 'المستخدم'}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {profile?.email || ''}
                </p>
                <div className="mt-1 flex justify-center">
                  <Badge variant={userType === 'driver' ? "default" : "secondary"}>
                    {userType === 'driver' ? 'سائق' : 'راكب'}
                  </Badge>
                </div>
              </div>

              <div className="w-full pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">الرصيد:</span>
                  <span className="font-medium">{profile?.wallet_balance?.toFixed(2) || '0.00'} د.ل</span>
                </p>
                {userType === 'driver' && profile?.rating !== null && (
                  <p className="flex items-center justify-between mt-2">
                    <span className="text-slate-600 dark:text-slate-400">التقييم:</span>
                    <span className="flex items-center">
                      <span className="font-medium mr-1">{profile?.rating?.toFixed(1) || '0.0'}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-yellow-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        />
                      </svg>
                    </span>
                  </p>
                )}
                {userType === 'driver' && (
                  <div className="mt-4">
                    <p className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">الحالة:</span>
                      <Badge variant={profile?.available ? "success" : "destructive"}>
                        {profile?.available ? 'متاح' : 'غير متاح'}
                      </Badge>
                    </p>
                    <Button
                      className="w-full"
                      variant={profile?.available ? "destructive" : "default"}
                      onClick={toggleAvailability}
                    >
                      {profile?.available ? (
                        <>
                          <X className="w-4 h-4 mr-2" /> إيقاف التوفر
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" /> تفعيل التوفر
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {userType === 'driver' && (
                <div className="w-full pt-2 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-medium mb-2">معلومات السيارة</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="block">الطراز: {profile?.car_model || 'غير محدد'}</span>
                    <span className="block mt-1">رقم اللوحة: {profile?.car_plate || 'غير محدد'}</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>آخر الرحلات</CardTitle>
            <CardDescription>آخر 3 رحلات قمت بها</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/history">عرض الكل</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentRides.length > 0 ? (
            <div className="space-y-4">
              {recentRides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium flex items-center">
                      <Car className="h-4 w-4 mr-1" />
                      من: {ride.pickup_address?.substring(0, 30) || 'غير محدد'}
                      {ride.pickup_address?.length > 30 && '...'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      إلى: {ride.destination_address?.substring(0, 30) || 'غير محدد'}
                      {ride.destination_address?.length > 30 && '...'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-500">
                      <CalendarClock className="h-3 w-3" />
                      {formatDate(ride.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <Badge variant={
                      ride.status === 'completed' 
                        ? 'success' 
                        : ride.status === 'cancelled' 
                          ? 'destructive' 
                          : 'default'
                    }>
                      {ride.status === 'pending' && 'قيد الانتظار'}
                      {ride.status === 'accepted' && 'تم القبول'}
                      {ride.status === 'in_progress' && 'قيد التنفيذ'}
                      {ride.status === 'completed' && 'مكتملة'}
                      {ride.status === 'cancelled' && 'ملغاة'}
                    </Badge>
                    <div className="flex items-center gap-1 font-medium">
                      <CreditCard className="h-4 w-4" />
                      {ride.price?.toFixed(2) || '0.00'} د.ل
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/ride?id=${ride.id}`)}
                    >
                      التفاصيل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">لا توجد رحلات سابقة</p>
              {userType === 'rider' && (
                <Button className="mt-4" asChild>
                  <Link to="/ride">طلب رحلة جديدة</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="rounded-full shadow-lg"
          onClick={() => navigate('/ride')}
        >
          <Car className="mr-2 h-5 w-5" />
          {userType === 'rider' ? 'طلب رحلة جديدة' : 'البحث عن رحلات'}
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
