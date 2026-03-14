import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";

import API from "../api/api";

const onboardingPoints = [
  "Upload documents and configure print settings in one guided flow.",
  "Pay securely and keep the order number ready for instant tracking.",
  "Use the dashboard later to revisit every print request in one place.",
];

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await API.post("/signup", {
        name,
        email,
        password,
        role: "user",
      });

      setSuccess(res.data.message || "Account created successfully.");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 md:px-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-800/90 bg-[linear-gradient(180deg,rgba(7,13,25,0.96),rgba(10,18,34,0.98))] shadow-[0_30px_120px_rgba(2,6,23,0.42)] lg:grid-cols-[1.05fr,0.95fr]">
        <section className="border-b border-slate-800/80 p-6 md:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <span className="chip">
            <Sparkles size={14} />
            New Workspace
          </span>

          <h1 className="mt-6 max-w-xl text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
            Create an account and start printing faster.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
            Signup now uses the same focused auth layout, so the experience feels separate
            from the home page and more like a dedicated account setup screen.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="soft-card rounded-[26px] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                Account Setup
              </p>
              <p className="mt-3 text-lg font-bold text-white">Start in one place</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Create your account once, then move smoothly into upload and payment flow.
              </p>
            </div>
            <div className="soft-card rounded-[26px] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-200">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Dedicated signup screen</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    The normal site nav stays hidden here so registration feels cleaner and
                    less distracting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {onboardingPoints.map((item) => (
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
                  <UserPlus size={14} />
                  Signup
                </span>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white">
                  Create your PrintEase account
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Set up your details to manage uploads, payments, and order tracking from
                  one account.
                </p>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200 md:flex">
                <UserPlus size={24} />
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </div>
            )}

            <form onSubmit={handleSignup} className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <User size={14} />
                  Full name
                </span>
                <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3.5">
                  <User className="text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                    required
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  />
                </div>
              </label>

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
                    placeholder="Create a password"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-blue-300 hover:text-blue-200"
              >
                Login here
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Signup;
