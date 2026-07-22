import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuthToken } from "@/lib/auth/middleware";
import { UserRepository } from "@/lib/db/user-repository";
import { UserPlan } from "@/types/auth";
import { handleApiError, ValidationError } from "@/lib/errors";

const PLAN_AMOUNTS: Record<UserPlan, number> = {
  FREE: 0,
  PRO: 21,
  PREMIUM: 399,
  ENTERPRISE: 999,
};

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan: UserPlan;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      throw new ValidationError("Missing required payment verification parameters");
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || "jjTFV9nUT6Q7qkR3ZVE0b3wh";

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new ValidationError("Invalid Razorpay payment signature verification failed");
    }

    // Upgrade user plan in Turso DB
    const updatedUser = await UserRepository.updatePlan(authContext.uid, plan);

    // Calculate amount based on plan
    const amount = PLAN_AMOUNTS[plan] ?? 21;

    // Record transaction in payments table
    await UserRepository.createPayment({
      firebase_uid: authContext.uid,
      gateway: "RAZORPAY",
      amount,
      currency: "INR",
      status: "SUCCESS",
      transaction_reference: razorpay_payment_id,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
