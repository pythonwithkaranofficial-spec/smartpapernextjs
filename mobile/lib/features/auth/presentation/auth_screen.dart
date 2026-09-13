import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_provider.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _loginFormKey = GlobalKey<FormState>();
  final _signupFormKey = GlobalKey<FormState>();

  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  final _signupNameController = TextEditingController();
  final _signupEmailController = TextEditingController();
  final _signupPasswordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _signupNameController.dispose();
    _signupEmailController.dispose();
    _signupPasswordController.dispose();
    super.dispose();
  }

  void _showForgotPasswordDialog(BuildContext context) {
    final resetEmailController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Reset Password', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Enter your registered email address to receive a password reset link.',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: resetEmailController,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Email Address',
                labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                filled: true,
                fillColor: Color(0xFF0F172A),
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
            onPressed: () async {
              final email = resetEmailController.text.trim();
              if (email.isNotEmpty) {
                final messenger = ScaffoldMessenger.of(context);
                final nav = Navigator.of(ctx);
                await Provider.of<AuthProvider>(context, listen: false).sendPasswordReset(email);
                nav.pop();
                messenger.showSnackBar(
                  const SnackBar(content: Text('Password reset email sent successfully!')),
                );
              }
            },
            child: const Text('Send Link'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Smart Paper Generator', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF6366F1),
          labelColor: const Color(0xFF818CF8),
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: const [
            Tab(text: 'Sign In'),
            Tab(text: 'Register'),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              if (authProvider.errorMessage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          authProvider.errorMessage!,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),

              SizedBox(
                height: 380,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Login Form
                    Form(
                      key: _loginFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _loginEmailController,
                            keyboardType: TextInputType.emailAddress,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(
                              labelText: 'Email Address',
                              labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                              prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF6366F1)),
                              filled: true,
                              fillColor: Color(0xFF1E293B),
                              border: OutlineInputBorder(),
                            ),
                            validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _loginPasswordController,
                            obscureText: true,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(
                              labelText: 'Password',
                              labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                              prefixIcon: Icon(Icons.lock_outline, color: Color(0xFF6366F1)),
                              filled: true,
                              fillColor: Color(0xFF1E293B),
                              border: OutlineInputBorder(),
                            ),
                            validator: (val) => val == null || val.length < 6 ? 'Min 6 characters required' : null,
                          ),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => _showForgotPasswordDialog(context),
                              child: const Text('Forgot Password?', style: TextStyle(color: Color(0xFF818CF8))),
                            ),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6366F1),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            onPressed: authProvider.isLoading
                                ? null
                                : () async {
                                    if (_loginFormKey.currentState!.validate()) {
                                      final nav = Navigator.of(context);
                                      final success = await authProvider.login(
                                        _loginEmailController.text.trim(),
                                        _loginPasswordController.text.trim(),
                                      );
                                      if (success && mounted) {
                                        nav.pop();
                                      }
                                    }
                                  },
                            child: authProvider.isLoading
                                ? const CircularProgressIndicator(color: Colors.white)
                                : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),

                    // Signup Form
                    Form(
                      key: _signupFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _signupNameController,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(
                              labelText: 'Full Name',
                              labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                              prefixIcon: Icon(Icons.person_outline, color: Color(0xFF6366F1)),
                              filled: true,
                              fillColor: Color(0xFF1E293B),
                              border: OutlineInputBorder(),
                            ),
                            validator: (val) => val == null || val.isEmpty ? 'Enter your name' : null,
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _signupEmailController,
                            keyboardType: TextInputType.emailAddress,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(
                              labelText: 'Email Address',
                              labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                              prefixIcon: Icon(Icons.email_outlined, color: Color(0xFF6366F1)),
                              filled: true,
                              fillColor: Color(0xFF1E293B),
                              border: OutlineInputBorder(),
                            ),
                            validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                          ),
                          const SizedBox(height: 14),
                          TextFormField(
                            controller: _signupPasswordController,
                            obscureText: true,
                            style: const TextStyle(color: Colors.white),
                            decoration: const InputDecoration(
                              labelText: 'Password',
                              labelStyle: TextStyle(color: Color(0xFF94A3B8)),
                              prefixIcon: Icon(Icons.lock_outline, color: Color(0xFF6366F1)),
                              filled: true,
                              fillColor: Color(0xFF1E293B),
                              border: OutlineInputBorder(),
                            ),
                            validator: (val) => val == null || val.length < 6 ? 'Min 6 characters required' : null,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6366F1),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            onPressed: authProvider.isLoading
                                ? null
                                : () async {
                                    if (_signupFormKey.currentState!.validate()) {
                                      final nav = Navigator.of(context);
                                      final success = await authProvider.signUp(
                                        _signupEmailController.text.trim(),
                                        _signupPasswordController.text.trim(),
                                        displayName: _signupNameController.text.trim(),
                                      );
                                      if (success && mounted) {
                                        nav.pop();
                                      }
                                    }
                                  },
                            child: authProvider.isLoading
                                ? const CircularProgressIndicator(color: Colors.white)
                                : const Text('Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(color: Color(0xFF334155), height: 32),

              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: Color(0xFF334155)),
                ),
                icon: const Icon(Icons.g_mobiledata, size: 28, color: Colors.white),
                label: const Text('Continue with Google', style: TextStyle(color: Colors.white, fontSize: 15)),
                onPressed: () async {
                  final nav = Navigator.of(context);
                  final success = await authProvider.loginWithGoogle();
                  if (success && mounted) {
                    nav.pop();
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
