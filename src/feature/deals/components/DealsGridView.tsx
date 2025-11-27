import GridView from "@/components/ui/GridView"
import { DealCard } from "./DealCard"
import { type Deal } from "../types"
import Loading from "@/components/ui/Loading"
import * as React from "react"
import { Plus } from "lucide-react"
import DealDetail from "./DealDetail"
import DealModal from './DealModal'
import { useDealStore } from '../stores/useDealStore'
import { useUserStore } from '../../user/store/userStore'
import { useEffect } from 'react';
import toast from "react-hot-toast"


export default function DealsGridView() {
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [editDeal, setEditDeal] = React.useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = React.useState<Deal["stage"] | undefined>(
    undefined,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const { filteredDeals, fetchDeals, loading,  deleteDeal ,updateDeal ,exportSingleDeal, initializeOwnerOptions } = useDealStore();
  const { fetchUsers, users } = useUserStore();

 const didInitRef = React.useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchUsers();
    fetchDeals();
  }, [fetchUsers, fetchDeals]);

  // Initialize owner options once users are available
  useEffect(() => {
    if (users && users.length > 0 ) {
      initializeOwnerOptions();
    }
  }, [users.length, initializeOwnerOptions]);
  
let moveInProgress = false;

const handleMove = React.useCallback(async  ({ itemId, fromKey, toKey }: { itemId: string | number; fromKey: string; toKey: string }) => {
  if (moveInProgress) return; // prevent double fire in Strict Mode
  moveInProgress = true;

  const dealToUpdate = filteredDeals.find((d) => String(d.id) === String(itemId));
  if (!dealToUpdate) return;

  const newStage = toStageFromColumn(toKey, dealToUpdate.stage);
  if (!newStage || newStage === dealToUpdate.stage) return;

  const stageLabelMap: Record<string, string> = {
    New: "Early Stage",
    Proposal: "In Progress",
    Negotiation: "In Progress",
    Contacted: "Early Stage",

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

    await updateDeal(dealToUpdate.id, { stage: newStage });

    toast.success(`Deal moved to ${readableStage}`);
  } catch (err: any) {
    toast.error(`Failed to move deal: ${err.message}`);
    console.error("handleMove error:", err);
  } finally {
    moveInProgress = false;
  }
}, [filteredDeals, updateDeal]);

  const openDetail = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDetailOpen(true)
  }

  const openAddModalWithStage = (columnKey: string) => {
    const stage = toStageFromColumn(columnKey, "New")
    setDefaultStage(stage)
    setEditDeal(null)
    setShowModal(true)
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
      {loading ? (
        <Loading label="Loading deals..." />
      ) : (
      <GridView
        items={filteredDeals}
        groupBy={(d: Deal) => {
          switch (d.stage) {
            case "New":
            case "Contacted":
              return "early-stage"
                          case "Proposal":
            case "Negotiation":
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
            onClick={() => openAddModalWithStage(String(key))}
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
      )}

      {/* ✅ Detail Modal */}
      <DealDetail
        isOpen={isDetailOpen}
        deal={selectedDeal}
        onClose={closeDetail}

        onDelete={async (id) => {
          setIsDeleting(true);
          try {
            await deleteDeal(id);
            closeDetail();
          } catch (error) {
            console.error('Error deleting deal:', error);
          } finally {
            setIsDeleting(false);
          }
        }}
        onEdit={async (deal) => {
          setIsEditing(true);
          try {
            handleEditDeal(deal);
          } catch (error) {
            console.error('Error editing deal:', error);
          } finally {
            setIsEditing(false);
          }
        }}
        onAddNotes={(id: string) => {
          const dealToEdit = filteredDeals.find((d) => d.id === id)
          if (!dealToEdit) {
            toast.error("Deal not found")
            return
          }
          setDefaultStage(undefined)
          setEditDeal(dealToEdit)
          setShowModal(true)
          setIsDetailOpen(false)
        }}
        onExport={async (id: string) => {
          setIsExporting(true);
          try {
            await exportSingleDeal(id);
          } catch (error) {
            console.error('Error exporting deal:', error);
          } finally {
            setIsExporting(false);
          }
        }}
        isDeleting={isDeleting}
        isEditing={isEditing}
        isExporting={isExporting}
      />

      <DealModal
        open={showModal}
        onClose={() => {
          setShowModal(false)
          setEditDeal(null)
          setDefaultStage(undefined)
        }}
        mode={editDeal ? 'edit' : 'add'}
        deal={editDeal || undefined}
        defaultStage={defaultStage}
      />
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
      if (currentStage === "Negotiation") return "Negotiation";
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
