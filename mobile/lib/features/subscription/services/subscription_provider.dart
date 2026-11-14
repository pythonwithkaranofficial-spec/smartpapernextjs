import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../services/api/api_client.dart';
import '../../../services/browser/external_browser.dart';

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
  ];

  /// Web page where paid passes are purchased. Payments are created by
  /// `/api/payment/checkout` and confirmed by `/api/payment/verify` on the
  /// server (Razorpay signature checked there); the app never upgrades a plan
  /// locally. Once the user returns to the app, the plan is re-read from
  /// `/user/me` (see AuthProvider.didChangeAppLifecycleState).
  static const String webCheckoutUrl = 'https://paperbykaran.vercel.app/profile';

  bool _awaitingWebCheckout = false;

  /// True after the browser checkout was opened and until the plan was refreshed.
  bool get awaitingWebCheckout => _awaitingWebCheckout;

  /// Opens the website checkout for a paid plan in the external browser.
  /// Returns true if the browser was launched. If it could not be launched,
  /// the checkout URL is copied to the clipboard and an error is shown.
  Future<bool> openWebCheckout(String planId) async {
    _isProcessing = true;
    _errorMessage = null;
    notifyListeners();

    final launched = await ExternalBrowser.open(webCheckoutUrl);
    if (launched) {
      _awaitingWebCheckout = true;
    } else {
      try {
        await Clipboard.setData(const ClipboardData(text: webCheckoutUrl));
      } catch (_) {}
      _errorMessage =
          'Could not open the browser. Visit $webCheckoutUrl (link copied) and sign in with the same account to purchase.';
    }

    _isProcessing = false;
    notifyListeners();
    return launched;
  }

  /// Called after the user's plan has been re-read from the server.
  void markCheckoutRefreshed() {
    if (_awaitingWebCheckout) {
      _awaitingWebCheckout = false;
      notifyListeners();
    }
  }

  /// Switches back to the FREE plan (the only change the server allows
  /// without a verified payment). Returns true on success.
  Future<bool> downgradeToFree() async {
    _isProcessing = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _apiClient.post('/user/plan', body: {'plan': 'FREE'});
      return true;
    } catch (e) {
      _errorMessage = e is ApiException ? e.message : 'Could not change plan. Please try again.';
      return false;
    } finally {
      _isProcessing = false;
      notifyListeners();
    }
  }
}
