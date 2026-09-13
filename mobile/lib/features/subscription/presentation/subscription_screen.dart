import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/subscription_provider.dart';
import '../../auth/services/auth_provider.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final subProvider = Provider.of<SubscriptionProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final currentPlan = authProvider.user?.plan ?? 'FREE';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Subscription & Plans', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF6366F1).withValues(alpha: 0.4)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Active Subscription:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                        const SizedBox(height: 4),
                        Text(
                          '$currentPlan PLAN',
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Chip(
                      backgroundColor: Color(0xFF10B981),
                      label: Text('ACTIVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
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
              const Text('Select Upgrade Plan:', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              ...SubscriptionProvider.availablePlans.map((plan) {
                final isCurrent = currentPlan.toUpperCase() == plan.id.toUpperCase();
                return Card(
                  color: const Color(0xFF1E293B),
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: plan.isPopular ? const Color(0xFF6366F1) : const Color(0xFF334155),
                      width: plan.isPopular ? 2 : 1,
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
                            Text(plan.title, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                            if (plan.isPopular)
                              const Chip(
                                backgroundColor: Color(0xFF6366F1),
                                label: Text('POPULAR', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(plan.price, style: const TextStyle(color: Color(0xFF818CF8), fontSize: 22, fontWeight: FontWeight.bold)),
                            Text(' / ${plan.period}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Daily Limit: ${plan.limitText}', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w600, fontSize: 13)),
                        const Divider(color: Color(0xFF334155), height: 20),
                        ...plan.features.map((f) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(
                                children: [
                                  const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 16),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(f, style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13))),
                                ],
                              ),
                            )),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isCurrent ? const Color(0xFF334155) : const Color(0xFF6366F1),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            onPressed: (isCurrent || subProvider.isProcessing)
                                ? null
                                : () async {
                                    final messenger = ScaffoldMessenger.of(context);
                                    final success = await subProvider.initiateCheckout(
                                      plan.id,
                                      (newPlan) => authProvider.updateUserPlan(newPlan),
                                    );
                                    if (success && context.mounted) {
                                      messenger.showSnackBar(
                                        SnackBar(content: Text('Upgraded to ${plan.title} successfully!')),
                                      );
                                    }
                                  },
                            child: isCurrent
                                ? const Text('Current Plan', style: TextStyle(color: Color(0xFF94A3B8)))
                                : (subProvider.isProcessing
                                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                    : Text('Upgrade to ${plan.title}', style: const TextStyle(fontWeight: FontWeight.bold))),
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
