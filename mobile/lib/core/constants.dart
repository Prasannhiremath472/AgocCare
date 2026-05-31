class AppConstants {
  static const String appName = 'AgocCare';
  static const String tokenKey = 'medico-auth-token';
  static const String userKey = 'medico-auth-user';
  static const String cartKey = 'medico-cart';

  static const double deliveryFee = 49.0;
  static const double freeDeliveryThreshold = 499.0;

  static const List<String> orderStatuses = [
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  ];

  static const Map<String, String> orderStatusLabels = {
    'pending': 'Pending',
    'paid': 'Paid',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
  };
}

class AppRoutes {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String products = '/medicines';
  static const String productDetail = '/medicines/:slug';
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String orderDetail = '/orders/:id';
  static const String prescription = '/prescription';
  static const String profile = '/profile';
  static const String about = '/about';

  // Admin
  static const String adminDashboard = '/admin';
  static const String adminProducts = '/admin/products';
  static const String adminOrders = '/admin/orders';
  static const String adminCategories = '/admin/categories';
  static const String adminUsers = '/admin/users';
  static const String adminAnalytics = '/admin/analytics';
  static const String adminOffers = '/admin/offers';
}
