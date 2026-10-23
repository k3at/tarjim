import { NextResponse } from "next/server";

// يعمل هذا المسار في وضع التصدير الثابت أيضاً (GET فقط).
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "tarjim",
    version: "0.1.0",
    time: new Date().toISOString(),
  });
}
