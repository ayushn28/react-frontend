import { NextRequest, NextResponse } from "next/server";
import { getAllCoupons, addCoupon, deleteCoupon } from "@/lib/store";
import { Coupon } from "@/lib/types";

export async function GET() {
  const coupons = getAllCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const requiredFields = ["code", "description", "discountType", "discountValue", "startDate", "endDate"];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!["FLAT", "PERCENT"].includes(body.discountType)) {
      return NextResponse.json(
        { error: "discountType must be 'FLAT' or 'PERCENT'" },
        { status: 400 }
      );
    }

    if (typeof body.discountValue !== "number" || body.discountValue <= 0) {
      return NextResponse.json(
        { error: "discountValue must be a positive number" },
        { status: 400 }
      );
    }

    const coupon: Coupon = {
      code: body.code.toUpperCase(),
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      maxDiscountAmount: body.maxDiscountAmount,
      startDate: body.startDate,
      endDate: body.endDate,
      usageLimitPerUser: body.usageLimitPerUser,
      eligibility: body.eligibility || {},
    };

    const result = addCoupon(coupon);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json({ message: result.message, coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  
  if (!code) {
    return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
  }

  const deleted = deleteCoupon(code.toUpperCase());
  
  if (!deleted) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Coupon deleted successfully" });
}
