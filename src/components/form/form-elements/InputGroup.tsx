"use client";
import React, { useState } from "react";
import Input from "../input/InputField";
import Label from "../Label";

export default function InputGroup() {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Phone Number</Label>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="Enter phone number"
        />
      </div>
      
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="Enter email address"
        />
      </div>
    </div>
  );
}
