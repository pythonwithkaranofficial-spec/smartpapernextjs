import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/services/auth_provider.dart';
import '../../generator/services/generator_provider.dart';
import '../../generator/presentation/generator_screen.dart';
import '../../history/presentation/history_screen.dart';
import '../../subscription/presentation/subscription_screen.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../admin/presentation/admin_screen.dart';
import '../../auth/presentation/auth_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<GeneratorProvider>(context, listen: false).fetchUserUsage();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final generatorProvider = Provider.of<GeneratorProvider>(context);

    final List<Widget> pages = [
      _buildHomeDashboard(context, authProvider, generatorProvider),
      const GeneratorScreen(),
      const HistoryScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          if (!authProvider.isAuthenticated && (index == 1 || index == 2 || index == 3)) {
            Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
          } else {
            setState(() => _selectedIndex = index);
          }
        },
        backgroundColor: const Color(0xFF1E293B),
        selectedItemColor: const Color(0xFF6366F1),
        unselectedItemColor: const Color(0xFF94A3B8),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.auto_awesome_outlined), activeIcon: Icon(Icons.auto_awesome), label: 'Generate'),
          BottomNavigationBarItem(icon: Icon(Icons.history_outlined), activeIcon: Icon(Icons.history), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildHomeDashboard(BuildContext context, AuthProvider authProvider, GeneratorProvider generatorProvider) {
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset('assets/images/app_logo.png', width: 32, height: 32, fit: BoxFit.cover),
            ),
            const SizedBox(width: 10),
            const Text('Smart Paper Generator', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        actions: [
          if (authProvider.isAuthenticated)
            IconButton(
              icon: const Icon(Icons.account_circle, color: Colors.white),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (ctx) => const ProfileScreen()));
              },
            )
          else
            TextButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
              },
              child: const Text('Sign In', style: TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold)),
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Section Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user != null ? 'Welcome back, ${user.displayName ?? "Educator"}!' : 'AI CBSE Question Paper Generator',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Create official CBSE standard question papers, blueprint layouts, and marking scheme solutions in under 60 seconds.',
                      style: TextStyle(fontSize: 14, color: Colors.white70),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF4F46E5),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.auto_awesome),
                      label: const Text('Generate Paper Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      onPressed: () {
                        if (!authProvider.isAuthenticated) {
                          Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                        } else {
                          setState(() => _selectedIndex = 1);
                        }
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Daily Limits Status Card
              if (user != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Today\'s Generation Quota:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                          const SizedBox(height: 4),
                          Text(
                            '${generatorProvider.papersGeneratedToday} / ${generatorProvider.dailyLimit} Papers Used',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SubscriptionScreen()));
                        },
                        child: const Text('Upgrade Plan'),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),

              // Features Grid
              const Text('Core Platform Features', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.2,
                children: [
                  _buildFeatureCard(
                    icon: Icons.auto_awesome,
                    iconColor: const Color(0xFF818CF8),
                    title: 'AI Paper Wizard',
                    subtitle: 'Full CBSE Class 1–12 papers',
                    onTap: () {
                      if (!authProvider.isAuthenticated) {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                      } else {
                        setState(() => _selectedIndex = 1);
                      }
                    },
                  ),
                  _buildFeatureCard(
                    icon: Icons.history,
                    iconColor: const Color(0xFF34D399),
                    title: 'Paper History',
                    subtitle: 'Saved papers & re-downloads',
                    onTap: () {
                      if (!authProvider.isAuthenticated) {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                      } else {
                        setState(() => _selectedIndex = 2);
                      }
                    },
                  ),
                  _buildFeatureCard(
                    icon: Icons.workspace_premium,
                    iconColor: const Color(0xFFFBBF24),
                    title: 'Plans & Pricing',
                    subtitle: 'Pro, Premium & Passes',
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SubscriptionScreen()));
                    },
                  ),
                  if (user != null && user.isAdmin)
                    _buildFeatureCard(
                      icon: Icons.admin_panel_settings,
                      iconColor: Colors.redAccent,
                      title: 'Admin Console',
                      subtitle: 'User & System Control',
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AdminScreen()));
                      },
                    )
                  else
                    _buildFeatureCard(
                      icon: Icons.account_circle_outlined,
                      iconColor: const Color(0xFF38BDF8),
                      title: 'My Profile',
                      subtitle: 'Account details & Plan',
                      onTap: () {
                        if (!authProvider.isAuthenticated) {
                          Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                        } else {
                          setState(() => _selectedIndex = 3);
                        }
                      },
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: iconColor, size: 28),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
