import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="page-container flex min-h-[calc(100vh-5rem)] items-center justify-center">
      <div className="glass-card animate-scale-in w-full max-w-3xl rounded-[32px] p-8 text-center md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-rose-500/12 text-rose-200">
          <ShieldAlert size={34} />
        </div>

        <span className="chip mt-6">
          <ShieldAlert size={14} />
          Access Restricted
        </span>

        <h1 className="mt-6 text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
          You do not have permission to view this page.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
          This area is protected by role-based access. Head back to a page available for
          your account and continue from there.
        </p>

        <div className="mt-8 grid gap-4 rounded-[28px] border border-slate-800 bg-slate-950/45 p-5 text-left md:grid-cols-3">
          <div className="soft-card rounded-3xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Reason</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Your current role cannot open this route.</p>
          </div>
          <div className="soft-card rounded-3xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">Next Step</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Go back or return home to continue safely.</p>
          </div>
          <div className="soft-card rounded-3xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Preserved</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">No permissions or routes were changed, only the UX.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            Go back
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="primary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            <Home size={18} />
            Return home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
