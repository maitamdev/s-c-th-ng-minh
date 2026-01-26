import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BottomNav } from "@/components/BottomNav";
import { usePageTracking } from "@/hooks/useAnalytics";
import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import StationDetail from "./pages/StationDetail";
import BookingPage from "./pages/BookingPage";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import VehicleSettings from "./pages/VehicleSettings";
import MyBookings from "./pages/MyBookings";
import ChargingHistory from "./pages/ChargingHistory";
import Favorites from "./pages/Favorites";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Operator pages
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import OperatorStations from "./pages/operator/OperatorStations";
import StationForm from "./pages/operator/StationForm";
import OperatorBookings from "./pages/operator/OperatorBookings";
import OperatorAnalytics from "./pages/operator/OperatorAnalytics";
import OperatorRevenue from "./pages/operator/OperatorRevenue";

const queryClient = new QueryClient();

// Analytics wrapper component
function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AnalyticsProvider>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Landing />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/station/:id" element={<StationDetail />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/help" element={<FAQ />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />

                      {/* Protected routes - require login */}
                      <Route path="/booking/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
                      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/dashboard/vehicle" element={<ProtectedRoute><VehicleSettings /></ProtectedRoute>} />
                      <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                      <Route path="/dashboard/history" element={<ProtectedRoute><ChargingHistory /></ProtectedRoute>} />
                      <Route path="/dashboard/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                      <Route path="/dashboard/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                      {/* Operator routes - require login */}
                      <Route path="/operator" element={<ProtectedRoute><OperatorDashboard /></ProtectedRoute>} />
                      <Route path="/operator/stations" element={<ProtectedRoute><OperatorStations /></ProtectedRoute>} />
                      <Route path="/operator/stations/new" element={<ProtectedRoute><StationForm /></ProtectedRoute>} />
                      <Route path="/operator/stations/:id" element={<ProtectedRoute><StationForm /></ProtectedRoute>} />
                      <Route path="/operator/stations/:id/edit" element={<ProtectedRoute><StationForm /></ProtectedRoute>} />
                      <Route path="/operator/bookings" element={<ProtectedRoute><OperatorBookings /></ProtectedRoute>} />
                      <Route path="/operator/analytics" element={<ProtectedRoute><OperatorAnalytics /></ProtectedRoute>} />
                      <Route path="/operator/revenue" element={<ProtectedRoute><OperatorRevenue /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnalyticsProvider>
                  <BottomNav />
                </BrowserRouter>
              </TooltipProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
