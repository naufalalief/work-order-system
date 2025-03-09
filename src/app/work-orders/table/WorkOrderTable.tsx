import { WorkOrder, WorkOrderTableProps } from "@/utils/interfaces";
import { useAuthentication } from "@/hooks/useAuth";
import WorkOrderRow from "./WorkOrderRow";

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  onWorkOrderUpdated,
  onEditWorkOrder,
}) => {
  const { userRole } = useAuthentication({
    allowedRoles: ["PRODUCTION_MANAGER", "OPERATOR"],
  });

  const handleDelete = async (order: WorkOrder) => {
    try {
      if (userRole === "OPERATOR") {
        alert("Operator cannot delete work order data!");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized");
      }

      const response = await fetch(
        `/api/work-orders/${order.workOrderNumber}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onWorkOrderUpdated();
      if (!response.ok) {
        throw new Error("Failed to delete work order");
      }
    } catch (error) {
      console.error("Error deleting work order:", error);
      alert("Failed to delete work order");
    }
  };

  const handleEdit = (order: WorkOrder) => {
    onEditWorkOrder(order);
  };

  return (
    <table className="border border-gray-300 rounded-md p-2 w-full ">
      <thead className="bg-gray-200 text-left">
        <tr className="border-b border-gray-300">
          <th className="space-x-4">WO Number</th>
          <th className="space-x-4">Product Name</th>
          <th className="space-x-4">Quantity</th>
          <th className="space-x-4">Deadline</th>
          <th className="space-x-4">Status</th>
          {userRole !== "OPERATOR" && (
            <th className="space-x-4">Assigned To</th>
          )}
          <th className="space-x-4">Progress Notes</th>
          <th className="space-x-4">Quantity Completed</th>
          <th className="space-x-4">Action</th>
        </tr>
      </thead>
      <tbody className="text-left">
        {workOrders.map((order) => (
          <WorkOrderRow
            key={order.id}
            order={order}
            userRole={userRole}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ))}
      </tbody>
    </table>
  );
};
