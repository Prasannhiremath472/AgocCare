import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../core/helpers.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _stateCtrl = TextEditingController();
  final _pincodeCtrl = TextEditingController();
  bool _isLoading = false;
  late Razorpay _razorpay;
  String? _pendingOrderId;
  int? _pendingDbOrderId;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
    // Pre-fill name/phone from auth
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(authProvider).user;
      if (user != null) {
        _nameCtrl.text = user.name;
        _phoneCtrl.text = user.phone ?? '';
      }
    });
  }

  @override
  void dispose() {
    _razorpay.clear();
    _nameCtrl.dispose(); _phoneCtrl.dispose(); _addressCtrl.dispose();
    _cityCtrl.dispose(); _stateCtrl.dispose(); _pincodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    final cartNotifier = ref.read(cartProvider.notifier);
    final items = ref.read(cartProvider);
    final api = ApiService();
    try {
      final shippingAddress = {
        'name': _nameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'address_line': _addressCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'state': _stateCtrl.text.trim(),
        'pincode': _pincodeCtrl.text.trim(),
      };
      final orderItems = items.map((i) => {'product_id': i.product.id, 'qty': i.quantity, 'price': i.product.price}).toList();
      final order = await api.createOrder({
        'items': orderItems,
        'shipping_address': shippingAddress,
        'total': cartNotifier.total,
      });
      _pendingDbOrderId = order.id;
      // Create Razorpay order
      final paymentOrder = await api.createPaymentOrder({'order_id': order.id, 'amount': cartNotifier.total});
      _pendingOrderId = paymentOrder['razorpay_order_id'];
      final options = {
        'key': paymentOrder['key'] ?? '',
        'amount': (cartNotifier.total * 100).toInt(),
        'name': 'AgocCare',
        'description': 'Medicine Order #${order.id}',
        'order_id': _pendingOrderId,
        'prefill': {'name': _nameCtrl.text, 'contact': _phoneCtrl.text},
        'theme': {'color': '#044B99'},
      };
      _razorpay.open(options);
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _onPaymentSuccess(PaymentSuccessResponse response) async {
    final api = ApiService();
    try {
      await api.verifyPayment({
        'razorpay_order_id': response.orderId,
        'razorpay_payment_id': response.paymentId,
        'razorpay_signature': response.signature,
        'order_id': _pendingDbOrderId,
      });
      ref.read(cartProvider.notifier).clearCart();
      if (mounted) {
        setState(() => _isLoading = false);
        context.go(AppRoutes.orders);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment successful! Order placed.')),
        );
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment verification failed: $e')));
    }
  }

  void _onPaymentError(PaymentFailureResponse response) {
    setState(() => _isLoading = false);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payment failed: ${response.message}')));
  }

  void _onExternalWallet(ExternalWalletResponse response) {
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final cartNotifier = ref.read(cartProvider.notifier);
    final subtotal = cartNotifier.subtotal;
    final delivery = cartNotifier.deliveryFee;
    final total = cartNotifier.total;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Shipping Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 16),
              _field(_nameCtrl, 'Full Name', Icons.person_outline, TextInputType.name),
              const SizedBox(height: 12),
              _field(_phoneCtrl, 'Phone Number', Icons.phone_outlined, TextInputType.phone),
              const SizedBox(height: 12),
              _field(_addressCtrl, 'Address Line', Icons.location_on_outlined, TextInputType.streetAddress, maxLines: 2),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: _field(_cityCtrl, 'City', Icons.location_city_outlined, TextInputType.text)),
                const SizedBox(width: 12),
                Expanded(child: _field(_stateCtrl, 'State', Icons.map_outlined, TextInputType.text)),
              ]),
              const SizedBox(height: 12),
              _field(_pincodeCtrl, 'Pincode', Icons.pin_drop_outlined, TextInputType.number),
              const SizedBox(height: 24),
              // Order Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.06), blurRadius: 8)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Order Summary', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    _Row('Subtotal', AppHelpers.formatPrice(subtotal)),
                    const SizedBox(height: 4),
                    _Row('Delivery', delivery == 0 ? 'FREE' : AppHelpers.formatPrice(delivery),
                      valueColor: delivery == 0 ? AppColors.success : null),
                    const Divider(height: 20),
                    _Row('Total', AppHelpers.formatPrice(total), bold: true),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _placeOrder,
                  icon: _isLoading
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.payment_rounded),
                  label: Text(_isLoading ? 'Processing...' : 'Pay ${AppHelpers.formatPrice(total)}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon, TextInputType type, {int maxLines = 1}) {
    return TextFormField(
      controller: ctrl,
      keyboardType: type,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  final bool bold;
  final Color? valueColor;
  const _Row(this.label, this.value, {this.bold = false, this.valueColor});
  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(label, style: TextStyle(fontSize: bold ? 15 : 13, fontWeight: bold ? FontWeight.w700 : FontWeight.w400, color: AppColors.textSecondary)),
      Text(value, style: TextStyle(fontSize: bold ? 16 : 13, fontWeight: bold ? FontWeight.w800 : FontWeight.w600, color: valueColor ?? (bold ? AppColors.textPrimary : AppColors.textSecondary))),
    ],
  );
}
