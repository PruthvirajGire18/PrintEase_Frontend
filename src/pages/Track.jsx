import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  Package,
  Receipt,
  Search,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import API from "../api/api";

const statusOrder = ["pending", "processing", "ready", "delivered"];

const statusSteps = [
  {
    key: "pending",
    title: "Order received",
    description: "Your print request has been created and added to the queue.",
  },
  {
    key: "processing",
    title: "Printing in progress",
    description: "The team is preparing and printing your files now.",
  },
  {
    key: "ready",
    title: "Ready for pickup",
    description: "Your order is complete and waiting to be collected.",
  },
  {
    key: "delivered",
    title: "Delivered",
    description: "The order has been handed over successfully.",
  },
];

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const statusBadgeStyles = {
  pending: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  processing: "border-blue-400/20 bg-blue-500/10 text-blue-100",
  ready: "border-violet-400/20 bg-violet-500/10 text-violet-100",
  delivered: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
};

function Track() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleTrack = async (manualOrderNumber) => {
    const trimmedOrderNumber = (manualOrderNumber ?? orderNumber).trim();

    if (!trimmedOrderNumber) {
      setError("Please enter an order number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const encodedOrderNumber = encodeURIComponent(trimmedOrderNumber);
      const res = await API.get(`/track/${encodedOrderNumber}`);

      if (res.data.success && res.data.order) {
        setOrder(res.data.order);
        setNotice(`Showing the latest status for ${trimmedOrderNumber.toUpperCase()}.`);
        if (searchParams.get("order") !== trimmedOrderNumber) {
          setSearchParams({ order: trimmedOrderNumber });
        }
      } else {
        setError(res.data.error || "Order not found.");
      }
    } catch (err) {
      console.error("Track error:", err);
      setOrder(null);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Order not found. Please check the order number and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrderNumber("");
    setOrder(null);
    setError("");
    setNotice("");
    setSearchParams({});
  };

  useEffect(() => {
    const queryOrder = searchParams.get("order");

    if (queryOrder && queryOrder !== orderNumber) {
      setOrderNumber(queryOrder);
      setNotice("Loaded your latest order number and started tracking it.");
      handleTrack(queryOrder);
    }
  }, [searchParams]);

  const currentStatusIndex = statusOrder.indexOf(order?.orderStatus);

  return (
    <div className="page-container">
      <div className="page-header items-center text-center">
        <div className="mx-auto max-w-4xl">
          <span className="chip">
            <Search size={14} />
            Order Tracking
          </span>
          <h1 className="page-title mt-4">Track every print order with less guesswork.</h1>
          <p className="page-subtitle mt-3">
            Search by order number to view current status, payment summary, and file
            details in one clear flow.
          </p>
        </div>

        <div className="glass-card mx-auto max-w-2xl rounded-[28px] p-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Tracking improvements</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Supporting cards now stay in the normal flow, so the page no longer feels
                right-heavy on larger screens.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className="glass-card animate-fade-in rounded-[32px] p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <label className="block flex-1">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Search size={14} />
                Order Number
              </span>
              <div className="input-shell flex items-center gap-3 rounded-2xl px-4 py-3.5">
                <Search className="text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Enter order number"
                  value={orderNumber}
                  onChange={(event) => {
                    setOrderNumber(event.target.value);
                    setError("");
                    setNotice("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleTrack();
                  }}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
              </div>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleTrack()}
                disabled={loading}
                className={`primary-btn inline-flex min-w-[140px] items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track order
                  </>
                )}
              </button>

              {orderNumber && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold"
                >
                  <X size={18} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {notice && !error && (
            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
              {notice}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {!order && !loading && (
            <div className="empty-state mt-6 rounded-[28px] p-6 md:p-8">
              <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900/70 text-blue-200">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">No order selected yet</p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                    Enter an order number above to reveal payment details, current progress,
                    and the exact files included in that request.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="glass-card animate-scale-in rounded-[32px] p-5 md:p-7">
          <span className="chip">
            <Clock3 size={14} />
            Status Guide
          </span>

          <div className="status-track mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statusSteps.map((step, index) => {
              const isActive = currentStatusIndex >= index;
              const isCurrent = order?.orderStatus === step.key;

              return (
                <div
                  key={step.key}
                  className={`relative z-10 rounded-[24px] border p-4 ${
                    isActive
                      ? "border-blue-400/20 bg-blue-500/10"
                      : "border-slate-800 bg-slate-950/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        isActive ? "bg-blue-500 text-white" : "bg-slate-900 text-slate-500"
                      }`}
                    >
                      {isActive ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {isCurrent ? "Current stage" : `Step ${index + 1}`}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {order && (
        <section className="glass-card animate-fade-in mt-6 overflow-hidden rounded-[32px]">
          <div className="border-b border-slate-800 bg-[linear-gradient(135deg,rgba(37,99,235,0.22),rgba(79,70,229,0.2),rgba(15,23,42,0.95))] px-5 py-6 md:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/8 text-blue-100">
                  <Package size={26} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                    Order Number
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-white">
                    {order.orderNumber}
                  </h2>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold capitalize ${
                  statusBadgeStyles[order.orderStatus] ||
                  "border-slate-700 bg-slate-900/60 text-slate-200"
                }`}
              >
                <CheckCircle2 size={16} />
                {order.orderStatus}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[0.95fr,1.05fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="soft-card rounded-[24px] p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <Receipt size={14} />
                    Total Amount
                  </div>
                  <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <div className="soft-card rounded-[24px] p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <FileText size={14} />
                    Total Pages
                  </div>
                  <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
                    {order.totalPages}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-500/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                      Payment Status
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Paid successfully</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
                    <CheckCircle2 size={22} />
                  </div>
                </div>
              </div>

              {order.userId?.name && (
                <div className="soft-card rounded-[24px] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Customer
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">{order.userId.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Files
                </p>
                <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
                  Included documents ({order.files?.length || 0})
                </h3>
              </div>

              <div className="space-y-4">
                {order.files?.map((file, index) => (
                  <div key={`${file.filename}-${index}`} className="soft-card rounded-[24px] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          File {index + 1}
                        </p>
                        <h4 className="mt-2 break-words text-base font-semibold text-white">
                          {file.filename}
                        </h4>
                      </div>

                      <a
                        href={file.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                      >
                        <Download size={16} />
                        Open file
                      </a>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                        {file.pages} pages
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                        {file.copies} copies
                      </span>
                      <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-100">
                        {file.color === "color" ? "Color | Rs.5/page" : "B&W | Rs.2/page"}
                      </span>
                      {file.doubleSided && (
                        <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
                          Double-sided
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Track;
