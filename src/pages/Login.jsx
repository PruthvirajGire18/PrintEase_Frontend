import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import API from "../api/api";
import { useAuth } from "../context/AuthContext";

const valueProps = [
  "Secure account access for uploads, payments, and order history.",
  "Track your orders without losing print settings or file context.",
  "Built for a fast handoff from upload to verified checkout.",
];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/login", { email, password });

      if (res.data.success && res.data.token && res.data.user) {
        const redirectPath = login({
          token: res.data.token,
          role: res.data.user.role,
          name: res.data.user.name || "",
        });
        navigate(redirectPath);
        return;
      }

      setError("Invalid response from server. Please try again.");
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error details:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 md:px-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(7,13,25,0.96),rgba(10,18,34,0.98))] shadow-[0_30px_120px_rgba(2,6,23,0.42)] lg:grid-cols-[0.9fr,1.1fr]">
        <section className="border-b border-slate-800/80 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <span className="chip">
            <Sparkles size={14} />
            PrintEase Access
          </span>

          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
            Welcome back to your print workspace.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
            This screen stays focused on sign-in only, so you can get straight back to
            uploads, order tracking, and dashboard access.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="soft-card rounded-[26px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                Account
              </p>
              <p className="mt-3 text-lg font-bold text-white">One secure entry point</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Your uploads, payments, and order history stay connected to one login.
              </p>
            </div>
            <div className="soft-card rounded-[26px] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Why this page feels cleaner</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    We removed the normal site chrome here so login behaves like a dedicated
                    auth experience, not a home page section.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {valueProps.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 text-emerald-300" size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="chip">
                  <LogIn size={14} />
                  Login
                </span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white">
                  Continue to PrintEase
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Enter your details to continue to uploads, tracking, and dashboard access.
                </p>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-200 md:flex">
                <LogIn size={24} />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <Mail size={14} />
                  Email
                </span>
                <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <Mail className="text-slate-500" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    required
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <Lock size={14} />
                  Password
                </span>
                <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <Lock className="text-slate-500" size={18} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    required
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`primary-btn flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Logging in...
                  </>
                ) : (
                  <>
                    Continue to PrintEase
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
              New here?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-semibold text-blue-300 hover:text-blue-200"
              >
                Create an account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
