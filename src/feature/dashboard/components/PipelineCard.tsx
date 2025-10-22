"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Loading from "@/components/ui/Loading"
import type { PipelineChartData } from "../types/Types"

const CHART_HEIGHT = 236

interface DealsStats {
  totalDeals: number;
  newDeals: number;
  activeDeals: number;
  wonDeals: number;
  contactedDeals: number;
  proposalDeals: number;
  negotiationDeals: number;
  conversionRate: number;
}

export function PipelineCard({ range = "this_month" }: { range?: string }) {
  const [pipelineData, setPipelineData] = useState<PipelineChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/deals/stats?range=${range}`)
        if (!response.ok) {
          throw new Error('Failed to fetch pipeline data')
        }
        const data = await response.json()
        const stats: DealsStats = data.data

        // Map API data to PipelineChartData format
        const mappedData: PipelineChartData = {
          title: "Pipeline",
          stages: [
            { stage: "New Leads", count: stats.newDeals },
            { stage: "Contacted", count: stats.contactedDeals },
            { stage: "Proposal Sent", count: stats.proposalDeals },
            { stage: "Negotiation", count: stats.negotiationDeals },
            { stage: "Won", count: stats.wonDeals },
          ],
          conversionRates: [
            stats.totalDeals > 0 ? (stats.contactedDeals / stats.totalDeals) * 100 : 0,
            stats.totalDeals > 0 ? (stats.proposalDeals / stats.totalDeals) * 100 : 0,
            stats.totalDeals > 0 ? (stats.negotiationDeals / stats.totalDeals) * 100 : 0,
            stats.totalDeals > 0 ? (stats.wonDeals / stats.totalDeals) * 100 : 0,
          ],
        }

        setPipelineData(mappedData)
      } catch (err) {
        console.error('Error fetching pipeline data:', err)
        setError('Failed to load pipeline data')
      } finally {
        setLoading(false)
      }
    }

    fetchPipelineData()
  }, [range])

  if (loading) {
    return (
      <section className="rounded-xl h-[488px] border border-[var(--border-gray)] bg-white shadow-sm">
        <div className="flex h-[58px] items-center justify-between p-[16px] border-b border-[var(--border-gray)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Pipeline</h3>
          <button  onClick={() => router.push("/deals")}
           className="text-xs font-medium text-[var(--foreground)] hover:text-gray-600">
            See Details</button>
        </div>
        <div className="p-4 flex items-center justify-center h-[430px]">
          <Loading
            variant="default"
            size="md"
            label="Loading pipeline..."
            className=""
          />
        </div>
      </section>
    )
  }

  if (error || !pipelineData) {
    return (
      <section className="rounded-xl h-[488px] border border-[var(--border-gray)] bg-white shadow-sm">
        <div className="flex h-[58px] items-center justify-between p-[16px] border-b border-[var(--border-gray)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Pipeline</h3>
          <button onClick={() => router.push("/deals")}
           className="text-xs font-medium text-[var(--foreground)] hover:text-gray-600">
            See Details</button>
        </div>
        <div className="p-4 flex items-center justify-center h-[430px]">
          <p className="text-red-500">{error || 'No data available'}</p>
        </div>
      </section>
    )
  }

  const { title, stages, conversionRates } = pipelineData




  return (
    <section className="rounded-xl h-[488px] border border-[var(--border-gray)] bg-white shadow-sm">
      <div className="flex h-[58px] items-center justify-between p-[16px] border-b border-[var(--border-gray)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        <button onClick={() => router.push("/deals")}
         className="text-xs font-medium text-[var(--foreground)] hover:text-gray-600">
          See Details</button>
      </div>

      <div className="p-4">
        <div className="relative">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-dashed border-[var(--border-gray)]"
              style={{ left: `${(i / 5) * 100}%` }}
            />
          ))}

          <div className="grid grid-cols-5 text-sm">
            {stages.map((s) => (
              <div key={s.stage} className="pb-3">
                <div className="px-3">
                  <div className="text-xs text-[var(--foreground)]">{s.stage}</div>
                  <div className="mt-1 text-xl font-semibold text-[var(--foreground)]">
                    {s.count.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 text-sm mt-15 gap-1">
            {stages.map((stage, index) => {
              // Calculate bar height as percentage of max stage count (increased scaling for more prominent bars)
              const maxCount = Math.max(...stages.map(s => s.count));
              const barHeight = maxCount > 0 ? (stage.count / maxCount) * 250 : 0; // Increased from 150 to 250 for maximum prominence

              return (
                <div key={stage.stage} className="flex flex-col items-center relative">
                  {/* Container for bottom-up growth */}
                  <div className="w-full flex flex-col justify-end" style={{ height: '240px' }}>
                    {/* 3D Effect Graph Bar - grows from bottom up */}
                    <div
                      className="w-full bg-gradient-to-t from-purple-400 to-purple-600  shadow-md hover:from-purple-500 hover:to-purple-700 relative"
                      style={{
                        height: `${Math.max(barHeight, 8)}px`,
                        minHeight: '8px',
                        clipPath: 'polygon(0 0, 100% 15%, 100% 100%, 0% 100%)', // Left high, right low slope
                      }}
                    >
                      {/* 3D depth effect */}
                      <div className="absolute inset-x-0 top-0 h-1rounded-t-md opacity-60"></div>
                      <div className="absolute inset-y-0 left-0 w-1  opacity-40"></div>
                    </div>
                  </div>
                
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion rates */}
        <div className="mt-2 grid grid-cols-5 items-center text-xs">
          <div className="px-3 whitespace-nowrap py-2 font-medium text-[var(--foreground)]">
            Conversion Rate
          </div>
          {conversionRates.map((rate, i) => (
            <div
              key={i}
              className={`px-3 py-2 text-center ${
                rate <= 30
                  ? "text-[#8B5CF6] font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {rate.toFixed(2)}%
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PipelineCard


