// useAnalytics - Page view tracking and custom event analytics
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Analytics events
type EventName = 
  | 'page_view'
  | 'search'
  | 'station_view'
  | 'booking_start'
  | 'booking_complete'
  | 'booking_cancel'
  | 'login'
  | 'signup'
  | 'favorite_add'
  | 'favorite_remove'
  | 'filter_apply'
  | 'share_station';

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

// Track event
export function trackEvent(name: EventName, params?: EventParams) {
  // Log in development
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', name, params);
  }

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', name, params);
  }

  // You can add other analytics providers here
  // e.g., Mixpanel, Amplitude, etc.
}

// Track page views automatically
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_view', {
      page_path: location.pathname,
      page_search: location.search,
    });
  }, [location]);
}

// Specific tracking functions
export const analytics = {
  // Search
  trackSearch: (query: string, filters: string[], resultsCount: number) => {
    trackEvent('search', {
      search_term: query,
      filters: filters.join(','),
      results_count: resultsCount,
    });
  },

  // Station
  trackStationView: (stationId: string, stationName: string) => {
    trackEvent('station_view', {
      station_id: stationId,
      station_name: stationName,
    });
  },

  // Booking
  trackBookingStart: (stationId: string) => {
    trackEvent('booking_start', { station_id: stationId });
  },

  trackBookingComplete: (stationId: string, amount: number, paymentMethod: string) => {
    trackEvent('booking_complete', {
      station_id: stationId,
      amount,
      payment_method: paymentMethod,
    });
  },

  trackBookingCancel: (bookingId: string, reason?: string) => {
    trackEvent('booking_cancel', {
      booking_id: bookingId,
      reason,
    });
  },

  // Auth
  trackLogin: (method: 'email' | 'google') => {
    trackEvent('login', { method });
  },

  trackSignup: (method: 'email' | 'google') => {
    trackEvent('signup', { method });
  },

  // Favorites
  trackFavoriteAdd: (stationId: string) => {
    trackEvent('favorite_add', { station_id: stationId });
  },

  trackFavoriteRemove: (stationId: string) => {
    trackEvent('favorite_remove', { station_id: stationId });
  },

  // Filters
  trackFilterApply: (filters: Record<string, string | number>) => {
    trackEvent('filter_apply', filters);
  },

  // Share
  trackShare: (stationId: string, platform: string) => {
    trackEvent('share_station', {
      station_id: stationId,
      platform,
    });
  },
};
