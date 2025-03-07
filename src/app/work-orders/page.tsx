"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/shared/navbar";
import AddWorkOrder from "./add/page";
import EditWorkOrder from "./edit/page";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { Role } from "@prisma/client";

interface WorkOrder {
  id: number;
  workOrderNumber: string;
  productName: string;
  quantity: number;
  deadline: string;
  status: string;
  assignedTo?: {
    username: string;
  };
  progressNotes: string[];
  statusHistory: {
    id: number;
    workOrderId: number;
    status: string;
    startedAt: string;
    completedAt: string | null;
    progressNote: string | null;
    quantityCompleted: number | null;
  }[];
}

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onWorkOrderUpdated: () => void;
  onEditWorkOrder: (workOrder: WorkOrder) => void;
}

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  onWorkOrderUpdated,
  onEditWorkOrder,
}) => {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token) as JwtPayload & { role: string };
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleDelete = async (order: WorkOrder) => {
    try {
      if (userRole === Role.OPERATOR) {
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

      if (!response.ok) {
        throw new Error("Failed to delete work order");
      }

      onWorkOrderUpdated();
    } catch (error) {
      console.error("Error deleting work order:", error);
      alert("Failed to delete work order");
    }
  };

  const handleEdit = (order: WorkOrder) => {
    onEditWorkOrder(order);
  };

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
        ))}
      </tbody>
    </table>
  );
};

export default function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const router = useRouter();
  const [editWorkOrder, setEditWorkOrder] = useState<WorkOrder | null>(null);
  const [showAddWorkOrder, setShowAddWorkOrder] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token) as JwtPayload & { role: Role };
      const dateNow = new Date();

      if (decodedToken && decodedToken.exp) {
        if (decodedToken.exp * 1000 < dateNow.getTime()) {
          console.log("Session expired");
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

  const fetchWorkOrders = async (role: Role | null) => {
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
    fetchWorkOrders(userRole as Role);
  };

  const handleWorkOrderUpdated = () => {
    fetchWorkOrders(userRole as Role);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setEditWorkOrder(workOrder);
  };

  const handleEditClose = () => {
    setEditWorkOrder(null);
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
          <WorkOrderTable
            workOrders={workOrders}
            onWorkOrderUpdated={handleWorkOrderUpdated}
            onEditWorkOrder={handleEditWorkOrder}
          />
          {showAddWorkOrder && (
            <AddWorkOrder onWorkOrderAdded={handleRefresh} />
          )}
          {editWorkOrder && (
            <EditWorkOrder
              key={editWorkOrder.id}
              workOrder={editWorkOrder}
              onClose={handleEditClose}
              onWorkOrderUpdated={handleWorkOrderUpdated}
            />
          )}
        </div>
      </section>
    </>
  );
}
