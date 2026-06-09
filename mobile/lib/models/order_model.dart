import 'dart:convert';

class OrderItem {
  final int productId;
  final String name;
  final String? image;
  final String? slug;
  final int qty;
  final double price;

  OrderItem({
    required this.productId,
    required this.name,
    this.image,
    this.slug,
    required this.qty,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: _toInt(json['product_id']),
      name: json['name'] ?? '',
      image: json['image'],
      slug: json['slug'],
      qty: _toInt(json['qty']),
      price: _toDouble(json['price']),
    );
  }

  static int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is String) return int.tryParse(v) ?? 1;
    return 1;
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
  final double total;
  final String status;
  final String? razorpayOrderId;
  final ShippingAddress? shippingAddress;
  final String? createdAt;
  final List<OrderItem> items;

  OrderModel({
    required this.id,
    required this.total,
    required this.status,
    this.razorpayOrderId,
    this.shippingAddress,
    this.createdAt,
    this.items = const [],
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    // items from backend may be a JSON string (JSON_ARRAYAGG) or already a List
    List<dynamic> rawItems = [];
    final itemsField = json['items'];
    if (itemsField is List) {
      rawItems = itemsField;
    } else if (itemsField is String) {
      try { rawItems = jsonDecode(itemsField) as List<dynamic>; } catch (_) {}
    }
    final itemsList = rawItems
        .whereType<Map<String, dynamic>>()
        .map(OrderItem.fromJson)
        .toList();

    ShippingAddress? addr;
    if (json['shipping_address'] != null) {
      final raw = json['shipping_address'];
      try {
        final map = raw is String
            ? jsonDecode(raw) as Map<String, dynamic>
            : raw as Map<String, dynamic>;
        addr = ShippingAddress.fromJson(map);
      } catch (_) {}
    }

    return OrderModel(
      id: json['id'] ?? 0,
      total: _toDouble(json['total']),
      status: json['status'] ?? 'pending',
      razorpayOrderId: json['razorpay_order_id'],
      shippingAddress: addr,
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
