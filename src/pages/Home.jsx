import React from "react";
import { Link } from "react-router-dom";
import {
  Clock3,
  CreditCard,
  FileCheck2,
  PackageCheck,
  Search,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";

function Home() {
  const steps = [
    {
      title: "Upload your files",
      copy: "Add PDFs, documents, and images in a clean guided flow.",
      icon: Upload,
    },
    {
      title: "Choose print settings",
      copy: "Set copies, color, and duplex options before checkout.",
      icon: FileCheck2,
    },
    {
      title: "Pay and relax",
      copy: "Secure checkout locks in your request and keeps tracking simple.",
      icon: CreditCard,
    },
    {
      title: "Track progress",
      copy: "See when your order is processing, ready, or delivered.",
      icon: Search,
    },
  ];

  const features = [
    {
      title: "Fast Print Operations",
      copy: "Optimized for repeat orders, quick handoff, and fewer manual steps.",
      icon: Zap,
      tint: "bg-blue-500/12 text-blue-300",
    },
    {
      title: "Secure Payments",
      copy: "Payment verification is built into the order flow so records stay consistent.",
      icon: ShieldCheck,
      tint: "bg-emerald-500/12 text-emerald-300",
    },
    {
      title: "Status Visibility",
      copy: "Customers and admins both get better visibility into every print request.",
      icon: Clock3,
      tint: "bg-violet-500/12 text-violet-300",
    },
  ];

  return (
    <div className="page-container space-y-8">
        <section className="glass-card relative overflow-hidden rounded-[32px] px-6 py-10 md:px-10 md:py-14">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(96,165,250,0.18),_transparent_58%)] lg:block" />

          <div className="relative grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
            <div className="max-w-3xl">
              <span className="chip animate-pulse-glow">
                <PackageCheck size={14} />
                Printing, but streamlined
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl xl:text-7xl">
                Print requests that feel organized from upload to delivery.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                PrintEase helps users upload documents, customize print settings,
                pay securely, and track each request in one clean workflow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/upload"
                  className="primary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold md:text-base"
                >
                  <Upload size={18} />
                  Upload documents
                </Link>
                <Link
                  to="/track"
                  className="secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold md:text-base"
                >
                  <Search size={18} />
                  Track an order
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Uploads
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">10 files</p>
                  <p className="mt-1 text-sm text-slate-400">
                    per order in the guided print flow
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Checkout
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">Verified</p>
                  <p className="mt-1 text-sm text-slate-400">
                    before orders are written into the system
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Tracking
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">Real-time</p>
                  <p className="mt-1 text-sm text-slate-400">
                    status visibility for users and admins
                  </p>
                </div>
              </div>
            </div>

            <div className="soft-card rounded-[28px] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">How PrintEase works</p>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                  End-to-end
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="card-hover rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            Step {index + 1}
                          </p>
                          <h3 className="mt-1 text-base font-bold text-white">
                            {step.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {step.copy}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr,1fr]">
          <div className="glass-card rounded-[28px] p-6 md:p-8">
            <p className="chip">Why teams choose it</p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-white">
              A cleaner customer experience for document printing.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              The product flow stays focused on a few things: fewer confusing
              steps, better pricing visibility, and a clearer order lifecycle.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="glass-card card-hover rounded-[26px] p-5"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.tint}`}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {feature.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
    </div>
  );
}

export default Home;
