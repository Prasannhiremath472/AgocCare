import 'product_model.dart';

class ExtractedMedicine {
  final String name;
  final String? dosage;
  final String? frequency;
  final String? duration;
  final List<ProductModel> matches;

  ExtractedMedicine({
    required this.name,
    this.dosage,
    this.frequency,
    this.duration,
    this.matches = const [],
  });

  factory ExtractedMedicine.fromJson(Map<String, dynamic> json) {
    final matchList = (json['matches'] as List<dynamic>? ?? [])
        .map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
        .toList();
    return ExtractedMedicine(
      name: json['name'] ?? '',
      dosage: json['dosage'],
      frequency: json['frequency'],
      duration: json['duration'],
      matches: matchList,
    );
  }
}
