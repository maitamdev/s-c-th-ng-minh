-- =============================================
-- SCS GO - Migration: Add Operator Tables
-- Run this in Supabase SQL Editor (Production)
-- =============================================

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_license TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS operator_verified BOOLEAN DEFAULT FALSE;

-- Add expired status to bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('held', 'confirmed', 'cancelled', 'completed', 'expired'));

-- =============================================
-- STATION_REVENUE TABLE (for operator analytics)
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
-- OPERATOR_PAYOUTS TABLE
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
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE station_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_payouts ENABLE ROW LEVEL SECURITY;

-- Station Revenue policies
DROP POLICY IF EXISTS "Operators can view own station revenue" ON station_revenue;
CREATE POLICY "Operators can view own station revenue" ON station_revenue FOR SELECT 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = station_revenue.station_id AND stations.operator_id = auth.uid()));

DROP POLICY IF EXISTS "System can insert revenue" ON station_revenue;
CREATE POLICY "System can insert revenue" ON station_revenue FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update revenue" ON station_revenue;
CREATE POLICY "System can update revenue" ON station_revenue FOR UPDATE USING (true);

-- Operator Payouts policies
DROP POLICY IF EXISTS "Operators can view own payouts" ON operator_payouts;
CREATE POLICY "Operators can view own payouts" ON operator_payouts FOR SELECT USING (auth.uid() = operator_id);

DROP POLICY IF EXISTS "Operators can request payouts" ON operator_payouts;
CREATE POLICY "Operators can request payouts" ON operator_payouts FOR INSERT WITH CHECK (auth.uid() = operator_id);

-- Update bookings policies for operators
DROP POLICY IF EXISTS "Operators can view station bookings" ON bookings;
CREATE POLICY "Operators can view station bookings" ON bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = bookings.station_id AND stations.operator_id = auth.uid()));

DROP POLICY IF EXISTS "Operators can update station bookings" ON bookings;
CREATE POLICY "Operators can update station bookings" ON bookings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM stations WHERE stations.id = bookings.station_id AND stations.operator_id = auth.uid()));

-- =============================================
-- DONE! Now operators can:
-- 1. Register with business info
-- 2. Add their stations
-- 3. View bookings for their stations
-- 4. Track revenue
-- 5. Request payouts
-- =============================================
