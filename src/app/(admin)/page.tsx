import React from "react";
import Category from "@/components/Category";

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
      Hello Admin, this is the admin page for managing government schemes.
      <Category />
      </div>
    </div>
  );
}
