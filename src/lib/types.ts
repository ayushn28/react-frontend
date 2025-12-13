export interface Eligibility {
  allowedUserTiers?: string[];
  minLifetimeSpend?: number;
  minOrdersPlaced?: number;
  firstOrderOnly?: boolean;
  allowedCountries?: string[];
  minCartValue?: number;
  applicableCategories?: string[];
  excludedCategories?: string[];
  minItemsCount?: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "FLAT" | "PERCENT";
  discountValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimitPerUser?: number;
  eligibility: Eligibility;
}

export interface UserContext {
  userId: string;
  userTier: string;
  country: string;
  lifetimeSpend: number;
  ordersPlaced: number;
}

export interface CartItem {
  productId: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface CouponUsage {
  [couponCode: string]: {
    [userId: string]: number;
  };
}
