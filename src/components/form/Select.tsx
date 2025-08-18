import React, { useMemo, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string | string[]) => void;
  className?: string;
  defaultValue?: string | string[];
  value?: string | string[];
  isMulti?: boolean;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  isMulti = false,
  required = false,
}) => {
  const initial = useMemo(() => (value ?? defaultValue ?? (isMulti ? [] : "")), [value, defaultValue, isMulti]);
  const [internalValue, setInternalValue] = useState<string | string[]>(initial);

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMulti) {
      const selectedOptions = Array.from(e.target.selectedOptions).map((o) => o.value);
      setInternalValue(selectedOptions);
      onChange(selectedOptions);
    } else {
      const val = e.target.value;
      setInternalValue(val);
      onChange(val);
    }
  };

  const isFilled = isMulti ? Array.isArray(currentValue) && currentValue.length > 0 : Boolean(currentValue);

  return (
    <select
      multiple={isMulti}
      required={required}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        isFilled ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={currentValue as string | readonly string[]}
      onChange={handleChange}
    >
      {!isMulti && (
        <option value="" disabled className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
