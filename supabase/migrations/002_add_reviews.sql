-- Review System Migration for SCS GO
-- This migration adds tables for storing user reviews and ratings

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id TEXT NOT NULL,  -- OpenChargeMap station ID (can be string)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,  -- True if user had actual booking
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one review per user per station
  CONSTRAINT unique_user_station_review UNIQUE (user_id, station_id)
);

-- ============================================
-- REVIEW IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEW HELPFUL VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One vote per user per review
  CONSTRAINT unique_helpful_vote UNIQUE (review_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_station ON reviews(station_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user ON review_helpful(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view active reviews" ON reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Review images policies
CREATE POLICY "Anyone can view review images" ON review_images
  FOR SELECT USING (true);

CREATE POLICY "Review owners can manage images" ON review_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = review_images.review_id 
      AND reviews.user_id = auth.uid()
    )
  );

-- Review helpful policies
CREATE POLICY "Anyone can view helpful votes" ON review_helpful
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON review_helpful
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own votes" ON review_helpful
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update helpful_count on reviews
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_helpful;
CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Function to update review timestamp
CREATE OR REPLACE FUNCTION update_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_updated ON reviews;
CREATE TRIGGER trigger_review_updated
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_review_timestamp();

-- Function to get review stats for a station
CREATE OR REPLACE FUNCTION get_station_review_stats(p_station_id TEXT)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews BIGINT,
  rating_1 BIGINT,
  rating_2 BIGINT,
  rating_3 BIGINT,
  rating_4 BIGINT,
  rating_5 BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0) as average_rating,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE rating = 1) as rating_1,
    COUNT(*) FILTER (WHERE rating = 2) as rating_2,
    COUNT(*) FILTER (WHERE rating = 3) as rating_3,
    COUNT(*) FILTER (WHERE rating = 4) as rating_4,
    COUNT(*) FILTER (WHERE rating = 5) as rating_5
  FROM reviews
  WHERE station_id = p_station_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;
