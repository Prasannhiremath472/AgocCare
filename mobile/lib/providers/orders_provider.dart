import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order_model.dart';
import '../services/api_service.dart';
import 'auth_provider.dart';

class OrdersNotifier extends StateNotifier<AsyncValue<List<OrderModel>>> {
  final ApiService _api;

  OrdersNotifier(this._api) : super(const AsyncValue.loading()) {
    fetch();
  }

  Future<void> fetch() async {
    state = const AsyncValue.loading();
    try {
      final orders = await _api.getOrders();
      state = AsyncValue.data(orders);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final ordersProvider =
    StateNotifierProvider<OrdersNotifier, AsyncValue<List<OrderModel>>>((ref) {
  return OrdersNotifier(ref.read(apiServiceProvider));
});

final orderDetailProvider =
    FutureProvider.family<OrderModel, int>((ref, id) async {
  return ref.read(apiServiceProvider).getOrder(id);
});
