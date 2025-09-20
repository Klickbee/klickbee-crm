import React from 'react'
import { getMetricsData } from "../libs/MetricsData"

const colorClasses = [
  // icon circle bg and text colors per metric (index-based)
  "bg-purple-100",
  "bg-red-100",
  "bg-yellow-100",
  "bg-green-100",
]

const DashboardMetrics = () => {
  const metrics = getMetricsData()

  return (
    <section className=" h-[156px] shadow-sm rounded-xl border border-[var(--border-gray)] bg-white opacity-100 ">
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

            <button className="border-t hover:bg-gray-50  border-[var(--border-gray)] leading-[20px] px-4 py-3 flex items-center justify-between text-sm font-semiblod text-muted-foreground">
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
