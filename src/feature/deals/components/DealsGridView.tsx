import GridView from "@/components/ui/GridView"
import { DealCard } from "./DealCard"
import { type DealData as Deal } from "../libs/DealsData"
import * as React from "react"
import { Plus } from "lucide-react"
import DealDetail from "./DealDetail"
import DealModal from './DealModal'
import { useDealStore } from '../stores/useDealStore'
import { useEffect } from 'react';
import toast from "react-hot-toast"


export default function DealsGridView() {
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [editDeal, setEditDeal] = React.useState<Deal | null>(null);
  const { deals, fetchDeals, loading,  deleteDeal ,updateDeal ,exportSingleDeal } = useDealStore();

useEffect(() => {
    fetchDeals();
  }, [fetchDeals])
  
let moveInProgress = false;

const handleMove = React.useCallback(async  ({ itemId, fromKey, toKey }: { itemId: string | number; fromKey: string; toKey: string }) => {
  if (moveInProgress) return; // prevent double fire in Strict Mode
  moveInProgress = true;

  const dealToUpdate = deals.find((d) => String(d.id) === String(itemId));
  if (!dealToUpdate) return;

  const newStage = toStageFromColumn(toKey, dealToUpdate.stage);
  if (!newStage || newStage === dealToUpdate.stage) return;

  const stageLabelMap: Record<string, string> = {
    New: "Early Stage",
    Proposal: "In Progress",
    Contacted: "In Progress",
    Won: "Won",
    Lost: "Lost",
  };

  const readableStage = stageLabelMap[newStage] || newStage;

  try {
    useDealStore.setState((state) => ({
      deals: state.deals.map((d) =>
        d.id === dealToUpdate.id ? { ...d, stage: newStage } : d
      ),
    }));

    await updateDeal(dealToUpdate.id, { ...dealToUpdate, stage: newStage });

    toast.success(`Deal moved to ${readableStage}`);
  } catch (err: any) {
    toast.error(`Failed to move deal: ${err.message}`);
    console.error("handleMove error:", err);
  } finally {
    moveInProgress = false;
  }
}, [deals, updateDeal]);

  const openDetail = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedDeal(null)
  }
  const handleEditDeal = (deal: Deal) => {
    setEditDeal(deal);
    setShowModal(true);
    setIsDetailOpen(false);

  }

  return (
    <main className="p-4 bg-[#F4F4F5] rounded-lg border border-[var(--border-gray)] shadow-sm">
      <GridView
        items={deals as Deal[]}
        groupBy={(d: Deal) => {
          switch (d.stage) {
            case "New":
              return "early-stage"
                          case "Proposal":

            case "Contacted":
              return "in-progress"
            case "Won":
              return "won"
            case "Lost":
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
          >
            <Plus className="h-3 w-3" />
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
        // ✅ Make cards clickable
        renderCard={(deal: Deal) => (
          <div onClick={() => openDetail(deal)} className="cursor-pointer">
            <DealCard deal={deal} />
          </div>
        )}
        enableDnd
        onItemMove={handleMove}
      />

      {/* ✅ Detail Modal */}
      <DealDetail
        isOpen={isDetailOpen}
        deal={selectedDeal}
        onClose={closeDetail}

        onDelete={async (id) => {
          await deleteDeal(id)
          closeDetail()
        }}
        onEdit={(deal: Deal) => handleEditDeal(deal)}
        onAddNotes={() => {
        
          toast("Add notes functionality coming soon!");
        }}
        onExport={(id: string) => {
          exportSingleDeal(id);
        }}
      />

      <DealModal open={showModal} onClose={() => setShowModal(false)} mode={editDeal ? 'edit' : 'add'} deal={editDeal || undefined} />
    </main>
  )
}

// Map column key back to a concrete stage
function toStageFromColumn(columnKey: string, currentStage: Deal["stage"]): Deal["stage"] {
  switch (columnKey) {
    case "early-stage":
      return "New";

    case "in-progress":
      // Decide intelligently what "in-progress" means
      if (currentStage === "New") return "Proposal"; // move up
      if (currentStage === "Proposal") return "Proposal";
      if (currentStage === "Contacted") return "Contacted";
      return "Proposal"; // default for unknown cases

    case "won":
      return "Won";

    case "lost":
      return "Lost";
    default:
      return currentStage
  }
}
