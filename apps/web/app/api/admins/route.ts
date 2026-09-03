import { NextResponse } from "next/server";
import { fetchAdmins, AdminRow, DEFAULT_ADMINS } from "@/lib/db";

// GET /api/admins — returns list of active team arbitrators dynamically
export async function GET() {
  try {
    const admins = await fetchAdmins();
    const safeAdmins = admins.map(({ password, ...rest }: AdminRow) => rest);
    return NextResponse.json({ admins: safeAdmins });
  } catch (e) {
    const safeAdmins = DEFAULT_ADMINS.map(({ password, ...rest }: AdminRow) => rest);
    return NextResponse.json({ admins: safeAdmins });
  }
}

// POST /api/admins — validates email & password against public.admins table
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const admins = await fetchAdmins();
    const normalizedEmail = email.toLowerCase().trim();

    const matched = admins.find(
      (a) => a.email.toLowerCase() === normalizedEmail && a.password === password
    );

    if (!matched) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const user = {
      id: matched.id,
      email: matched.email,
      name: matched.name,
      role: "ADMIN" as const,
      seatNumber: matched.seat_number,
      title: matched.title,
      walletAddress: "0x71C...b821",
    };

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication server error: " + err.message },
      { status: 500 }
    );
  }
}
