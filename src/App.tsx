
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Ride from "./pages/Ride";
import History from "./pages/History";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthGuard } from "./components/AuthGuard";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import { useEffect } from "react";
import { getMapboxToken } from "./lib/mapService";

// التحقق من وجود توكن Mapbox
useEffect(() => {
  const mapboxToken = getMapboxToken();
  if (!mapboxToken) {
    console.error("Mapbox token is missing. Maps will not work correctly.");
  }
}, []);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* المسارات المحمية */}
              <Route element={<AuthGuard />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ride" element={<Ride />} />
                  <Route path="/history" element={<History />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
