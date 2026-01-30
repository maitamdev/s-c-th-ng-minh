import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  MapPin,
  Navigation,
  Zap,
  Clock,
  Battery,
  Route,
  Plus,
  Trash2,
  GripVertical,
  Car,
  AlertCircle,
  CheckCircle2,
  Coffee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Waypoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "start" | "charging" | "destination" | "waypoint";
  chargingTime?: number;
  batteryOnArrival?: number;
}

interface ChargingStop {
  station: {
    id: string;
    name: string;
    address: string;
    power: number;
    price: number;
  };
  chargeFromPercent: number;
  chargeToPercent: number;
  chargingTime: number;
  distanceFromPrevious: number;
}

interface TripSummary {
  totalDistance: number;
  totalTime: number;
  totalChargingTime: number;
  totalChargingCost: number;
  chargingStops: number;
}

const TripPlanner = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isVn = language === "vi";

  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [currentBattery, setCurrentBattery] = useState([80]);
  const [vehicleRange, setVehicleRange] = useState("300");
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock waypoints for the trip
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // Mock charging stops
  const chargingStops: ChargingStop[] = [
    {
      station: {
        id: "1",
        name: "VinFast Charging - Bảo Lộc",
        address: "QL20, Bảo Lộc, Lâm Đồng",
        power: 150,
        price: 4500,
      },
      chargeFromPercent: 15,
      chargeToPercent: 80,
      chargingTime: 25,
      distanceFromPrevious: 180,
    },
    {
      station: {
        id: "2",
        name: "EV Station - Đức Trọng",
        address: "Quốc lộ 20, Đức Trọng, Lâm Đồng",
        power: 120,
        price: 4200,
      },
      chargeFromPercent: 20,
      chargeToPercent: 90,
      chargingTime: 35,
      distanceFromPrevious: 85,
    },
  ];

  const tripSummary: TripSummary = {
    totalDistance: 310,
    totalTime: 5.5,
    totalChargingTime: 60,
    totalChargingCost: 280000,
    chargingStops: 2,
  };

  const vehicleOptions = [
    { value: "300", label: "VinFast VF8 (300 km)" },
    { value: "420", label: "VinFast VF9 (420 km)" },
    { value: "250", label: "VinFast VF e34 (250 km)" },
    { value: "350", label: "Tesla Model 3 (350 km)" },
    { value: "400", label: "Tesla Model Y (400 km)" },
    { value: "280", label: isVn ? "Khác (280 km)" : "Other (280 km)" },
  ];

  const handleCalculateRoute = async () => {
    if (!startLocation || !endLocation) return;

    setIsCalculating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCalculating(false);
    setShowResults(true);
  };

  const handleAddWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: `wp-${Date.now()}`,
      name: "",
      address: "",
      lat: 0,
      lng: 0,
      type: "waypoint",
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const handleRemoveWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
  };

  const handleStartNavigation = () => {
    navigate("/navigation", {
      state: {
        station: {
          id: "dalat",
          name: endLocation,
          address: "Đà Lạt, Lâm Đồng",
          lat: 11.9404,
          lng: 108.4583,
          available: 4,
          total: 6,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {isVn ? "Lập lộ trình" : "Trip Planner"}
              </h1>
              <p className="text-sm text-gray-500">
                {isVn
                  ? "Tính toán điểm sạc tối ưu"
                  : "Calculate optimal charging stops"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-teal-500" />
              {isVn ? "Thông tin chuyến đi" : "Trip Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Start Location */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <Input
                placeholder={isVn ? "Điểm xuất phát" : "Starting point"}
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Waypoints */}
            {waypoints.map((wp, index) => (
              <div key={wp.id} className="relative flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  </div>
                  <Input
                    placeholder={`${isVn ? "Điểm dừng" : "Stop"} ${index + 1}`}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveWaypoint(wp.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}

            {/* Add Waypoint Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddWaypoint}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isVn ? "Thêm điểm dừng" : "Add stop"}
            </Button>

            {/* End Location */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <Input
                placeholder={isVn ? "Điểm đến" : "Destination"}
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Vehicle Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Car className="h-4 w-4 inline mr-1" />
                  {isVn ? "Loại xe" : "Vehicle"}
                </label>
                <Select value={vehicleRange} onValueChange={setVehicleRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Battery className="h-4 w-4 inline mr-1" />
                  {isVn ? "Pin hiện tại" : "Current battery"}: {currentBattery}%
                </label>
                <Slider
                  value={currentBattery}
                  onValueChange={setCurrentBattery}
                  max={100}
                  step={5}
                  className="mt-3"
                />
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 h-12"
              onClick={handleCalculateRoute}
              disabled={!startLocation || !endLocation || isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {isVn ? "Đang tính toán..." : "Calculating..."}
                </>
              ) : (
                <>
                  <Route className="h-5 w-5 mr-2" />
                  {isVn ? "Tính toán lộ trình" : "Calculate Route"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <>
            {/* Trip Summary */}
            <Card className="border-teal-200 bg-teal-50/50 dark:bg-teal-900/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-teal-600">
                      {tripSummary.totalDistance} km
                    </p>
                    <p className="text-xs text-gray-500">
                      {isVn ? "Tổng quãng đường" : "Total distance"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {tripSummary.totalTime}h
                    </p>
                    <p className="text-xs text-gray-500">
                      {isVn ? "Thời gian đi" : "Travel time"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-500">
                      {tripSummary.totalChargingTime} min
                    </p>
                    <p className="text-xs text-gray-500">
                      {isVn ? "Thời gian sạc" : "Charging time"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-600">
                      {(tripSummary.totalChargingCost / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-gray-500">
                      {isVn ? "Chi phí sạc" : "Charging cost"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-500" />
                  {isVn ? "Lộ trình chi tiết" : "Route Details"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                  {/* Start Point */}
                  <div className="relative flex items-start gap-4 pb-6">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">{startLocation}</p>
                      <p className="text-sm text-gray-500">
                        {isVn ? "Điểm xuất phát" : "Starting point"} •{" "}
                        {currentBattery}% {isVn ? "pin" : "battery"}
                      </p>
                    </div>
                  </div>

                  {/* Charging Stops */}
                  {chargingStops.map((stop, index) => (
                    <div
                      key={stop.station.id}
                      className="relative flex items-start gap-4 pb-6"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center z-10">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold">{stop.station.name}</p>
                            <p className="text-sm text-gray-500">
                              {stop.station.address}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {stop.distanceFromPrevious} km
                          </Badge>
                        </div>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Battery className="h-4 w-4" />
                              {stop.chargeFromPercent}% → {stop.chargeToPercent}
                              %
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {stop.chargingTime} min
                            </span>
                            <span className="flex items-center gap-1 text-teal-600">
                              <Zap className="h-4 w-4" />
                              {stop.station.power} kW
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Coffee className="h-4 w-4 text-orange-500" />
                            <span className="text-xs text-gray-500">
                              {isVn
                                ? "Có quán cafe, toilet"
                                : "Coffee shop, restroom available"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* End Point */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center z-10">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold">{endLocation}</p>
                      <p className="text-sm text-gray-500">
                        {isVn ? "Điểm đến" : "Destination"} • ~45%{" "}
                        {isVn ? "pin còn lại" : "battery remaining"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-700 dark:text-orange-400">
                      {isVn ? "Lưu ý" : "Tips"}
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mt-1 space-y-1">
                      <li>
                        •{" "}
                        {isVn
                          ? "Nên sạc trước khi pin xuống dưới 20%"
                          : "Charge before battery drops below 20%"}
                      </li>
                      <li>
                        •{" "}
                        {isVn
                          ? "Thời gian sạc có thể thay đổi tùy điều kiện thực tế"
                          : "Charging time may vary based on conditions"}
                      </li>
                      <li>
                        •{" "}
                        {isVn
                          ? "Nên đặt trước cổng sạc qua app"
                          : "Book charging port in advance via app"}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <MapPin className="h-4 w-4 mr-2" />
                {isVn ? "Lưu lộ trình" : "Save Route"}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
                onClick={handleStartNavigation}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isVn ? "Bắt đầu" : "Start"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TripPlanner;
