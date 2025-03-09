"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";
import { AddWorkOrderProps } from "@/utils/interfaces";
import { AddWorkOrderForm } from "../form/WorkOrderForm";
import { useAuthentication } from "@/hooks/useAuth";
import { useOperators } from "@/hooks/useOperator";

const AddWorkOrder: React.FC<AddWorkOrderProps> = ({
  onClose,
  onWorkOrderAdded,
}) => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const router = useRouter();

  const { userRole } = useAuthentication({
    allowedRoles: ["PRODUCTION_MANAGER", "OPERATOR"],
  });

  const token = localStorage.getItem("token");

  const { operators, loading, error } = useOperators(token, setAssignedToId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (!token) {
        throw new Error("Unauthorized");
      }

      const payload = {
        productName,
        quantity: Number(quantity),
        deadline: new Date(deadline),
        status: Status.PENDING,
        assignedToId: Number(assignedToId),
      };

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Failed to add work order");
      }

      onWorkOrderAdded();
      router.push("/work-orders");
      resetForm();
    } catch (error: any) {
      console.error("Error adding work order:", error);
      alert(`Error adding work order: ${error.message}`);
    }
  };

  const resetForm = () => {
    setProductName("");
    setQuantity(1);
    setDeadline("");
    setAssignedToId("");
  };

  const workOrder = {
    productName,
    quantity,
    deadline,
    assignedToId,
    operators,
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Add Work Order
      </h2>

      <AddWorkOrderForm
        workOrder={workOrder}
        setProductName={setProductName}
        setQuantity={setQuantity}
        setDeadline={setDeadline}
        setAssignedToId={setAssignedToId}
        handleSubmit={handleSubmit}
        onClose={onClose}
      />
    </div>
  );
};

export default AddWorkOrder;
