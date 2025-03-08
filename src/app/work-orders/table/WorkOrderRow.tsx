import { WorkOrder, WorkOrderRowProps } from "@/utils/interfaces";
import React, { useState } from "react";

const WorkOrderRow: React.FC<WorkOrderRowProps> = ({
  order,
  userRole,
  handleDelete,
  handleEdit,
}) => {
  const getLatestQuantityCompleted = (
    statusHistory: WorkOrder["statusHistory"]
  ): string | number => {
    if (!statusHistory || statusHistory.length === 0) {
      return "N/A";
    }

    for (let i = statusHistory.length - 1; i >= 0; i--) {
      if (statusHistory[i].quantityCompleted !== null) {
        return statusHistory[i].quantityCompleted!;
      }
    }

    return "N/A";
  };

  const [expandedNotes, setExpandedNotes] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleNotes = (id: number) => {
    setExpandedNotes({
      ...expandedNotes,
      [id]: !expandedNotes[id],
    });
  };

  const truncateNotes = (notes: string[], id: number) => {
    const allNotes = notes.join(", ");
    if (expandedNotes[id]) {
      return allNotes;
    }
    return allNotes.length > 25 ? allNotes.substring(0, 25) + "..." : allNotes;
  };
  return (
    <tr key={order.id}>
      <td className="space-x-4">{order.workOrderNumber}</td>
      <td className="space-x-4">{order.productName}</td>
      <td className="space-x-4">{order.quantity}</td>
      <td className="space-x-4">
        {new Date(order.deadline).toLocaleDateString()}
      </td>
      <td className="space-x-4">{order.status}</td>
      {userRole !== "OPERATOR" && (
        <td className="space-x-4">
          {order.assignedTo?.username || "Unassigned"}
        </td>
      )}
      <td
        className="space-x-4 cursor-pointer"
        onClick={() => toggleNotes(order.id)}
      >
        {truncateNotes(order.progressNotes, order.id)}
      </td>
      <td className="space-x-4">
        {getLatestQuantityCompleted(order.statusHistory)}
      </td>
      <td>
        {userRole !== "OPERATOR" && (
          <button onClick={() => handleDelete(order)}>Delete</button>
        )}
        <button onClick={() => handleEdit(order)}>Edit</button>
      </td>
    </tr>
  );
};

export default WorkOrderRow;
