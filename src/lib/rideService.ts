import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Coordinates, Profile, Ride, RideStatus } from "@/types";

export async function getNearbyDrivers(latitude: number, longitude: number, maxDistance = 5) {
  try {
    // نحن نستخدم هنا مسافة مباشرة بين الإحداثيات للتبسيط
    // في التطبيق الفعلي، يمكن استخدام صيغة أكثر دقة لحساب المسافة
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'driver')
      .eq('available', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    
    if (error) {
      console.error("خطأ في جلب السائقين القريبين:", error);
      return { drivers: [], error };
    }
    
    // تصفية السائقين حسب المسافة
    const nearbyDrivers = data.filter((driver) => {
      if (!driver.latitude || !driver.longitude) return false;
      
      const distance = calculateDistance(
        { latitude, longitude },
        { latitude: driver.latitude, longitude: driver.longitude }
      );
      
      return distance <= maxDistance;
    });
    
    return { drivers: nearbyDrivers };
  } catch (error) {
    console.error("خطأ في جلب السائقين القريبين:", error);
    return { drivers: [], error };
  }
}

export async function createRide(
  pickupLocation: Coordinates,
  destinationLocation: Coordinates,
  pickupAddress: string,
  destinationAddress: string
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: "المستخدم غير مسجل الدخول" };
    }

    // حساب سعر الرحلة استنادًا إلى المسافة
    const distance = calculateDistance(pickupLocation, destinationLocation);
    const price = calculatePrice(distance);
    
    // تحقق من رصيد المحفظة
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error("خطأ في جلب معلومات المحفظة:", profileError);
      toast.error("فشل في التحقق من رصيد المحفظة");
      return { error: profileError };
    }
    
    if (profile.wallet_balance < price) {
      toast.error(`رصيد المحفظة غير كافٍ. الرصيد الحالي: ${profile.wallet_balance} د.ل، سعر الرحلة: ${price} د.ل`);
      return { error: "رصيد غير كافٍ" };
    }
    
    // البحث عن سائق متاح
    const { drivers, error: driversError } = await getNearbyDrivers(pickupLocation.latitude, pickupLocation.longitude);
    
    if (driversError) {
      console.error("خطأ في البحث عن سائقين:", driversError);
    }
    
    // إنشاء الرحلة
    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        rider_id: session.user.id,
        pickup_latitude: pickupLocation.latitude,
        pickup_longitude: pickupLocation.longitude,
        destination_latitude: destinationLocation.latitude,
        destination_longitude: destinationLocation.longitude,
        pickup_address: pickupAddress,
        destination_address: destinationAddress,
        price: price,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error("خطأ في إنشاء الرحلة:", error);
      toast.error("فشل في إنشاء الرحلة");
      return { error };
    }
    
    // إذا وجدنا سائقين متاحين، اختر واحدًا عشوائيًا
    if (drivers && drivers.length > 0) {
      const randomIndex = Math.floor(Math.random() * drivers.length);
      const randomDriver = drivers[randomIndex];
      
      // تخصيص الرحلة للسائق
      const { error: assignError } = await supabase
        .from('rides')
        .update({ 
          driver_id: randomDriver.id,
          status: 'accepted'
        })
        .eq('id', ride.id);
      
      if (assignError) {
        console.error("خطأ في تخصيص السائق:", assignError);
      } else {
        toast.success("تم تخصيص سائق للرحلة");
      }
    } else {
      toast.info("جاري البحث عن سائق متاح");
    }
    
    return { ride };
  } catch (error) {
    console.error("خطأ في إنشاء الرحلة:", error);
    toast.error("حدث خطأ غير متوقع أثناء إنشاء الرحلة");
    return { error };
  }
}

export async function acceptRide(rideId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: "المستخدم غير مسجل الدخول" };
    }
    
    // تحقق من أن المستخدم هو سائق
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || profile?.user_type !== 'driver') {
      toast.error("يجب أن تكون سائقاً لقبول الرحلات");
      return { error: "يجب أن تكون سائقاً لقبول الرحلات" };
    }
    
    // تحديث الرحلة
    const { data: ride, error } = await supabase
      .from('rides')
      .update({ 
        driver_id: session.user.id,
        status: 'accepted'
      })
      .eq('id', rideId)
      .eq('status', 'pending') // تأكد من أن الرحلة لا تزال معلقة
      .select()
      .single();
    
    if (error) {
      console.error("خطأ في قبول الرحلة:", error);
      toast.error("فشل في قبول الرحلة");
      return { error };
    }
    
    return { ride };
  } catch (error) {
    console.error("خطأ في قبول الرحلة:", error);
    toast.error("حدث خطأ غير متوقع أثناء قبول الرحلة");
    return { error };
  }
}

