import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/feature/auth/lib/auth";

type RangeKey =
  | "this_week"
  | "this_month"
  | "this_year"
  | "last_7_days"
  | "last_28_days"
  | "last_365_days"
  | "all";

function getDateRange(range: RangeKey): { gte?: Date; lt?: Date } {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (range === "all") return {};

  if (range === "this_week") {
    const day = now.getDay();
    const distanceToMonday = (day + 6) % 7; // Monday=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    const gte = startOfDay(monday);
    const lt = new Date(gte);
    lt.setDate(gte.getDate() + 7);
    return { gte, lt };
  }

  if (range === "this_month") {
    const gte = new Date(now.getFullYear(), now.getMonth(), 1);
    const lt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { gte, lt };
  }

  if (range === "this_year") {
    const gte = new Date(now.getFullYear(), 0, 1);
    const lt = new Date(now.getFullYear() + 1, 0, 1);
    return { gte, lt };
  }

  if (range === "last_7_days") {
    const lt = new Date();
    const gte = new Date(lt);
    gte.setDate(lt.getDate() - 7);
    return { gte, lt };
  }

  if (range === "last_28_days") {
    const lt = new Date();
    const gte = new Date(lt);
    gte.setDate(lt.getDate() - 28);
    return { gte, lt };
  }

  if (range === "last_365_days") {
    const lt = new Date();
    const gte = new Date(lt);
    gte.setDate(lt.getDate() - 365);
    return { gte, lt };
  }

  return {};
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const rangeParam = (url.searchParams.get("range") || "this_month").toLowerCase() as RangeKey;
    const ownerId = url.searchParams.get("ownerId") || undefined;
    const companyId = url.searchParams.get("companyId") || undefined;
    const contactId = url.searchParams.get("contactId") || undefined;

    const validRanges: RangeKey[] = [
      "this_week",
      "this_month",
      "this_year",
      "last_7_days",
      "last_28_days",
      "last_365_days",
      "all",
    ];
    const range: RangeKey = validRanges.includes(rangeParam) ? rangeParam : "this_month";
    const { gte, lt } = getDateRange(range);

    const baseWhere: any = {
      ...(gte ? { createdAt: { gte } } : {}),
      ...(lt ? { createdAt: { ...(gte ? { gte } : {}), lt } } : {}),
      ...(ownerId ? { ownerId } : {}),
      ...(companyId ? { companyId } : {}),
      ...(contactId ? { contactId } : {}),
    };

    // Count metrics
    const [
      totalDeals,
      totalActive,
      totalNew,
      totalWon,
      totalContacted,
      totalProposal,
      totalNegotiation,
      expectedRevenueActive,
    ] = await Promise.all([ 
      prisma.deal.count({
        where: { ...baseWhere },
      }),
      prisma.deal.count({
        where: { ...baseWhere, NOT: { stage: { in: ["Won", "Lost"] } } },
      }),
      prisma.deal.count({
        where: { ...baseWhere, stage: "New" },
      }),
      prisma.deal.count({
        where: { ...baseWhere, stage: "Won" },
      }),
      prisma.deal.count({
        where: { ...baseWhere, stage: "Contacted" },
      }),
      prisma.deal.count({
        where: { ...baseWhere, stage: "Proposal" },
      }),
      prisma.deal.count({
        where: { ...baseWhere, stage: "Negotiation" },
      }),
      prisma.deal.aggregate({
        _sum: { amount: true },
        where: { ...baseWhere, NOT: { stage: { in: ["Won", "Lost"] } } },
      }),
    ]);

    const expectedRevenueUSD = expectedRevenueActive._sum.amount ?? 0;

    // Conversion rate: active / won (as per request)
    const conversionRate = totalDeals === 0 ? 0 : (totalWon / totalDeals) * 100;

    return NextResponse.json({
      range,
      filters: { ownerId, companyId, contactId },
      data: {
        totalDeals: totalDeals,
        newDeals: totalNew,
        activeDeals: totalActive,
        wonDeals: totalWon,
        contactedDeals: totalContacted,
        proposalDeals: totalProposal,
        negotiationDeals: totalNegotiation,
        conversionRate,
        expectedRevenueUSD,
      },
    });
  } catch (err) {
    console.error("GET /admin/deals/stats error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


