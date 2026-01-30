import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Navigation as NavIcon,
  MapPin,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Layers,
  LocateFixed,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  Flag,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationStep {
  instruction: string;
  distance: string;
  icon: "straight" | "turn-right" | "turn-left" | "arrive";
}

interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  available: number;
  total: number;
}

const Navigation = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const isVn = language === "vi";
  
  // Get station from route state or use mock
  const station: Station = location.state?.station || {
    id: "1",
    name: "VinFast Charging - Aeon Mall",
    address: "30 Bờ Bao Tân Thắng, Tân Phú, TP.HCM",
    lat: 10.8012,
    lng: 106.6181,
    available: 3,
    total: 4,
  };

  const [isNavigating, setIsNavigating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(5.3);
  const [remainingTime, setRemainingTime] = useState(12);
  const [userLocation] = useState({ lat: 10.7769, lng: 106.7009 });

  const navigationSteps: NavigationStep[] = [
    {
      instruction: isVn ? "Đi thẳng về phía Bắc" : "Head north",
      distance: "1.5 km",
      icon: "straight",
    },
    {
      instruction: isVn
        ? "Rẽ phải vào đường Nguyễn Huệ"
        : "Turn right onto Nguyen Hue St",
      distance: "1.2 km",
      icon: "turn-right",
    },
    {
      instruction: isVn ? "Tiếp tục đi thẳng" : "Continue straight",
      distance: "1.8 km",
      icon: "straight",
    },
    {
      instruction: isVn
        ? "Rẽ trái vào đường Lê Lợi"
        : "Turn left onto Le Loi St",
      distance: "0.5 km",
      icon: "turn-left",
    },
    {
      instruction: isVn
        ? `Đích đến ở bên phải - ${station.name}`
        : `Destination on right - ${station.name}`,
      distance: "0.3 km",
      icon: "arrive",
    },
  ];

  const getStepIcon = (icon: NavigationStep["icon"]) => {
    switch (icon) {
      case "straight":
        return <ArrowUp className="h-6 w-6" />;
      case "turn-right":
        return <CornerUpRight className="h-6 w-6" />;
      case "turn-left":
        return <CornerUpLeft className="h-6 w-6" />;
      case "arrive":
        return <Flag className="h-6 w-6" />;
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    // Simulate navigation progress
    const interval = setInterval(() => {
      setRemainingDistance((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 0.1;
      });
      setRemainingTime((prev) => Math.max(0, prev - 1));
    }, 5000);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    // Initialize map (using OpenStreetMap iframe for simplicity)
    // In production, use Leaflet or similar library
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 relative">
      {/* Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0">
        <iframe
          title="Navigation Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
            userLocation.lng - 0.05
          }%2C${userLocation.lat - 0.03}%2C${userLocation.lng + 0.05}%2C${
            userLocation.lat + 0.03
          }&layer=mapnik&marker=${station.lat}%2C${station.lng}`}
          style={{ border: 0 }}
        />
      </div>

      {/* Navigation Header (when navigating) */}
      {isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                {getStepIcon(navigationSteps[currentStepIndex].icon)}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold">
                  {navigationSteps[currentStepIndex].instruction}
                </p>
                <p className="text-sm opacity-90">
                  {navigationSteps[currentStepIndex].distance}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-500">
                  {remainingDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-gray-500">
                  {isVn ? "Còn lại" : "Remaining"}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold">{remainingTime} min</p>
                <p className="text-xs text-gray-500">
                  {isVn ? "Thời gian" : "Time"}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={stopNavigation}
            >
              {isVn ? "Dừng" : "Stop"}
            </Button>
          </div>
        </div>
      )}

      {/* Back Button (when not navigating) */}
      {!isNavigating && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute right-4 top-1/3 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
        >
          <LocateFixed className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
        >
          <Layers className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Card className="rounded-t-3xl shadow-2xl">
          <CardContent className="p-6">
            {/* Station Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{station.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {station.address}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                {station.available}/{station.total}{" "}
                {isVn ? "trống" : "available"}
              </Badge>
            </div>

            {/* Route Info */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-500">
                  {remainingDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-gray-500">
                  {isVn ? "Khoảng cách" : "Distance"}
                </p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold">{remainingTime} min</p>
                <p className="text-xs text-gray-500">
                  {isVn ? "Thời gian" : "Time"}
                </p>
              </div>
              <div className="h-10 w-px bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-500">
                  {navigationSteps.length}
                </p>
                <p className="text-xs text-gray-500">
                  {isVn ? "Bước" : "Steps"}
                </p>
              </div>
            </div>

            {/* Navigation Steps Preview */}
            {!isNavigating && (
              <div className="mb-4 max-h-40 overflow-y-auto space-y-2">
                {navigationSteps.slice(0, 3).map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg text-teal-600">
                      {getStepIcon(step.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.instruction}</p>
                      <p className="text-xs text-gray-500">{step.distance}</p>
                    </div>
                  </div>
                ))}
                {navigationSteps.length > 3 && (
                  <p className="text-xs text-center text-gray-500">
                    +{navigationSteps.length - 3}{" "}
                    {isVn ? "bước nữa" : "more steps"}
                  </p>
                )}
              </div>
            )}

            {/* Action Button */}
            {!isNavigating ? (
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 h-14 text-lg"
                onClick={startNavigation}
              >
                <NavIcon className="h-5 w-5 mr-2" />
                {isVn ? "Bắt đầu dẫn đường" : "Start Navigation"}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-center text-gray-500">
                  {isVn ? "Đang dẫn đường..." : "Navigating..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Navigation;
