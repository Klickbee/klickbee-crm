// src/feature/meetings/api/apiMeetings.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";
import { prisma } from "@/libs/prisma";
import { createMeetingSchema, updateMeetingSchema } from "../schema/meetingSchema";

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
      startTime: combineToISO(bodyRaw.startDate, bodyRaw.startTime),
      endTime: combineToISO(bodyRaw.startDate, bodyRaw.endTime),
      ownerId: session.user.id,
      linkedId: session.user.id,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data as any;
    console.log({date: data.startDate, isodate: toDate(data.startDate)})

    const created = await prisma.meeting.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        startTime: data.startTime,
        endTime: data.endTime,
        ownerId: data.ownerId,
        repeatMeeting: data.repeatMeeting ?? false,
        frequency: data.frequency,
        repeatOn: data.repeatOn ?? null,
        repeatEvery: typeof data.repeatEvery === "number" ? data.repeatEvery : 0,
        ends: data.ends,
        linkedId: data.linkedId,
        location: data.location ?? null,
        assignedId: data.assignedId ?? null,
        participants: data.participants ?? [],
        status: data.status,
        tags: data.tags ?? [],
        notes: data.notes ?? null,
        files: data.files ?? undefined,
      },
    });

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
      const meeting = await prisma.meeting.findUnique({ where: { id } });
      if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(meeting);
    }

    if (method === "PATCH") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const bodyRaw = await req.json();
      const parsed = updateMeetingSchema.safeParse({ ...bodyRaw, id });
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation error", details: parsed.error.flatten() },
          { status: 422 }
        );
      }

      const data = parsed.data as any;

      const updated = await prisma.meeting.update({
        where: { id },
        data: {
          title: data.title,
          startDate: toDate(data.startDate),
          startTime: combineToISO(data.startDate, data.startTime),
          endTime: combineToISO(data.startDate, data.endTime),
          repeatMeeting: data.repeatMeeting,
          frequency: data.frequency,
          repeatOn: data.repeatOn ?? undefined,
          repeatEvery: data.repeatEvery,
          ends: data.ends,
          linkedTo: data.linkedTo,
          location: data.location ?? undefined,
          assignedTo: data.assignedTo ?? undefined,
          participants: data.participants ?? undefined,
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
      if (!session?.user?.id)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await prisma.meeting.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  } catch (err) {
    console.error("meetings/:id handler error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
