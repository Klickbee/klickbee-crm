// src/feature/customers/api/apiCustomers.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createCustomerSchema, updateCustomerSchema } from "../schema/customerSchema";
import { withActivityLogging } from "@/libs/apiUtils";
import { ActivityAction, Prisma } from "@prisma/client";

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

    const parsedData = parsed.data as any;
const data = {
        fullName: parsedData.fullName,
        companyId: parsedData.companyId || null,
        email: parsedData.email || null,
        phone: parsedData.phone || null,
        status: parsedData.status,
        tags: parsedData.tags ?? [],
        notes: parsedData.notes || null,
        files: parsedData.files ?? undefined,
        ownerId: parsedData.ownerId,
        userId: parsedData.userId,
      }

    const created = await withActivityLogging(
      async () => {
        return await prisma.customer.create({
          data,
          include: {
            owner: true,
            company: true,
          },
        });
      },
      {
        entityType: 'Customer',
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
const search = url.searchParams.get("search");
  


      const where = {
      ...(ownerId ? { ownerId } : {}),
      ...(companyId ? { companyId } : {}),
      ...(search
              ? {
                    fullName: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                }
              : {}),
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
      const parsed = updateCustomerSchema.safeParse({ ...body, id, ownerId: body.owner });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const parsedData = parsed.data as any;
      const data = {
          fullName: parsedData.fullName,
          companyId: parsedData.companyId || null,
          email: parsedData.email ?? undefined,
          phone: parsedData.phone ?? undefined,
          status: parsedData.status,
          tags: parsedData.tags ?? undefined,
          notes: parsedData.notes ?? undefined,
          files: parsedData.files ?? undefined,
          ownerId: parsedData.ownerId,
      };

      const getPreviousData = async () => {
        const customer = await prisma.customer.findUnique({
          where: { id: id },
        });
        return customer;
      };
      const updatedCustomer = await withActivityLogging(
        async () => {
          return await prisma.customer.update({
            where: { id: id },
            data,
            include: {
              owner: true,
              company: true,
            },
          });
        },
        {
          entityType: 'Customer',
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

      return NextResponse.json(updatedCustomer);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const getPreviousData = async () => {
        return await prisma.customer.findUnique({
          where: { id },
        });
      };
            
      const deletedCustomer = await withActivityLogging(
        async () => {
          return await prisma.customer.delete({
            where: { id },
          });
        },
        {
          entityType: 'Customer',
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
    console.error("customers/:id handler error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
