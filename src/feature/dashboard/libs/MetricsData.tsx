import type { MetricData } from "../types/Types"

interface DealsStats {
  totalDeals: number;
  newDeals: number;
  activeDeals: number;
  wonDeals: number;
  conversionRate: number;
  expectedRevenueUSD: number;
  changes: {
    newDealsChangePercent?: number;
    activeDealsChangePercent?: number;
    conversionRateChangePercent?: number;
    expectedRevenueChangePercent?: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatRangeDisplay = (range: string): string => {
  return range.replace(/^(this_|last_|previous_)/i, '')
}

export const fetchMetricsData = async (range: string): Promise<MetricData[]> => {
  try {
    const response = await fetch(`/api/admin/deals/stats?range=${range}`)
    if (!response.ok) {
      throw new Error('Failed to fetch deals stats')
    }
    const data = await response.json()
    const stats: DealsStats = data.data

    return [
      {
        title: "New Leads",
        value: `${stats.newDeals} Leads`,
        change: `${(stats.changes?.newDealsChangePercent ?? 0) >= 0 ? '+' : ''}${(stats.changes?.newDealsChangePercent ?? 0).toFixed(1)}% from last ${formatRangeDisplay(range)}`,
        changeType: (stats.changes?.newDealsChangePercent ?? 0) >= 0 ? "increase" : "decrease",
        icon: <img src="/icons/users.svg" alt="New Leads" className="h-6 w-6 text-muted-foreground" />,
      },
      {
        title: "Active Deals",
        value: `${stats.activeDeals} Deals`,
        change: `${(stats.changes?.activeDealsChangePercent ?? 0) >= 0 ? '+' : ''}${(stats.changes?.activeDealsChangePercent ?? 0).toFixed(1)}% from last ${formatRangeDisplay(range)}`,
        changeType: (stats.changes?.activeDealsChangePercent ?? 0) >= 0 ? "increase" : "decrease",
        icon: <img src="/sideBarIcons/handshake.svg" alt="Active Deals" className="h-6 w-6 text-muted-foreground" />,
      },
      {
        title: "Conversion Rate",
        value: `${stats.conversionRate.toFixed(1)}%`,
        change: `${(stats.changes?.conversionRateChangePercent ?? 0) >= 0 ? '+' : ''}${(stats.changes?.conversionRateChangePercent ?? 0).toFixed(1)}% from last ${formatRangeDisplay(range)}`,
        changeType: (stats.changes?.conversionRateChangePercent ?? 0) >= 0 ? "increase" : "decrease",
        icon: <img src="/sideBarIcons/bar-chart.svg" alt="Conversion Rate" className="h-6 w-6 text-muted-foreground" />,
      },
      {
        title: "Expected Revenue",
        value: `$${stats.expectedRevenueUSD.toLocaleString()}`,
        change: `${(stats.changes?.expectedRevenueChangePercent ?? 0) >= 0 ? '+' : ''}${(stats.changes?.expectedRevenueChangePercent ?? 0).toFixed(1)}% from last ${formatRangeDisplay(range)}`,
        changeType: (stats.changes?.expectedRevenueChangePercent ?? 0) >= 0 ? "increase" : "decrease",
        icon: <img src="/icons/Dollar.svg" alt="Expected Revenue" className="h-6 w-6 text-muted-foreground" />,
      },
    ]
  } catch (err) {
    console.error('Error fetching deals stats:', err)
    throw err
  }
}




