"use client";
import React, { useState } from "react";
import Input from "../input/InputField";
import Label from "../Label";
import Select from "../Select";
import DatePicker from "../date-picker";

export default function DefaultInputs() {
  const [single, setSingle] = useState("");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Label>Single Select</Label>
          <Select
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
              { value: "option3", label: "Option 3" },
            ]}
            value={single}
            onChange={(value) => setSingle(Array.isArray(value) ? value[0] || "" : value)}
            placeholder="Select an option"
          />
        </div>

        <div>
          <Label>Date Picker</Label>
          <DatePicker
            id="date-picker"
            placeholder="Select a date"
            onChange={() => {
              // Handle date change
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Label>Input Field</Label>
          <Input
            type="text"
            placeholder="Enter text"
            onChange={() => {
              // Handle input change
            }}
          />
        </div>

        <div>
          <Label>Text Area</Label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter text here..."
          />
        </div>
      </div>
    </div>
  );
}
