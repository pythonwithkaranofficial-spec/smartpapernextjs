import '../api/api_client.dart';

/// Service contract for handling payment processing and verification
abstract class PaymentService {
  Future<Map<String, dynamic>> createOrder({required String planId});
  Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
    required String planId,
  });
}

/// Concrete implementation of PaymentService using ApiClient
class PaymentServiceImpl implements PaymentService {
  final ApiClient _apiClient;

  PaymentServiceImpl(this._apiClient);

  @override
  Future<Map<String, dynamic>> createOrder({required String planId}) async {
    final response = await _apiClient.post('/payment/checkout', body: {'plan': planId});
    return (response['data'] as Map<String, dynamic>?) ?? response;
  }

  @override
  Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
    required String planId,
  }) async {
    final response = await _apiClient.post('/payment/verify', body: {
      'razorpay_order_id': orderId,
      'razorpay_payment_id': paymentId,
      'razorpay_signature': signature,
      'plan': planId,
    });
    return response['success'] == true;
  }
}
