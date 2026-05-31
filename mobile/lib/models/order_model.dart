import 'dart:convert';

class OrderItem {
  final int id;
  final int orderId;
  final int productId;
  final String? productName;
  final String? productImage;
  final int qty;
  final double price;

  OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    this.productName,
    this.productImage,
    required this.qty,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? 0,
      orderId: json['order_id'] ?? 0,
      productId: json['product_id'] ?? 0,
      productName: json['product_name'] ?? json['name'],
      productImage: json['product_image'] ?? json['image'],
      qty: json['qty'] ?? 1,
      price: _toDouble(json['price']),
    );
  }

  static double _toDouble(dynamic v) {
    if (v is double) return v;
    if (v is int) return v.toDouble();
    if (v is String) return double.tryParse(v) ?? 0.0;
    return 0.0;
  }
}

class ShippingAddress {
  final String name;
  final String phone;
  final String addressLine;
  final String city;
  final String state;
  final String pincode;

  ShippingAddress({
    required this.name,
    required this.phone,
    required this.addressLine,
    required this.city,
    required this.state,
    required this.pincode,
  });

  factory ShippingAddress.fromJson(Map<String, dynamic> json) {
    return ShippingAddress(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      addressLine: json['address_line'] ?? json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name, 'phone': phone, 'address_line': addressLine,
    'city': city, 'state': state, 'pincode': pincode,
  };
}

class OrderModel {
  final int id;
  final int userId;
  final double total;
  final String status;
  final ShippingAddress? shippingAddress;
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final String? createdAt;
  final List<OrderItem> items;

  OrderModel({
    required this.id,
    required this.userId,
    required this.total,
    required this.status,
    this.shippingAddress,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    this.createdAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    ShippingAddress? addr;
    if (json['shipping_address'] != null) {
      final raw = json['shipping_address'];
      if (raw is Map<String, dynamic>) {
        addr = ShippingAddress.fromJson(raw);
      } else if (raw is String) {
        try {
          addr = ShippingAddress.fromJson(jsonDecode(raw) as Map<String, dynamic>);
        } catch (_) {}
      }
    }

    final itemsList = (json['items'] as List<dynamic>? ?? [])
        .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
        .toList();

    return OrderModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      total: _toDouble(json['total']),
      status: json['status'] ?? 'pending',
      shippingAddress: addr,
      razorpayOrderId: json['razorpay_order_id'],
      razorpayPaymentId: json['razorpay_payment_id'],
      createdAt: json['created_at'],
      items: itemsList,
    );
  }

  static double _toDouble(dynamic v) {
    if (v is double) return v;
    if (v is int) return v.toDouble();
    if (v is String) return double.tryParse(v) ?? 0.0;
    return 0.0;
  }
}
