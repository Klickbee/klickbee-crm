import type { PipelineChartData } from "../types/Types"

export const getPipelineData = (): PipelineChartData => ({
  title: "Pipeline",
  stages: [
    { stage: "New Leads", count: 2240 },
    { stage: "Contacted", count: 1850 },
    { stage: "Proposal Sent", count: 1200 },
    { stage: "Negotiation", count: 910 },
    { stage: "Won", count: 529 },
  ],
  conversionRates: [79.88, 61.05, 44.6, 20.6],
})


