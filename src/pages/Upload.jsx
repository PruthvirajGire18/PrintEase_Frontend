import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

import API from "../api/api";

function Upload() {
  const [files, setFiles] = useState([]);
  const [filePages, setFilePages] = useState({});
  const [fileCopies, setFileCopies] = useState({});
  const [fileColor, setFileColor] = useState({});
  const [fileDoubleSided, setFileDoubleSided] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const pagesObj = {};
    const copiesObj = {};
    const colorObj = {};
    const doubleSidedObj = {};

    for (let i = 0; i < selectedFiles.length; i += 1) {
      const pageCount = await getPDFPageCount(selectedFiles[i]);
      pagesObj[i] = pageCount;
      copiesObj[i] = 1;
      colorObj[i] = "color";
      doubleSidedObj[i] = false;
    }

    setFilePages(pagesObj);
    setFileCopies(copiesObj);
    setFileColor(colorObj);
    setFileDoubleSided(doubleSidedObj);
  };

  const removeFile = (index) => {
    const remainingFiles = files.filter((_, i) => i !== index);
    const reindexState = (state) =>
      remainingFiles.reduce((acc, _, newIndex) => {
        const oldIndex = newIndex >= index ? newIndex + 1 : newIndex;

        if (state[oldIndex] !== undefined) {
          acc[newIndex] = state[oldIndex];
        }

        return acc;
      }, {});

    setFiles(remainingFiles);
    setFilePages(reindexState(filePages));
    setFileCopies(reindexState(fileCopies));
    setFileColor(reindexState(fileColor));
    setFileDoubleSided(reindexState(fileDoubleSided));
  };

  const handlePagesChange = (index, pages) => {
    setFilePages({ ...filePages, [index]: Number.parseInt(pages, 10) || 1 });
  };

  const handleCopiesChange = (index, copies) => {
    setFileCopies({ ...fileCopies, [index]: Number.parseInt(copies, 10) || 1 });
  };

  const handleColorChange = (index, color) => {
    setFileColor({ ...fileColor, [index]: color });
  };

  const handleDoubleSidedChange = (index, doubleSided) => {
    setFileDoubleSided({ ...fileDoubleSided, [index]: doubleSided });
  };

  const buildFilesData = () =>
    files.map((file, index) => ({
      name: file.name,
      pages: filePages[index] || 1,
      copies: fileCopies[index] || 1,
      color: fileColor[index] || "color",
      doubleSided: fileDoubleSided[index] || false,
    }));

  const calculateTotalAmount = () =>
    files.reduce((sum, file, index) => {
      const pages = filePages[index] || 1;
      const copies = fileCopies[index] || 1;
      const color = fileColor[index] || "color";
      const pricePerPage = color === "color" ? 5 : 2;
      return sum + pages * copies * pricePerPage;
    }, 0);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      alert("Razorpay checkout is not loaded. Please refresh and try again.");
      return;
    }

    const formElement = e.currentTarget;
    const filesData = buildFilesData();

    try {
      setLoading(true);

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
        description: `Print Order - ${files.length} file(s)`,
        order_id: paymentOrder.order.id,
        handler: async (response) => {
          try {
            const formData = new FormData();

            files.forEach((file) => {
              formData.append("files", file);
            });

            formData.append("filesData", JSON.stringify(filesData));
            formData.append("paymentId", response.razorpay_payment_id);
            formData.append("razorpayOrderId", response.razorpay_order_id);
            formData.append("razorpaySignature", response.razorpay_signature);

            const uploadRes = await API.post("/upload", formData);

            if (!uploadRes.data?.success || !uploadRes.data?.order?.orderNumber) {
              throw new Error("Order creation failed after payment.");
            }

            alert(
              `Payment successful.\nOrder Number: ${uploadRes.data.order.orderNumber}\nPayment ID: ${response.razorpay_payment_id}`
            );

            setFiles([]);
            setFilePages({});
            setFileCopies({});
            setFileColor({});
            setFileDoubleSided({});
            formElement.reset();
          } catch (uploadErr) {
            console.error("Upload error:", uploadErr);

            const uploadMessage =
              uploadErr.response?.data?.message ||
              uploadErr.response?.data?.error ||
              uploadErr.message ||
              "Payment was captured but upload failed.";

            alert(`${uploadMessage}\nPayment ID: ${response.razorpay_payment_id}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: localStorage.getItem("name") || "Guest",
          contact: "9999999999",
          email: "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        alert(`Payment failed.\n${response.error.description}`);
        setLoading(false);
      });

      rzp.on("payment.authorized", (response) => {
        console.log("Payment authorized:", response);
      });

      rzp.on("error", (error) => {
        console.error("Razorpay error:", error);
        alert(`Razorpay error: ${error.description || "Unknown error"}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment start error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to start payment.";

      alert(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-3 px-2">
            Upload Documents
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2">Upload your files and customize print settings</p>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-6 lg:p-8 animate-scale-in">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Files (PDF, DOCX, JPG, PNG)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.png"
                  onChange={handleFileChange}
                  multiple
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    Selected Files ({files.length})
                  </p>

                  {files.map((file, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <svg className="text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all ml-2"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-2 md:space-y-3 pt-2 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                          <div>
                            <label className="text-[10px] md:text-xs font-semibold text-gray-600 mb-1 block">Pages</label>
                            <input
                              type="number"
                              min="1"
                              value={filePages[index] || 1}
                              onChange={(event) => handlePagesChange(index, event.target.value)}
                              className="w-full border-2 border-gray-200 p-1.5 md:p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs md:text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] md:text-xs font-semibold text-gray-600 mb-1 block">Copies</label>
                            <input
                              type="number"
                              min="1"
                              value={fileCopies[index] || 1}
                              onChange={(event) => handleCopiesChange(index, event.target.value)}
                              className="w-full border-2 border-gray-200 p-1.5 md:p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs md:text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
                          <div className="flex-1 w-full sm:w-auto min-w-[120px]">
                            <label className="text-[10px] md:text-xs font-semibold text-gray-600 mb-1 block">Print Type</label>
                            <select
                              value={fileColor[index] || "color"}
                              onChange={(event) => handleColorChange(index, event.target.value)}
                              className="w-full border-2 border-gray-200 p-1.5 md:p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs md:text-sm"
                            >
                              <option value="color">Color Rs.5/page</option>
                              <option value="bw">B&amp;W Rs.2/page</option>
                            </select>
                          </div>

                          <label className="flex items-center gap-2 mt-4 sm:mt-6 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fileDoubleSided[index] || false}
                              onChange={(event) => handleDoubleSidedChange(index, event.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs md:text-sm font-medium text-gray-700">2-Sided</span>
                          </label>

                          <div className="bg-blue-100 px-3 md:px-4 py-1.5 md:py-2 rounded-lg w-full sm:w-auto sm:ml-auto">
                            <span className="text-xs md:text-sm font-bold text-blue-700">
                              Rs.
                              {((filePages[index] || 1) * (fileCopies[index] || 1) * ((fileColor[index] || "color") === "color" ? 5 : 2))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 rounded-xl text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                  <span className="text-xs md:text-sm opacity-90">Total Amount</span>
                  <span className="text-2xl md:text-3xl font-bold">Rs.{calculateTotalAmount().toFixed(2)}</span>
                </div>
                <p className="text-[10px] md:text-xs opacity-75">
                  {files.length} file(s) | Color: Rs.5/page | B&amp;W: Rs.2/page
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || files.length === 0}
              className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                loading || files.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transform"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Proceed to Payment
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Upload;
