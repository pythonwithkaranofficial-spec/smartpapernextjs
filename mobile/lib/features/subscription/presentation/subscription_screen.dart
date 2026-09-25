import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../app/theme/theme_provider.dart';
import '../../../app/theme/app_colors.dart';
import '../services/subscription_provider.dart';
import '../../auth/services/auth_provider.dart';
import '../../auth/presentation/auth_screen.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final subProvider = Provider.of<SubscriptionProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final currentPlan = authProvider.user?.plan ?? 'FREE';

    final isDark = themeProvider.isDarkMode;
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
        title: Text(
          'Subscription & Passes',
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Current Plan Banner
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
                        Text('Active Subscription Plan:', style: TextStyle(color: subtextColor, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text(
                          '$currentPlan PLAN',
                          style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: isDark ? Colors.white.withValues(alpha: 0.2) : Colors.black.withValues(alpha: 0.2)),
                      ),
                      child: Text(
                        'ACTIVE',
                        style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),

              if (subProvider.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12.0),
                  child: Text(subProvider.errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 13)),
                ),

              const SizedBox(height: 24),
              Text('Select Upgrade Plan:', style: TextStyle(color: textColor, fontSize: 17, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              ...SubscriptionProvider.availablePlans.map((plan) {
                final isCurrent = currentPlan.toUpperCase() == plan.id.toUpperCase();
                return Card(
                  color: cardBg,
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: BorderSide(
                      color: plan.isPopular
                          ? (isDark ? Colors.white : Colors.black)
                          : borderColor,
                      width: plan.isPopular ? 1.5 : 1,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(plan.title, style: TextStyle(color: textColor, fontSize: 16, fontWeight: FontWeight.bold)),
                            if (plan.isPopular)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.white : Colors.black,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'RECOMMENDED',
                                  style: TextStyle(
                                    color: isDark ? Colors.black : Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(plan.price, style: TextStyle(color: textColor, fontSize: 22, fontWeight: FontWeight.bold)),
                            Text(' / ${plan.period}', style: TextStyle(color: subtextColor, fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Daily Quota: ${plan.limitText}', style: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 12.5)),
                        Divider(color: borderColor, height: 20),
                        ...plan.features.map((f) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(
                                children: [
                                  Icon(Icons.check_circle_outline, color: textColor, size: 15),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(f, style: TextStyle(color: subtextColor, fontSize: 12.5))),
                                ],
                              ),
                            )),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isCurrent
                                  ? (isDark ? const Color(0xFF262626) : const Color(0xFFE5E7EB))
                                  : (isDark ? Colors.white : Colors.black),
                              foregroundColor: isCurrent
                                  ? subtextColor
                                  : (isDark ? Colors.black : Colors.white),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            onPressed: (isCurrent || subProvider.isProcessing)
                                ? null
                                : () async {
                                    if (!authProvider.isAuthenticated) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Please sign in to upgrade your subscription plan.')),
                                      );
                                      Navigator.push(context, MaterialPageRoute(builder: (ctx) => const AuthScreen()));
                                      return;
                                    }

                                    final messenger = ScaffoldMessenger.of(context);
                                    final success = await subProvider.initiateCheckout(
                                      plan.id,
                                      (newPlan) {
                                        authProvider.updateUserPlan(newPlan);
                                      },
                                    );
                                    if (success && context.mounted) {
                                      messenger.showSnackBar(
                                        SnackBar(
                                          backgroundColor: isDark ? Colors.white : Colors.black,
                                          content: Text(
                                            'Upgraded to ${plan.title} successfully!',
                                            style: TextStyle(
                                              color: isDark ? Colors.black : Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      );
                                    }
                                  },
                            child: isCurrent
                                ? const Text('Current Plan', style: TextStyle(fontWeight: FontWeight.bold))
                                : (subProvider.isProcessing
                                    ? SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          color: isDark ? Colors.black : Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : Text('Activate ${plan.title}', style: const TextStyle(fontWeight: FontWeight.bold))),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
