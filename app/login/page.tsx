"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import DemoCredentials from "@/components/DemoCredentials/DemoCredentials";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleSelectDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error || "Invalid email or password");
      setLoading(false);
      return;
    }

    // Fetch session role to perform client redirect
    const response = await fetch("/api/auth/session");
    const session = await response.json();
    const role = session?.user?.role;

    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }

    if (role === "ADMIN") router.push("/admin");
    else if (role === "EMPLOYEE") router.push("/dashboard");
    else if (role === "CLIENT") router.push("/client");
    else router.push("/");
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-md mb-3">
          F
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FixyAds Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to manage your projects and portal tasks</p>
      </div>

      {/* Demo Accounts Bar */}
      <DemoCredentials onSelectAccount={handleSelectDemo} />

      <Card padding="lg" className="shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@fixyads.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth isLoading={loading} className="mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Having trouble signing in? Contact{" "}
          <a href="mailto:support@fixyads.com" className="text-blue-600 hover:underline font-semibold">
            support@fixyads.com
          </a>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6">
      <Suspense fallback={
        <div className="p-8 text-center text-slate-500 font-medium">Loading login portal...</div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}