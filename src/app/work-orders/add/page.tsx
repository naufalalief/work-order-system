"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@prisma/client";

interface Operator {
  id: number;
  username: string;
}

interface AddWorkOrderProps {
  onWorkOrderAdded: () => void;
}

const AddWorkOrder: React.FC<AddWorkOrderProps> = ({ onWorkOrderAdded }) => {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<Status>(Status.PENDING);
  const [assignedToId, setAssignedToId] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User not authenticated.");
          return;
        }

        const response = await fetch("/api/users?role=operator", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOperators(data.users);
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

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName,
          quantity: Number(quantity),
          deadline: new Date(deadline),
          status,
          assignedToId: Number(assignedToId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add work order");
      }

      onWorkOrderAdded();
      router.push("/work-orders");

      setProductName("");
      setQuantity(1);
      setDeadline("");
      setStatus(Status.PENDING);
      setAssignedToId("");
    } catch (error: any) {
      console.error("Error adding work order:", error);
      alert(`Error adding work order: ${error.message}`);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStatus = e.target.value as Status;
    setStatus(selectedStatus);
  };

  return (
    <div>
      <div>AddForm</div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="productName"
          id="productName"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="number"
          name="quantity"
          id="quantity"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <input
          type="date"
          name="deadline"
          id="deadline"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <select
          name="assignedToId"
          id="assignedToId"
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
        >
          <option value="">Select Operator</option>
          {operators.map((operator) => (
            <option key={operator.id} value={operator.id}>
              {operator.username}
            </option>
          ))}
        </select>
        <button type="submit">Add Work Order</button>
      </form>
    </div>
  );
};

export default AddWorkOrder;
