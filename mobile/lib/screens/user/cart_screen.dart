import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../widgets/app_image.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../core/helpers.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/app_bottom_nav.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);
    final subtotal = notifier.subtotal;
    final delivery = notifier.deliveryFee;
    final total = notifier.total;
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text('Cart (${items.length})'),
        actions: [
          if (items.isNotEmpty)
            TextButton(
              onPressed: () => showDialog(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Clear Cart'),
                  content: const Text('Remove all items from cart?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                    ElevatedButton(
                      onPressed: () { notifier.clearCart(); Navigator.pop(context); },
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                      child: const Text('Clear'),
                    ),
                  ],
                ),
              ),
              child: const Text('Clear', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: items.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 80, color: AppColors.textMuted.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  const Text('Add medicines to get started', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => context.go(AppRoutes.products),
                    child: const Text('Browse Medicines'),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) {
                      final item = items[i];
                      final imageUrl = AppHelpers.imgUrl(item.product.image);
                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(AppRadius.lg),
                          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 8)],
                        ),
                        child: Row(
                          children: [
                            AppImage(
                              url: imageUrl,
                              width: 70,
                              height: 70,
                              fit: BoxFit.cover,
                              borderRadius: BorderRadius.circular(10),
                              placeholder: _placeholder(),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(item.product.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                  const SizedBox(height: 4),
                                  Text(AppHelpers.formatPrice(item.product.price),
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      _QtyControl(
                                        qty: item.quantity,
                                        onDec: () => notifier.updateQty(item.product.id, item.quantity - 1),
                                        onInc: () => notifier.updateQty(item.product.id, item.quantity + 1),
                                      ),
                                      const Spacer(),
                                      Text(AppHelpers.formatPrice(item.total),
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: AppColors.error),
                              onPressed: () => notifier.removeItem(item.product.id),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                // Summary
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, -4))],
                  ),
                  child: SafeArea(
                    child: Column(
                      children: [
                        _SummaryRow(label: 'Subtotal', value: AppHelpers.formatPrice(subtotal)),
                        const SizedBox(height: 4),
                        _SummaryRow(
                          label: 'Delivery',
                          value: delivery == 0 ? 'FREE' : AppHelpers.formatPrice(delivery),
                          valueColor: delivery == 0 ? AppColors.success : null,
                        ),
                        if (delivery > 0) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Add ${AppHelpers.formatPrice(AppConstants.freeDeliveryThreshold - subtotal)} more for free delivery',
                            style: const TextStyle(fontSize: 11, color: AppColors.secondary),
                          ),
                        ],
                        const Divider(height: 16),
                        _SummaryRow(
                          label: 'Total',
                          value: AppHelpers.formatPrice(total),
                          bold: true,
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton(
                            onPressed: () {
                              if (!auth.isAuthenticated) {
                                context.push(AppRoutes.login);
                              } else {
                                context.push(AppRoutes.checkout);
                              }
                            },
                            child: const Text('Proceed to Checkout', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 2),
    );
  }

  Widget _placeholder() => Container(
    width: 70, height: 70,
    color: AppColors.primaryLight,
    child: const Icon(Icons.medication_rounded, color: AppColors.primary, size: 32),
  );
}

class _QtyControl extends StatelessWidget {
  final int qty;
  final VoidCallback onDec;
  final VoidCallback onInc;
  const _QtyControl({required this.qty, required this.onDec, required this.onInc});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(onTap: onDec, child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.remove, size: 16, color: AppColors.primary))),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: Text('$qty', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700))),
          GestureDetector(onTap: onInc, child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.add, size: 16, color: AppColors.primary))),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;
  const _SummaryRow({required this.label, required this.value, this.bold = false, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: bold ? 15 : 13, fontWeight: bold ? FontWeight.w700 : FontWeight.w400, color: AppColors.textSecondary)),
        Text(value, style: TextStyle(fontSize: bold ? 16 : 13, fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
          color: valueColor ?? (bold ? AppColors.textPrimary : AppColors.textSecondary))),
      ],
    );
  }
}
