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

function getDateRange(range: RangeKey): {
  current: { gte?: Date; lt?: Date };
  previous: { gte?: Date; lt?: Date };
} {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let currentGte: Date | undefined;
  let currentLt: Date | undefined;

  if (range === "all") {
    return { current: {}, previous: {} };
  }

  if (range === "this_week") {
    const day = now.getDay();
    const distanceToMonday = (day + 6) % 7; // Monday=0
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    currentGte = startOfDay(monday);
    currentLt = new Date(currentGte);
    currentLt.setDate(currentGte.getDate() + 7);
  } else if (range === "this_month") {
    currentGte = new Date(now.getFullYear(), now.getMonth(), 1);
    currentLt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (range === "this_year") {
    currentGte = new Date(now.getFullYear(), 0, 1);
    currentLt = new Date(now.getFullYear() + 1, 0, 1);
  } else if (range === "last_7_days") {
    currentLt = new Date();
    currentGte = new Date(currentLt);
    currentGte.setDate(currentLt.getDate() - 7);
  } else if (range === "last_28_days") {
    currentLt = new Date();
    currentGte = new Date(currentLt);
    currentGte.setDate(currentLt.getDate() - 28);
  } else if (range === "last_365_days") {
    currentLt = new Date();
    currentGte = new Date(currentLt);
    currentGte.setDate(currentLt.getDate() - 365);
  }

  const getPrevRange = (current: { gte?: Date; lt?: Date }): { gte?: Date; lt?: Date } => {
    if (!current.gte || !current.lt) return {};
    const durationMs = current.lt.getTime() - current.gte.getTime();
    const prevLt = new Date(current.gte.getTime());
    const prevGte = new Date(prevLt.getTime() - durationMs);
    return { gte: prevGte, lt: prevLt };
  };

  return {
    current: { gte: currentGte, lt: currentLt },
    previous: getPrevRange({ gte: currentGte, lt: currentLt }),
  };
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

    const { current: { gte: currentGte, lt: currentLt }, previous: { gte: prevGte, lt: prevLt } } = getDateRange(range);

    const buildWhere = (rangeInput: { gte?: Date; lt?: Date }) => {
      const createdAtFilter =
        rangeInput.gte && rangeInput.lt
          ? { createdAt: { gte: rangeInput.gte, lt: rangeInput.lt } }
          : {};
      return {
        ...createdAtFilter,
        ...(ownerId ? { ownerId } : {}),
        ...(companyId ? { companyId } : {}),
        ...(contactId ? { contactId } : {}),
      } as any;
    };

    const baseWhere: any = buildWhere({ gte: currentGte, lt: currentLt });
    const prevWhere: any = buildWhere({ gte: prevGte, lt: prevLt });
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
      prevTotalDeals,
      prevTotalActive,
      prevTotalNew,
      prevTotalWon,
      prevExpectedRevenueActive,
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
        where: { ...baseWhere, NOT: { stage: { in: ["Lost"] } } },
      }),

      // Previous period values
      prisma.deal.count({
        where: { ...prevWhere },
      }),
      prisma.deal.count({
        where: { ...prevWhere, NOT: { stage: { in: ["Won", "Lost"] } } },
      }),
      prisma.deal.count({
        where: { ...prevWhere, stage: "New" },
      }),
      prisma.deal.count({
        where: { ...prevWhere, stage: "Won" },
      }),
      prisma.deal.aggregate({
        _sum: { amount: true },
        where: { ...prevWhere, NOT: { stage: { in: [ "Lost"] } } },
      }),
    ]);

    const expectedRevenueUSD = expectedRevenueActive._sum.amount ?? 0;

    const prevExpectedRevenueUSD = prevExpectedRevenueActive._sum.amount ?? 0;

    const conversionRate = totalWon === 0 ? 0 : (totalWon / totalDeals) * 100;
    const prevConversionRate = prevTotalWon === 0 ? 0 : (prevTotalWon / prevTotalDeals) * 100;

    // Percent change helper
    const toPctChange = (prev: number, curr: number): number => {
        if (range === "all") return 0;
      
        // Case 1: both are zero → no change
        if (prev === 0 && curr === 0) return 0;
      
        // Case 2: previously zero, now positive → infinite rise
        if (prev === 0 && curr > 0) return 100;
      
        // Case 3: previously nonzero, now zero → 100% drop
        if (prev > 0 && curr === 0) return -100;
      
        // Case 4: normal percentage change
        const pct = ((curr - prev) / prev) * 100;
        return Math.round(pct * 100) / 100; // 2 decimals
      };

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
        changes: {
          newDealsChangePercent: toPctChange(prevTotalNew, totalNew),
          activeDealsChangePercent: toPctChange(prevTotalActive, totalActive),
          expectedRevenueChangePercent: toPctChange(prevExpectedRevenueUSD, expectedRevenueUSD),
          conversionRateChangePercent: toPctChange(prevConversionRate * 100, conversionRate * 100),
        },
      },
    });
  } catch (err) {
    console.error("GET /admin/deals/stats error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


