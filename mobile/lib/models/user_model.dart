class UserModel {
  final String uid;
  final String email;
  final String? displayName;
  final String? photoUrl;
  final String plan; // FREE, PRO, PREMIUM, ENTERPRISE
  final String role; // USER, ADMIN
  final String? preferredClass;
  final bool emailVerified;

  const UserModel({
    required this.uid,
    required this.email,
    this.displayName,
    this.photoUrl,
    required this.plan,
    required this.role,
    this.emailVerified = false,
    this.preferredClass,
  });

  UserModel copyWith({
    String? uid,
    String? email,
    String? displayName,
    String? photoUrl,
    String? plan,
    String? role,
    bool? emailVerified,
    String? preferredClass,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      photoUrl: photoUrl ?? this.photoUrl,
      plan: plan ?? this.plan,
      role: role ?? this.role,
      emailVerified: emailVerified ?? this.emailVerified,
      preferredClass: preferredClass ?? this.preferredClass,
    );
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['firebase_uid'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      displayName: json['name'] ?? json['displayName'],
      photoUrl: json['photo_url'] ?? json['photoUrl'],
      plan: json['plan'] ?? 'FREE',
      role: json['role'] ?? 'USER',
      emailVerified: (json['email_verified'] == 1 || json['emailVerified'] == true),
      preferredClass: json['preferred_class'] ?? json['preferredClass'],
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
      'preferred_class': preferredClass,
    };
  }

  bool get isAdmin => role.toUpperCase() == 'ADMIN';
  bool get isPro => plan.toUpperCase() == 'PRO';
  bool get isPremium => plan.toUpperCase() == 'PREMIUM';
  bool get isEnterprise => plan.toUpperCase() == 'ENTERPRISE';
}
