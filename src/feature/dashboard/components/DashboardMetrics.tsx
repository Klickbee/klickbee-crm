"use client";
import React, { useEffect } from 'react'
import { useDealStore } from "../../deals/stores/useDealStore"
import { useRouter } from "next/navigation"

const colorClasses = [
  // icon circle bg and text colors per metric (index-based)
  "bg-purple-100",
  "bg-red-100",
  "bg-yellow-100",
  "bg-green-100",
]

const DashboardMetrics = () => {
  const { deals, filteredDeals, fetchDeals } = useDealStore()
  const router = useRouter()

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  // Calculate metrics from deals data
  const newLeads = filteredDeals.filter(deal => deal.stage === 'New').length
  const activeDeals = filteredDeals.filter(deal => deal.stage !== 'Won' && deal.stage !== 'Lost').length
  const wonDeals = filteredDeals.filter(deal => deal.stage === 'Won').length
  const totalDeals = filteredDeals.length
  const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0

  const expectedRevenue = filteredDeals
    .filter(deal => deal.stage !== 'Lost')
    .reduce((sum, deal) => sum + (deal.amount || 0), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const metrics = [
    {
      title: "New Leads",
      value: `${newLeads} Leads`,
      change: "+12% from last week",
      changeType: "increase" as const,
      icon: <img src="/icons/users.svg" alt="New Leads" className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Active Deals",
      value: `${activeDeals} Deals`,
      change: "+8% from last week",
      changeType: "increase" as const,
      icon: <img src="/sideBarIcons/handshake.svg" alt="Active Deals" className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "+2% from last week",
      changeType: "increase" as const,
      icon: <img src="/sideBarIcons/bar-chart.svg" alt="Conversion Rate" className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Expected Revenue",
      value: formatCurrency(expectedRevenue),
      change: "+15% from last week",
      changeType: "increase" as const,
      icon: <img src="/icons/Dollar.svg" alt="Expected Revenue" className="h-6 w-6 text-muted-foreground" />,
    },
  ]

  return (
    <section className=" h-[156px] w-auto shadow-sm rounded-xl border border-[var(--border-gray)] bg-white opacity-100 ">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 h-full">
        {metrics.map((metric, index) => (
          <div key={metric.title} className={`flex h-full flex-col ${index > 0}`}>
            <div className="flex-1 w-full h-[112px] opacity-100 p-4 flex flex-col gap-[8px]">
              <div className="flex items-start gap-4">
                <div className={`h-[48px] w-[48px] rounded-full flex items-center justify-center ${colorClasses[index % colorClasses.length]}`}>{metric.icon}</div>
                <div className=" flex flex-col gap-[6px]">
                  <div className="text-sm leading-[20px] text-muted-foreground">{metric.title}</div>
                  <div className=" text-xl leading-[20px] font-semibold text-foreground">{metric.value}</div>
                  <div className={` text-xs leading-[20px] md:text-sm ${metric.changeType === "increase" ? "text-green-600" : "text-red-600"}`}>{metric.change}</div>
                </div>
              </div>
            </div>

            <button  onClick={() => router.push("/deals")}
            className="border-t hover:bg-gray-50  border-[var(--border-gray)] leading-[20px] px-4 py-3 flex items-center justify-between text-sm font-semiblod text-muted-foreground">
              <span>See Details</span>
              <span><img src="\icons\arrow-right.svg" alt="Arrow-Right" /></span>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

export default DashboardMetrics
