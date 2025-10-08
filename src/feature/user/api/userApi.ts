import { NextResponse } from "next/server"
import { prisma } from "@/libs/prisma"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const userId = url.searchParams.get("userId");

    const where = userId ? { id: userId } : undefined;
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json({ success: true, users })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
