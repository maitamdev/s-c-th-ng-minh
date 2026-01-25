class Profile {
  final String id;
  final String role;
  final String? fullName;
  final String? avatarUrl;
  final String? phone;
  final String? address;
  final bool? onboardingCompleted;
  final String? subscriptionPlan;
  final DateTime createdAt;
  
  Profile({
    required this.id,
    required this.role,
    this.fullName,
    this.avatarUrl,
    this.phone,
    this.address,
    this.onboardingCompleted,
    this.subscriptionPlan,
    required this.createdAt,
  });
  
  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      role: json['role'] as String? ?? 'user',
      fullName: json['full_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      onboardingCompleted: json['onboarding_completed'] as bool?,
      subscriptionPlan: json['subscription_plan'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'full_name': fullName,
      'avatar_url': avatarUrl,
      'phone': phone,
      'address': address,
      'onboarding_completed': onboardingCompleted,
      'subscription_plan': subscriptionPlan,
      'created_at': createdAt.toIso8601String(),
    };
  }
  
  Profile copyWith({
    String? id,
    String? role,
    String? fullName,
    String? avatarUrl,
    String? phone,
    String? address,
    bool? onboardingCompleted,
    String? subscriptionPlan,
    DateTime? createdAt,
  }) {
    return Profile(
      id: id ?? this.id,
      role: role ?? this.role,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      subscriptionPlan: subscriptionPlan ?? this.subscriptionPlan,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
