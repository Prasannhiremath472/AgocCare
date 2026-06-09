import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../providers/cart_provider.dart';

class AppBottomNav extends ConsumerWidget {
  final int currentIndex;
  const AppBottomNav({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartCount = ref.watch(cartCountProvider);

    final items = [
      _NavItem(icon: Icons.home_outlined,          activeIcon: Icons.home_rounded,              label: 'Home'),
      _NavItem(icon: Icons.medication_outlined,    activeIcon: Icons.medication_rounded,        label: 'Products'),
      _NavItem(icon: Icons.receipt_long_outlined,  activeIcon: Icons.receipt_long_rounded,      label: 'Orders'),
      _NavItem(icon: Icons.shopping_cart_outlined, activeIcon: Icons.shopping_cart_rounded,     label: 'Cart'),
      _NavItem(icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded,            label: 'Profile'),
    ];

    final routes = [
      AppRoutes.home,
      AppRoutes.products,
      AppRoutes.orders,
      AppRoutes.cart,
      AppRoutes.profile,
    ];

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF0F0F0), width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            children: List.generate(items.length, (i) {
              final isActive = i == currentIndex;
              final item = items[i];
              final showBadge = i == 3 && cartCount > 0;

              return Expanded(
                child: GestureDetector(
                  onTap: () { if (!isActive) context.go(routes[i]); },
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          // Active tab — circle background like screenshot
                          if (isActive)
                            Container(
                              width: 36, height: 36,
                              decoration: const BoxDecoration(
                                color: Color(0xFFF5F0E8),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(item.activeIcon,
                                color: const Color(0xFF2D2D2D), size: 20),
                            )
                          else
                            SizedBox(
                              width: 36, height: 36,
                              child: Center(
                                child: Icon(item.icon,
                                  color: const Color(0xFF666666), size: 20),
                              ),
                            ),
                          if (showBadge)
                            Positioned(
                              top: 2, right: 2,
                              child: Container(
                                width: 16, height: 16,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE53935),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text('$cartCount',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                    )),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                          color: isActive ? const Color(0xFF2D2D2D) : const Color(0xFF888888),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({required this.icon, required this.activeIcon, required this.label});
}
