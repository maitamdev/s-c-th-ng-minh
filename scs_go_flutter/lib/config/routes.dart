import 'package:go_router/go_router.dart';
import '../screens/landing/landing_screen.dart';
import '../screens/auth/auth_screen.dart';
import '../screens/explore/explore_screen.dart';
import '../screens/station_detail/station_detail_screen.dart';
import '../screens/booking/booking_screen.dart';
import '../screens/booking/my_bookings_screen.dart';
import '../screens/booking/booking_detail_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/vehicle/vehicle_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/history/history_screen.dart';
import '../screens/trip_planner/trip_planner_screen.dart';
import '../screens/main_shell.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    // Landing page
    GoRoute(
      path: '/',
      name: 'landing',
      builder: (context, state) => const LandingScreen(),
    ),

    // Auth
    GoRoute(
      path: '/auth',
      name: 'auth',
      builder: (context, state) => const AuthScreen(),
    ),

    // Login (alias for auth)
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const AuthScreen(),
    ),

    // Main app with bottom navigation
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: '/explore',
          name: 'explore',
          builder: (context, state) => const ExploreScreen(),
        ),
        GoRoute(
          path: '/dashboard',
          name: 'dashboard',
          builder: (context, state) => const DashboardScreen(),
        ),
        GoRoute(
          path: '/favorites',
          name: 'favorites',
          builder: (context, state) => const FavoritesScreen(),
        ),
        GoRoute(
          path: '/settings',
          name: 'settings',
          builder: (context, state) => const SettingsScreen(),
        ),
      ],
    ),

    // Detail pages (no bottom nav)
    GoRoute(
      path: '/station/:id',
      name: 'stationDetail',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return StationDetailScreen(stationId: id);
      },
    ),
    GoRoute(
      path: '/booking/:id',
      name: 'booking',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return BookingScreen(stationId: id);
      },
    ),
    GoRoute(
      path: '/my-bookings',
      name: 'myBookings',
      builder: (context, state) => const MyBookingsScreen(),
    ),
    GoRoute(
      path: '/booking-detail/:id',
      name: 'bookingDetail',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return BookingDetailScreen(bookingId: id);
      },
    ),
    GoRoute(
      path: '/vehicle',
      name: 'vehicle',
      builder: (context, state) => const VehicleScreen(),
    ),
    GoRoute(
      path: '/history',
      name: 'history',
      builder: (context, state) => const HistoryScreen(),
    ),
    GoRoute(
      path: '/trip-planner',
      name: 'tripPlanner',
      builder: (context, state) => const TripPlannerScreen(),
    ),
  ],
);
