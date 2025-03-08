import { Role } from "@prisma/client";
import { JwtPayload } from "jwt-decode";
import { NextApiResponse } from "next";
import { FormEvent } from "react";

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: Role;
  expired: boolean;
}

export interface Auth {
  username: string;
  password: string;
  role?: Role;
}

export interface AuthWithResponse extends Auth {
  res: NextApiResponse;
}

export interface WorkOrder {
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

export interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onWorkOrderUpdated: () => void;
  onEditWorkOrder: (workOrder: WorkOrder) => void;
}

export interface DecodedToken extends JwtPayload {
  role: string;
}

export interface WorkOrderRowProps {
  order: WorkOrder;
  userRole: string;
  handleDelete: (order: WorkOrder) => void;
  handleEdit: (order: WorkOrder) => void;
}

export interface Operator {
  id: number;
  username: string;
}

export interface AddWorkOrderProps {
  onClose: () => void;
  onWorkOrderAdded: () => void;
}

export interface AddWorkOrderFormProps {
  workOrder: {
    productName: string;
    quantity: number;
    deadline: string;
    assignedToId: string;
    operators: Operator[];
  };
  setProductName: (productName: string) => void;
  setQuantity: (quantity: number) => void;
  setDeadline: (deadline: string) => void;
  setAssignedToId: (assignedToId: string) => void;
  handleSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

export interface FormToggleProps {
  mode: "login" | "register";
  setMode: React.Dispatch<React.SetStateAction<"login" | "register">>;
}

export interface EditWorkOrderProps {
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

export interface DecodedToken {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}
