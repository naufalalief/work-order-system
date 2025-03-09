"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../components/ui/Navbar";
import AddWorkOrder from "./add/page";
import EditWorkOrder from "./edit/page";
import { WorkOrder } from "@/utils/interfaces";
import { WorkOrderTable } from "./table/WorkOrderTable";
import { useAuthentication } from "@/hooks/useAuth";
import { useWorkOrders } from "@/hooks/useWorkOrder";

export default function WorkOrders() {
  const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder | null>(null);
  const [showAddWorkOrder, setShowAddWorkOrder] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  });

  const isAuthenticated = useAuthentication({
    allowedRoles: ["PRODUCTION_MANAGER", "OPERATOR"],
    setUserRole,
    redirectTo: "/",
  });
  const { workOrders, loading, error, refresh } = useWorkOrders(token);

  if (!isAuthenticated) return null;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleRefresh = () => {
    refresh();
    handleClose();
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setEditWorkOrder(workOrder);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditWorkOrder(null);
    setShowAddWorkOrder(false);
  };

  const handleToggleAddWorkOrder = () => {
    setShowAddWorkOrder(!showAddWorkOrder);
  };

  return (
    <>
      <Navbar />
      <section className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Work Orders</h1>
          {isAuthenticated.userRole === "PRODUCTION_MANAGER" && (
            <button onClick={handleToggleAddWorkOrder}>
              {showAddWorkOrder ? "Hide Add Work Order" : "Add Work Order"}
            </button>
          )}
          {showAddWorkOrder && (
            <AddWorkOrder
              onWorkOrderAdded={handleRefresh}
              onClose={handleClose}
            />
          )}
          {editWorkOrder && (
            <EditWorkOrder
              key={editWorkOrder.id}
              workOrder={editWorkOrder}
              onClose={handleClose}
              onWorkOrderUpdated={handleRefresh}
            />
          )}
          {workOrders && (
            <WorkOrderTable
              workOrders={workOrders}
              onWorkOrderUpdated={handleRefresh}
              onEditWorkOrder={handleEditWorkOrder}
            />
          )}
        </div>
      </section>
    </>
  );
}
