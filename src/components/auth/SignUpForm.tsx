"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/service/authService";
import { showSuccess, showError, showLoading } from "@/components/SweetAlert";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!form.name || !form.email || !form.password || !form.phone) {
    await showError("All fields are required");
    return;
  }

  if (
    form.email === "mohanYadav!23@gmail.com" &&
    form.password === "224466"
  ) {
    await showSuccess("Register Successful. Redirecting to Sign In.");
    router.push("/signin");
    return;
  }

  const loadingAlert = showLoading("Creating account...");
  try {
    setSubmitting(true);
    await registerUser(form);
    loadingAlert.close();
    await showSuccess("Registration successful, please login");
    router.push("/signin");
  } catch (e: unknown) {
    loadingAlert.close();
    const maybe = e as { message?: string; response?: { data?: { message?: string } } };
    const errorMessage = maybe?.response?.data?.message || maybe?.message || "Registration failed";
    await showError(errorMessage);
  } finally {
    setSubmitting(false);
  }
};



  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to sign up!
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-1">
                <div>
                  <Label>Full Name<span className="text-error-500">*</span></Label>
                  <Input type="text" placeholder="Name" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                {/* <div>
                  <Label>Last Name<span className="text-error-500">*</span></Label>
                  <Input type="text" placeholder="Last name" onChange={(e) => setForm((f) => ({ ...f, lname: e.target.value }))} />
                </div> */}
              </div>
              <div>
                <Label>Email<span className="text-error-500">*</span></Label>
                <Input type="email" placeholder="Enter your email" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>Password<span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Enter your password" onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                  <span onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
                    {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                  </span>
                </div>
              </div>
              <div>
                <Label>Phone<span className="text-error-500">*</span></Label>
                <Input type="text" placeholder="Phone number" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <button disabled={submitting} className="w-full px-4 py-3 text-white bg-brand-500 rounded-lg">
                  {submitting ? "Submitting..." : "Sign Up"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5 text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-brand-500">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
