import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../app/theme/theme_provider.dart';
import '../../../app/theme/app_colors.dart';
import '../../auth/services/auth_provider.dart';
import '../../subscription/presentation/subscription_screen.dart';
import '../../history/presentation/history_screen.dart';
import '../../admin/presentation/admin_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showEditProfileDialog(BuildContext context, AuthProvider authProvider, bool isDark) {
    final user = authProvider.user;
    if (user == null) return;

    final nameController = TextEditingController(text: user.displayName ?? '');
    final classController = TextEditingController(text: user.preferredClass ?? 'Class 10');

    final dialogBg = AppColors.getSurface(isDark);
    final inputBg = AppColors.getSurfaceElevated(isDark);
    final borderColor = AppColors.getBorder(isDark);
    final textColor = AppColors.getTextPrimary(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    showDialog(
      context: context,
      builder: (dCtx) {
        bool isSaving = false;
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            return AlertDialog(
              backgroundColor: dialogBg,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: borderColor),
              ),
              title: Row(
                children: [
                  Icon(Icons.edit_outlined, color: textColor, size: 20),
                  const SizedBox(width: 8),
                  Text('Edit Basic Information', style: TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Full Name', style: TextStyle(color: subtextColor, fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: nameController,
                    style: TextStyle(color: textColor, fontSize: 14),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: inputBg,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderColor)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderColor)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: textColor)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text('Teaching Class / Standard', style: TextStyle(color: subtextColor, fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: classController,
                    style: TextStyle(color: textColor, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'e.g. Class 10, Class 12, Secondary',
                      hintStyle: TextStyle(color: subtextColor.withValues(alpha: 0.7)),
                      filled: true,
                      fillColor: inputBg,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderColor)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderColor)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: textColor)),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isSaving ? null : () => Navigator.pop(dCtx),
                  child: Text('Cancel', style: TextStyle(color: subtextColor)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isDark ? Colors.white : Colors.black,
                    foregroundColor: isDark ? Colors.black : Colors.white,
                  ),
                  onPressed: isSaving
                      ? null
                      : () async {
                          final newName = nameController.text.trim();
                          final newClass = classController.text.trim();
                          if (newName.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Name cannot be empty')),
                            );
                            return;
                          }
                          setDialogState(() => isSaving = true);
                          final ok = await authProvider.updateProfile(
                            displayName: newName,
                            preferredClass: newClass,
                          );
                          setDialogState(() => isSaving = false);
                          if (ok && context.mounted) {
                            Navigator.pop(dCtx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Profile updated successfully!')),
                            );
                          }
                        },
                  child: isSaving
                      ? SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(color: isDark ? Colors.black : Colors.white, strokeWidth: 2),
                        )
                      : const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    final isDark = themeProvider.isDarkMode;
    final bg = AppColors.getBackground(isDark);
    final cardBg = AppColors.getSurface(isDark);
    final borderColor = AppColors.getBorder(isDark);
    final textColor = AppColors.getTextPrimary(isDark);
    final subtextColor = AppColors.getTextSecondary(isDark);

    if (user == null) {
      return Scaffold(
        backgroundColor: bg,
        appBar: AppBar(
          backgroundColor: cardBg,
          iconTheme: IconThemeData(color: textColor),
          title: Text('Profile', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        ),
        body: Center(
          child: Text(
            'Please sign in to view your profile.',
            style: TextStyle(color: subtextColor, fontSize: 16),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: cardBg,
        elevation: 0,
        iconTheme: IconThemeData(color: textColor),
        title: Text(
          'Account Profile',
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // User Avatar Card with Edit Button
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: isDark ? Colors.white : Colors.black,
                          child: Text(
                            (user.displayName ?? user.email)[0].toUpperCase(),
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.black : Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user.displayName ?? 'Educator',
                                style: TextStyle(
                                  color: textColor,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                user.email,
                                style: TextStyle(
                                  color: subtextColor,
                                  fontSize: 13,
                                ),
                              ),
                              if (user.preferredClass != null && user.preferredClass!.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Text(
                                  user.preferredClass!,
                                  style: TextStyle(
                                    color: textColor,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 4,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.2)),
                                    ),
                                    child: Text(
                                      user.plan.toUpperCase(),
                                      style: TextStyle(
                                        color: textColor,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      user.role.toUpperCase(),
                                      style: TextStyle(
                                        color: subtextColor,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: textColor,
                          side: BorderSide(color: borderColor),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        icon: const Icon(Icons.edit_outlined, size: 16),
                        label: const Text('Edit Profile Information', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                        onPressed: () => _showEditProfileDialog(context, authProvider, isDark),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Theme Mode Toggle Card
              Container(
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: borderColor),
                ),
                child: SwitchListTile(
                  secondary: Icon(
                    isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
                    color: textColor,
                  ),
                  title: Text(
                    isDark ? 'Dark Theme' : 'Light Theme',
                    style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    isDark ? 'Sleek dark mode active' : 'Clean light mode active',
                    style: TextStyle(color: subtextColor, fontSize: 12),
                  ),
                  value: isDark,
                  activeThumbColor: isDark ? Colors.white : Colors.black,
                  activeTrackColor: isDark ? const Color(0xFF404040) : const Color(0xFFD4D4D4),
                  onChanged: (val) {
                    themeProvider.toggleTheme(val);
                  },
                ),
              ),

              const SizedBox(height: 16),

              // Navigation Actions
              Container(
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: borderColor),
                ),
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(Icons.star_outline, color: textColor),
                      title: Text('Upgrade Subscription', style: TextStyle(color: textColor)),
                      subtitle: Text('Current Plan: ${user.plan}', style: TextStyle(color: subtextColor, fontSize: 12)),
                      trailing: Icon(Icons.chevron_right, color: subtextColor),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const SubscriptionScreen()));
                      },
                    ),
                    Divider(height: 1, color: borderColor),
                    ListTile(
                      leading: Icon(Icons.history, color: textColor),
                      title: Text('Paper History', style: TextStyle(color: textColor)),
                      subtitle: Text('View and download generated papers', style: TextStyle(color: subtextColor, fontSize: 12)),
                      trailing: Icon(Icons.chevron_right, color: subtextColor),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (ctx) => const HistoryScreen()));
                      },
                    ),
                    if (user.isAdmin) ...[
                      Divider(height: 1, color: borderColor),
                      ListTile(
                        leading: Icon(Icons.admin_panel_settings_outlined, color: textColor),
                        title: Text('Admin Dashboard', style: TextStyle(color: textColor)),
                        subtitle: Text('Manage system users & plans', style: TextStyle(color: subtextColor, fontSize: 12)),
                        trailing: Icon(Icons.chevron_right, color: subtextColor),
                        onTap: () {
                          Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AdminScreen()));
                        },
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: Color(0xFFEF4444)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.logout, color: Color(0xFFEF4444)),
                  label: const Text('Sign Out', style: TextStyle(color: Color(0xFFEF4444), fontSize: 15, fontWeight: FontWeight.bold)),
                  onPressed: () async {
                    await authProvider.logout();
                  },
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'Smart Paper Generator Mobile v1.0.0\nCloud Synced: smartpapergenwebsite',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: subtextColor),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
