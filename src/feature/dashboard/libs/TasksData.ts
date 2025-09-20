import type { Task } from "../types/Types"

export const getTasksOverview = () => ({
  lateAssignmentsNotice: "There are 20 late assignments.",
  tasks: [
    { id: 1, title: "Update Product Descriptions", date: "July 24, 2025", status: "ongoing", color: "#3B82F6" },
    { id: 2, title: "Schedule Team Meeting for Q3 Planning", date: "July 24, 2025", status: "ongoing", color: "#3B82F6" },
    { id: 3, title: "Design Homepage Wireframe", date: "July 24, 2025", status: "overdue", color: "#F59E0B" },
    { id: 4, title: "Prepare Monthly Sales Report", date: "July 24, 2025", status: "completed", color: "#10B981" },
  ] as Task[],
  progress: [
    { label: "Ongoing", value: 35, color: "#3B82F6" },
    { label: "Done", value: 50, color: "#10B981" },
    { label: "Overdue", value: 15, color: "#EF4444" },
  ],
})


