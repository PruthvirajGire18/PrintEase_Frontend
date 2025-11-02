import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, FileText, Download, Clock, CheckCircle, AlertCircle, Loader2, Receipt } from "lucide-react";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login to view your orders");
          setLoading(false);
          return;
        }

        const res = await axios.get("https://print-ease-backend-new-qlv6.vercel.app/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.data.success) {
          setOrders(res.data.orders || []);
        } else {
          console.error("API returned unsuccessful response:", res.data);
          alert(res.data.message || "Failed to fetch your orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        console.error("Error response:", err.response?.data);
        const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to fetch your orders. Please check your connection.";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />;
      case "ready":
        return <Package className="text-blue-600" size={20} />;
      case "processing":
        return <Loader2 className="text-yellow-600 animate-spin" size={20} />;
      default:
        return <AlertCircle className="text-red-500" size={20} />;
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-xl font-semibold text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <Receipt className="text-white" size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-3 px-2">
            Your Orders
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2">Track and manage all your print orders</p>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100 animate-scale-in">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mb-4 md:mb-6">
              <Package className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">Start by uploading your first document!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {orders.map((order, idx) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden card-hover animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 md:p-4 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Package size={18} />
                      <span className="font-bold text-xs md:text-sm truncate">{order.orderNumber}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)} bg-white`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="text-[10px] md:text-xs font-semibold capitalize">{order.orderStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4 md:p-6">
                  {/* Amount */}
                  <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b">
                    <span className="text-gray-600 font-medium text-sm md:text-base">Total Amount</span>
                    <span className="text-xl md:text-2xl font-bold text-blue-600">₹{order.totalAmount}</span>
                  </div>

                  {/* Files */}
                  <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileText size={14} />
                      Files ({order.files?.length || 0})
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {order.files && order.files.map((file, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-2 md:p-3 border border-gray-200">
                          <a 
                            href={file.cloudinaryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 mb-1 md:mb-2 group"
                          >
                            <Download size={12} className="group-hover:translate-y-1 transition-transform" />
                            <span className="truncate">{file.filename}</span>
                          </a>
                          <div className="flex flex-wrap gap-1 md:gap-1.5">
                            <span className="bg-blue-100 text-blue-700 px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium">
                              {file.pages} pages
                            </span>
                            <span className="bg-green-100 text-green-700 px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium">
                              {file.copies} copies
                            </span>
                            <span className={`px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium ${
                              file.color === 'color' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {file.color === 'color' ? 'Color ₹5' : 'B&W ₹2'}
                            </span>
                            {file.doubleSided && (
                              <span className="bg-orange-100 text-orange-700 px-1.5 md:px-2 py-0.5 rounded-md text-[10px] md:text-xs font-medium">
                                2-Sided
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Pages */}
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t">
                    <span className="text-gray-600 text-xs md:text-sm">Total Pages</span>
                    <span className="font-bold text-gray-800 text-sm md:text-base">{order.totalPages}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
