// src/feature/meetings/api/apiMeetings.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createMeetingSchema, updateMeetingSchema } from "../schema/meetingSchema";
import { withActivityLogging } from "@/libs/apiUtils";
import { ActivityAction } from "@prisma/client";

function toDate(val: any): Date | null | undefined {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  return val instanceof Date ? val : new Date(val);
}

function combineToISO(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr || !timeStr) return null;

  const combined = new Date(`${dateStr}T${timeStr}:00Z`);
  return combined.toISOString(); // ensures consistent UTC
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bodyRaw = await req.json();

    const parsed = createMeetingSchema.safeParse({
      ...bodyRaw,
      startDate: toDate(bodyRaw.startDate),
      startTime: toDate(bodyRaw.startTime),
      endTime: toDate(bodyRaw.endTime),
      ownerId: bodyRaw.owner.id,
      linkedId: bodyRaw.linkedTo, 
      assignedTo: bodyRaw.assignedTo && bodyRaw.assignedTo.trim() !== "" ? bodyRaw.assignedTo : null,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const parsedData = parsed.data as any;
    const data = {
      title: parsedData.title,
      startDate: parsedData.startDate,
      startTime: parsedData.startTime,
      endTime: parsedData.endTime,
      ownerId: parsedData.ownerId,
      repeatMeeting: parsedData.repeatMeeting ?? false,
      frequency: parsedData.frequency,
      repeatOn: parsedData.repeatOn ?? null,
      repeatEvery: typeof parsedData.repeatEvery === "number" ? parsedData.repeatEvery : 0,
      ends: parsedData.ends,
      linkedId: parsedData.linkedId || session.user.id,
      location: parsedData.location ?? null,
      assignedId: parsedData.assignedTo|| session.user.id,
      participants: parsedData.participants ?? [],
      status: parsedData.status,
      tags: parsedData.tags ?? [],
      notes: parsedData.notes ?? null,
      files: parsedData.files ?? undefined,
    };

    const created = await withActivityLogging(
      async () => {
        return await prisma.meeting.create({
          data,
          include: {
            owner: true,
            linkedTo: true,
            assignedTo: true
          },
        });
      },
      {
        entityType: 'Meeting',
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
    console.error("POST /meetings error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? 50);
    const ownerId = url.searchParams.get("ownerId");

    const where = ownerId ? { ownerId } : undefined;
    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        linkedTo: true,
        assignedTo: true,
        owner: true,
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });

    return NextResponse.json(meetings);
  } catch (err) {
    console.error("GET /meetings error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function handleMethodWithId(req: Request, id: string) {
  try {
    const method = req.method?.toUpperCase();

    if (method === "GET") {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: {
          linkedTo: true,
          assignedTo: true,
          owner: true,
        }
      });
      if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(meeting);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const bodyRaw = await req.json();
      const parsed = updateMeetingSchema.safeParse({ ...bodyRaw, id, ownerId: bodyRaw.owner.id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const parsedData = parsed.data as any;
      const data = {
          title: parsedData.title,
          startDate: toDate(parsedData.startDate),
          startTime: toDate(parsedData.startTime),
          endTime: toDate(parsedData.endTime),
          repeatMeeting: parsedData.repeatMeeting,
          frequency: parsedData.frequency,
          repeatOn: parsedData.repeatOn ?? undefined,
          repeatEvery: parsedData.repeatEvery,
          ends: parsedData.ends,
          linkedId: parsedData.linkedTo || session.user.id,
          location: parsedData.location ?? undefined,
          assignedId: parsedData.assignedTo && parsedData.assignedTo.trim() !== "" ? parsedData.assignedTo : null,
          participants: parsedData.participants ?? undefined,
          status: parsedData.status,
          tags: parsedData.tags ?? undefined,
          notes: parsedData.notes ?? undefined,
          files: parsedData.files ?? undefined,
          ownerId: parsedData.ownerId,
        };

      const getPreviousData = async () => {
        const meeting = await prisma.meeting.findUnique({
          where: { id: id },
        });
        return meeting;
      };
      console.log(await getPreviousData())
      const updatedMeeting = await withActivityLogging(
        async () => {
          return await prisma.meeting.update({
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
          entityType: 'Meeting',
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

      return NextResponse.json(updatedMeeting);
    }

    if (method === "DELETE") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const getPreviousData = async () => {
        return await prisma.meeting.findUnique({
          where: { id },
        });
      };
      
      const deletedMeeting = await withActivityLogging(
        async () => {
          return await prisma.meeting.delete({
            where: { id },
          });
        },
        {
          entityType: 'Meeting',
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
    console.error("meetings/:id handler error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
