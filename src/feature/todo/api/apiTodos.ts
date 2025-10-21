// src/feature/todo/api/apiTodos.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createTodoSchema, updateTodoSchema } from "../schema/todoSchema";
import { ActivityAction, Prisma } from "@prisma/client";
import { withActivityLogging } from "@/libs/apiUtils";

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
      assignedId: raw?.assignedTo || session.user.id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const parsedData = parsed.data as any;
    const data = {
      taskName: parsedData.taskName,
      linkedTo: { connect: { id: parsedData.linkedId } },
      assignedTo: parsedData.assignedId ? { connect: { id: parsedData.assignedId } } : undefined,
      owner: { connect: { id: session.user.id } },
      status: parsedData.status,
      priority: parsedData.priority,
      dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : null,
      notes: parsedData.notes ?? null,
      files: parsedData.files ?? undefined,
    };
    const created = await withActivityLogging(
      async () => {
        return await prisma.todo.create({
          data,
          include: {
            owner: true,
            linkedTo: true,
            assignedTo: true
          },
        });
      },
      {
        entityType: 'Todo',
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
    const search = url.searchParams.get("search");

    const where = {
      ...(linkedId ? { linkedId } : {}),
      ...(assignedId ? { assignedId } : {}),
       ...(search
              ? {
                    taskName: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                }
              : {}),
    };
    const todos = await prisma.todo.findMany({
      where,
      include:{linkedTo: true, assignedTo: true,},
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
      const todo = await prisma.todo.findUnique({ where: { id }, include: { linkedTo: true, assignedTo: true } });
      if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(todo);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const body = await req.json();

      // validate with zod - id comes from URL params, not body
      const parsed = updateTodoSchema.safeParse({...body, linkedTo: body.linkedTo});
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const parsedData = parsed.data as any;
      const data = {
        taskName: parsedData.taskName,
        linkedTo: parsedData.linkedTo ? { connect: { id: parsedData.linkedTo } } : undefined,
        assignedTo: parsedData.assignedId ? { connect: { id: parsedData.assignedId } } : undefined,
        status: parsedData.status,
        priority: parsedData.priority,
        dueDate: parsedData.dueDate ? new Date(parsedData.dueDate) : undefined,
        notes: parsedData.notes ?? undefined,
        files: parsedData.files ?? undefined,
      };
      const getPreviousData = async () => {
        const todo = await prisma.todo.findUnique({
          where: { id: id },
        });
        return todo;
      };
      const updatedTodo = await withActivityLogging(
        async () => {
          return await prisma.todo.update({
            where: { id: id },
            data,
            include: {
              owner: true,
              linkedTo: true,
              assignedTo: true, 
            },
          });
        },
        {
          entityType: 'Todo',
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

      return NextResponse.json(updatedTodo);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const getPreviousData = async () => {
        return await prisma.todo.findUnique({
          where: { id },
        });
      };
            
      const deletedTodo = await withActivityLogging(
        async () => {
          return await prisma.todo.delete({
            where: { id },
          });
        },
        {
          entityType: 'Todo',
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
    console.error("todos/:id handler error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
