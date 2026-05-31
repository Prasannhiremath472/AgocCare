import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../models/order_model.dart';
import '../../providers/orders_provider.dart';
import '../../widgets/app_bottom_nav.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersProvider);
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('My Orders'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.read(ordersProvider.notifier).fetch(),
          ),
        ],
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text('$e', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            ElevatedButton(onPressed: () => ref.read(ordersProvider.notifier).fetch(), child: const Text('Retry')),
          ]),
        ),
        data: (orders) => orders.isEmpty
            ? Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.receipt_long_outlined, size: 80, color: AppColors.textMuted.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  const Text('No orders yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                  const SizedBox(height: 24),
                  ElevatedButton(onPressed: () => context.go('/medicines'), child: const Text('Start Shopping')),
                ]),
              )
            : RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async => ref.read(ordersProvider.notifier).fetch(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, i) => _OrderCard(order: orders[i]),
                ),
              ),
      ),
      bottomNavigationBar: const AppBottomNav(currentIndex: 3),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(order.status);
    return GestureDetector(
      onTap: () => context.push('/orders/${order.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.07), blurRadius: 10)],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text('Order #${order.id}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: statusColor.withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
              child: Text(order.status.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: statusColor)),
            ),
          ]),
          const SizedBox(height: 8),
          Text('${order.items.length} item${order.items.length != 1 ? 's' : ''}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          if (order.createdAt != null)
            Text(AppHelpers.formatDateTime(order.createdAt),
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          const Divider(height: 16),
          Row(children: [
            const Text('Total', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
            const Spacer(),
            Text(AppHelpers.formatPrice(order.total),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
          ]),
        ]),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'paid': return AppColors.statusPaid;
      case 'processing': return AppColors.statusProcessing;
      case 'shipped': return AppColors.statusShipped;
      case 'delivered': return AppColors.statusDelivered;
      case 'cancelled': return AppColors.statusCancelled;
      default: return AppColors.statusPending;
    }
  }
}

// ── Order Detail ─────────────────────────────────────────────────────────────
class OrderDetailScreen extends ConsumerWidget {
  final int orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: Text('Order #$orderId')),
      body: orderAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (order) {
          final statusColor = _statusColor(order.status);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Status card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Row(children: [
                  Icon(_statusIcon(order.status), color: statusColor, size: 28),
                  const SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(order.status.toUpperCase(), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: statusColor)),
                    if (order.createdAt != null)
                      Text(AppHelpers.formatDateTime(order.createdAt), style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ]),
                ]),
              ),
              const SizedBox(height: 16),
              // Items
              const Text('Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              ...order.items.map((item) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.md)),
                child: Row(children: [
                  Container(width: 48, height: 48, decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.medication_rounded, color: AppColors.primary)),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(item.productName ?? 'Product', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    Text('Qty: ${item.qty}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ])),
                  Text(AppHelpers.formatPrice(item.price * item.qty),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                ]),
              )),
              const SizedBox(height: 8),
              // Shipping
              if (order.shippingAddress != null) ...[
                const Text('Delivery Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.md)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(order.shippingAddress!.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text(order.shippingAddress!.phone),
                    Text(order.shippingAddress!.addressLine),
                    Text('${order.shippingAddress!.city}, ${order.shippingAddress!.state} ${order.shippingAddress!.pincode}'),
                  ]),
                ),
                const SizedBox(height: 16),
              ],
              // Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg)),
                child: Column(children: [
                  _SRow('Total', AppHelpers.formatPrice(order.total), bold: true),
                  if (order.razorpayPaymentId != null) ...[
                    const SizedBox(height: 4),
                    _SRow('Payment ID', order.razorpayPaymentId!),
                  ],
                ]),
              ),
            ]),
          );
        },
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'paid': return AppColors.statusPaid;
      case 'processing': return AppColors.statusProcessing;
      case 'shipped': return AppColors.statusShipped;
      case 'delivered': return AppColors.statusDelivered;
      case 'cancelled': return AppColors.statusCancelled;
      default: return AppColors.statusPending;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'paid': return Icons.payment_rounded;
      case 'processing': return Icons.inventory_rounded;
      case 'shipped': return Icons.local_shipping_rounded;
      case 'delivered': return Icons.check_circle_rounded;
      case 'cancelled': return Icons.cancel_rounded;
      default: return Icons.hourglass_empty_rounded;
    }
  }
}

class _SRow extends StatelessWidget {
  final String label, value;
  final bool bold;
  const _SRow(this.label, this.value, {this.bold = false});
  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(label, style: TextStyle(fontSize: bold ? 15 : 13, fontWeight: bold ? FontWeight.w700 : FontWeight.w400, color: AppColors.textSecondary)),
      Text(value, style: TextStyle(fontSize: bold ? 16 : 13, fontWeight: bold ? FontWeight.w800 : FontWeight.w600, color: bold ? AppColors.primary : AppColors.textSecondary)),
    ],
  );
}
