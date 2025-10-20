// src/feature/companies/api/apiCompanies.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createCompanySchema, updateCompanySchema } from "../schema/companySchema";
import { withActivityLogging } from "@/libs/apiUtils";
import { ActivityAction } from "@prisma/client";

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

    const parsedData = parsed.data as any;
    const data = {
        fullName: parsedData.fullName,
        industry: parsedData.industry,
        email: parsedData.email || null,
        phone: parsedData.phone || null,
        website: parsedData.website || null,
        status: parsedData.status,
        tags: parsedData.tags ?? [],
        assing: parsedData.assing ?? [],
        notes: parsedData.notes || null,
        files: parsedData.files ?? undefined,
        ownerId: parsedData.ownerId,
        userId: parsedData.userId,
      }

    const created = await withActivityLogging(
      async () => {
        return await prisma.company.create({
          data,
          include: {
            owner: true
          },
        });
      },
      {
        entityType: 'Company',
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
      const parsed = updateCompanySchema.safeParse({ ...body, id, ownerId: body.owner.id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const parsedData = parsed.data as any;

      const data = {
          fullName: parsedData.fullName,
          industry: parsedData.industry,
          email: parsedData.email ?? undefined,
          phone: parsedData.phone ?? undefined,
          website: parsedData.website ?? undefined,
          status: parsedData.status,
          tags: parsedData.tags ?? undefined,
          assing: parsedData.assing ?? undefined,
          notes: parsedData.notes ?? undefined,
          files: parsedData.files ?? undefined,
          ownerId: parsedData.ownerId,
        };

        const getPreviousData = async () => {
          const company = await prisma.company.findUnique({
            where: { id: id },
          });
          return company;
        };
      console.log(await getPreviousData())
      const updatedCompany = await withActivityLogging(
        async () => {
          return await prisma.company.update({
            where: { id: id },
            data,
          });
        },
        {
          entityType: 'Company',
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

      return NextResponse.json(updatedCompany);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const getPreviousData = async () => {
        return await prisma.company.findUnique({
          where: { id },
        });
      };
      
      const deletedCompany = await withActivityLogging(
        async () => {
          return await prisma.company.delete({
            where: { id },
          });
        },
        {
          entityType: 'Company',
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
    console.error("companies/:id handler error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
