import { Input } from "@/components/ui/input";
import { AddWorkOrderFormProps } from "@/utils/interfaces";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({
  workOrder,
  setProductName,
  setQuantity,
  setDeadline,
  setAssignedToId,
  handleSubmit,
  onClose,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-2">
      <div className="grid grid-cols-1 gap-2">
        <label
          htmlFor="productName"
          className="block text-sm font-medium text-gray-700"
        >
          Product Name
        </label>
        <Input
          type="text"
          name="productName"
          id="productName"
          placeholder="Product Name"
          value={workOrder.productName}
          onChange={(e) => setProductName(e.target.value)}
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
        <Input
          type="number"
          name="quantity"
          id="quantity"
          placeholder="Quantity"
          value={workOrder.quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
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
        <Input
          type="date"
          name="deadline"
          id="deadline"
          value={workOrder.deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300 disabled:bg-gray-100"
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <label
          htmlFor="assignedToId"
          className="block text-sm font-medium text-gray-700"
        >
          Assigned To
        </label>
        <Select
          name="assignedToId"
          value={workOrder.assignedToId}
          onValueChange={setAssignedToId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Operator" />
          </SelectTrigger>
          <SelectContent>
            {workOrder.operators &&
              workOrder.operators.length > 0 &&
              workOrder.operators.map((operator) => (
                <SelectItem key={operator.id} value={String(operator.id)}>
                  {operator.username}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 mt-4 col-span-2">
        <button
          type="submit"
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200 transition duration-300 ease-in-out text-sm"
        >
          Add Work Order
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring focus:ring-indigo-200 transition duration-300 ease-in-out text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
