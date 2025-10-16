// src/feature/deals/api/apiDeals.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createDealSchema, updateDealSchema } from "../schema/dealSchema";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // ✅ validate with zod
    const parsed = createDealSchema.safeParse({
      ...body,
      ownerId: body.owner.id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;

    const created = await prisma.deal.create({
      data: {
        dealName: data.dealName,
        stage: data.stage,
        amount: data.amount,
        currency: data.currency,
        ownerId: data.ownerId,
        companyId: data.companyId ?? null,
        contactId: data.contactId ?? null,
        closeDate: data.closeDate ? new Date(data.closeDate) : null,
        tags: data.tags ?? [],
        notes: data.notes ?? null,
        files: data.files ?? undefined,

      },
       include: {
    owner: true,
    company: true,
    contact: true, 
  },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /deals error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const ownerId = url.searchParams.get("ownerId");
    const companyId = url.searchParams.get("companyId");
    const contactId = url.searchParams.get("contactId");



      const where = {
      ...(ownerId ? { ownerId } : {}),
      ...(companyId ? { companyId } : {}),
      ...(contactId ? { contactId } : {}),

    };
    const deals = await prisma.deal.findMany({
      where,
      include: { owner: true, company: true , contact: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json(deals);
  } catch (err) {
    console.error("GET /deals error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function handleMethodWithId(req: Request, id: string) {
  try {
    const method = req.method?.toUpperCase();

    if (method === "GET") {
      const deal = await prisma.deal.findUnique({ where: { id } });
      if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(deal);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();

      // ✅ validate with zod
      const parsed = updateDealSchema.safeParse({ ...body, id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const data = parsed.data;

      const updated = await prisma.deal.update({
        where: { id },
        data: {
          dealName: data.dealName,
          companyId: data.companyId,
          contactId: data.contactId ?? undefined,
          stage: data.stage,
          amount: data.amount,
          currency: data.currency,
          closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
          tags: data.tags ?? undefined,
          notes: data.notes ?? undefined,
          files: data.files ?? undefined,
        },
      });

      return NextResponse.json(updated);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await prisma.deal.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (err) {
    console.error("deals/:id handler error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
