class ProductImage {
  final int id;
  final String imagePath;
  final int sortOrder;

  ProductImage({required this.id, required this.imagePath, required this.sortOrder});

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['id'] ?? 0,
      imagePath: json['image_path'] ?? '',
      sortOrder: json['sort_order'] ?? 0,
    );
  }
}

class ProductModel {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final double price;
  final double? mrp;
  final int stock;
  final int? categoryId;
  final String? categoryName;
  final String? composition;
  final String? manufacturer;
  final String? expiryDate;
  final bool prescriptionRequired;
  final String? image;
  final bool isActive;
  final String? createdAt;
  final List<ProductImage> images;

  ProductModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.mrp,
    required this.stock,
    this.categoryId,
    this.categoryName,
    this.composition,
    this.manufacturer,
    this.expiryDate,
    required this.prescriptionRequired,
    this.image,
    required this.isActive,
    this.createdAt,
    this.images = const [],
  });

  bool get inStock => stock > 0;

  int get discountPercent {
    if (mrp == null || mrp! <= price) return 0;
    return (((mrp! - price) / mrp!) * 100).round();
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    // Backend returns images as plain strings OR as {image_path, sort_order} objects
    final rawImages = json['images'] as List<dynamic>? ?? [];
    final imagesList = rawImages.map((e) {
      if (e is String) {
        return ProductImage(id: 0, imagePath: e, sortOrder: 0);
      } else if (e is Map<String, dynamic>) {
        return ProductImage.fromJson(e);
      }
      return ProductImage(id: 0, imagePath: e.toString(), sortOrder: 0);
    }).toList();

    return ProductModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      price: _toDouble(json['price']),
      mrp: json['mrp'] != null ? _toDouble(json['mrp']) : null,
      stock: json['stock'] ?? 0,
      categoryId: json['category_id'],
      categoryName: json['category_name'] ?? json['category'],
      composition: json['composition'],
      manufacturer: json['manufacturer'],
      expiryDate: json['expiry_date'],
      prescriptionRequired: json['prescription_required'] == true || json['prescription_required'] == 1,
      image: json['image'],
      isActive: json['is_active'] == true || json['is_active'] == 1 || json['is_active'] == null,
      createdAt: json['created_at'],
      images: imagesList,
    );
  }

  static double _toDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'slug': slug,
    'description': description, 'price': price, 'mrp': mrp,
    'stock': stock, 'category_id': categoryId,
    'prescription_required': prescriptionRequired,
    'image': image, 'is_active': isActive,
  };
}
