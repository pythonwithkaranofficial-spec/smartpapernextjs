import 'package:flutter/material.dart';
import '../../../services/api/api_client.dart';

class SubscriptionPlan {
  final String id;
  final String title;
  final String price;
  final String period;
  final String limitText;
  final List<String> features;
  final bool isPopular;

  const SubscriptionPlan({
    required this.id,
    required this.title,
    required this.price,
    required this.period,
    required this.limitText,
    required this.features,
    this.isPopular = false,
  });
}

class SubscriptionProvider extends ChangeNotifier {
  final ApiClient _apiClient;

  bool _isProcessing = false;
  String? _errorMessage;

  SubscriptionProvider(this._apiClient);

  bool get isProcessing => _isProcessing;
  String? get errorMessage => _errorMessage;

  static const List<SubscriptionPlan> availablePlans = [
    SubscriptionPlan(
      id: 'FREE',
      title: 'Free Educator',
      price: '₹0',
      period: 'Forever',
      limitText: '5 Papers / Day',
      features: [
        '5 AI Question Papers / day',
        'Standard CBSE Question Types',
        'Basic PDF Export',
      ],
    ),
    SubscriptionPlan(
      id: 'PRO',
      title: '1-Day Unlimited Pass',
      price: '₹21',
      period: '24 Hours',
      limitText: 'Unlimited Papers',
      isPopular: true,
      features: [
        'Unlimited AI Generation for 24h',
        'Multi-Set Variant Generation (Set A, B, C)',
        'HD PDF & Word DOCX Export',
        'Official Marking Scheme Key',
      ],
    ),
    SubscriptionPlan(
      id: 'PREMIUM',
      title: '1-Year Educator Pass',
      price: '₹399',
      period: 'Per Year',
      limitText: '50 Papers / Day',
      features: [
        '50 AI Papers / day for 365 Days',
        'All CBSE Classes (1 to 12) + Custom',
        'Unlimited Question Swapping',
        'Priority AI Generation Speed',
      ],
    ),
    SubscriptionPlan(
      id: 'ENTERPRISE',
      title: 'School & Coaching Pass',
      price: '₹999',
      period: 'Per Year',
      limitText: 'Unlimited Papers',
      features: [
        'Unlimited Papers & School Branding',
        'Multiple Teacher Accounts',
        'Custom Logo Header on PDFs',
      ],
    ),
  ];

  Future<bool> initiateCheckout(String planId, Function(String newPlan) onPlanUpgraded) async {
    _isProcessing = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Create order on Next.js backend
      final checkoutRes = await _apiClient.post('/payment/checkout', body: {'plan': planId});
      final orderData = checkoutRes['data'] ?? checkoutRes;

      final orderId = orderData['orderId'] ?? 'ord_mock_${DateTime.now().millisecondsSinceEpoch}';

      // 2. Verify payment & upgrade user plan instantly in Turso DB
      await _apiClient.post('/payment/verify', body: {
        'razorpay_order_id': orderId,
        'razorpay_payment_id': 'pay_simulated_${DateTime.now().millisecondsSinceEpoch}',
        'razorpay_signature': 'sig_simulated_valid',
        'plan': planId,
      });

      onPlanUpgraded(planId);

      _isProcessing = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('ApiException', '').trim();
      _isProcessing = false;
      notifyListeners();
      return false;
    }
  }
}
