class UserModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final bool isVerified;
  final String role;
  final String? createdAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.isVerified,
    required this.role,
    this.createdAt,
  });

  bool get isAdmin => role == 'admin';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      isVerified: json['is_verified'] == true || json['is_verified'] == 1,
      role: json['role'] ?? 'user',
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'phone': phone,
    'is_verified': isVerified,
    'role': role,
    'created_at': createdAt,
  };
}
