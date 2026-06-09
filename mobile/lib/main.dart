import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:go_router/go_router.dart';
import 'core/theme.dart';
import 'core/constants.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/user/home_screen.dart';
import 'screens/user/products_screen.dart';
import 'screens/user/product_detail_screen.dart';
import 'screens/user/cart_screen.dart';
import 'screens/user/checkout_screen.dart';
import 'screens/user/orders_screen.dart';
import 'screens/user/prescription_screen.dart';
import 'screens/user/profile_screen.dart';
import 'screens/user/about_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  // Increase image cache: 150 MB / 500 images
  PaintingBinding.instance.imageCache.maximumSizeBytes = 150 << 20;
  PaintingBinding.instance.imageCache.maximumSize = 500;

  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp, DeviceOrientation.portraitDown]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
  runApp(const ProviderScope(child: AgocCareApp()));
}

final _router = GoRouter(
  initialLocation: AppRoutes.splash,
  routes: [
    GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
    GoRoute(path: AppRoutes.onboarding, builder: (_, __) => const OnboardingScreen()),
    GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
    GoRoute(path: AppRoutes.register, builder: (_, __) => const RegisterScreen()),
    GoRoute(path: AppRoutes.home, builder: (_, __) => const HomeScreen()),
    GoRoute(
      path: AppRoutes.products,
      builder: (_, state) {
        final cat = state.uri.queryParameters['category'];
        return ProductsScreen(initialCategory: cat);
      },
    ),
    GoRoute(
      path: '/medicines/:slug',
      builder: (_, state) => ProductDetailScreen(slug: state.pathParameters['slug']!),
    ),
    GoRoute(path: AppRoutes.cart, builder: (_, __) => const CartScreen()),
    GoRoute(path: AppRoutes.checkout, builder: (_, __) => const CheckoutScreen()),
    GoRoute(path: AppRoutes.orders, builder: (_, __) => const OrdersScreen()),
    GoRoute(
      path: '/orders/:id',
      builder: (_, state) => OrderDetailScreen(orderId: int.parse(state.pathParameters['id']!)),
    ),
    GoRoute(path: AppRoutes.prescription, builder: (_, __) => const PrescriptionScreen()),
    GoRoute(path: AppRoutes.profile, builder: (_, __) => const ProfileScreen()),
    GoRoute(path: AppRoutes.about, builder: (_, __) => const AboutScreen()),
  ],
);

class AgocCareApp extends ConsumerWidget {
  const AgocCareApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'AgocCare',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: _router,
    );
  }
}
