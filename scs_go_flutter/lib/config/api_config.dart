/// API Configuration for OpenChargeMap and other services
class ApiConfig {
  // OpenChargeMap API
  static const String openChargeMapBaseUrl = 'https://api.openchargemap.io/v3';

  /// API Key from OpenChargeMap
  /// Register at: https://openchargemap.org/site/develop/api
  static const String openChargeMapApiKey =
      '0bdb16cf-b8dd-4680-bd44-178c06d98295';

  // Default search parameters
  static const String defaultCountryCode = 'VN';
  static const int defaultDistanceKm = 50;
  static const int defaultMaxResults = 100;

  // Default location (Ho Chi Minh City center)
  static const double defaultLatitude = 10.7769;
  static const double defaultLongitude = 106.7009;
}
