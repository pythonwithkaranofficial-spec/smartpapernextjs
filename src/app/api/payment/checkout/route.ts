import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/middleware";
import { UserPlan } from "@/types/auth";
import { AppError, handleApiError, ValidationError } from "@/lib/errors";
import { PLAN_PRICES_INR } from "@/lib/auth/helpers";
import { getRazorpayClient, getRazorpayCredentials } from "@/lib/razorpay";

const PURCHASABLE_PLANS: UserPlan[] = ["PRO", "PREMIUM", "ENTERPRISE"];

export async function POST(req: NextRequest) {
  try {
    const authContext = await verifyAuthToken(req);
    const body = await req.json().catch(() => ({}));
    const { plan } = body as { plan: UserPlan };

    if (!plan || !PURCHASABLE_PLANS.includes(plan)) {
      throw new ValidationError("Invalid subscription plan selected");
    }

    const { keyId } = getRazorpayCredentials();
    const amountInPaise = PLAN_PRICES_INR[plan] * 100;
    const receipt = `rcpt_${authContext.uid.substring(0, 8)}_${Date.now()}`;

    let order;
    try {
      order = await getRazorpayClient().orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt,
        notes: {
          firebase_uid: authContext.uid,
          user_email: authContext.email || "",
          target_plan: plan,
        },
      });
    } catch (rzpError) {
      console.error("[Razorpay Order Create Error]:", rzpError);
      throw new AppError("Could not start the payment. Please try again.", 502, "PAYMENT_GATEWAY_ERROR");
    }

    if (!order?.id) {
      throw new AppError("Could not start the payment. Please try again.", 502, "PAYMENT_GATEWAY_ERROR");
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        keyId,
        plan,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
