"use client";
import React, { useState } from "react";
import Select from "../Select";
import Label from "../Label";

export default function SelectInputs() {
  const [single, setSingle] = useState("");

  return (
    <div className="space-y-6">
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
    </div>
  );
}
