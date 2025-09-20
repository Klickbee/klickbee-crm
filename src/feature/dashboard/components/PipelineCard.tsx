"use client"

import React from "react"
import { getPipelineData } from "../libs/PipelineData"

const CARD_HEIGHT = 260
const CHART_HEIGHT = 140

export function PipelineCard() {
  const { title, stages, conversionRates } = getPipelineData()
  const maxCount = Math.max(...stages.map((s) => s.count))
  const chartWidth = 680 // visual width for svg points
  const stepX = chartWidth / (stages.length - 1)

  const points = stages
    .map((s, i) => {
      const x = i * stepX
      const y = CHART_HEIGHT - (s.count / maxCount) * CHART_HEIGHT
      return `${x},${y}`
    })
    .join(" ")

  const polygonPoints = `0,${CHART_HEIGHT} ${points} ${chartWidth},${CHART_HEIGHT}`

  return (
    <section className="rounded-xl  h-[488px] border border-[var(--border-gray)] bg-white">
      <div className="flex h-[58px] items-center justify-between p-[16px]">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button className="text-xs font-medium text-muted-foreground">See Details</button>
      </div>

      <div className="px-4" style={{ height: CARD_HEIGHT }}>
        <div className="grid grid-cols-5 text-sm">
          {stages.map((s, i) => (
            <div key={s.stage} className={`pb-3 ${i > 0 ? "md:border-l border-dashed border-[var(--border-gray)]" : ""}`}>
              <div className="px-3">
                <div className="text-xs text-muted-foreground">{s.stage}</div>
                <div className="mt-1 text-xl font-semibold text-foreground">{s.count.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-1 w-full">
          <svg viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`} className="w-full" height={CHART_HEIGHT} preserveAspectRatio="none">
            <defs>
              <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <polygon points={polygonPoints} fill="url(#pipelineGradient)" />
          </svg>
        </div>

        <div className="mt-2 grid grid-cols-5 items-center border-t border-[var(--border-gray)] text-xs">
          <div className="px-3 py-2 font-medium text-foreground">Conversion Rate</div>
          {conversionRates.map((rate, i) => (
            <div key={i} className={`px-3 py-2 text-center ${i === conversionRates.length - 1 ? "text-[#8B5CF6] font-semibold" : "text-muted-foreground"}`}>
              {rate.toFixed(2)}%
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PipelineCard