export async function updateRideStatus(rideId: string, status: RideStatus) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: "المستخدم غير مسجل الدخول" };
    }
    
    const updateData: Partial<Ride> = { status };
    
    // إذا كانت الحالة "مكتملة"، أضف وقت الإكمال
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    // تحديث الرحلة
    const { data: ride, error } = await supabase
      .from('rides')
      .update(updateData)
      .eq('id', rideId)
      .or(`driver_id.eq.${session.user.id},rider_id.eq.${session.user.id}`) // يمكن للراكب أو السائق تحديث الحالة
      .select()
      .single();
    
    if (error) {
      console.error("خطأ في تحديث حالة الرحلة:", error);
      toast.error("فشل في تحديث حالة الرحلة");
      return { error };
    }
    
    // إذا كانت الرحلة مكتملة، قم بإنشاء المعاملات المالية
    if (status === 'completed') {
      await processRidePayment(ride);
    }
    
    return { ride };
  } catch (error) {
    console.error("خطأ في تحديث حالة الرحلة:", error);
    toast.error("حدث خطأ غير متوقع أثناء تحديث حالة الرحلة");
    return { error };
  }
}

export async function getRideDetails(rideId: string) {
  try {
    const { data: ride, error } = await supabase
      .from('rides')
      .select(`
        *,
        rider:rider_id(id, full_name, phone, avatar_url),
        driver:driver_id(id, full_name, phone, avatar_url, car_model, car_plate)
      `)
      .eq('id', rideId)
      .single();
    
    if (error) {
      console.error("خطأ في جلب تفاصيل الرحلة:", error);
      return { error };
    }
    
    return { ride };
  } catch (error) {
    console.error("خطأ في جلب تفاصيل الرحلة:", error);
    return { error };
  }
}

export async function getUserRides(status?: RideStatus | RideStatus[]) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { rides: [], error: "المستخدم غير مسجل الدخول" };
    }
    
    // تحقق من نوع المستخدم
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    let query = supabase
      .from('rides')
      .select(`
        *,
        rider:rider_id(id, full_name, phone, avatar_url),
        driver:driver_id(id, full_name, phone, avatar_url, car_model, car_plate)
      `)
      .order('created_at', { ascending: false });
    
    // تطبيق شرط نوع المستخدم
    if (profile?.user_type === 'rider') {
      query = query.eq('rider_id', session.user.id);
    } else if (profile?.user_type === 'driver') {
      query = query.eq('driver_id', session.user.id);
    }
    
    // تطبيق شرط الحالة إذا تم تحديدها
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }
    
    const { data: rides, error } = await query;
    
    if (error) {
      console.error("خطأ في جلب الرحلات:", error);
      return { rides: [], error };
    }
    
    return { rides };
  } catch (error) {
    console.error("خطأ في جلب الرحلا��:", error);
    return { rides: [], error };
  }
}

export async function getActiveRide() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { ride: null, error: "المستخدم غير مسجل الدخول" };
    }
    
    // تحقق من نوع المستخدم
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
    
    let query = supabase
      .from('rides')
      .select(`
        *,
        rider:rider_id(id, full_name, phone, avatar_url),
        driver:driver_id(id, full_name, phone, avatar_url, car_model, car_plate)
      `)
      .in('status', ['pending', 'accepted', 'in_progress']);
    
    // تطبيق شرط نوع المستخدم
    if (profile?.user_type === 'rider') {
      query = query.eq('rider_id', session.user.id);
    } else if (profile?.user_type === 'driver') {
      query = query.eq('driver_id', session.user.id);
    }
    
    query = query.order('created_at', { ascending: false }).limit(1);
    
    const { data: rides, error } = await query;
    
    if (error) {
      console.error("خطأ في جلب الرحلة النشطة:", error);
      return { ride: null, error };
    }
    
    return { ride: rides && rides.length > 0 ? rides[0] : null };
  } catch (error) {
    console.error("خطأ في جلب الرحلة النشطة:", error);
    return { ride: null, error };
  }
}

