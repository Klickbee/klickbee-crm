import GridView from "@/components/ui/GridView"
import { DealCard } from "./DealCard"
import type { Deal } from "../types"
import { dealsData as initialDeals } from "../libs/DealsData"
import * as React from "react"
import { Plus } from "lucide-react"



export default function DealsGridView() {
  const [deals, setDeals] = React.useState<Deal[]>(() => initialDeals as Deal[])

  const handleMove = React.useCallback(({ itemId, fromKey, toKey }: { itemId: string | number; fromKey: string; toKey: string }) => {
    setDeals((prev) =>
      prev.map((d) => (String(d.id) === String(itemId) ? { ...d, stage: toStageFromColumn(toKey, d.stage) } : d)),
    )
  }, [])

  return (
    <main className="p-4 bg-[#F4F4F5]">
      <GridView
        items={deals as Deal[]}
        groupBy={(d: Deal) => {
          switch (d.stage) {
            case "new":
              return "early-stage"
            case "contacted":
            case "proposal":
              return "in-progress"
            case "won":
              return "won"
            case "lost":
              return "lost"
            default:
              return String(d.stage)
          }
        }}
        order={["early-stage", "in-progress", "won", "lost"]}
        labels={{
          "early-stage": "Early Stage",
          "in-progress": "In-Progress",
          won: "Won",
          lost: "Lost",
        }}
        getAmount={(d: Deal) => d.amount}
        renderColumnAction={(key: any) => (
          <button
            className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#E4E4E7] text-xs font-medium text-primary-foreground cursor-pointer"
            aria-label={`Add to ${key}`}
            // onClick={() => alert(`Add to ${key}`)}
          >
            <Plus className="h-3 w-3"/>
          </button>
        )}
        columnHeaderClassName={(key: any) =>
          key === "lost" ? "bg-destructive/5" : key === "won" ? "bg-primary/5" : undefined
        }
        columnDotClassName={(key: any) =>
          key === "lost"
            ? "bg-red-500"
            : key === "won"
            ? "bg-[#10B981]"
            : key === "in-progress"
            ? "bg-orange-500"
            : key === "early-stage"
            ? "bg-gray-300"
            : undefined
        }
        renderCard={(deal: Deal) => <DealCard deal={deal} />}
        enableDnd
        onItemMove={handleMove}
      />
    </main>
  )
}

// Map column key back to a concrete stage. If moving into grouped columns like
// "in-progress", preserve more specific existing stage when possible; default
// to a sensible stage within that group.
function toStageFromColumn(columnKey: string, currentStage: Deal["stage"]): Deal["stage"] {
  switch (columnKey) {
    case "early-stage":
      return "new"
    case "in-progress":
      // If it is already one of the in-progress stages, keep it; otherwise default to "contacted"
      return currentStage === "contacted" || currentStage === "proposal" ? currentStage : "contacted"
    case "won":
      return "won"
    case "lost":
      return "lost"
    default:
      return currentStage
  }
}
