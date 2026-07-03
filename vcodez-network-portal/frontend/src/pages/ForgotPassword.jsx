import React, { useState } from "react";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import BackgroundBlobs from "../components/layout/BackgroundBlobs";
import BrandMark from "../components/layout/BrandMark";
import TextField from "../components/ui/TextField";
import GradientButton from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.warn("Please enter your email.");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      <BackgroundBlobs />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6">
            <div className="flex justify-center mb-4"><BrandMark size="lg" /></div>

            {!sent ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Forgot Password</h2>
                  <p className="text-slate-600 text-sm">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <TextField
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <GradientButton type="submit" disabled={isLoading} className="w-full">
                    <div className="flex items-center justify-center space-x-2">
                      <span>{isLoading ? "Sending..." : "Send Reset Link"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </GradientButton>
                </form>
              </>
            ) : (
              <div className="text-center space-y-3 py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Check your inbox</h2>
                <p className="text-slate-600 text-sm">
                  If an account exists for <b>{email}</b>, a password reset link has been sent.
                </p>
              </div>
            )}

            <div className="text-center pt-6 mt-6 border-t border-slate-200">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
