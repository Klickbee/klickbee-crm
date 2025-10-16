import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const where: any = {};
    
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    // Get activity logs with user information
    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 100), // Limit to 100 max
      skip,
    });

    const total = await prisma.activityLog.count({ where });

    return NextResponse.json({
      data: activities,
      total,
      hasMore: skip + activities.length < total,
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
