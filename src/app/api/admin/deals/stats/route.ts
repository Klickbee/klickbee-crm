import {NextResponse} from "next/server";
import {prisma} from "@/libs/prisma";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/feature/auth/lib/auth";

// Allowed range keys for stats
type RangeKey =
    | "this_week"
    | "this_month"
    | "this_year"
    | "last_7_days"
    | "last_28_days"
    | "last_365_days"
    | "all";

type DateBound = { gte?: Date; lt?: Date };

const VALID_RANGES: RangeKey[] = [
    "this_week",
    "this_month",
    "this_year",
    "last_7_days",
    "last_28_days",
    "last_365_days",
    "all",
];

// Utility: start of day for a date
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Returns the current and previous ranges for a given key
function getDateRange(range: RangeKey): { current: DateBound; previous: DateBound } {
    const now = new Date();

    if (range === "all") return {current: {}, previous: {}};

    let currentGte: Date | undefined;
    let currentLt: Date | undefined;

    if (range === "this_week") {
        // compute Monday for the current week (Monday = 0)
        const day = now.getDay();
        const distanceToMonday = (day + 6) % 7;
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

    const getPrevRange = (current: DateBound): DateBound => {
        if (!current.gte || !current.lt) return {};
        const durationMs = current.lt.getTime() - current.gte.getTime();
        const prevLt = new Date(current.gte.getTime());
        const prevGte = new Date(prevLt.getTime() - durationMs);
        return {gte: prevGte, lt: prevLt};
    };

    return {
        current: {gte: currentGte, lt: currentLt},
        previous: getPrevRange({gte: currentGte, lt: currentLt}),
    };
}

// Parse range param from URL and coerce to a valid RangeKey
function parseRangeParam(url: URL): RangeKey {
    const raw = (url.searchParams.get("range") || "this_month").toLowerCase();
    return VALID_RANGES.includes(raw as RangeKey) ? (raw as RangeKey) : "this_month";
}

// Parse optional filters from URL
function parseFilters(url: URL) {
    const ownerId = url.searchParams.get("ownerId") || undefined;
    const companyId = url.searchParams.get("companyId") || undefined;
    const contactId = url.searchParams.get("contactId") || undefined;
    return {ownerId, companyId, contactId};
}

// Build a Prisma "where" object including createdAt range and optional ids
function buildWhere(range: DateBound, filters: ReturnType<typeof parseFilters>) {
    const createdAtFilter = range.gte && range.lt ? {createdAt: {gte: range.gte, lt: range.lt}} : {};
    return {
        ...createdAtFilter,
        ...(filters.ownerId ? {ownerId: filters.ownerId} : {}),
        ...(filters.companyId ? {companyId: filters.companyId} : {}),
        ...(filters.contactId ? {contactId: filters.contactId} : {}),
    } as any;
}

// Compute all needed metrics in parallel
async function computeMetrics(baseWhere: any, prevWhere: any) {
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
        // totalDeals
        prisma.deal.count({where: {...baseWhere}}),
        // totalActive: corrected to exclude "Won" and "Lost"
        prisma.deal.count({where: {...baseWhere, NOT: {stage: {in: ["Won", "Lost"]}}}}),
        // totalNew Prospects
        prisma.prospect.count({where: {...baseWhere}}),
        // totalWon
        prisma.deal.count({where: {...baseWhere, stage: "Won"}}),
        // totalContacted
        prisma.deal.count({where: {...baseWhere, stage: {in: ["Contacted", "Proposal", "Negotiation", "Won"]}}}),
        // totalProposal
        prisma.deal.count({where: {...baseWhere, stage: {in: ["Proposal", "Negotiation", "Won"]}}}),
        // totalNegotiation
        prisma.deal.count({where: {...baseWhere, stage: {in: ["Negotiation", "Won"]}}}),
        // expectedRevenueActive
        prisma.deal.aggregate({_sum: {amount: true}, where: {...baseWhere, NOT: {stage: {in: ["Lost"]}}}}),

        // Previous period values
        // prevTotalDeals
        prisma.deal.count({where: {...prevWhere}}),
        // prevTotalActive: corrected to exclude "Won" and "Lost"
        prisma.deal.count({where: {...prevWhere, NOT: {stage: {in: ["Won", "Lost"]}}}}),
        // prevTotalNew
        prisma.prospect.count({where: {...prevWhere }}),
        // prevTotalWon
        prisma.deal.count({where: {...prevWhere, stage: "Won"}}),
        // prevExpectedRevenueActive
        prisma.deal.aggregate({_sum: {amount: true}, where: {...prevWhere, NOT: {stage: {in: ["Lost"]}}}}),
    ]);

    return {
        totalDeals,
        totalActive,
        totalNew,
        totalWon,
        totalContacted,
        totalProposal,
        totalNegotiation,
        expectedRevenueActiveSum: expectedRevenueActive._sum.amount ?? 0,
        prevTotalDeals,
        prevTotalActive,
        prevTotalNew,
        prevTotalWon,
        prevExpectedRevenueActiveSum: prevExpectedRevenueActive._sum.amount ?? 0,
    };
}

// Safe percent change calculator
function toPctChange(range: RangeKey, prev: number, curr: number): number {
    if (range === "all") return 0;
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0 && curr > 0) return 100;
    if (prev > 0 && curr === 0) return -100;
    const pct = ((curr - prev) / prev) * 100;
    return Math.round(pct * 100) / 100; // keep 2 decimals
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const url = new URL(req.url);
        const range = parseRangeParam(url);
        const filters = parseFilters(url);

        const {current, previous} = getDateRange(range);
        const baseWhere = buildWhere(current, filters);
        const prevWhere = buildWhere(previous, filters);

        const metrics = await computeMetrics(baseWhere, prevWhere);

        const conversionRate = metrics.totalDeals === 0 ? 0 : (metrics.totalWon / metrics.totalDeals) * 100;
        const prevConversionRate = metrics.prevTotalDeals === 0 ? 0 : (metrics.prevTotalWon / metrics.prevTotalDeals) * 100;

        return NextResponse.json({
            range,
            filters,
            data: {
                totalDeals: metrics.totalDeals,
                newDeals: metrics.totalNew,
                activeDeals: metrics.totalActive,
                wonDeals: metrics.totalWon,
                contactedDeals: metrics.totalContacted,
                proposalDeals: metrics.totalProposal,
                negotiationDeals: metrics.totalNegotiation,
                conversionRate,
                expectedRevenueUSD: metrics.expectedRevenueActiveSum,
                changes: {
                    newDealsChangePercent: toPctChange(range, metrics.prevTotalNew, metrics.totalNew),
                    activeDealsChangePercent: toPctChange(range, metrics.prevTotalActive, metrics.totalActive),
                    expectedRevenueChangePercent: toPctChange(range, metrics.prevExpectedRevenueActiveSum, metrics.expectedRevenueActiveSum),
                    conversionRateChangePercent: toPctChange(range, prevConversionRate * 100, conversionRate * 100),
                },
            },
        });
    } catch (err) {
        console.error("GET /admin/deals/stats error", err);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
