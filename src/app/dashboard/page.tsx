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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Ticket,
  Plus,
  Trash2,
  LogOut,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Users,
  ShoppingCart,
  Globe,
} from "lucide-react";
import { Coupon, Eligibility } from "@/lib/types";

export default function DashboardPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discountType: "FLAT" as "FLAT" | "PERCENT",
    discountValue: "",
    maxDiscountAmount: "",
    startDate: "",
    endDate: "",
    usageLimitPerUser: "",
    allowedUserTiers: "",
    minLifetimeSpend: "",
    minOrdersPlaced: "",
    firstOrderOnly: false,
    allowedCountries: "",
    minCartValue: "",
    applicableCategories: "",
    excludedCategories: "",
    minItemsCount: "",
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/");
      return;
    }
    fetchCoupons();
  }, [router]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/coupons`);
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    const eligibility: Eligibility = {};
    if (newCoupon.allowedUserTiers) {
      eligibility.allowedUserTiers = newCoupon.allowedUserTiers.split(",").map((s) => s.trim().toUpperCase());
    }
    if (newCoupon.minLifetimeSpend) {
      eligibility.minLifetimeSpend = parseFloat(newCoupon.minLifetimeSpend);
    }
    if (newCoupon.minOrdersPlaced) {
      eligibility.minOrdersPlaced = parseInt(newCoupon.minOrdersPlaced);
    }
    if (newCoupon.firstOrderOnly) {
      eligibility.firstOrderOnly = true;
    }
    if (newCoupon.allowedCountries) {
      eligibility.allowedCountries = newCoupon.allowedCountries.split(",").map((s) => s.trim().toUpperCase());
    }
    if (newCoupon.minCartValue) {
      eligibility.minCartValue = parseFloat(newCoupon.minCartValue);
    }
    if (newCoupon.applicableCategories) {
      eligibility.applicableCategories = newCoupon.applicableCategories.split(",").map((s) => s.trim().toLowerCase());
    }
    if (newCoupon.excludedCategories) {
      eligibility.excludedCategories = newCoupon.excludedCategories.split(",").map((s) => s.trim().toLowerCase());
    }
    if (newCoupon.minItemsCount) {
      eligibility.minItemsCount = parseInt(newCoupon.minItemsCount);
    }

    const payload = {
      code: newCoupon.code,
      description: newCoupon.description,
      discountType: newCoupon.discountType,
      discountValue: parseFloat(newCoupon.discountValue),
      maxDiscountAmount: newCoupon.maxDiscountAmount ? parseFloat(newCoupon.maxDiscountAmount) : undefined,
      startDate: newCoupon.startDate,
      endDate: newCoupon.endDate,
      usageLimitPerUser: newCoupon.usageLimitPerUser ? parseInt(newCoupon.usageLimitPerUser) : undefined,
      eligibility,
    };

    try {
      const res = await fetch(`${window.location.origin}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setDialogOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create coupon");
      }
    } catch {
      alert("Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;

    try {
      const res = await fetch(`${window.location.origin}/api/coupons?code=${code}`, { method: "DELETE" });
      if (res.ok) {
        fetchCoupons();
      }
    } catch {
      alert("Failed to delete coupon");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  const resetForm = () => {
    setNewCoupon({
      code: "",
      description: "",
      discountType: "FLAT",
      discountValue: "",
      maxDiscountAmount: "",
      startDate: "",
      endDate: "",
      usageLimitPerUser: "",
      allowedUserTiers: "",
      minLifetimeSpend: "",
      minOrdersPlaced: "",
      firstOrderOnly: false,
      allowedCountries: "",
      minCartValue: "",
      applicableCategories: "",
      excludedCategories: "",
      minItemsCount: "",
    });
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Coupon Manager</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => router.push("/best-coupon")}>
                <Search className="w-4 h-4 mr-2" />
                Find Best Coupon
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">All Coupons</h1>
            <p className="text-muted-foreground">{coupons.length} coupons available</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Coupon</DialogTitle>
                  <DialogDescription>Fill in the coupon details and eligibility rules</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCoupon} className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Coupon Code *</Label>
                      <Input
                        placeholder="e.g. SAVE20"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input
                        placeholder="Short description"
                        value={newCoupon.description}
                        onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Type *</Label>
                      <Select
                        value={newCoupon.discountType}
                        onValueChange={(v) => setNewCoupon({ ...newCoupon, discountType: v as "FLAT" | "PERCENT" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FLAT">Flat Amount</SelectItem>
                          <SelectItem value="PERCENT">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount Value *</Label>
                      <Input
                        type="number"
                        placeholder={newCoupon.discountType === "FLAT" ? "e.g. 100" : "e.g. 10"}
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Discount (for %)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        value={newCoupon.maxDiscountAmount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="date"
                        value={newCoupon.startDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date *</Label>
                      <Input
                        type="date"
                        value={newCoupon.endDate}
                        onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Usage Limit/User</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 1"
                        value={newCoupon.usageLimitPerUser}
                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimitPerUser: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      User Eligibility
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Allowed User Tiers</Label>
                        <Input
                          placeholder="e.g. NEW, GOLD"
                          value={newCoupon.allowedUserTiers}
                          onChange={(e) => setNewCoupon({ ...newCoupon, allowedUserTiers: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Allowed Countries</Label>
                        <Input
                          placeholder="e.g. IN, US"
                          value={newCoupon.allowedCountries}
                          onChange={(e) => setNewCoupon({ ...newCoupon, allowedCountries: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Lifetime Spend</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 5000"
                          value={newCoupon.minLifetimeSpend}
                          onChange={(e) => setNewCoupon({ ...newCoupon, minLifetimeSpend: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Orders Placed</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 3"
                          value={newCoupon.minOrdersPlaced}
                          onChange={(e) => setNewCoupon({ ...newCoupon, minOrdersPlaced: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newCoupon.firstOrderOnly}
                          onChange={(e) => setNewCoupon({ ...newCoupon, firstOrderOnly: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">First order only</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Cart Eligibility
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Cart Value</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 1000"
                          value={newCoupon.minCartValue}
                          onChange={(e) => setNewCoupon({ ...newCoupon, minCartValue: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Items Count</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 2"
                          value={newCoupon.minItemsCount}
                          onChange={(e) => setNewCoupon({ ...newCoupon, minItemsCount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Applicable Categories</Label>
                        <Input
                          placeholder="e.g. electronics, fashion"
                          value={newCoupon.applicableCategories}
                          onChange={(e) => setNewCoupon({ ...newCoupon, applicableCategories: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Excluded Categories</Label>
                        <Input
                          placeholder="e.g. groceries"
                          value={newCoupon.excludedCategories}
                          onChange={(e) => setNewCoupon({ ...newCoupon, excludedCategories: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Coupon</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredCoupons.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Ticket className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No coupons found</p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.code} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                      <CardDescription className="mt-1">{coupon.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCoupon(coupon.code)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
<div className="flex items-center gap-2">
  <Badge variant="secondary">
    {coupon.discountType === "PERCENT"
      ? `${coupon.discountValue}% off`
      : `₹${coupon.discountValue} off`}
  </Badge>

  {coupon.maxDiscountAmount && (
    <Badge variant="outline">Max ₹{coupon.maxDiscountAmount}</Badge>
  )}
</div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {Object.keys(coupon.eligibility).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {coupon.eligibility.allowedUserTiers && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Tag className="w-3 h-3" />
                          {coupon.eligibility.allowedUserTiers.join(", ")}
                        </Badge>
                      )}
                      {coupon.eligibility.allowedCountries && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Globe className="w-3 h-3" />
                          {coupon.eligibility.allowedCountries.join(", ")}
                        </Badge>
                      )}
                      {coupon.eligibility.minCartValue && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          Min ₹{coupon.eligibility.minCartValue}
                        </Badge>
                      )}
                      {coupon.eligibility.firstOrderOnly && (
                        <Badge variant="outline" className="text-xs">First order</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
