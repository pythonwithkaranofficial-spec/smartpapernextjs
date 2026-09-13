/// Placeholder interface for Razorpay Payment Service
abstract class PaymentService {
  Future<void> initiatePayment({required String orderId, required double amount});
}
