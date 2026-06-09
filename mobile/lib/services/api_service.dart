import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/user_model.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/order_model.dart';
import '../models/offer_model.dart';

class ApiService {
  final _client = ApiClient.instance;

  // ── Auth ──────────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> sendOtp(String email) async {
    final res = await _client.post('/auth/login/send-otp', data: {'email': email});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String otp) async {
    final res = await _client.post('/auth/login/verify-otp', data: {'email': email, 'otp': otp});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final res = await _client.post('/auth/register', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<UserModel> getMe() async {
    final res = await _client.get('/auth/me');
    return UserModel.fromJson(res.data['user'] ?? res.data);
  }

  // ── Products ──────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> getProducts({
    int page = 1,
    int limit = 20,
    String? search,
    String? category,
    String? sort,
    String? order,
    bool? prescriptionRequired,
  }) async {
    // Backend accepts: sort=price_asc | price_desc | name | (default=newest)
    String? sortParam;
    if (sort != null && order != null) {
      if (sort == 'price' && order == 'asc') {
        sortParam = 'price_asc';
      } else if (sort == 'price' && order == 'desc') {
        sortParam = 'price_desc';
      } else if (sort == 'name') {
        sortParam = 'name';
      }
    }

    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category.isNotEmpty) 'category': category,
      if (sortParam != null) 'sort': sortParam,
      if (prescriptionRequired != null) 'prescription_required': prescriptionRequired,
    };
    final res = await _client.get('/products', params: params);
    final data = res.data;
    final products = (data['products'] as List<dynamic>? ?? [])
        .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
        .toList();
    return {
      'products': products,
      'total': data['total'] ?? 0,
      'pages': data['pages'] ?? 1,
      'page': data['page'] ?? 1,
    };
  }

  Future<ProductModel> getProduct(String slug) async {
    final res = await _client.get('/products/$slug');
    // Backend returns the product object directly (not wrapped)
    final data = res.data;
    final productMap = (data is Map<String, dynamic> && data.containsKey('product'))
        ? data['product'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return ProductModel.fromJson(productMap);
  }

  Future<List<ProductModel>> getFeaturedProducts() async {
    final res = await _client.get('/products/featured');
    // Backend returns plain array directly
    final data = res.data;
    List<dynamic> list = [];
    if (data is List) {
      list = data;
    } else if (data is Map) {
      list = (data['products'] ?? data['data'] ?? []) as List<dynamic>;
    }
    return list.map((e) => ProductModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Categories ────────────────────────────────────────────────────────────
  Future<List<CategoryModel>> getCategories() async {
    final res = await _client.get('/categories');
    // Backend returns plain array directly
    final data = res.data;
    List<dynamic> list = [];
    if (data is List) {
      list = data;
    } else if (data is Map) {
      list = (data['categories'] ?? data['data'] ?? []) as List<dynamic>;
    }
    return list.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Offers ────────────────────────────────────────────────────────────────
  Future<List<OfferModel>> getOffers() async {
    final res = await _client.get('/offers');
    final list = res.data['offers'] as List<dynamic>? ?? res.data as List<dynamic>? ?? [];
    return list.map((e) => OfferModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ── Cart Validation ───────────────────────────────────────────────────────
  Future<Map<String, dynamic>> validateCart(List<Map<String, dynamic>> items) async {
    final res = await _client.post('/cart/validate', data: {'items': items});
    return res.data as Map<String, dynamic>;
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  Future<OrderModel> createOrder(Map<String, dynamic> data) async {
    final res = await _client.post('/orders', data: data);
    return OrderModel.fromJson(res.data['order'] ?? res.data);
  }

  Future<List<OrderModel>> getOrders() async {
    final res = await _client.get('/orders');
    final data = res.data;
    // Backend returns a plain array
    final list = data is List ? data : <dynamic>[];
    return list
        .whereType<Map<String, dynamic>>()
        .map(OrderModel.fromJson)
        .toList();
  }

  Future<OrderModel> getOrder(int id) async {
    final res = await _client.get('/orders/$id');
    // Backend returns the order object directly (spread with items)
    final data = res.data is Map<String, dynamic>
        ? res.data as Map<String, dynamic>
        : res.data['order'] as Map<String, dynamic>;
    return OrderModel.fromJson(data);
  }

  // ── Payment ───────────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> createPaymentOrder(Map<String, dynamic> data) async {
    final res = await _client.post('/payment/create-order', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyPayment(Map<String, dynamic> data) async {
    final res = await _client.post('/payment/verify', data: data);
    return res.data as Map<String, dynamic>;
  }

  // ── Prescription ──────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> extractPrescription(String filePath) async {
    final formData = FormData.fromMap({
      'prescription': await MultipartFile.fromFile(filePath, filename: 'prescription.jpg'),
    });
    final res = await _client.postFormData('/prescription/extract', formData);
    return res.data as Map<String, dynamic>;
  }

  // ── Consultation ──────────────────────────────────────────────────────────
  Future<Map<String, dynamic>> bookConsultation(Map<String, dynamic> data) async {
    final res = await _client.post('/consultation/gynecologist', data: data);
    return res.data as Map<String, dynamic>;
  }
}
