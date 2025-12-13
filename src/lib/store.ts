import { Coupon, CouponUsage } from "./types";

const coupons: Map<string, Coupon> = new Map();
const couponUsage: CouponUsage = {};

const sampleCoupons: Coupon[] = [
  {
    code: "WELCOME100",
    description: "₹100 off for new users",
    discountType: "FLAT",
    discountValue: 100,
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    usageLimitPerUser: 1,
    eligibility: {
      firstOrderOnly: true,
      allowedUserTiers: ["NEW"],
    },
  },
  {
    code: "GOLD20",
    description: "20% off for Gold members",
    discountType: "PERCENT",
    discountValue: 20,
    maxDiscountAmount: 500,
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    eligibility: {
      allowedUserTiers: ["GOLD"],
    },
  },
  {
    code: "ELECTRONICS10",
    description: "10% off on electronics",
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscountAmount: 200,
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    eligibility: {
      applicableCategories: ["electronics"],
    },
  },
  {
    code: "BIGSPENDER",
    description: "₹500 off for loyal customers",
    discountType: "FLAT",
    discountValue: 500,
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    eligibility: {
      minLifetimeSpend: 5000,
      minOrdersPlaced: 5,
    },
  },
  {
    code: "FLAT200",
    description: "₹200 off on orders above ₹1000",
    discountType: "FLAT",
    discountValue: 200,
    startDate: "2024-01-01",
    endDate: "2025-12-31",
    eligibility: {
      minCartValue: 1000,
    },
  },
];

sampleCoupons.forEach((c) => coupons.set(c.code, c));

export function getAllCoupons(): Coupon[] {
  return Array.from(coupons.values());
}

export function getCoupon(code: string): Coupon | undefined {
  return coupons.get(code);
}

export function addCoupon(coupon: Coupon): { success: boolean; message: string } {
  if (coupons.has(coupon.code)) {
    return { success: false, message: `Coupon code "${coupon.code}" already exists` };
  }
  coupons.set(coupon.code, coupon);
  return { success: true, message: "Coupon created successfully" };
}

export function deleteCoupon(code: string): boolean {
  return coupons.delete(code);
}

export function getUserUsageCount(couponCode: string, userId: string): number {
  return couponUsage[couponCode]?.[userId] ?? 0;
}

export function incrementUsage(couponCode: string, userId: string): void {
  if (!couponUsage[couponCode]) {
    couponUsage[couponCode] = {};
  }
  couponUsage[couponCode][userId] = (couponUsage[couponCode][userId] ?? 0) + 1;
}
