import { lazy, Suspense } from "react";
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

// Lazy-loaded pages for better initial bundle size
const Landing = lazy(() => import("./pages/Landing"));
const Explore = lazy(() => import("./pages/Explore"));
const StationDetail = lazy(() => import("./pages/StationDetail"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Contact = lazy(() => import("./pages/Contact"));
const Team = lazy(() => import("./pages/Team"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VehicleSettings = lazy(() => import("./pages/VehicleSettings"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const ChargingHistory = lazy(() => import("./pages/ChargingHistory"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Community = lazy(() => import("./pages/Community"));
const Navigation = lazy(() => import("./pages/Navigation"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));

// Operator pages
const OperatorDashboard = lazy(() => import("./pages/operator/OperatorDashboard"));
const OperatorStations = lazy(() => import("./pages/operator/OperatorStations"));
const StationForm = lazy(() => import("./pages/operator/StationForm"));
const OperatorBookings = lazy(() => import("./pages/operator/OperatorBookings"));
const OperatorAnalytics = lazy(() => import("./pages/operator/OperatorAnalytics"));
const OperatorRevenue = lazy(() => import("./pages/operator/OperatorRevenue"));

const queryClient = new QueryClient();

// Loading fallback for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

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
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/station/:id" element={<StationDetail />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="/help" element={<FAQ />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/navigation" element={<Navigation />} />
                        <Route path="/trip-planner" element={<TripPlanner />} />

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
                    </Suspense>
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
