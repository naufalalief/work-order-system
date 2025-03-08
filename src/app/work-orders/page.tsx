"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/shared/Navbar";
import AddWorkOrder from "./add/page";
import EditWorkOrder from "./edit/page";
import { jwtDecode } from "jwt-decode";
import { DecodedToken, WorkOrder } from "@/utils/interfaces";
import { WorkOrderTable } from "./table/WorkOrderTable";

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder | null>(null);
  const [showAddWorkOrder, setShowAddWorkOrder] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const dateNow = new Date();

      if (decodedToken && decodedToken.exp) {
        if (decodedToken.exp * 1000 < dateNow.getTime()) {
          console.log("Session expired");
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        setUserRole(decodedToken.role);
        fetchWorkOrders(decodedToken.role);
      } else {
        console.log("Token invalid or exp missing");
        router.push("/");
      }
    } catch (error) {
      console.error("Token error:", error);
      router.push("/");
    }
  }, [router]);

  const fetchWorkOrders = async (role: string | null) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFetchError("Unauthorized");
        router.push("/");
        return;
      }
      const response = await fetch("/api/work-orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Role": role || "",
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch work orders";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        setFetchError(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("Data:", data);

      if (data && Array.isArray(data.data)) {
        setWorkOrders(data.data);
      } else {
        console.error("Invalid data format:", data);
        setWorkOrders([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setFetchError(error.message);
      } else {
        setFetchError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (fetchError) return <div>Error: {fetchError}</div>;

  const handleRefresh = () => {
    fetchWorkOrders(userRole as string);
  };

  const handleWorkOrderUpdated = () => {
    fetchWorkOrders(userRole as string);
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
          <h1 className="text-4xl font-bold mb-4 cursor-pointer">
            Work Orders
          </h1>
          {userRole !== "OPERATOR" && (
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
              onWorkOrderUpdated={handleWorkOrderUpdated}
            />
          )}
          <WorkOrderTable
            workOrders={workOrders}
            onWorkOrderUpdated={handleWorkOrderUpdated}
            onEditWorkOrder={handleEditWorkOrder}
          />
        </div>
      </section>
    </>
  );
}