export async function rateRide(rideId: string, ratedUserId: string, rating: number, comment?: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: "المستخدم غير مسجل الدخول" };
    }
    
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        ride_id: rideId,
        rater_id: session.user.id,
        rated_id: ratedUserId,
        rating,
        comment
      })
      .select()
      .single();
    
    if (error) {
      console.error("خطأ في تقييم الرحلة:", error);
      toast.error("فشل في إرسال التقييم");
      return { error };
    }
    
    // تحديث متوسط تقييم المستخدم المقيم
    await updateUserRating(ratedUserId);
    
    return { rating: data };
  } catch (error) {
    console.error("خطأ في تقييم الرحلة:", error);
    toast.error("حدث خطأ غير متوقع أثناء إرسال التقييم");
    return { error };
  }
}

// دوال مساعدة داخلية

async function processRidePayment(ride: Ride) {
  try {
    const rideAmount = ride.price || 10; // استخدام القيمة الافتراضية إذا لم يكن هناك سعر محدد
    
    // إنشاء معاملة سحب من محفظة الراكب
    const { error: withdrawError } = await supabase
      .from('transactions')
      .insert({
        user_id: ride.rider_id,
        amount: -rideAmount,
        type: 'ride_payment',
        ride_id: ride.id,
        description: `دفع رحلة رقم ${ride.id}`
      });
    
    if (withdrawError) {
      console.error("خطأ في معالجة دفع الرحلة:", withdrawError);
      return;
    }
    
    // إنشاء معاملة إضافة إلى محفظة السائق
    const { error: depositError } = await supabase
      .from('transactions')
      .insert({
        user_id: ride.driver_id,
        amount: rideAmount,
        type: 'ride_earning',
        ride_id: ride.id,
        description: `أرباح رحلة رقم ${ride.id}`
      });
    
    if (depositError) {
      console.error("خطأ في معالجة أرباح الرحلة:", depositError);
      return;
    }
    
    // تحديث أرصدة المحافظ
    await updateWalletBalance(ride.rider_id);
    await updateWalletBalance(ride.driver_id);
  } catch (error) {
    console.error("خطأ في معالجة معاملات الرحلة:", error);
  }
}

async function updateWalletBalance(userId: string) {
  try {
    // حساب الرصيد الإجمالي من المعاملات
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId);
    
    if (txError) {
      console.error("خطأ في جلب المعاملات:", txError);
      return;
    }
    
    const totalBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // تحديث رصيد المحفظة
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ wallet_balance: totalBalance })
      .eq('id', userId);
    
    if (updateError) {
      console.error("خطأ في تحديث رصيد المحفظة:", updateError);
    }
  } catch (error) {
    console.error("خطأ في تحديث رصيد المحفظة:", error);
  }
}

async function updateUserRating(userId: string) {
  try {
    // حساب متوسط التقييمات
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_id', userId);
    
    if (ratingsError) {
      console.error("خطأ في جلب التقييمات:", ratingsError);
      return;
    }
    
    if (ratings.length === 0) return;
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    // تحديث تقييم المستخدم
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ rating: avgRating })
      .eq('id', userId);
    
    if (updateError) {
      console.error("خطأ في تحديث تقييم المستخدم:", updateError);
    }
  } catch (error) {
    console.error("خطأ في تحديث تقييم المستخدم:", error);
  }
}

// دالة لحساب المسافة بين نقطتين باستخدام صيغة هافرسين
function calculateDistance(point1: Coordinates, point2: Coordinates) {
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

// حساب سعر الرحلة بناءً على المسافة
function calculatePrice(distance: number): number {
  // سعر البداية
  const basePrice = 5;
  
  // سعر لكل كيلومتر
  const pricePerKm = 1.5;
  
  // حساب السعر الإجمالي
  const totalPrice = basePrice + (distance * pricePerKm);
  
  // تقريب السعر إلى أقرب 0.5
  return Math.round(totalPrice * 2) / 2; 
}
