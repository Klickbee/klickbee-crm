// src/feature/companies/api/apiCompanies.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createCompanySchema, updateCompanySchema } from "../schema/companySchema";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parsed = createCompanySchema.safeParse({
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

    const created = await prisma.company.create({
      data: {
        fullName: data.fullName,
        industry: data.industry,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        status: data.status,
        tags: data.tags ?? [],
        assing: data.assing ?? [],
        notes: data.notes || null,
        files: data.files ?? undefined,
        ownerId: data.ownerId,
        userId: data.userId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /companies error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const ownerId = url.searchParams.get("ownerId");
    const status = url.searchParams.get("status");

    let where: Record<string, any> = {};
    if(ownerId){
      where.ownerId = ownerId
    }
    if(status){
      where.status = status;
    }
    const companies = await prisma.company.findMany({
      where,
      include: {
        owner: true,  // Include owner information
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json(companies);
  } catch (err) {
    console.error("GET /companies error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function handleMethodWithId(req: Request, id: string) {
  try {
    const method = req.method?.toUpperCase();

    if (method === "GET") {
      const company = await prisma.company.findUnique({ where: { id } });
      if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(company);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const parsed = updateCompanySchema.safeParse({ ...body, id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const data = parsed.data as any;

      const updated = await prisma.company.update({
        where: { id },
        data: {
          fullName: data.fullName,
          industry: data.industry,
          email: data.email ?? undefined,
          phone: data.phone ?? undefined,
          website: data.website ?? undefined,
          status: data.status,
          tags: data.tags ?? undefined,
          assing: data.assing ?? undefined,
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

      await prisma.company.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (err) {
    console.error("companies/:id handler error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
