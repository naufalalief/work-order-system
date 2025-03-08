import {
  InputLabeledProps,
  Operator,
  SelectLabeledProps,
} from "@/utils/interfaces";
import React from "react";

export const LabeledInput: React.FC<InputLabeledProps> = ({
  label,
  value,
  onChange,
  type,
  placeholder,
  disabled,
}) => (
  <div className="grid grid-cols-1 gap-2">
    <label htmlFor={label} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={label}
      id={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300"
    />
  </div>
);

export const LabeledSelect: React.FC<SelectLabeledProps<any>> = ({
  label,
  value,
  onChange,
  options,
  disabled,
  optionLabelKey,
  optionValueKey,
  defaultOptionLabel = "Select Option",
}) => (
  <div className="grid grid-cols-1 gap-2">
    <label htmlFor={label} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      name={label}
      id={label}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-indigo-200 focus:border-indigo-300"
    >
      <option value="">{defaultOptionLabel}</option>
      {options?.map((option) => (
        <option
          className="capitalize"
          key={String(option[optionValueKey])}
          value={String(option[optionValueKey])}
        >
          {String(option[optionLabelKey])}
        </option>
      ))}
    </select>
  </div>
);
