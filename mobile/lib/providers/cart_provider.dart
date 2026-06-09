import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_model.dart';
import '../models/product_model.dart';
import '../models/order_model.dart';
import '../core/constants.dart';
import '../core/helpers.dart';

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]) {
    _loadCart();
  }

  Future<void> _loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(AppConstants.cartKey);
    if (raw != null) {
      try {
        final list = jsonDecode(raw) as List<dynamic>;
        state = list.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList();
      } catch (_) {}
    }
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.cartKey, jsonEncode(state.map((e) => e.toJson()).toList()));
  }

  void addItem(ProductModel product, {int qty = 1}) {
    final idx = state.indexWhere((e) => e.product.id == product.id);
    if (idx >= 0) {
      final updated = List<CartItem>.from(state);
      updated[idx].quantity += qty;
      state = updated;
    } else {
      state = [...state, CartItem(product: product, quantity: qty)];
    }
    _saveCart();
  }

  void removeItem(int productId) {
    state = state.where((e) => e.product.id != productId).toList();
    _saveCart();
  }

  void updateQty(int productId, int qty) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    final updated = List<CartItem>.from(state);
    final idx = updated.indexWhere((e) => e.product.id == productId);
    if (idx >= 0) updated[idx].quantity = qty;
    state = updated;
    _saveCart();
  }

  void buyAgain(List<OrderItem> items) {
    for (final item in items) {
      final product = ProductModel(
        id: item.productId,
        name: item.name,
        slug: item.slug ?? '',
        price: item.price,
        stock: 99,
        prescriptionRequired: false,
        isActive: true,
        image: item.image,
      );
      addItem(product, qty: item.qty);
    }
  }

  void clearCart() {
    state = [];
    _saveCart();
  }

  double get subtotal => state.fold(0, (sum, e) => sum + e.total);
  double get deliveryFee => AppHelpers.deliveryFee(subtotal);
  double get total => subtotal + deliveryFee;
  int get itemCount => state.fold(0, (sum, e) => sum + e.quantity);
  bool contains(int productId) => state.any((e) => e.product.id == productId);
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

final cartSubtotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider.notifier).subtotal;
});

final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider.notifier).total;
});

final cartCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider.notifier).itemCount;
});
