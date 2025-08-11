"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/service/authService";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMessage(null);

  if (!form.email || !form.password) {
    setMessage("Both email and password are required");
    return;
  }

  try {
    setSubmitting(true);
    const { data } = await loginUser(form);
    try {
      if (data?.token) {
        // Store token with Bearer prefix for Authorization header usage
        localStorage.setItem("token", `Bearer ${data.token}`);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (storageErr) {
      // ignore storage errors but continue navigation
    }
    alert(data?.message || "Login successful");
    router.push("/");
  } catch (err: any) {
    setMessage(err.message || err.response?.data?.message || "Login failed");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5">
            <h1 className="mb-2 font-semibold text-gray-800">Sign In</h1>
            <p className="text-sm text-gray-500">Enter your credentials to login</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              {/* Password */}
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  disabled={submitting}
                  className="w-full px-4 py-3 text-white bg-brand-500 rounded-lg disabled:opacity-60"
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </div>
          </form>

          {/* Message */}
          {message && (
            <p className="mt-3 text-center text-sm text-gray-600">{message}</p>
          )}

          {/* Sign Up Link */}
          <div className="mt-5 text-center">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-brand-500 hover:text-brand-600">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
