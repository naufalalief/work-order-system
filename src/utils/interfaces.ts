import { Role } from "@prisma/client";
import { JwtPayload } from "jwt-decode";
import { NextApiResponse } from "next";
import { FormEvent } from "react";
import { authSchema } from "./schemas";
import { z } from "zod";

export interface LoginFormProps {
  form: any;
  handleSubmit: (values: z.infer<typeof authSchema>) => Promise<void>;
  mode: "login" | "register";
}
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

export interface WorkOrderRowProps {
  order: WorkOrder;
  userRole: string | null;
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

export interface DecodedToken extends JwtPayload {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export interface InputLabeledProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: "text" | "number" | "date";
  placeholder?: string;
  disabled?: boolean;
}
export interface SelectLabeledProps<T> {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: T[];
  optionLabelKey: keyof T;
  optionValueKey: keyof T;
  defaultOptionLabel?: string;
}

export interface CustomJwtPayload extends JwtPayload {
  username: string;
  role: string;
}

export interface UserInfo {
  username: string | null;
  role: string | null;
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

export interface OperatorReport {
  operatorName: string;
  report: {
    productName: string;
    totalQuantity: number;
  }[];
}

export interface ProductReportItem {
  productName: string;
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELED: number;
  totalQuantity: number;
}
