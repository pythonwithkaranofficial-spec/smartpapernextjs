import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/services/auth_provider.dart';
import '../../subscription/presentation/subscription_screen.dart';
import '../../history/presentation/history_screen.dart';
import '../../admin/presentation/admin_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    if (user == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        appBar: AppBar(title: const Text('Profile')),
        body: const Center(child: Text('Please sign in to view your profile.', style: TextStyle(color: Colors.white))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Account Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // User Avatar Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: const Color(0xFF6366F1),
                      child: Text(
                        (user.displayName ?? user.email)[0].toUpperCase(),
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user.displayName ?? 'Educator', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          Text(user.email, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Chip(
                                backgroundColor: const Color(0xFF6366F1).withValues(alpha: 0.2),
                                label: Text(user.plan, style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(width: 8),
                              Chip(
                                backgroundColor: user.isAdmin ? Colors.amber.withValues(alpha: 0.2) : Colors.grey.withValues(alpha: 0.2),
                                label: Text(user.role, style: TextStyle(color: user.isAdmin ? Colors.amber : Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Navigation Actions
              ListTile(
                tileColor: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                leading: const Icon(Icons.star_outline, color: Color(0xFF6366F1)),
                title: const Text('Upgrade Subscription', style: TextStyle(color: Colors.white)),
                subtitle: Text('Current Plan: ${user.plan}', style: const TextStyle(color: Color(0xFF94A3B8))),
                trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SubscriptionScreen()));
                },
              ),
              const SizedBox(height: 12),
              ListTile(
                tileColor: const Color(0xFF1E293B),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                leading: const Icon(Icons.history, color: Color(0xFF10B981)),
                title: const Text('Paper History', style: TextStyle(color: Colors.white)),
                subtitle: const Text('View and download generated papers', style: TextStyle(color: Color(0xFF94A3B8))),
                trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                onTap: () {
                  Navigator.push(context, MaterialPageRoute(builder: (ctx) => const HistoryScreen()));
                },
              ),

              if (user.isAdmin) ...[
                const SizedBox(height: 12),
                ListTile(
                  tileColor: const Color(0xFF1E293B),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  leading: const Icon(Icons.admin_panel_settings_outlined, color: Colors.amber),
                  title: const Text('Admin Dashboard', style: TextStyle(color: Colors.white)),
                  subtitle: const Text('Manage system users & plans', style: TextStyle(color: Color(0xFF94A3B8))),
                  trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AdminScreen()));
                  },
                ),
              ],

              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: Colors.redAccent),
                  ),
                  icon: const Icon(Icons.logout, color: Colors.redAccent),
                  label: const Text('Sign Out', style: TextStyle(color: Colors.redAccent, fontSize: 16)),
                  onPressed: () async {
                    await authProvider.logout();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
