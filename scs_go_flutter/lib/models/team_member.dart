class TeamMember {
  final String name;
  final String role;
  final String description;
  final String avatarUrl;
  final List<SocialLink> socialLinks;

  const TeamMember({
    required this.name,
    required this.role,
    required this.description,
    required this.avatarUrl,
    this.socialLinks = const [],
  });

  factory TeamMember.fromJson(Map<String, dynamic> json) {
    return TeamMember(
      name: json['name'] as String,
      role: json['role'] as String,
      description: json['description'] as String,
      avatarUrl: json['avatarUrl'] as String,
      socialLinks: (json['socialLinks'] as List<dynamic>?)
              ?.map((e) => SocialLink.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'role': role,
      'description': description,
      'avatarUrl': avatarUrl,
      'socialLinks': socialLinks.map((e) => e.toJson()).toList(),
    };
  }
}

class SocialLink {
  final SocialType type;
  final String url;

  const SocialLink({
    required this.type,
    required this.url,
  });

  factory SocialLink.fromJson(Map<String, dynamic> json) {
    return SocialLink(
      type: SocialType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => SocialType.link,
      ),
      url: json['url'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'url': url,
    };
  }
}

enum SocialType {
  linkedin,
  twitter,
  github,
  email,
  link,
}
