import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BadgeCheck,
  Copy,
  CreditCard,
  FileImage,
  FileText,
  FolderOpen,
  LoaderCircle,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

import API from "../api/api";

const MAX_FILES = 10;

const feedbackStyles = {
  success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  error: "border-rose-400/20 bg-rose-500/10 text-rose-100",
  warning: "border-amber-400/20 bg-amber-500/10 text-amber-100",
  info: "border-blue-400/20 bg-blue-500/10 text-blue-100",
};

const createItemId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatFileSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState(null);
  const [processingLabel, setProcessingLabel] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const getPDFPageCount = async (file) => {
    if (file.type !== "application/pdf") return 1;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error("Error reading PDF:", error);
      return 1;
    }
  };

  const clearSelection = (preserveCompletedOrder = false) => {
    setItems([]);
    if (!preserveCompletedOrder) {
      setCompletedOrder(null);
    }
    setProcessingLabel("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFiles = async (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || []).filter(Boolean);
    if (!selectedFiles.length) return;

    const remainingSlots = MAX_FILES - items.length;

    if (remainingSlots <= 0) {
      setMessage({
        type: "warning",
        title: "Upload limit reached",
        detail: `You can add up to ${MAX_FILES} files in one order.`,
      });
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, remainingSlots);

    setAnalyzing(true);
    setCompletedOrder(null);
    setMessage({
      type: "info",
      title: "Preparing your files",
      detail: "Checking page counts and getting your print settings ready.",
    });

    try {
      const nextItems = [];

      for (const file of acceptedFiles) {
        const detectedPages = await getPDFPageCount(file);
        nextItems.push({
          id: createItemId(),
          file,
          pages: detectedPages,
          copies: 1,
          color: "color",
          doubleSided: false,
          detectedPages,
        });
      }

      setItems((currentItems) => [...currentItems, ...nextItems]);
      setMessage({
        type: "success",
        title: `${nextItems.length} file${nextItems.length > 1 ? "s" : ""} ready`,
        detail:
          selectedFiles.length > acceptedFiles.length
            ? `Only ${acceptedFiles.length} file(s) were added because one order supports ${MAX_FILES} files.`
            : "Adjust settings below and continue to secure checkout.",
      });
    } catch (error) {
      console.error("File preparation error:", error);
      setMessage({
        type: "error",
        title: "Could not prepare files",
        detail: "Please try selecting the files again.",
      });
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateItem = (id, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "pages" || field === "copies"
                  ? Math.max(1, Number.parseInt(value, 10) || 1)
                  : value,
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const getItemTotal = (item) =>
    item.pages * item.copies * (item.color === "color" ? 5 : 2);

  const getItemSheets = (item) =>
    (item.doubleSided ? Math.ceil(item.pages / 2) : item.pages) * item.copies;

  const totalAmount = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const totalPages = items.reduce((sum, item) => sum + item.pages * item.copies, 0);
  const totalSheets = items.reduce((sum, item) => sum + getItemSheets(item), 0);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!items.length) {
      setMessage({
        type: "warning",
        title: "Add a file first",
        detail: "Upload at least one document before checkout.",
      });
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      setMessage({
        type: "error",
        title: "Checkout is unavailable",
        detail: "Razorpay did not load. Refresh and try again.",
      });
      return;
    }

    const filesData = items.map((item) => ({
      name: item.file.name,
      pages: item.pages,
      copies: item.copies,
      color: item.color,
      doubleSided: item.doubleSided,
    }));

    try {
      setLoading(true);
      setProcessingLabel("Preparing secure checkout...");
      setMessage({
        type: "info",
        title: "Creating payment session",
        detail: "Your print configuration is being sent to secure checkout.",
      });

      const paymentOrderRes = await API.post("/payments/order", { filesData });
      const paymentOrder = paymentOrderRes.data;

      if (!paymentOrder?.success || !paymentOrder?.order?.id || !paymentOrder?.key) {
        throw new Error("Unable to create payment order.");
      }

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.order.amount,
        currency: paymentOrder.order.currency,
        name: "PrintEase",
        description: `Print Order - ${items.length} file(s)`,
        order_id: paymentOrder.order.id,
        handler: async (response) => {
          try {
            setProcessingLabel("Verifying payment and uploading files...");
            const formData = new FormData();

            items.forEach((item) => {
              formData.append("files", item.file);
            });

            formData.append("filesData", JSON.stringify(filesData));
            formData.append("paymentId", response.razorpay_payment_id);
            formData.append("razorpayOrderId", response.razorpay_order_id);
            formData.append("razorpaySignature", response.razorpay_signature);

            const uploadRes = await API.post("/upload", formData);

            if (!uploadRes.data?.success || !uploadRes.data?.order?.orderNumber) {
              throw new Error("Order creation failed after payment.");
            }

            const order = {
              ...uploadRes.data.order,
              paymentId: response.razorpay_payment_id,
            };

            setCompletedOrder(order);
            setMessage({
              type: "success",
              title: "Order placed successfully",
              detail: `Order ${order.orderNumber} is now in processing.`,
            });
            clearSelection(true);
          } catch (uploadErr) {
            console.error("Upload error:", uploadErr);
            const uploadMessage =
              uploadErr.response?.data?.message ||
              uploadErr.response?.data?.error ||
              uploadErr.message ||
              "Payment was captured but the order could not be created.";

            setMessage({
              type: "warning",
              title: "Payment completed, but setup needs attention",
              detail: `${uploadMessage} Payment ID: ${response.razorpay_payment_id}`,
            });
          } finally {
            setLoading(false);
            setProcessingLabel("");
          }
        },
        prefill: {
          name: localStorage.getItem("name") || "Guest",
          contact: "9999999999",
          email: "",
        },
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setProcessingLabel("");
            setMessage((currentMessage) =>
              currentMessage?.type === "success"
                ? currentMessage
                : {
                    type: "warning",
                    title: "Checkout closed",
                    detail: "Your files are still here. Review them and try again when ready.",
                  }
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        setMessage({
          type: "error",
          title: "Payment failed",
          detail: response.error.description || "Please try again with another method.",
        });
        setLoading(false);
        setProcessingLabel("");
      });

      razorpay.on("error", (error) => {
        setMessage({
          type: "error",
          title: "Checkout error",
          detail: error.description || "Something went wrong while opening payment.",
        });
        setLoading(false);
        setProcessingLabel("");
      });

      setProcessingLabel("Waiting for payment confirmation...");
      razorpay.open();
    } catch (error) {
      console.error("Payment start error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to start payment.";

      setMessage({
        type: "error",
        title: "Could not start checkout",
        detail: errorMessage,
      });
      setLoading(false);
      setProcessingLabel("");
    }
  };

  return (
    <div className="page-container">
      <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
          <section className="space-y-6">
            <div className="glass-card rounded-[32px] p-6 md:p-8">
              <span className="chip">
                Upload Flow
              </span>
              <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
                Upload, configure, and pay without losing context.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Add files, fine-tune copies and print mode, and review everything in a live
                summary before you pay.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="soft-card rounded-[24px] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Step 1</p>
                  <p className="mt-3 text-lg font-bold text-white">Add files</p>
                  <p className="mt-1 text-sm text-slate-400">PDF pages are detected automatically.</p>
                </div>
                <div className="soft-card rounded-[24px] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Step 2</p>
                  <p className="mt-3 text-lg font-bold text-white">Tune settings</p>
                  <p className="mt-1 text-sm text-slate-400">Cost updates instantly while you edit.</p>
                </div>
                <div className="soft-card rounded-[24px] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Step 3</p>
                  <p className="mt-3 text-lg font-bold text-white">Pay securely</p>
                  <p className="mt-1 text-sm text-slate-400">Orders save only after payment verification.</p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`flex gap-3 rounded-[24px] border px-4 py-4 ${feedbackStyles[message.type]}`}>
                <div className="mt-0.5">
                  {message.type === "success" ? <BadgeCheck size={18} /> : <AlertCircle size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{message.title}</p>
                  <p className="mt-1 text-sm leading-6 opacity-90">{message.detail}</p>
                </div>
              </div>
            )}

            {completedOrder && (
              <div className="glass-card rounded-[32px] p-6 md:p-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="chip">
                      Order confirmed
                    </span>
                    <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">
                      Your print request is now in the queue.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Save the order number for quick tracking.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-800 bg-slate-950/70 px-5 py-4 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Order number</p>
                    <p className="mt-2 text-xl font-black">{completedOrder.orderNumber}</p>
                    <p className="mt-2 text-xs text-slate-500">Payment ID: {completedOrder.paymentId}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate(`/track?order=${encodeURIComponent(completedOrder.orderNumber)}`)}
                    className="primary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                  >
                    Track this order
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(completedOrder.orderNumber);
                        setMessage({
                          type: "success",
                          title: "Order number copied",
                          detail: "You can paste it anywhere you need for tracking.",
                        });
                      } catch (error) {
                        setMessage({
                          type: "warning",
                          title: "Copy did not work",
                          detail: "Please copy the order number manually from the success card.",
                        });
                      }
                    }}
                    className="secondary-btn inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
                  >
                    <Copy size={16} />
                    Copy order number
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleUpload} className="glass-card rounded-[32px] p-5 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.04em] text-white">Add and configure your files</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Accepted formats: PDF, DOCX, JPG, JPEG, PNG. Up to {MAX_FILES} files.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="secondary-btn inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                  >
                    <FolderOpen size={16} />
                    {items.length ? "Add more" : "Choose files"}
                  </button>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="danger-btn inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                    >
                      <Trash2 size={16} />
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={(event) => addFiles(event.target.files)}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={async (event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  await addFiles(event.dataTransfer.files);
                }}
                className={`mt-6 flex w-full flex-col items-center justify-center rounded-[30px] border-2 border-dashed px-6 py-12 text-center transition-all ${
                  isDragging
                    ? "border-blue-400 bg-blue-500/10 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                    : "border-slate-700 bg-slate-950/35 hover:border-blue-400/60 hover:bg-blue-500/6"
                }`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed)] text-white shadow-[0_20px_45px_rgba(79,70,229,0.3)]">
                  {analyzing ? <LoaderCircle className="animate-spin" size={28} /> : <UploadCloud size={28} />}
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  {analyzing ? "Analyzing your files..." : "Drop files here or browse your device"}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  {analyzing
                    ? "This usually takes a moment while we count PDF pages."
                    : "Each file gets its own print controls, preview context, and live price updates."}
                </p>
              </button>

              <div className="mt-6 space-y-4">
                {items.map((item, index) => {
                  const FileIcon = item.file.type.startsWith("image/") ? FileImage : FileText;

                  return (
                    <div key={item.id} className="soft-card rounded-[28px] p-4 md:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
                            <FileIcon size={22} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                File {index + 1}
                              </span>
                              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100">
                                {item.file.type === "application/pdf" ? `${item.detectedPages} detected pages` : "Default 1 page"}
                              </span>
                            </div>
                            <h3 className="mt-2 break-words text-base font-bold text-white md:text-lg">{item.file.name}</h3>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{formatFileSize(item.file.size)}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="danger-btn inline-flex items-center gap-2 self-start rounded-2xl px-3 py-2 text-sm font-semibold"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-4">
                        <label className="rounded-[22px] border border-slate-800 bg-slate-950/35 p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pages</span>
                          <input
                            type="number"
                            min="1"
                            value={item.pages}
                            onChange={(event) => updateItem(item.id, "pages", event.target.value)}
                            className="input-shell mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-semibold"
                          />
                        </label>

                        <label className="rounded-[22px] border border-slate-800 bg-slate-950/35 p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Copies</span>
                          <input
                            type="number"
                            min="1"
                            value={item.copies}
                            onChange={(event) => updateItem(item.id, "copies", event.target.value)}
                            className="input-shell mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-semibold"
                          />
                        </label>

                        <label className="rounded-[22px] border border-slate-800 bg-slate-950/35 p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Print type</span>
                          <select
                            value={item.color}
                            onChange={(event) => updateItem(item.id, "color", event.target.value)}
                            className="input-shell mt-2 w-full rounded-xl px-3 py-2.5 text-sm font-semibold"
                          >
                            <option value="color">Color - Rs.5 per page</option>
                            <option value="bw">B&W - Rs.2 per page</option>
                          </select>
                        </label>

                        <div className="rounded-[22px] border border-slate-800 bg-slate-950/35 p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Duplex</span>
                          <label className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/55 px-3 py-2.5 text-sm font-semibold text-slate-200">
                            <span>Print both sides</span>
                            <input
                              type="checkbox"
                              checked={item.doubleSided}
                              onChange={(event) => updateItem(item.id, "doubleSided", event.target.checked)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                          {item.pages * item.copies} print pages
                        </span>
                        <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-100">
                          About {getItemSheets(item)} sheet{getItemSheets(item) > 1 ? "s" : ""}
                        </span>
                        <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                          {formatCurrency(getItemTotal(item))}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="empty-state rounded-[28px] p-6 text-center">
                    <p className="text-sm font-semibold text-white">No files added yet</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Once you add files, each document gets its own print controls and price line.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-[28px] border border-slate-800 bg-slate-950/40 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Ready for checkout?</p>
                  <p className="mt-1 text-sm text-slate-400">You can still edit settings until the payment window opens.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || analyzing || items.length === 0}
                  className={`inline-flex min-w-[220px] items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition ${
                    loading || analyzing || items.length === 0
                      ? "cursor-not-allowed bg-slate-700/80"
                      : "primary-btn"
                  }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      {processingLabel || "Processing..."}
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Proceed to payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="glass-card overflow-hidden rounded-[32px]">
              <div className="border-b border-slate-800 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(79,70,229,0.22),rgba(15,23,42,0.95))] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">Live order summary</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-blue-100">Estimated total</p>
                    <p className="mt-1 text-4xl font-black tracking-tight">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-right backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Files</p>
                    <p className="text-2xl font-black">{items.length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6">
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="soft-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Print pages</p>
                    <p className="mt-2 text-2xl font-black text-white">{totalPages}</p>
                  </div>
                  <div className="soft-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated sheets</p>
                    <p className="mt-2 text-2xl font-black text-white">{totalSheets}</p>
                  </div>
                  <div className="soft-card rounded-[24px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Payment status</p>
                    <p className="mt-2 text-sm font-bold text-white">{loading ? "In progress" : "Not paid yet"}</p>
                  </div>
                </div>

                <div className="soft-card rounded-[24px] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-200">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Checkout confidence</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Secure payment through Razorpay, with backend signature verification before order creation.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Cost breakdown</h3>
                  <div className="mt-3 space-y-3">
                    {items.length === 0 ? (
                      <div className="empty-state rounded-[24px] p-5 text-sm leading-6">
                        Add files to see a clean cost breakdown here before payment.
                      </div>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="soft-card rounded-[24px] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="line-clamp-2 text-sm font-semibold text-white">{item.file.name}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.pages} page{item.pages > 1 ? "s" : ""} x {item.copies} cop
                                {item.copies > 1 ? "ies" : "y"} | {item.color === "color" ? "Color" : "B&W"}
                              </p>
                            </div>
                            <span className="text-sm font-black text-white">{formatCurrency(getItemTotal(item))}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}

export default Upload;
