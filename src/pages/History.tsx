
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserRides } from "@/lib/rideService";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, CalendarClock, CreditCard, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const History = () => {
  const { userType } = useAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const { rides: userRides, error } = await getUserRides();
        
        if (error) {
          console.error("خطأ في جلب الرحلات:", error);
          return;
        }
        
        setRides(userRides || []);
        setFilteredRides(userRides || []);
      } catch (error) {
        console.error("خطأ في جلب الرحلات:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRides();
  }, []);

  useEffect(() => {
    // تطبيق التصفية على الرحلات
    let result = [...rides];
    
    // تصفية حسب الحالة
    if (statusFilter !== "all") {
      result = result.filter((ride) => ride.status === statusFilter);
    }
    
    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (ride) =>
          (ride.pickup_address && ride.pickup_address.toLowerCase().includes(query)) ||
          (ride.destination_address && ride.destination_address.toLowerCase().includes(query))
      );
    }
    
    setFilteredRides(result);
  }, [statusFilter, searchQuery, rides]);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سجل الرحلات</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>الرحلات السابقة</CardTitle>
          <CardDescription>
            جميع رحلاتك السابقة {userType === 'rider' ? 'كراكب' : 'كسائق'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* فلاتر البحث */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="بحث عن عناوين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="accepted">تم القبول</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* قائمة الرحلات */}
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-600 dark:text-slate-400">
                  لم يتم العثور على أي رحلات
                </p>
                {userType === 'rider' && statusFilter === 'all' && !searchQuery && (
                  <Button className="mt-4" onClick={() => navigate("/ride")}>
                    طلب رحلة جديدة
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => navigate(`/ride?id=${ride.id}`)}
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
                      {getStatusBadge(ride.status)}
                      <div className="flex items-center gap-1 font-medium">
                        <CreditCard className="h-4 w-4" />
                        {ride.price?.toFixed(2) || '0.00'} د.ل
                      </div>
                      {userType === 'rider' ? (
                        <div className="text-xs text-slate-600">
                          {ride.driver
                            ? `السائق: ${ride.driver.full_name}`
                            : 'لم يتم تعيين سائق'}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600">
                          {ride.rider
                            ? `الراكب: ${ride.rider.full_name}`
                            : 'غير محدد'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
