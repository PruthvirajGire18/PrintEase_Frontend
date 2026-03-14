import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  Package,
  Receipt,
  RefreshCw,
  Search,
} from "lucide-react";

import API from "../api/api";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const statusStyles = {
  pending: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  processing: "border-blue-400/20 bg-blue-500/10 text-blue-100",
  ready: "border-violet-400/20 bg-violet-500/10 text-violet-100",
  delivered: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
};

function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchUserOrders = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setOrders([]);
        setError("Please login to view your orders.");
        return;
      }

      const res = await API.get("/orders");

      if (res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setOrders([]);
        setError(res.data.message || "Failed to fetch your orders.");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      console.error("Error response:", err.response?.data);
      setOrders([]);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch your orders. Please check your connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const totalSpend = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalFiles = orders.reduce((sum, order) => sum + (order.files?.length || 0), 0);
  const activeOrders = orders.filter((order) =>
    ["pending", "processing", "ready"].includes(order.orderStatus)
  ).length;
  const deliveredOrders = orders.filter((order) => order.orderStatus === "delivered").length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="glass-card flex min-h-[420px] flex-col items-center justify-center rounded-[32px] p-8 text-center">
          <Loader2 className="animate-spin text-blue-300" size={40} />
          <p className="mt-4 text-xl font-semibold text-white">Loading your orders...</p>
          <p className="mt-2 text-sm text-slate-400">
            Pulling the latest print requests and statuses into your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header items-center text-center">
        <div className="mx-auto max-w-4xl">
          <span className="chip">
            <Receipt size={14} />
            User Dashboard
          </span>
          <h1 className="page-title mt-4">Your orders, totals, and tracking in one place.</h1>
          <p className="page-subtitle mt-3">
            The page now keeps supporting content in the main flow, so nothing feels pushed
            off to the right side on larger screens.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUserOrders({ isRefresh: true })}
          disabled={refreshing}
          className={`secondary-btn inline-flex items-center justify-center gap-2 self-center rounded-2xl px-5 py-3 text-sm font-semibold ${
            refreshing ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {refreshing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh orders
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Total Orders</p>
          <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">{orders.length}</p>
          <p className="mt-2 text-sm text-slate-400">Everything you have submitted so far.</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Active Orders</p>
          <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">{activeOrders}</p>
          <p className="mt-2 text-sm text-slate-400">Pending, processing, or ready for pickup.</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Total Spend</p>
          <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">{formatCurrency(totalSpend)}</p>
          <p className="mt-2 text-sm text-slate-400">A quick view of your printing cost over time.</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Delivered</p>
          <p className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">{deliveredOrders}</p>
          <p className="mt-2 text-sm text-slate-400">Completed orders that are already closed out.</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-[28px] border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="glass-card mt-6 rounded-[32px] p-8 md:p-10">
          <div className="empty-state rounded-[28px] p-8 md:p-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-900/70 text-blue-200">
                <Package size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-white">No orders yet</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Your dashboard is ready. Once you upload a document and place an order,
                  the entire history will appear here with cleaner progress visibility.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="primary-btn mt-5 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                >
                  Start a new upload
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-[32px] p-6">
              <span className="chip">
                <FileText size={14} />
                Overview
              </span>
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">
                A clearer snapshot of your order activity.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Supporting content now stays in the main dashboard flow, so the page feels
                balanced instead of sending details into a separate right column.
              </p>
            </div>

            <div className="glass-card rounded-[32px] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Quick Totals
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="soft-card rounded-[24px] p-4">
                  <p className="text-sm text-slate-400">Uploaded Files</p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">{totalFiles}</p>
                </div>
                <div className="soft-card rounded-[24px] p-4">
                  <p className="text-sm text-slate-400">Current Spend</p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                    {formatCurrency(totalSpend)}
                  </p>
                </div>
                <div className="soft-card rounded-[24px] p-4">
                  <p className="text-sm text-slate-400">Best Next Action</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    Track active orders or place a new print request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order._id} className="glass-card rounded-[32px] p-5 md:p-6 card-hover">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="chip">
                        <Package size={14} />
                        {order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                          statusStyles[order.orderStatus] ||
                          "border-slate-700 bg-slate-900/60 text-slate-200"
                        }`}
                      >
                        {order.orderStatus === "delivered" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock3 size={14} />
                        )}
                        {order.orderStatus}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">
                      {formatCurrency(order.totalAmount)}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      {order.files?.length || 0} files, {order.totalPages || 0} total pages.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/track?order=${encodeURIComponent(order.orderNumber)}`)}
                    className="secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                  >
                    <Search size={16} />
                    Track order
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="soft-card rounded-[24px] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Files</p>
                    <p className="mt-3 text-2xl font-black text-white">{order.files?.length || 0}</p>
                  </div>
                  <div className="soft-card rounded-[24px] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pages</p>
                    <p className="mt-3 text-2xl font-black text-white">{order.totalPages || 0}</p>
                  </div>
                  <div className="soft-card rounded-[24px] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                    <p className="mt-3 text-2xl font-black capitalize text-white">{order.orderStatus}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {order.files?.map((file, index) => (
                    <div key={`${file.filename}-${index}`} className="soft-card rounded-[24px] p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            File {index + 1}
                          </p>
                          <h3 className="mt-2 break-words text-base font-semibold text-white">
                            {file.filename}
                          </h3>
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
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
