import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyAuthToken } from "@/lib/auth/middleware";
import { UserPlan } from "@/types/auth";
import { handleApiError, ValidationError } from "@/lib/errors";

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TGd0ItjJBk6QgH";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "jjTFV9nUT6Q7qkR3ZVE0b3wh";

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

const PLAN_PRICES: Record<UserPlan, number> = {
  FREE: 0,
  PRO: 21, // ₹21 (1-Day Unlimited Pass)
  PREMIUM: 399, // ₹399 (1-Year Educator Pass - 50 papers/day)
  ENTERPRISE: 999, // ₹999
};

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json();
    const { plan } = body as { plan: UserPlan };

    if (!plan || PLAN_PRICES[plan] === undefined) {
      throw new ValidationError("Invalid subscription plan selected");
    }

    const amountInINR = PLAN_PRICES[plan];
    const amountInPaise = amountInINR * 100;

    const receipt = `rcpt_${authContext.uid.substring(0, 8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        firebase_uid: authContext.uid,
        user_email: authContext.email || "",
        target_plan: plan,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: key_id,
        plan,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
