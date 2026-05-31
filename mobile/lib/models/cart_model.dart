import 'product_model.dart';

class CartItem {
  final ProductModel product;
  int quantity;

  CartItem({required this.product, required this.quantity});

  double get total => product.price * quantity;

  Map<String, dynamic> toJson() => {
    'product_id': product.id,
    'quantity': quantity,
    'product': product.toJson(),
  };

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      product: ProductModel.fromJson(json['product'] as Map<String, dynamic>),
      quantity: json['quantity'] ?? 1,
    );
  }
}
