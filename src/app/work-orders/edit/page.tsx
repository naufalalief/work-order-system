"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { jwtDecode } from "jwt-decode";

interface Operator {
  id: number;
  username: string;
}

interface EditWorkOrderProps {
  workOrder: {
    id: number;
    workOrderNumber: string;
    productName: string;
    quantity: number;
    deadline: string;
    status: string;
    assignedToId?: number | null;
    progressNotes: string[];
  };
  onClose: () => void;
  onWorkOrderUpdated: () => void;
}

interface DecodedToken {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

const EditWorkOrder: React.FC<EditWorkOrderProps> = ({
  workOrder,
  onClose,
  onWorkOrderUpdated,
}) => {
  const [productName, setProductName] = useState(workOrder.productName);
  const [quantity, setQuantity] = useState(workOrder.quantity);
  const [deadline, setDeadline] = useState(
    new Date(workOrder.deadline).toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<Status>(workOrder.status as Status);
  const [assignedToId, setAssignedToId] = useState<string>(
    workOrder.assignedToId ? workOrder.assignedToId.toString() : ""
  );
  const [progressNotes, setProgressNotes] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [quantityChanged, setQuantityChanged] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User not authenticated.");
          return;
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);

        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOperators(data.users);

          if (decodedToken.role === "OPERATOR") {
            setAssignedToId(decodedToken.userId.toString());
          }
        } else {
          console.error("Failed to fetch operators");
        }
      } catch (error) {
        console.error("Error fetching operators:", error);
      }
    };

    fetchOperators();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Unauthorized");
      }

      let updateData: any = {
        productName,
        quantity: Number(quantity),
        deadline: new Date(deadline),
        status,
        assignedToId: Number(assignedToId),
        progressNote: progressNotes,
        quantityCompleted: quantityChanged,
      };

      const response = await fetch(
        `/api/work-orders/${workOrder.workOrderNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to edit work order");
      }

      onWorkOrderUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error editing work order:", error);
      alert(`Error editing work order: ${error.message}`);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value as Status;
    setStatus(selectedStatus);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Edit Work Order
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 grid grid-cols-2 gap-2"
      >
        <div className="grid grid-cols-1 gap-2">
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            id="productName"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={userRole === "OPERATOR"}
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 disabled:bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={userRole === "OPERATOR"}
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 disabled:bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label
            htmlFor="deadline"
            className="block text-sm font-medium text-gray-700"
          >
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={userRole === "OPERATOR"}
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 disabled:bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <select
            name="status"
            id="status"
            value={status}
            onChange={handleStatusChange}
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300"
          >
            <option value={Status.PENDING}>Pending</option>
            <option value={Status.IN_PROGRESS}>In Progress</option>
            <option value={Status.COMPLETED}>Completed</option>
            <option value={Status.CANCELED}>Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label
            htmlFor="assignedToId"
            className="block text-sm font-medium text-gray-700"
          >
            Assigned To
          </label>
          <select
            name="assignedToId"
            id="assignedToId"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            disabled={userRole === "OPERATOR"}
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 disabled:bg-gray-100"
          >
            <option value="">Select Operator</option>
            {operators &&
              operators.length > 0 &&
              operators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.username}
                </option>
              ))}
          </select>
        </div>

        {userRole === "OPERATOR" && (
          <div className="grid grid-cols-1 gap-2">
            <label
              htmlFor="quantityChanged"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity Completed
            </label>
            <input
              type="number"
              value={quantityChanged}
              onChange={(e) => setQuantityChanged(Number(e.target.value))}
              placeholder="Quantity Completed"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-2">
          <label
            htmlFor="progressNotes"
            className="block text-sm font-medium text-gray-700"
          >
            Progress Note
          </label>
          <input
            type="text"
            name="progressNotes"
            id="progressNotes"
            placeholder="Progress Note"
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300"
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200 transition duration-300 ease-in-out text-sm" // Menambahkan text-sm
          >
            Update Work Order
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring focus:ring-indigo-200 transition duration-300 ease-in-out text-sm" // Menambahkan text-sm
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditWorkOrder;
