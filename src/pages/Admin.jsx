import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  IndianRupee,
  Loader2,
  Package,
  RefreshCw,
  Shield,
  Trash2,
  Users,
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

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const fetchOrders = async ({ isRefresh = false } = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const res = await API.get("/admin/orders");

      if (res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setOrders([]);
        setError("Failed to fetch orders from server.");
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
      setError("Failed to fetch orders from server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError("");
      await API.put(`/admin/orders/${id}/status`, { status });
      await fetchOrders({ isRefresh: true });
    } catch (err) {
      console.error(err);
      setError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (id, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setUpdatingId(id);
      setError("");
      await API.delete(`/admin/orders/${id}`);
      await fetchOrders({ isRefresh: true });
    } catch (err) {
      console.error(err);
      setError("Failed to delete order.");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((order) => order.orderStatus === "pending").length,
    processing: orders.filter((order) => order.orderStatus === "processing").length,
    ready: orders.filter((order) => order.orderStatus === "ready").length,
    delivered: orders.filter((order) => order.orderStatus === "delivered").length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    totalUsers: new Set(orders.map((order) => order.userId?._id).filter(Boolean)).size,
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="glass-card flex min-h-[420px] flex-col items-center justify-center rounded-[32px] p-8 text-center">
          <Loader2 className="animate-spin text-blue-300" size={40} />
          <p className="mt-4 text-xl font-semibold text-white">Loading admin data...</p>
          <p className="mt-2 text-sm text-slate-400">
            Gathering every print request so you can manage them from one dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="chip">
            <Shield size={14} />
            Admin Control
          </span>
          <h1 className="page-title mt-4">Manage the print queue with clearer priorities.</h1>
          <p className="page-subtitle mt-3">
            The admin workspace now uses a denser but cleaner dark dashboard layout, with
            easier status scanning, better actions, and more readable file summaries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders({ isRefresh: true })}
          disabled={refreshing}
          className={`secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold ${
            refreshing ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {refreshing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh queue
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Orders</p>
          <p className="mt-4 text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Pending</p>
          <p className="mt-4 text-3xl font-black text-white">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Processing</p>
          <p className="mt-4 text-3xl font-black text-white">{stats.processing}</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Ready</p>
          <p className="mt-4 text-3xl font-black text-white">{stats.ready}</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Delivered</p>
          <p className="mt-4 text-3xl font-black text-white">{stats.delivered}</p>
        </div>
        <div className="glass-card rounded-[28px] p-5 card-hover">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">Revenue</p>
          <p className="mt-4 text-3xl font-black text-white">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Unique Customers</p>
              <p className="mt-1 text-2xl font-black text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-200">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Queue Health</p>
              <p className="mt-1 text-base font-semibold text-white">
                {stats.pending + stats.processing > 0
                  ? "Active production queue in progress."
                  : "No active queue backlog right now."}
              </p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-200">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Management Note</p>
              <p className="mt-1 text-base font-semibold text-white">
                Status changes and deletions stay exactly as before, now with cleaner UX.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-[28px] border border-rose-500/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <section className="glass-card mt-6 overflow-hidden rounded-[32px]">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Operations</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
              All orders ({orders.length})
            </h2>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/45 px-4 py-3 text-sm text-slate-400">
            Status, user, files, amount, and actions stay available on every screen size.
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 md:p-10">
            <div className="empty-state rounded-[28px] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-900/70 text-blue-200">
                <Package size={28} />
              </div>
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">No orders yet</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Orders will appear here once customers place them. The layout is ready for
                both compact mobile review and detailed desktop management.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 p-4 md:hidden">
              {orders.map((order) => (
                <article
                  key={order._id}
                  className={`soft-card rounded-[28px] p-4 ${
                    updatingId === order._id ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Order Number
                      </p>
                      <h3 className="mt-2 text-lg font-black text-white">{order.orderNumber}</h3>
                    </div>
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

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">User</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {order.userId?.name || "Guest"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Amount</p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.files?.map((file, index) => (
                      <div
                        key={`${file.filename}-${index}`}
                        className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3"
                      >
                        <a
                          href={file.cloudinaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-blue-100"
                        >
                          <Download size={14} />
                          {file.filename}
                        </a>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
                            {file.pages} pages
                          </span>
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                            {file.copies} copies
                          </span>
                          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100">
                            {file.color === "color" ? "Color" : "B&W"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    <select
                      value={order.orderStatus}
                      onChange={(event) => updateStatus(order._id, event.target.value)}
                      disabled={updatingId === order._id}
                      className="input-shell w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => deleteOrder(order._id, order.orderNumber)}
                      disabled={updatingId === order._id}
                      className={`danger-btn inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                        updatingId === order._id ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      {updatingId === order._id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete order
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Files
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className={`transition hover:bg-slate-900/25 ${
                        updatingId === order._id ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
                            <Package size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {order.totalPages || 0} pages total
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2">
                          <Users className="text-slate-500" size={16} />
                          <span className="text-sm font-medium text-slate-200">
                            {order.userId?.name || "Guest"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="max-w-md space-y-3">
                          {order.files?.map((file, index) => (
                            <div
                              key={`${file.filename}-${index}`}
                              className="rounded-2xl border border-slate-800 bg-slate-950/35 p-3"
                            >
                              <a
                                href={file.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 hover:text-blue-100"
                              >
                                <Download size={14} />
                                {file.filename}
                              </a>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
                                  {file.pages} pages
                                </span>
                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                                  {file.copies} copies
                                </span>
                                <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-100">
                                  {file.color === "color" ? "Color · Rs.5/page" : "B&W · Rs.2/page"}
                                </span>
                                {file.doubleSided && (
                                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100">
                                    Double-sided
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center gap-2">
                          <FileText className="text-slate-500" size={16} />
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                            statusStyles[order.orderStatus] ||
                            "border-slate-700 bg-slate-900/60 text-slate-200"
                          }`}
                        >
                          {order.orderStatus === "delivered" ? (
                            <CheckCircle2 size={14} />
                          ) : order.orderStatus === "pending" ? (
                            <AlertCircle size={14} />
                          ) : (
                            <Clock3 size={14} />
                          )}
                          {order.orderStatus}
                        </span>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col items-center gap-3">
                          <select
                            value={order.orderStatus}
                            onChange={(event) => updateStatus(order._id, event.target.value)}
                            disabled={updatingId === order._id}
                            className="input-shell min-w-[150px] rounded-2xl px-4 py-2.5 text-sm font-semibold"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => deleteOrder(order._id, order.orderNumber)}
                            disabled={updatingId === order._id}
                            className={`danger-btn inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                              updatingId === order._id ? "cursor-not-allowed opacity-70" : ""
                            }`}
                          >
                            {updatingId === order._id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Admin;
