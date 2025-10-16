// src/feature/customers/api/apiCustomers.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createCustomerSchema, updateCustomerSchema } from "../schema/customerSchema";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parsed = createCustomerSchema.safeParse({
      ...body,
      ownerId: body.owner.id,
      userId: session.user.id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data as any;

    const created = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        companyId: data.companyId || null,
        email: data.email || null,
        phone: data.phone || null,
        status: data.status,
        tags: data.tags ?? [],
        notes: data.notes || null,
        files: data.files ?? undefined,
        ownerId: data.ownerId,
        userId: data.userId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /customers error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const ownerId = url.searchParams.get("ownerId");
const companyId = url.searchParams.get("companyId");
  


      const where = {
      ...(ownerId ? { ownerId } : {}),
      ...(companyId ? { companyId } : {}),
    };
    const customers = await prisma.customer.findMany({
      where,
      include: {
        owner: true,
        company: true,
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json(customers);
  } catch (err) {
    console.error("GET /customers error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function handleMethodWithId(req: Request, id: string) {
  try {
    const method = req.method?.toUpperCase();

    if (method === "GET") {
      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(customer);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

      const body = await req.json();
      const parsed = updateCustomerSchema.safeParse({ ...body, id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const data = parsed.data as any;

      const updated = await prisma.customer.update({
        where: { id },
        data: {
          fullName: data.fullName,
          companyId: data.companyId || null,
          email: data.email ?? undefined,
          phone: data.phone ?? undefined,
          status: data.status,
          tags: data.tags ?? undefined,
          notes: data.notes ?? undefined,
          files: data.files ?? undefined,
        },
      });

      return NextResponse.json(updated);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await prisma.customer.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (err) {
    console.error("customers/:id handler error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
