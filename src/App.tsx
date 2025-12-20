import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import StationDetail from "./pages/StationDetail";
import BookingPage from "./pages/BookingPage";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import VehicleSettings from "./pages/VehicleSettings";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/station/:id" element={<StationDetail />} />
              <Route path="/booking/:id" element={<BookingPage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/vehicle" element={<VehicleSettings />} />
              <Route path="/dashboard/bookings" element={<MyBookings />} />
              <Route path="/dashboard/favorites" element={<Favorites />} />
              <Route path="/dashboard/subscription" element={<Subscription />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
