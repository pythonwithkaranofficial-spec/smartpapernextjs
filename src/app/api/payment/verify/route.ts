import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuthToken } from "@/lib/auth/middleware";
import { UserRepository } from "@/lib/db/user-repository";
import { UserPlan } from "@/types/auth";
import { AppError, handleApiError, ValidationError } from "@/lib/errors";
import { PLAN_PRICES_INR, computePlanExpiry } from "@/lib/auth/helpers";
import { getRazorpayClient, getRazorpayCredentials } from "@/lib/razorpay";

const PURCHASABLE_PLANS: UserPlan[] = ["PRO", "PREMIUM", "ENTERPRISE"];

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * Verifies a Razorpay payment and upgrades the caller's plan.
 * Every fact used for the upgrade (plan, amount, owner) comes from Razorpay's
 * order and payment records, never from the request body.
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (
      typeof razorpay_order_id !== "string" || !razorpay_order_id.startsWith("order_") ||
      typeof razorpay_payment_id !== "string" || !razorpay_payment_id ||
      typeof razorpay_signature !== "string" || !razorpay_signature
    ) {
      throw new ValidationError("Missing or invalid payment verification parameters");
    }

    // 1. Signature check: proves Razorpay issued this payment for this order.
    const { keySecret } = getRazorpayCredentials();
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (!timingSafeEqualStr(expectedSignature, razorpay_signature)) {
      throw new ValidationError("Payment signature verification failed", 400, "INVALID_SIGNATURE");
    }

    // 2. Idempotency: a payment can only ever be applied once.
    const existingPayment = await UserRepository.findPaymentByReference(razorpay_payment_id);
    if (existingPayment) {
      if (existingPayment.firebase_uid !== authContext.uid) {
        throw new ValidationError("This payment belongs to another account", 403, "PAYMENT_OWNERSHIP_MISMATCH");
      }
      const currentUser = await UserRepository.findUserByFirebaseUid(authContext.uid);
      return NextResponse.json({ success: true, data: currentUser, alreadyProcessed: true });
    }

    // 3. Fetch the authoritative order + payment from Razorpay.
    const razorpay = getRazorpayClient();
    let order;
    let payment;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
      payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (rzpErr) {
      console.error("[Razorpay Fetch Error]:", rzpErr);
      throw new AppError(
        "Could not confirm the payment with Razorpay. Please contact support if you were charged.",
        502,
        "PAYMENT_GATEWAY_ERROR"
      );
    }

    const notes = (order.notes || {}) as Record<string, string>;
    const plan = notes.target_plan as UserPlan;

    if (notes.firebase_uid !== authContext.uid) {
      throw new ValidationError("This order belongs to another account", 403, "PAYMENT_OWNERSHIP_MISMATCH");
    }
    if (!PURCHASABLE_PLANS.includes(plan)) {
      throw new ValidationError("Order does not reference a valid plan");
    }
    const expectedAmount = PLAN_PRICES_INR[plan] * 100;
    if (Number(order.amount) !== expectedAmount || order.currency !== "INR") {
      throw new ValidationError("Order amount does not match the plan price");
    }
    if (payment.order_id !== razorpay_order_id || Number(payment.amount) !== expectedAmount) {
      throw new ValidationError("Payment does not match the order");
    }

    // 4. Ensure funds are captured (capture if only authorized).
    if (payment.status === "authorized") {
      try {
        payment = await razorpay.payments.capture(razorpay_payment_id, expectedAmount, "INR");
      } catch (capErr) {
        console.error("[Razorpay Capture Error]:", capErr);
      }
    }
    if (payment.status !== "captured") {
      throw new ValidationError("Payment is not completed yet", 402, "PAYMENT_NOT_CAPTURED");
    }

    // 5. Record the payment first (UNIQUE transaction_reference blocks a concurrent double-apply), then upgrade.
    try {
      await UserRepository.createPayment({
        firebase_uid: authContext.uid,
        gateway: "RAZORPAY",
        amount: expectedAmount / 100,
        currency: "INR",
        status: "SUCCESS",
        transaction_reference: razorpay_payment_id,
      });
    } catch (dbErr) {
      const again = await UserRepository.findPaymentByReference(razorpay_payment_id);
      if (again && again.firebase_uid === authContext.uid) {
        const currentUser = await UserRepository.findUserByFirebaseUid(authContext.uid);
        return NextResponse.json({ success: true, data: currentUser, alreadyProcessed: true });
      }
      throw dbErr;
    }

    // Renewing the same plan early extends from the current expiry.
    const current = await UserRepository.findUserByFirebaseUid(authContext.uid);
    const currentExpiry = current?.plan === plan && current.plan_expires_at ? new Date(current.plan_expires_at) : null;
    const base = currentExpiry && currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
    const updatedUser = await UserRepository.updatePlan(authContext.uid, plan, computePlanExpiry(plan, base));

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
