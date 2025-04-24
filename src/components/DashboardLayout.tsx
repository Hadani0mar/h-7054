
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "@/lib/authService";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { User, Car, Home, Clock, LogOut, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { updateUserLocation } from "@/lib/authService";

const DashboardLayout = () => {
  const { profile, userType } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // تحديث موقع المستخدم
  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateUserLocation(latitude, longitude);
          },
          (error) => {
            console.error("خطأ في تحديد الموقع:", error);
          }
        );
      }
    };

    // تحديث الموقع عند تحميل الصفحة
    updateLocation();

    // تحديث الموقع كل دقيقة
    const intervalId = setInterval(updateLocation, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast.success("تم تسجيل الخروج بنجاح");
    }
  };

  // القائمة الرئيسية
  const menuItems = [
    { 
      label: "لوحة التحكم", 
      path: "/dashboard", 
      icon: <Home className="h-5 w-5 mr-2" /> 
    },
    {
      label: userType === "driver" ? "الرحلات المتاحة" : "طلب رحلة",
      path: "/ride",
      icon: <Car className="h-5 w-5 mr-2" />
    },
    {
      label: "سجل الرحلات",
      path: "/history",
      icon: <Clock className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Car className="h-6 w-6" />
              <span className="text-xl font-bold">OusTaa</span>
            </Link>
          </div>

          {/* قائمة الشاشات الكبيرة */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-slate-700 dark:text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* قائمة الشاشات الصغيرة */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="pb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <Car className="h-6 w-6" />
                    <span>OusTaa</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center py-2 text-sm font-medium transition-colors hover:text-primary ${
                        location.pathname === item.path
                          ? "text-primary"
                          : "text-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start px-2 hover:bg-slate-100 dark:hover:bg-slate-800 mt-4"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    تسجيل الخروج
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
              
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'المستخدم'} />
                <AvatarFallback>
                  {profile?.user_type === 'driver' ? <Car className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
