import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/auth_provider.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLogin = true;
  bool _isOperator = false;
  bool _showPassword = false;
  bool _loading = false;

  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() => _isOperator = _tabController.index == 1);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final size = MediaQuery.of(context).size;
    final isWide = size.width > 800;

    return Scaffold(
      body: Stack(
        children: [
          // Background gradients
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withOpacity(0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 50,
            right: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.cyanLight.withOpacity(0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Content
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header with logo
                  _buildHeader(context, lang),

                  const SizedBox(height: 32),

                  // User Type Tabs
                  _buildUserTypeTabs(context, lang),

                  const SizedBox(height: 24),

                  // Title
                  Text(
                    _isLogin
                        ? (_isOperator
                            ? lang.t('auth.operatorLogin')
                            : lang.t('auth.login'))
                        : (_isOperator
                            ? lang.t('auth.operatorRegister')
                            : lang.t('auth.register')),
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isLogin
                        ? lang.t('auth.welcomeDesc')
                        : lang.t('auth.createAccountDesc'),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                  ),

                  const SizedBox(height: 24),

                  // Google Sign In (for users only)
                  if (!_isOperator) ...[
                    _buildGoogleButton(context, lang),
                    const SizedBox(height: 16),
                    _buildDivider(context, lang),
                    const SizedBox(height: 16),
                  ],

                  // Form
                  _buildForm(context, lang),

                  const SizedBox(height: 24),

                  // Toggle Login/Register
                  _buildToggleMode(context, lang),

                  const SizedBox(height: 32),

                  // Features list (like web hero)
                  _buildFeaturesList(context, lang),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, LanguageProvider lang) {
    return Row(
      children: [
        GestureDetector(
          onTap: () => context.go('/'),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.asset(
                  'assets/images/logo.jpg',
                  width: 48,
                  height: 48,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.cyanLight],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.bolt, color: Colors.white),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ).createShader(bounds),
                child: Text(
                  'SCS GO',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUserTypeTabs(BuildContext context, LanguageProvider lang) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: _isOperator
              ? AppColors.primary
              : Theme.of(context).scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        indicatorPadding: const EdgeInsets.all(4),
        labelColor: _isOperator
            ? Colors.white
            : Theme.of(context).textTheme.bodyLarge?.color,
        unselectedLabelColor: Theme.of(context).textTheme.bodySmall?.color,
        labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        tabs: [
          Tab(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.person_outline, size: 18),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    lang.t('auth.userAccount'),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.business, size: 18),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    lang.t('auth.operatorAccount'),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGoogleButton(BuildContext context, LanguageProvider lang) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _loading ? null : _handleGoogleSignIn,
        icon: Image.network(
          'https://www.google.com/favicon.ico',
          width: 20,
          height: 20,
          errorBuilder: (context, error, stackTrace) {
            return const Icon(Icons.g_mobiledata, size: 20);
          },
        ),
        label: Text(lang.t('auth.loginWithGoogle')),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildDivider(BuildContext context, LanguageProvider lang) {
    return Row(
      children: [
        Expanded(child: Divider(color: Theme.of(context).dividerColor)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Or',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
        Expanded(child: Divider(color: Theme.of(context).dividerColor)),
      ],
    );
  }

  Widget _buildForm(BuildContext context, LanguageProvider lang) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Name field (only for register)
          if (!_isLogin) ...[
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: lang.t('auth.fullName'),
                prefixIcon: const Icon(Icons.person_outline),
                hintText: 'Nguyễn Văn A',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return lang.isVietnamese
                      ? 'Vui lòng nhập tên'
                      : 'Please enter name';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
          ],

          // Email field
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              labelText: lang.t('auth.email'),
              prefixIcon: const Icon(Icons.email_outlined),
              hintText: 'email@example.com',
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return lang.isVietnamese
                    ? 'Vui lòng nhập email'
                    : 'Please enter email';
              }
              if (!value.contains('@')) {
                return lang.isVietnamese
                    ? 'Email không hợp lệ'
                    : 'Invalid email';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),

          // Password field
          TextFormField(
            controller: _passwordController,
            obscureText: !_showPassword,
            decoration: InputDecoration(
              labelText: lang.t('auth.password'),
              prefixIcon: const Icon(Icons.lock_outline),
              hintText: '••••••••',
              suffixIcon: IconButton(
                icon: Icon(
                    _showPassword ? Icons.visibility_off : Icons.visibility),
                onPressed: () => setState(() => _showPassword = !_showPassword),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return lang.isVietnamese
                    ? 'Vui lòng nhập mật khẩu'
                    : 'Please enter password';
              }
              if (value.length < 6) {
                return lang.isVietnamese
                    ? 'Mật khẩu tối thiểu 6 ký tự'
                    : 'Minimum 6 characters';
              }
              return null;
            },
          ),

          // Forgot password link
          if (_isLogin) ...[
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  // Forgot password
                },
                child: Text(
                  lang.t('auth.forgotPassword'),
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Submit button
          SizedBox(
            width: double.infinity,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed: _loading ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _isLogin
                                ? lang.t('auth.login')
                                : lang.t('auth.register'),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward,
                              color: Colors.white, size: 18),
                        ],
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleMode(BuildContext context, LanguageProvider lang) {
    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            _isLogin ? lang.t('auth.noAccount') : lang.t('auth.hasAccount'),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).textTheme.bodySmall?.color,
                ),
          ),
          TextButton(
            onPressed: () => setState(() => _isLogin = !_isLogin),
            child: Text(
              _isLogin ? lang.t('auth.register') : lang.t('auth.login'),
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesList(BuildContext context, LanguageProvider lang) {
    final features = _isOperator
        ? [
            lang.isVietnamese
                ? 'Đăng ký trạm sạc dễ dàng'
                : 'Easy station registration',
            lang.isVietnamese
                ? 'Theo dõi đặt chỗ real-time'
                : 'Real-time booking tracking',
            lang.isVietnamese
                ? 'Thống kê doanh thu chi tiết'
                : 'Detailed revenue stats',
          ]
        : [
            lang.isVietnamese
                ? 'AI gợi ý trạm phù hợp nhất'
                : 'AI recommends best stations',
            lang.isVietnamese
                ? 'Dự đoán độ đông theo giờ'
                : 'Hourly crowd prediction',
            lang.isVietnamese
                ? 'Đặt chỗ trước, hủy miễn phí'
                : 'Book ahead, cancel free',
          ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.08),
            AppColors.cyanLight.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                _isOperator ? Icons.business : Icons.auto_awesome,
                color: AppColors.primary,
              ),
              const SizedBox(width: 8),
              Text(
                _isOperator
                    ? (lang.isVietnamese
                        ? 'Dành cho nhà vận hành'
                        : 'For Operators')
                    : (lang.isVietnamese
                        ? 'Trải nghiệm tuyệt vời'
                        : 'Great Experience'),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...features.map((feature) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.success,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    feature,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    final lang = context.read<LanguageProvider>();

    try {
      final auth = context.read<AuthProvider>();

      if (_isLogin) {
        await auth.signIn(_emailController.text, _passwordController.text);
      } else {
        await auth.signUp(
          _emailController.text,
          _passwordController.text,
          _nameController.text,
        );
      }

      if (mounted) {
        context.go('/explore');
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = e.toString();

        // Check for rate limiting error
        if (errorMessage.contains('security purposes') ||
            errorMessage.contains('after') &&
                errorMessage.contains('seconds')) {
          errorMessage = lang.isVietnamese
              ? 'Bạn đã thử quá nhiều lần. Vui lòng đợi một chút rồi thử lại.'
              : 'Too many attempts. Please wait a moment and try again.';
        } else if (errorMessage.contains('Invalid login credentials')) {
          errorMessage = lang.isVietnamese
              ? 'Email hoặc mật khẩu không đúng.'
              : 'Invalid email or password.';
        } else if (errorMessage.contains('User already registered')) {
          errorMessage = lang.isVietnamese
              ? 'Email này đã được đăng ký.'
              : 'This email is already registered.';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _loading = true);
    final lang = context.read<LanguageProvider>();

    try {
      final auth = context.read<AuthProvider>();
      await auth.signInWithGoogle();
      if (mounted) {
        context.go('/explore');
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = e.toString();

        // Check for rate limiting error
        if (errorMessage.contains('security purposes') ||
            errorMessage.contains('after') &&
                errorMessage.contains('seconds')) {
          errorMessage = lang.isVietnamese
              ? 'Bạn đã thử quá nhiều lần. Vui lòng đợi một chút rồi thử lại.'
              : 'Too many attempts. Please wait a moment and try again.';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }
}
