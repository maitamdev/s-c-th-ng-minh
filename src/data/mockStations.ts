import { Station, Charger, Review } from '@/types';
import { PROVIDERS, AMENITIES, VIETNAM_CITIES } from '@/lib/constants';

// Generate random stations around Vietnam cities
function generateStations(): Station[] {
  const stations: Station[] = [];
  let stationId = 1;

  VIETNAM_CITIES.forEach((city) => {
    // Generate 15-20 stations per city
    const numStations = Math.floor(Math.random() * 6) + 15;
    
    for (let i = 0; i < numStations; i++) {
      // Random offset within ~15km of city center
      const latOffset = (Math.random() - 0.5) * 0.25;
      const lngOffset = (Math.random() - 0.5) * 0.25;
      
      const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)];
      const numAmenities = Math.floor(Math.random() * 5) + 1;
      const amenities = [...AMENITIES]
        .sort(() => Math.random() - 0.5)
        .slice(0, numAmenities);
      
      const is24h = Math.random() > 0.7;
      
      stations.push({
        id: `station-${stationId}`,
        operator_id: `operator-${Math.floor(Math.random() * 10) + 1}`,
        name: `${provider} ${city.name} ${i + 1}`,
        address: `Số ${Math.floor(Math.random() * 200) + 1}, Đường ${['Nguyễn Huệ', 'Lê Lợi', 'Trần Phú', 'Hai Bà Trưng', 'Lý Thường Kiệt'][Math.floor(Math.random() * 5)]}, ${city.name}`,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        provider,
        hours_json: {
          open: is24h ? '00:00' : '06:00',
          close: is24h ? '24:00' : '22:00',
          is_24h: is24h,
        },
        amenities_json: amenities,
        status: 'approved',
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      stationId++;
    }
  });

  return stations;
}

function generateChargers(stations: Station[]): Charger[] {
  const chargers: Charger[] = [];
  const connectorTypes = ['CCS2', 'Type2', 'CHAdeMO', 'GBT'] as const;
  const powerLevels = [22, 50, 60, 100, 120, 150, 180, 250, 350];
  
  stations.forEach((station) => {
    const numChargers = Math.floor(Math.random() * 8) + 2;
    
    for (let i = 0; i < numChargers; i++) {
      const connector = connectorTypes[Math.floor(Math.random() * connectorTypes.length)];
      const power = powerLevels[Math.floor(Math.random() * powerLevels.length)];
      const statuses: ('available' | 'occupied' | 'out_of_service')[] = ['available', 'available', 'available', 'occupied', 'out_of_service'];
      
      chargers.push({
        id: `charger-${station.id}-${i + 1}`,
        station_id: station.id,
        connector_type: connector,
        power_kw: power,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        price_per_kwh: Math.round((3000 + Math.random() * 3000) / 100) * 100, // 3000-6000 VND
      });
    }
  });

  return chargers;
}

function generateReviews(stations: Station[]): Review[] {
  const reviews: Review[] = [];
  const comments = [
    'Trạm sạch sẽ, nhân viên nhiệt tình',
    'Sạc nhanh, vị trí thuận tiện',
    'Có quán cà phê ngay bên cạnh, rất tiện',
    'Wifi nhanh, phòng chờ thoải mái',
    'Giá hơi cao nhưng chất lượng tốt',
    'Cổng sạc đôi khi bị lỗi, cần cải thiện',
    'Vị trí hơi khó tìm, cần có biển chỉ dẫn rõ hơn',
    'Rất hài lòng, sẽ quay lại',
    'Trạm mới, thiết bị hiện đại',
    'Đông vào giờ cao điểm, nên đặt trước',
  ];

  stations.forEach((station) => {
    const numReviews = Math.floor(Math.random() * 15) + 3;
    
    for (let i = 0; i < numReviews; i++) {
      reviews.push({
        id: `review-${station.id}-${i + 1}`,
        user_id: `user-${Math.floor(Math.random() * 100) + 1}`,
        station_id: station.id,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        comment: comments[Math.floor(Math.random() * comments.length)],
        created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  return reviews;
}

// Generate and export mock data
export const mockStations = generateStations();
export const mockChargers = generateChargers(mockStations);
export const mockReviews = generateReviews(mockStations);

// Add computed fields to stations
export const enrichedStations = mockStations.map((station) => {
  const stationChargers = mockChargers.filter((c) => c.station_id === station.id);
  const stationReviews = mockReviews.filter((r) => r.station_id === station.id);
  
  return {
    ...station,
    chargers: stationChargers,
    available_chargers: stationChargers.filter((c) => c.status === 'available').length,
    min_price: Math.min(...stationChargers.map((c) => c.price_per_kwh)),
    max_power: Math.max(...stationChargers.map((c) => c.power_kw)),
    avg_rating: stationReviews.length > 0
      ? stationReviews.reduce((sum, r) => sum + r.rating, 0) / stationReviews.length
      : 0,
    review_count: stationReviews.length,
  };
});

// Seed destinations for AI
export const seedDestinations = [
  { name: 'Sân bay Nội Bài', lat: 21.2187, lng: 105.8072 },
  { name: 'Sân bay Tân Sơn Nhất', lat: 10.8184, lng: 106.6586 },
  { name: 'Vịnh Hạ Long', lat: 20.9517, lng: 107.0760 },
  { name: 'Phố cổ Hội An', lat: 15.8801, lng: 108.3380 },
  { name: 'Bãi biển Mỹ Khê', lat: 16.0545, lng: 108.2478 },
  { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583 },
  { name: 'Sapa', lat: 22.3363, lng: 103.8438 },
  { name: 'Phú Quốc', lat: 10.2280, lng: 103.9880 },
  { name: 'Trung tâm Quận 1', lat: 10.7769, lng: 106.7009 },
  { name: 'Hồ Hoàn Kiếm', lat: 21.0285, lng: 105.8523 },
];
