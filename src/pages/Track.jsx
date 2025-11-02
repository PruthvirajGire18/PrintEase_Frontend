import React, { useState } from "react";
import axios from "axios";
import { Search, Package, X, Loader2, CheckCircle, AlertCircle, FileText, Download, Receipt, User } from "lucide-react";

function Track() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    const trimmedOrderNumber = orderNumber.trim();
    
    if (!trimmedOrderNumber) {
      setError("Please enter an Order Number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);
      
      // Encode the order number for URL and trim it
      const encodedOrderNumber = encodeURIComponent(trimmedOrderNumber);
      console.log("🔍 Searching for order:", trimmedOrderNumber);
      
      const res = await axios.get(`http://localhost:5000/api/track/${encodedOrderNumber}`);
      
      console.log("📦 Response:", res.data);
      
      if (res.data.success && res.data.order) {
        setOrder(res.data.order);
        setError("");
      } else {
        setOrder(null);
        setError(res.data.error || "Order not found!");
      }
    } catch (err) {
      console.error("❌ Track error:", err);
      setOrder(null);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Order not found! Please check the Order Number and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrderNumber("");
    setOrder(null);
    setError("");
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "delivered":
        return <CheckCircle className="text-green-600" size={24} />;
      case "ready":
        return <Package className="text-blue-600" size={24} />;
      case "processing":
        return <Loader2 className="text-yellow-600 animate-spin" size={24} />;
      default:
        return <AlertCircle className="text-red-500" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-300";
      case "ready":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "processing":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-red-100 text-red-700 border-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <Search className="text-white" size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-3 px-2">
            Track Your Order
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2">Enter your order number to check the status</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6 border border-gray-100 animate-scale-in">
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter Order Number"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value);
                  setError("");
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-sm md:text-base"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleTrack}
                disabled={loading}
                className={`flex-1 sm:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] transform"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span className="hidden sm:inline">Tracking...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Track</span>
                  </>
                )}
              </button>
              {orderNumber && (
                <button
                  onClick={handleReset}
                  className="px-3 md:px-6 py-3 md:py-4 rounded-xl font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200 shadow-lg flex items-center gap-2 text-sm md:text-base"
                >
                  <X size={18} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Package size={28} />
                  <div>
                    <p className="text-sm opacity-90">Order Number</p>
                    <p className="text-xl font-bold">{order.orderNumber}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="font-semibold capitalize text-sm">{order.orderStatus}</span>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="p-4 md:p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 border border-blue-100">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Receipt size={16} />
                    <span className="text-xs md:text-sm font-medium">Total Amount</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600">₹{order.totalAmount}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 md:p-4 border border-purple-100">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FileText size={16} />
                    <span className="text-xs md:text-sm font-medium">Total Pages</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-purple-600">{order.totalPages}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                <span className="text-gray-700 font-medium">Payment Status</span>
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                  <CheckCircle size={16} />
                  Paid
                </span>
              </div>

              {order.userId && order.userId.name && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <User className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold text-gray-800">{order.userId.name}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Files ({order.files?.length || 0})
                </h3>
                <div className="space-y-3">
                  {order.files && order.files.map((file, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-all">
                      <a 
                        href={file.cloudinaryUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 mb-3 group"
                      >
                        <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                        {file.filename}
                      </a>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">
                          {file.pages} pages
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium">
                          {file.copies} copies
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          file.color === 'color' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {file.color === 'color' ? 'Color ₹5' : 'B&W ₹2'}
                        </span>
                        {file.doubleSided && (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-medium">
                            2-Sided
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Track;
