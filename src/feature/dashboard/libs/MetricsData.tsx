import type { MetricData } from "../types/Types"

export const getMetricsData = (): MetricData[] => [
  {
    title: "New Leads",
    value: "50 Leads",
    change: "+40% from last week",
    changeType: "increase",
    icon: <img src="/icons/users.svg" alt="New Leads" className="h-6 w-6 text-muted-foreground" />,
  },
  {
    title: "Active Deals",
    value: "120 Deals",
    change: "+10% from last week",
    changeType: "increase",
    icon: <img src="/sideBarIcons/handshake.svg" alt="Active Deals" className="h-6 w-6 text-muted-foreground" />,
  },
  {
    title: "Conversion Rate",
    value: "24%",
    change: "+4% from last week",
    changeType: "increase",
    icon: <img src="/sideBarIcons/bar-chart.svg" alt="Conversion Rate" className="h-6 w-6 text-muted-foreground" />,
  },
  {
    title: "Expected Revenue",
    value: "€68,400",
    change: "+8% from last week",
    changeType: "increase",
    icon: <img src="/icons/Dollar.svg" alt="Expected Revenue" className="h-6 w-6 text-muted-foreground" />,
  },
]


