-- =============================================
-- SCS GO - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'operator', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  business_name TEXT,
  business_license TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  operator_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. VEHICLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  battery_kwh NUMERIC DEFAULT 60,
  soc_current NUMERIC DEFAULT 50,
  consumption_kwh_per_100km NUMERIC DEFAULT 16,
  preferred_connector TEXT DEFAULT 'CCS2' CHECK (preferred_connector IN ('CCS2', 'Type2', 'CHAdeMO', 'GBT')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. STATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  provider TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  hours_open TEXT DEFAULT '06:00',
  hours_close TEXT DEFAULT '23:00',
  is_24h BOOLEAN DEFAULT FALSE,
  amenities TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. CHARGERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chargers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  connector_type TEXT NOT NULL CHECK (connector_type IN ('CCS2', 'Type2', 'CHAdeMO', 'GBT')),
  power_kw NUMERIC NOT NULL,
  price_per_kwh NUMERIC NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'out_of_service')),
  charger_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  charger_id UUID REFERENCES chargers(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('held', 'confirmed', 'cancelled', 'completed', 'expired')),
  total_price NUMERIC,
  services TEXT[] DEFAULT '{}',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. STATION_REVENUE TABLE (for operator analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS station_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_kwh NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(station_id, date)
);

-- =============================================
-- 7. OPERATOR_PAYOUTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS operator_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  bank_name TEXT,
  bank_account TEXT,
  payout_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, station_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_payouts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Users can view own vehicles" ON vehicles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- Stations policies (public read, operator write)
CREATE POLICY "Anyone can view approved stations" ON stations FOR SELECT USING (status = 'approved');
CREATE POLICY "Operators can manage own stations" ON stations FOR ALL USING (auth.uid() = operator_id);

-- Chargers policies (public read)
CREATE POLICY "Anyone can view chargers" ON chargers FOR SELECT USING (true);
CREATE POLICY "Operators can manage chargers" ON chargers FOR ALL 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = chargers.station_id AND stations.operator_id = auth.uid()));

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Operators can view station bookings" ON bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = bookings.station_id AND stations.operator_id = auth.uid()));
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Operators can update station bookings" ON bookings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = bookings.station_id AND stations.operator_id = auth.uid()));

-- Station Revenue policies
CREATE POLICY "Operators can view own station revenue" ON station_revenue FOR SELECT 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = station_revenue.station_id AND stations.operator_id = auth.uid()));
CREATE POLICY "System can insert revenue" ON station_revenue FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update revenue" ON station_revenue FOR UPDATE USING (true);

-- Operator Payouts policies
CREATE POLICY "Operators can view own payouts" ON operator_payouts FOR SELECT USING (auth.uid() = operator_id);
CREATE POLICY "Operators can request payouts" ON operator_payouts FOR INSERT WITH CHECK (auth.uid() = operator_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SAMPLE DATA - Vietnamese EV Charging Stations
-- =============================================

-- Insert sample stations
INSERT INTO stations (name, address, lat, lng, provider, description, is_24h, amenities, image_url) VALUES
('VinFast Hà Nội 1', '458 Minh Khai, Hai Bà Trưng, Hà Nội', 21.0011, 105.8625, 'VinFast', 'Trạm sạc VinFast tại trung tâm Hà Nội', true, ARRAY['wifi', 'cafe', 'toilet', 'parking'], 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'),
('EVN Cầu Giấy', '144 Xuân Thủy, Cầu Giấy, Hà Nội', 21.0369, 105.7835, 'EVN', 'Trạm sạc công cộng EVN', false, ARRAY['parking', 'toilet'], 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
('VinFast Times City', 'Tòa T1, Times City, Hai Bà Trưng, Hà Nội', 20.9952, 105.8686, 'VinFast', 'Trạm sạc tại TTTM Times City', true, ARRAY['wifi', 'cafe', 'shopping', 'toilet', 'parking'], 'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=800'),
('EV One Long Biên', '27 Cổ Linh, Long Biên, Hà Nội', 21.0408, 105.9178, 'EV One', 'Trạm sạc nhanh EV One', false, ARRAY['cafe', 'parking'], 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'),
('VinFast Hồ Gươm', '1 Tràng Tiền, Hoàn Kiếm, Hà Nội', 21.0245, 105.8542, 'VinFast', 'Trạm sạc gần Hồ Gươm', true, ARRAY['wifi', 'toilet', 'parking'], 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'),
('EVN Thanh Xuân', '83 Nguyễn Trãi, Thanh Xuân, Hà Nội', 20.9932, 105.8002, 'EVN', 'Trạm sạc EVN Thanh Xuân', false, ARRAY['parking', 'toilet'], 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
('VinFast Sài Gòn 1', '72 Lê Thánh Tôn, Quận 1, TP.HCM', 10.7769, 106.7009, 'VinFast', 'Trạm sạc trung tâm Quận 1', true, ARRAY['wifi', 'cafe', 'toilet', 'parking'], 'https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=800'),
('EVN Quận 7', '1 Nguyễn Văn Linh, Quận 7, TP.HCM', 10.7325, 106.7219, 'EVN', 'Trạm sạc Phú Mỹ Hưng', false, ARRAY['parking', 'shopping'], 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800'),
('VinFast Thủ Đức', '1 Võ Văn Ngân, Thủ Đức, TP.HCM', 10.8506, 106.7719, 'VinFast', 'Trạm sạc khu vực Thủ Đức', true, ARRAY['wifi', 'cafe', 'parking'], 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'),
('EV One Đà Nẵng', '36 Bạch Đằng, Hải Châu, Đà Nẵng', 16.0678, 108.2208, 'EV One', 'Trạm sạc bên sông Hàn', false, ARRAY['cafe', 'parking', 'toilet'], 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800');

-- Insert chargers for each station
DO $$
DECLARE
  station_record RECORD;
BEGIN
  FOR station_record IN SELECT id, provider FROM stations LOOP
    -- Add 4-8 chargers per station
    INSERT INTO chargers (station_id, connector_type, power_kw, price_per_kwh, status, charger_number)
    SELECT 
      station_record.id,
      (ARRAY['CCS2', 'CCS2', 'Type2', 'CHAdeMO'])[floor(random() * 4 + 1)],
      (ARRAY[50, 100, 150, 250])[floor(random() * 4 + 1)],
      CASE 
        WHEN station_record.provider = 'VinFast' THEN 3500 + floor(random() * 500)
        WHEN station_record.provider = 'EVN' THEN 3000 + floor(random() * 400)
        ELSE 3800 + floor(random() * 600)
      END,
      (ARRAY['available', 'available', 'available', 'occupied', 'available'])[floor(random() * 5 + 1)],
      generate_series
    FROM generate_series(1, 4 + floor(random() * 4)::int);
  END LOOP;
END $$;

-- Add some sample reviews
INSERT INTO reviews (user_id, station_id, rating, comment)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  id,
  4 + floor(random() * 2)::int,
  (ARRAY[
    'Trạm sạc rất tiện lợi, nhân viên nhiệt tình',
    'Sạc nhanh, giá hợp lý',
    'Vị trí đẹp, dễ tìm',
    'Có wifi và cafe, rất tiện',
    'Trạm sạch sẽ, hiện đại'
  ])[floor(random() * 5 + 1)]
FROM stations
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
