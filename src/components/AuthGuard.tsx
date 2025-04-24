
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const AuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const UserTypeGuard = ({ 
  allowedTypes, 
  children 
}: { 
  allowedTypes: string[], 
  children: React.ReactNode 
}) => {
  const { userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
    );
  }

  if (!userType || !allowedTypes.includes(userType)) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-2">غير مصرح</h3>
        <p className="text-slate-600 dark:text-slate-400">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
