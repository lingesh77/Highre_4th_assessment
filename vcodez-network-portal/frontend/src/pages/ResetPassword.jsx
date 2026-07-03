import React, { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import BackgroundBlobs from "../components/layout/BackgroundBlobs";
import BrandMark from "../components/layout/BrandMark";
import GradientButton from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Missing or invalid reset link.");
    if (password.length < 6) return toast.warn("Password must be at least 6 characters.");
    if (password !== confirm) return toast.warn("Passwords do not match.");

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success("Password updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "This reset link is invalid or expired.");
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

            {done ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-800">Password updated</h2>
                <p className="text-slate-600 text-sm">You can now sign in with your new password.</p>
                <GradientButton className="w-full mt-4" onClick={() => navigate("/login")}>
                  Go to Sign In
                </GradientButton>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
                  <p className="text-slate-600 text-sm">Choose a new password for your account.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>New Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <GradientButton type="submit" disabled={isLoading} className="w-full">
                    <div className="flex items-center justify-center space-x-2">
                      <span>{isLoading ? "Updating..." : "Update Password"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </GradientButton>
                </form>
              </>
            )}

            <div className="text-center pt-6 mt-6 border-t border-slate-200">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
