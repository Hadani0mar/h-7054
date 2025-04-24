import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GuestGuard } from "@/components/AuthGuard";
import { signIn, signUp } from "@/lib/authService";
import { UserType } from "@/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Car, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

const registerSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().min(3, "الاسم الكامل مطلوب"),
  phone: z.string().min(9, "رقم الهاتف غير صالح"),
  userType: z.enum(["rider", "driver"] as const),
  carModel: z.string().optional(),
  carPlate: z.string().optional(),
}).refine((data) => {
  if (data.userType === "driver") {
    return !!data.carModel && !!data.carPlate;
  }
  return true;
}, {
  message: "بيانات السيارة مطلوبة للسائق",
  path: ["carModel"],
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phone: "",
      userType: "rider",
      carModel: "",
      carPlate: "",
    },
  });

  const userType = registerForm.watch("userType");

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const { data, error } = await signIn(values.email, values.password);
      
      if (error) {
        toast.error("فشل تسجيل الدخول: " + error.message);
        return;
      }
      
      if (data.session) {
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await signUp(
        values.email, 
        values.password, 
        values.userType as UserType,
        values.fullName,
        values.phone
      );
      
      if (error) {
        toast.error("فشل التسجيل: " + error.message);
        return;
      }
      
      if (values.userType === "driver" && data?.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            car_model: values.carModel,
            car_plate: values.carPlate
          })
          .eq('id', data.user.id);

        if (updateError) {
          toast.error("تم تسجيل الحساب ولكن حدث خطأ في تحديث بيانات السيارة");
        }
      }
      
      if (data) {
        toast.success("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
        loginForm.reset({
          email: values.email,
          password: values.password,
        });
        document.getElementById("login-tab")?.click();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">OusTaa</CardTitle>
            <CardDescription className="text-center">
              خدمة تطبيق التاكسي الأفضل في ليبيا
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" id="login-tab">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل بريدك الإلكتروني" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل بريدك الإلكتروني" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسمك الكامل" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل رقم هاتفك" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>نوع الحساب</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-2 gap-4"
                            >
                              <div>
                                <RadioGroupItem
                                  value="rider"
                                  id="rider"
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor="rider"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <User className="mb-2 h-6 w-6" />
                                  راكب
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem
                                  value="driver"
                                  id="driver"
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor="driver"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <Car className="mb-2 h-6 w-6" />
                                  سائق
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {userType === "driver" && (
                      <>
                        <FormField
                          control={registerForm.control}
                          name="carModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع السيارة</FormLabel>
                              <FormControl>
                                <Input placeholder="مثال: تويوتا كامري 2020" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="carPlate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم لوحة السيارة</FormLabel>
                              <FormControl>
                                <Input placeholder="مثال: 12345-ط" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "جاري التسجيل..." : "إنشاء حساب"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              من خلال التسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية
            </p>
          </CardFooter>
        </Card>
      </div>
    </GuestGuard>
  );
};

export default Auth;
