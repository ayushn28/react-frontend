import { Coupon, UserContext, Cart } from "./types";
import { getAllCoupons, getUserUsageCount } from "./store";

function computeCartValue(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function computeTotalItems(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartCategories(cart: Cart): Set<string> {
  return new Set(cart.items.map((item) => item.category));
}

function isWithinDateRange(coupon: Coupon): boolean {
  const now = new Date();
  const start = new Date(coupon.startDate);
  const end = new Date(coupon.endDate);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

function checkUsageLimit(coupon: Coupon, userId: string): boolean {
  if (coupon.usageLimitPerUser === undefined) return true;
  const usage = getUserUsageCount(coupon.code, userId);
  return usage < coupon.usageLimitPerUser;
}

function checkEligibility(coupon: Coupon, user: UserContext, cart: Cart): boolean {
  const elig = coupon.eligibility;
  const cartValue = computeCartValue(cart);
  const totalItems = computeTotalItems(cart);
  const cartCategories = getCartCategories(cart);

  if (elig.allowedUserTiers && elig.allowedUserTiers.length > 0) {
    if (!elig.allowedUserTiers.includes(user.userTier)) return false;
  }

  if (elig.minLifetimeSpend !== undefined) {
    if (user.lifetimeSpend < elig.minLifetimeSpend) return false;
  }

  if (elig.minOrdersPlaced !== undefined) {
    if (user.ordersPlaced < elig.minOrdersPlaced) return false;
  }

  if (elig.firstOrderOnly === true) {
    if (user.ordersPlaced > 0) return false;
  }

  if (elig.allowedCountries && elig.allowedCountries.length > 0) {
    if (!elig.allowedCountries.includes(user.country)) return false;
  }

  if (elig.minCartValue !== undefined) {
    if (cartValue < elig.minCartValue) return false;
  }

  if (elig.applicableCategories && elig.applicableCategories.length > 0) {
    const hasApplicable = elig.applicableCategories.some((cat) => cartCategories.has(cat));
    if (!hasApplicable) return false;
  }

  if (elig.excludedCategories && elig.excludedCategories.length > 0) {
    const hasExcluded = elig.excludedCategories.some((cat) => cartCategories.has(cat));
    if (hasExcluded) return false;
  }

  if (elig.minItemsCount !== undefined) {
    if (totalItems < elig.minItemsCount) return false;
  }

  return true;
}

function computeDiscount(coupon: Coupon, cart: Cart): number {
  const cartValue = computeCartValue(cart);

  if (coupon.discountType === "FLAT") {
    return Math.min(coupon.discountValue, cartValue);
  }

  let discount = (coupon.discountValue / 100) * cartValue;
  if (coupon.maxDiscountAmount !== undefined) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }
  return Math.min(discount, cartValue);
}

export interface BestCouponResult {
  coupon: Coupon | null;
  discountAmount: number;
  finalPrice: number;
  cartValue: number;
}

export function findBestCoupon(user: UserContext, cart: Cart): BestCouponResult {
  const allCoupons = getAllCoupons();
  const cartValue = computeCartValue(cart);

  const eligibleCoupons: { coupon: Coupon; discount: number }[] = [];

  for (const coupon of allCoupons) {
    if (!isWithinDateRange(coupon)) continue;
    if (!checkUsageLimit(coupon, user.userId)) continue;
    if (!checkEligibility(coupon, user, cart)) continue;

    const discount = computeDiscount(coupon, cart);
    eligibleCoupons.push({ coupon, discount });
  }

  if (eligibleCoupons.length === 0) {
    return { coupon: null, discountAmount: 0, finalPrice: cartValue, cartValue };
  }

  eligibleCoupons.sort((a, b) => {
    if (b.discount !== a.discount) return b.discount - a.discount;
    const endA = new Date(a.coupon.endDate).getTime();
    const endB = new Date(b.coupon.endDate).getTime();
    if (endA !== endB) return endA - endB;
    return a.coupon.code.localeCompare(b.coupon.code);
  });

  const best = eligibleCoupons[0];
  return {
    coupon: best.coupon,
    discountAmount: best.discount,
    finalPrice: cartValue - best.discount,
    cartValue,
  };
}
