class UserModel {
  final String uid;
  final String email;
  final String? displayName;
  final String? photoUrl;
  final String plan; // FREE, PRO, PREMIUM, ENTERPRISE
  final String role; // USER, ADMIN
  final bool emailVerified;

  const UserModel({
    required this.uid,
    required this.email,
    this.displayName,
    this.photoUrl,
    required this.plan,
    required this.role,
    this.emailVerified = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['firebase_uid'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      displayName: json['name'] ?? json['displayName'],
      photoUrl: json['photo_url'] ?? json['photoUrl'],
      plan: json['plan'] ?? 'FREE',
      role: json['role'] ?? 'USER',
      emailVerified: (json['email_verified'] == 1 || json['emailVerified'] == true),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'firebase_uid': uid,
      'email': email,
      'name': displayName,
      'photo_url': photoUrl,
      'plan': plan,
      'role': role,
      'email_verified': emailVerified ? 1 : 0,
    };
  }

  bool get isAdmin => role.toUpperCase() == 'ADMIN';
  bool get isPro => plan.toUpperCase() == 'PRO';
  bool get isPremium => plan.toUpperCase() == 'PREMIUM';
  bool get isEnterprise => plan.toUpperCase() == 'ENTERPRISE';
}
