
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserType } from "@/types";

export async function signUp(email: string, password: string, userType: UserType, fullName: string, phone: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
          full_name: fullName
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    if (data.user) {
      // تحديث معلومات إضافية في جدول الملفات الشخصية
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone: phone
        })
        .eq('id', data.user.id);

      if (profileError) {
        toast.error("تم تسجيل الحساب ولكن حدث خطأ في تحديث الملف الشخصي");
      }
    }

    return { data };
  } catch (error) {
    console.error("خطأ في التسجيل:", error);
    toast.error("حدث خطأ غير متوقع أثناء التسجيل");
    return { error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    toast.error("حدث خطأ غير متوقع أثناء تسجيل الدخول");
    return { error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("خطأ في تسجيل الخروج:", error);
    toast.error("حدث خطأ غير متوقع أثناء تسجيل الخروج");
    return { error };
  }
}

export async function getUserProfile() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { profile: null };
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error("خطأ في جلب الملف الشخصي:", error);
      return { profile: null, error };
    }
    
    return { profile };
  } catch (error) {
    console.error("خطأ في جلب الملف الشخصي:", error);
    return { profile: null, error };
  }
}

export async function updateUserLocation(latitude: number, longitude: number) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: "المستخدم غير مسجل الدخول" };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        latitude,
        longitude
      })
      .eq('id', session.user.id);
    
    if (error) {
      console.error("خطأ في تحديث الموقع:", error);
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("خطأ في تحديث الموقع:", error);
    return { error };
  }
}

export async function updateDriverAvailability(available: boolean) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { error: "المستخدم غير مسجل الدخول" };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ available })
      .eq('id', session.user.id);
    
    if (error) {
      console.error("خطأ في تحديث حالة التوفر:", error);
      return { error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("خطأ في تحديث حالة التوفر:", error);
    return { error };
  }
}
