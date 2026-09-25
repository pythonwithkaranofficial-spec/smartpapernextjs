import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../app/theme/theme_provider.dart';
import '../../../app/theme/app_colors.dart';
import '../../auth/services/auth_provider.dart';
import '../../generator/services/generator_provider.dart';
import '../../generator/presentation/generator_screen.dart';
import '../../history/presentation/history_screen.dart';
import '../../subscription/presentation/subscription_screen.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../admin/presentation/admin_screen.dart';
import '../../auth/presentation/auth_screen.dart';
import '../../syllabus/presentation/syllabus_screen.dart';

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
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final generatorProvider = Provider.of<GeneratorProvider>(context);

    final isDark = themeProvider.isDarkMode;
    final bg = AppColors.getBackground(isDark);
    final cardBg = AppColors.getSurface(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    final List<Widget> pages = [
      _buildHomeDashboard(context, authProvider, generatorProvider, isDark),
      const GeneratorScreen(),
      const HistoryScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: bg,
      body: pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          generatorProvider.fetchUserUsage();
          if (!authProvider.isAuthenticated && index != 0) {
            Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
          } else {
            setState(() => _selectedIndex = index);
          }
        },
        backgroundColor: cardBg,
        selectedItemColor: isDark ? Colors.white : Colors.black,
        unselectedItemColor: subtextColor,
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

  Widget _buildHomeDashboard(
    BuildContext context,
    AuthProvider authProvider,
    GeneratorProvider generatorProvider,
    bool isDark,
  ) {
    final user = authProvider.user;
    final bg = AppColors.getBackground(isDark);
    final cardBg = AppColors.getSurface(isDark);
    final borderColor = AppColors.getBorder(isDark);
    final textColor = AppColors.getTextPrimary(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: cardBg,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset('assets/images/app_logo.png', width: 28, height: 28, fit: BoxFit.cover),
            ),
            const SizedBox(width: 10),
            Text(
              'Smart Paper Generator',
              style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 17),
            ),
          ],
        ),
        actions: [
          if (authProvider.isAuthenticated)
            IconButton(
              icon: Icon(Icons.account_circle_outlined, color: textColor),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (ctx) => const ProfileScreen()));
              },
            )
          else
            TextButton(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
              },
              child: Text('Sign In', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
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
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: isDark
                        ? const [Color(0xFF1F1F1F), Color(0xFF141414)]
                        : const [Color(0xFFF3F4F6), Color(0xFFE5E7EB)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: isDark ? Colors.black.withValues(alpha: 0.6) : Colors.grey.withValues(alpha: 0.2),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user != null ? 'Welcome back, ${user.displayName ?? "Educator"}!' : 'AI CBSE Question Paper Generator',
                      style: TextStyle(fontSize: 21, fontWeight: FontWeight.bold, color: textColor),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Create official CBSE standard question papers, blueprint layouts, and marking schemes in seconds.',
                      style: TextStyle(fontSize: 13.5, color: subtextColor, height: 1.4),
                    ),
                    const SizedBox(height: 18),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? Colors.white : Colors.black,
                        foregroundColor: isDark ? Colors.black : Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.auto_awesome, size: 18),
                      label: const Text('Generate Paper Now', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
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

              const SizedBox(height: 20),

              // Daily Limit Status Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.timer_outlined, size: 15, color: subtextColor),
                            const SizedBox(width: 6),
                            Text('Today\'s Generation Quota:', style: TextStyle(color: subtextColor, fontSize: 12, fontWeight: FontWeight.w500)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${generatorProvider.papersGeneratedToday} / ${generatorProvider.dailyLimit} Papers Used',
                          style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          generatorProvider.papersGeneratedToday >= generatorProvider.dailyLimit
                              ? 'Daily 5 papers limit reached'
                              : '${generatorProvider.dailyLimit - generatorProvider.papersGeneratedToday} remaining today',
                          style: TextStyle(
                            color: generatorProvider.papersGeneratedToday >= generatorProvider.dailyLimit
                                ? Colors.redAccent
                                : subtextColor,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? Colors.white : Colors.black,
                        foregroundColor: isDark ? Colors.black : Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SubscriptionScreen()));
                      },
                      child: const Text('Upgrade Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Features Grid
              Text('Quick Access', style: TextStyle(color: textColor, fontSize: 17, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.25,
                children: [
                  _buildFeatureCard(
                    icon: Icons.auto_awesome,
                    title: 'Paper Wizard',
                    subtitle: 'Create CBSE 1–12 papers',
                    isDark: isDark,
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
                    title: 'Paper History',
                    subtitle: 'Saved papers & DOCX',
                    isDark: isDark,
                    onTap: () {
                      if (!authProvider.isAuthenticated) {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                      } else {
                        setState(() => _selectedIndex = 2);
                      }
                    },
                  ),
                  _buildFeatureCard(
                    icon: Icons.menu_book_outlined,
                    title: 'Syllabus Explorer',
                    subtitle: 'CBSE Chapter Directory',
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SyllabusScreen()));
                    },
                  ),
                  _buildFeatureCard(
                    icon: Icons.workspace_premium_outlined,
                    title: 'Subscription Plans',
                    subtitle: 'Passes & Educator Plans',
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SubscriptionScreen()));
                    },
                  ),
                  if (user != null && user.isAdmin)
                    _buildFeatureCard(
                      icon: Icons.admin_panel_settings_outlined,
                      title: 'Admin Console',
                      subtitle: 'Turso users & roles',
                      isDark: isDark,
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AdminScreen()));
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
    required String title,
    required String subtitle,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    final cardBg = AppColors.getSurface(isDark);
    final elevatedBg = AppColors.getSurfaceElevated(isDark);
    final borderColor = AppColors.getBorder(isDark);
    final textColor = AppColors.getTextPrimary(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: elevatedBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: textColor, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(color: textColor, fontSize: 14, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(color: subtextColor, fontSize: 11),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
