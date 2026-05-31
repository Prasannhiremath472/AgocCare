import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart' as badges;
import '../core/theme.dart';
import '../core/constants.dart';
import '../providers/cart_provider.dart';

class AppBottomNav extends ConsumerWidget {
  final int currentIndex;
  const AppBottomNav({super.key, required this.currentIndex});

  static const _routes = [
    AppRoutes.home,
    AppRoutes.products,
    AppRoutes.cart,
    AppRoutes.orders,
    AppRoutes.profile,
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartCountProvider);
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: (i) {
        if (i != currentIndex) context.go(_routes[i]);
      },
      items: [
        const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
        const BottomNavigationBarItem(icon: Icon(Icons.medication_outlined), activeIcon: Icon(Icons.medication), label: 'Medicines'),
        BottomNavigationBarItem(
          label: 'Cart',
          icon: badges.Badge(
            showBadge: cartCount > 0,
            badgeContent: Text('$cartCount', style: const TextStyle(color: Colors.white, fontSize: 10)),
            child: const Icon(Icons.shopping_cart_outlined),
          ),
          activeIcon: badges.Badge(
            showBadge: cartCount > 0,
            badgeContent: Text('$cartCount', style: const TextStyle(color: Colors.white, fontSize: 10)),
            child: const Icon(Icons.shopping_cart),
          ),
        ),
        const BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), activeIcon: Icon(Icons.receipt_long), label: 'Orders'),
        const BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
      ],
    );
  }
}
