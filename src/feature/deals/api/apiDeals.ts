// src/feature/deals/api/apiDeals.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createDealSchema, updateDealSchema } from "../schema/dealSchema";
import { withActivityLogging } from "@/libs/apiUtils";
import { ActivityAction } from "@prisma/client";

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

    const parsedData = parsed.data;
    const data = {
        dealName: parsedData.dealName,
        stage: parsedData.stage,
        amount: parsedData.amount,
        currency: parsedData.currency,
        ownerId: parsedData.ownerId,
        companyId: parsedData.companyId ?? null,
        contactId: parsedData.contactId ?? null,
        closeDate: parsedData.closeDate ? new Date(parsedData.closeDate) : null,
        tags: parsedData.tags ?? [],
        notes: parsedData.notes ?? null,
        files: parsedData.files ?? undefined,

      }

    const created = await withActivityLogging(
          async () => {
            return await prisma.deal.create({
              data,
              include: {
                owner: true,
                company: true,
                contact: true, 
              },
            });
          },
          {
            entityType: 'Deal',
            entityId: '',
            action: ActivityAction.Create,
            userId: session.user.id,
            getCurrentData: async (result: any) => {
              return result;
            },
            metadata: {
              createdFields: Object.keys(data),
            },
          }
      );

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
      const parsed = updateDealSchema.safeParse({ ...body, id, ownerId: body.owner.id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const parsedData = parsed.data;
      const data = {
          dealName: parsedData.dealName,
          companyId: parsedData.companyId,
          contactId: parsedData.contactId ?? undefined,
          ownerId: parsedData.ownerId,
          stage: parsedData.stage,
          amount: parsedData.amount,
          currency: parsedData.currency,
          closeDate: parsedData.closeDate ? new Date(parsedData.closeDate) : undefined,
          tags: parsedData.tags ?? undefined,
          notes: parsedData.notes ?? undefined,
          files: parsedData.files ?? undefined,
        }

      const getPreviousData = async () => {
            const deal = await prisma.deal.findUnique({
              where: { id: id },
            });
            return deal;
          };
      console.log(await getPreviousData())
      const updatedDeal = await withActivityLogging(
        async () => {
          return await prisma.deal.update({
            where: { id: id },
            data,
          });
        },
        {
          entityType: 'Deal',
          entityId: id,
          action: ActivityAction.Update,
          userId: session.user.id,
          getPreviousData,
          getCurrentData: async (result: any) => {
            return result;
          },
          metadata: {
            updatedFields: Object.keys(data),
          },
        }
      );

      return NextResponse.json(updatedDeal);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const getPreviousData = async () => {
            return await prisma.deal.findUnique({
              where: { id },
            });
          };
      
      const deletedDeal = await withActivityLogging(
        async () => {
          return await prisma.deal.delete({
            where: { id },
          });
        },
        {
          entityType: 'Deal',
          entityId: id,
          action: ActivityAction.Delete,
          userId: session.user.id,
          getPreviousData,
          metadata: {
            deletedAt: new Date().toISOString(),
          },
        }
      );
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
