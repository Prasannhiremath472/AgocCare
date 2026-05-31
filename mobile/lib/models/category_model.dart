class CategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? image;
  final int? productCount;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.image,
    this.productCount,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      image: json['image'],
      productCount: json['product_count'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    'image': image,
    'product_count': productCount,
  };
}
