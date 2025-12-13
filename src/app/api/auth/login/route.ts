import { NextRequest, NextResponse } from "next/server";

const DEMO_USER = {
  email: "hire-me@anshumat.org",
  password: "HireMe@2025!",
  userId: "demo-user-001",
  name: "Demo User",
  userTier: "GOLD",
  country: "IN",
  lifetimeSpend: 15000,
  ordersPlaced: 12,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const { password: _, ...userWithoutPassword } = DEMO_USER;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        token: "demo-jwt-token-" + Date.now(),
      });
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
