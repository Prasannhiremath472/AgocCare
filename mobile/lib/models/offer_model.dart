class OfferModel {
  final int id;
  final String tag;
  final String title;
  final String? subtitle;
  final String? btnLabel;
  final String? btnUrl;
  final String? image;
  final String? bgGradient;
  final bool isActive;
  final int sortOrder;

  OfferModel({
    required this.id,
    required this.tag,
    required this.title,
    this.subtitle,
    this.btnLabel,
    this.btnUrl,
    this.image,
    this.bgGradient,
    required this.isActive,
    required this.sortOrder,
  });

  factory OfferModel.fromJson(Map<String, dynamic> json) {
    return OfferModel(
      id: json['id'] ?? 0,
      tag: json['tag'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['subtitle'],
      btnLabel: json['btn_label'],
      btnUrl: json['btn_url'],
      image: json['image'],
      bgGradient: json['bg_gradient'],
      isActive: json['is_active'] == true || json['is_active'] == 1,
      sortOrder: json['sort_order'] ?? 0,
    );
  }
}
