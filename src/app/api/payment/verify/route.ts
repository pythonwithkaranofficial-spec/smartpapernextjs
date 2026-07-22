import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuthToken } from "@/lib/auth/middleware";
import { UserRepository } from "@/lib/db/user-repository";
import { UserPlan } from "@/types/auth";
import { handleApiError, ValidationError } from "@/lib/errors";

const key_secret = process.env.RAZORPAY_KEY_SECRET || "jjTFV9nUT6Q7qkR3ZVE0b3wh";

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json();

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
    const amount = plan === "PRO" ? 499 : plan === "PREMIUM" ? 999 : 2499;

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
