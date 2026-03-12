// useNotifications - Push notification management and booking reminders
import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string }[];
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('Notifications not available or not permitted');
      return null;
    }

    try {
      // Try to use service worker for better notification support
      const registration = await navigator.serviceWorker?.ready;
      
      if (registration) {
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/logo.jpg',
          badge: '/logo.jpg',
          tag: options.tag,
          data: options.data,
          requireInteraction: true,
        } as NotificationOptions);
        return true;
      } else {
        // Fallback to regular notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/logo.jpg',
          tag: options.tag,
          data: options.data,
        });
        return notification;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  // Schedule a notification for later
  const scheduleNotification = useCallback((options: NotificationOptions, delayMs: number) => {
    const timeoutId = setTimeout(() => {
      showNotification(options);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
  };
}

// Hook for booking reminders
export function useBookingReminder() {
  const { showNotification, permission, requestPermission } = useNotifications();

  const scheduleReminder = useCallback((booking: {
    id: string;
    stationName: string;
    startTime: Date;
  }) => {
    const now = new Date();
    const bookingTime = new Date(booking.startTime);
    
    // Remind 30 minutes before
    const reminderTime = new Date(bookingTime.getTime() - 30 * 60 * 1000);
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        showNotification({
          title: '⏰ Nhắc nhở đặt chỗ',
          body: `Bạn có lịch sạc tại ${booking.stationName} trong 30 phút nữa`,
          tag: `booking-reminder-${booking.id}`,
          data: {
            url: '/dashboard/bookings',
            bookingId: booking.id,
          },
        });
      }, delay);

      // Store timeout ID for cleanup
      const key = `reminder_${booking.id}`;
      localStorage.setItem(key, timeoutId.toString());

      return () => {
        clearTimeout(timeoutId);
        localStorage.removeItem(key);
      };
    }

    return () => {};
  }, [showNotification]);

  const cancelReminder = useCallback((bookingId: string) => {
    const key = `reminder_${bookingId}`;
    const timeoutId = localStorage.getItem(key);
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem(key);
    }
  }, []);

  return {
    permission,
    requestPermission,
    scheduleReminder,
    cancelReminder,
  };
}
