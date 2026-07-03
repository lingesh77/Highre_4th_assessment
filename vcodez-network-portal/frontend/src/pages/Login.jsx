import React, { useState } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, BarChart3, Network, ScanLine, FileSpreadsheet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BackgroundBlobs from "../components/layout/BackgroundBlobs";
import BrandMark from "../components/layout/BrandMark";
import TextField from "../components/ui/TextField";
import GradientButton from "../components/ui/GradientButton";
import { useAuth } from "../context/AuthContext";
import { usePersistedState } from "../hooks/usePersistedState";

const FEATURES = [
  { icon: BarChart3, bg: "bg-blue-50", title: "Smart Dashboard", desc: "Real-time analytics & insights" },
  { icon: Network, bg: "bg-green-50", title: "Cluster Metrics", desc: "Band charts of min/max/median" },
  { icon: ScanLine, bg: "bg-purple-50", title: "Switch Inventory", desc: "Search & update device status" },
  { icon: FileSpreadsheet, bg: "bg-orange-50", title: "Alerts & Reports", desc: "Email alerts & exports" },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginData, setLoginData] = usePersistedState("highre_login_draft", { email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.warn("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await login(loginData.email, loginData.password);
      toast.success("Logged in successfully!");
      setLoginData({ email: "", password: "" });
      navigate("/app/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      <BackgroundBlobs />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Hero */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <BrandMark subtitle="TECHNOLOGY" size="lg" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Highre Software
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8">Network Switch &amp; Cluster Management Portal</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className={`w-full h-20 flex items-center justify-center mb-2 ${f.bg} rounded-lg`}>
                      <f.icon className="w-7 h-7 text-slate-700" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">{f.title}</h3>
                    <p className="text-xs text-slate-600">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="w-full relative lg:top-8">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200">
              <div className="text-center space-y-4 lg:hidden p-6 border-b border-slate-200">
                <div className="flex justify-center"><BrandMark /></div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Highre Software Portal</h1>
                  <p className="text-slate-600 mt-2">Network Switch Management</p>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign In</h2>
                  <p className="text-slate-600">Access your Highre Software Network Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <TextField
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <GradientButton type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        "Signing In..."
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Sign In to Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </GradientButton>

                    <div className="text-center pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Don&apos;t have an account?{" "}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
