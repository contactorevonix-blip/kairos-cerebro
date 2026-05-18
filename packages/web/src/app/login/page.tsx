"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowRight, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await signIn("resend", { email, redirect: false });
      if (res?.error) setError("Could not send email. Try again.");
      else setSent(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Background glow */}
      <div className="fixed inset-0 hero-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-semibold text-xl text-gray-12">KAIROS</span>
        </Link>

        <div className="glass rounded-3xl border border-white/8 p-8">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-12 mb-2">Sign in to KAIROS</h1>
                <p className="text-sm text-gray-10">
                  Enter your email and we’ll send a magic link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-9" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className="w-full bg-white/5 border border-white/8 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-12 placeholder:text-gray-9 focus:outline-none focus:border-blue-500/40 transition-kairos"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  {!loading && <>
                    Send magic link
                    <ArrowRight className="w-4 h-4" />
                  </>}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/6 text-center">
                <p className="text-xs text-gray-9">
                  By signing in you agree to our{" "}
                  <Link href="/privacy" className="text-gray-11 hover:text-gray-12 underline">Privacy Policy</Link>
                  {" "}&amp;{" "}
                  <Link href="/terms" className="text-gray-11 hover:text-gray-12 underline">Terms</Link>.
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-12 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-10 leading-relaxed">
                We sent a magic link to <strong className="text-gray-12">{email}</strong>.
                Click it to sign in — it expires in 10 minutes.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-xs text-gray-10 hover:text-gray-12 transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-gray-9 mt-6">
          New to KAIROS?{" "}
          <Badge variant="accent" className="cursor-pointer">10 free tokens on signup</Badge>
        </p>
      </motion.div>
    </div>
  );
}
