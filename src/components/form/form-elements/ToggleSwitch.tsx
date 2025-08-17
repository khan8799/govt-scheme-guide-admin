"use client";
import React, { useState } from "react";
import Switch from "../switch/Switch";

export default function ToggleSwitch() {
  const [checked, setChecked] = useState(false);

  const handleToggle = (isChecked: boolean) => {
    setChecked(isChecked);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Switch
          label="Toggle Switch"
          defaultChecked={checked}
          onChange={handleToggle}
        />
        <span className="text-sm text-gray-700">
          {checked ? "Enabled" : "Disabled"}
        </span>
      </div>
    </div>
  );
}
