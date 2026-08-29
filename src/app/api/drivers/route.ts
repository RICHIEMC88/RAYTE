import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { drivers } from "@/db/schema";

export async function GET() {
  const list = await db.select().from(drivers).where(eq(drivers.active, true));
  return NextResponse.json({ drivers: list });
}
