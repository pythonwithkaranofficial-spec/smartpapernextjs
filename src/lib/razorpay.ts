import Razorpay from 'razorpay';
import { AppError } from './errors';

/**
 * Server-only Razorpay client. Credentials MUST come from the environment;
 * there is intentionally no hardcoded fallback.
 */
export function getRazorpayCredentials(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new AppError('Payments are not configured on the server.', 503, 'PAYMENTS_NOT_CONFIGURED');
  }
  return { keyId, keySecret };
}

export function getRazorpayClient(): Razorpay {
  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
