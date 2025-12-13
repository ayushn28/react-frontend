"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Ticket,
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Sparkles,
  ShoppingCart,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { CartItem, Coupon } from "@/lib/types";

interface BestCouponResult {
  bestCoupon: Coupon | null;
  discountAmount: number;
  cartValue: number;
  finalPrice: number;
}

export default function BestCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BestCouponResult | null>(null);

  const [user, setUser] = useState({
    userId: "u123",
    userTier: "NEW",
    country: "IN",
    lifetimeSpend: "1200",
    ordersPlaced: "0",
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: "p1", category: "electronics", unitPrice: 1500, quantity: 1 },
    { productId: "p2", category: "fashion", unitPrice: 500, quantity: 2 },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
    }
  }, [router]);

  const addCartItem = () => {
    setCartItems([
      ...cartItems,
      { productId: `p${cartItems.length + 1}`, category: "", unitPrice: 0, quantity: 1 },
    ]);
  };

  const removeCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, field: keyof CartItem, value: string | number) => {
    const updated = [...cartItems];
    updated[index] = { ...updated[index], [field]: value };
    setCartItems(updated);
  };

  const handleFindBestCoupon = async () => {
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        user: {
          userId: user.userId,
          userTier: user.userTier,
          country: user.country,
          lifetimeSpend: parseFloat(user.lifetimeSpend) || 0,
          ordersPlaced: parseInt(user.ordersPlaced) || 0,
        },
        cart: {
          items: cartItems.map((item) => ({
            productId: item.productId,
            category: item.category.toLowerCase(),
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      };

      const res = await fetch("/api/coupons/best", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || "Failed to find best coupon");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Find Best Coupon</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Context
                </CardTitle>
                <CardDescription>Simulated user attributes for eligibility check</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User ID</Label>
                    <Input
                      value={user.userId}
                      onChange={(e) => setUser({ ...user, userId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>User Tier</Label>
                    <Select
                      value={user.userTier}
                      onValueChange={(v) => setUser({ ...user, userTier: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">NEW</SelectItem>
                        <SelectItem value="REGULAR">REGULAR</SelectItem>
                        <SelectItem value="GOLD">GOLD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={user.country}
                      onValueChange={(v) => setUser({ ...user, country: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">India (IN)</SelectItem>
                        <SelectItem value="US">United States (US)</SelectItem>
                        <SelectItem value="UK">United Kingdom (UK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lifetime Spend (₹)</Label>
                    <Input
                      type="number"
                      value={user.lifetimeSpend}
                      onChange={(e) => setUser({ ...user, lifetimeSpend: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Orders Placed</Label>
                    <Input
                      type="number"
                      value={user.ordersPlaced}
                      onChange={(e) => setUser({ ...user, ordersPlaced: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart
                </CardTitle>
                <CardDescription>Add items to simulate a cart</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-end gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Category</Label>
                      <Input
                        placeholder="e.g. electronics"
                        value={item.category}
                        onChange={(e) => updateCartItem(index, "category", e.target.value)}
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label className="text-xs">Price (₹)</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateCartItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-20 space-y-2">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCartItem(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeCartItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={addCartItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-muted-foreground">Cart Total</span>
                  <span className="text-xl font-bold">₹{cartTotal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-12"
              size="lg"
              onClick={handleFindBestCoupon}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Find Best Coupon
                </span>
              )}
            </Button>
          </div>

          <div>
            <Card className={`sticky top-24 ${result ? "" : "border-dashed"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Best Coupon Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Ticket className="w-12 h-12 mb-4 opacity-50" />
                    <p>Enter user & cart details and click "Find Best Coupon"</p>
                  </div>
                ) : result.bestCoupon ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Coupon Found!</p>
                        <p className="text-sm text-muted-foreground">Best matching coupon for your cart</p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xl font-bold">{result.bestCoupon.code}</span>
                        <Badge>{result.bestCoupon.discountType}</Badge>
                      </div>
                      <p className="text-muted-foreground">{result.bestCoupon.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cart Value</span>
                        <span>₹{result.cartValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{result.discountAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold text-lg">
                        <span>Final Price</span>
                        <span>₹{result.finalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        You save{" "}
                        <span className="font-bold text-foreground">
                          ₹{result.discountAmount.toLocaleString()}
                        </span>{" "}
                        ({((result.discountAmount / result.cartValue) * 100).toFixed(1)}% off)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <XCircle className="w-6 h-6 text-orange-500" />
                      <div>
                        <p className="font-medium text-orange-700 dark:text-orange-400">No Eligible Coupon</p>
                        <p className="text-sm text-muted-foreground">
                          No coupons match the current user and cart criteria
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cart Value</span>
                        <span className="font-bold">₹{result.cartValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Final Price</span>
                        <span className="font-bold">₹{result.finalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Try adjusting user tier, cart value, or product categories to find matching coupons.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
