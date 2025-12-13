import { NextRequest, NextResponse } from "next/server";
import { findBestCoupon } from "@/lib/coupon-engine";
import { UserContext, Cart } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { user, cart } = body as { user: UserContext; cart: Cart };

    if (!user || !cart) {
      return NextResponse.json(
        { error: "Missing required fields: user and cart" },
        { status: 400 }
      );
    }

    const requiredUserFields = ["userId", "userTier", "country", "lifetimeSpend", "ordersPlaced"];
    for (const field of requiredUserFields) {
      if (user[field as keyof UserContext] === undefined) {
        return NextResponse.json(
          { error: `Missing required user field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!cart.items || !Array.isArray(cart.items)) {
      return NextResponse.json(
        { error: "Cart must have an items array" },
        { status: 400 }
      );
    }

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const requiredItemFields = ["productId", "category", "unitPrice", "quantity"];
      for (const field of requiredItemFields) {
        if (item[field as keyof typeof item] === undefined) {
          return NextResponse.json(
            { error: `Missing required field in cart item ${i}: ${field}` },
            { status: 400 }
          );
        }
      }
    }

    const result = findBestCoupon(user, cart);

    return NextResponse.json({
      bestCoupon: result.coupon,
      discountAmount: result.discountAmount,
      cartValue: result.cartValue,
      finalPrice: result.finalPrice,
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
