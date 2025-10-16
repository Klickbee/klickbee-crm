// src/feature/todo/api/apiTodos.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createTodoSchema, updateTodoSchema } from "../schema/todoSchema";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const raw = await req.json();
    // validate with zod
    const parsed = createTodoSchema.safeParse({
      ...raw,
      linkedId: session.user.id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data as any;

    const created = await prisma.todo.create({
      data: {
        taskName: data.taskName,
        linkedTo: { connect: { id: data.linkedId } },
        assignedTo: data.assignedId ? { connect: { id: data.assignedId } } : undefined,
        owner: { connect: { id: session.user.id } },
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes ?? null,
        files: data.files ?? undefined,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /todos error", err);
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
    const linkedId = url.searchParams.get("linkedId");
    const assignedId = url.searchParams.get("assignedId");

    const where = {
      ...(linkedId ? { linkedId } : {}),
      ...(assignedId ? { assignedId } : {}),
    };
    const todos = await prisma.todo.findMany({
      where,
      include:{linkedTo: true, assignedTo: true},
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json(todos);
  } catch (err) {
    console.error("GET /todos error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// For GET by id, PATCH, DELETE we route to /api/admin/todos/[id]
export async function handleMethodWithId(req: Request, id: string) {
  try {
    const method = req.method?.toUpperCase();

    if (method === "GET") {
      const todo = await prisma.todo.findUnique({ where: { id } });
      if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(todo);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();

      // validate with zod - id comes from URL params, not body
      const parsed = updateTodoSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const data = parsed.data as any;

      const updated = await prisma.todo.update({
        where: { id },
        data: {
          taskName: data.taskName,
          linkedTo: data.linkedId ? { connect: { id: data.linkedId } } : undefined,
          assignedTo: data.assignedId ? { connect: { id: data.assignedId } } : undefined,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
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

      await prisma.todo.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (err) {
    console.error("todos/:id handler error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
