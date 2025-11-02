import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Shield, 
  Package, 
  Users, 
  DollarSign, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2,
  Trash2,
  RefreshCw
} from "lucide-react";

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://print-ease-backend-new-qlv6.vercel.app/api/admin/orders", {
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        alert("Failed to fetch orders from server");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch orders from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      await axios.put(`https://print-ease-backend-new-qlv6.vercel.app/api/admin/orders/${id}/status`, 
        { status },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          }
        }
      );
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (id, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) return;
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      await axios.delete(`https://print-ease-backend-new-qlv6.vercel.app/api/admin/orders/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    ready: orders.filter(o => o.orderStatus === 'ready').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    totalUsers: new Set(orders.map(o => o.userId?._id).filter(Boolean)).size
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "delivered":
        return <CheckCircle className="text-green-600" size={18} />;
      case "ready":
        return <Package className="text-blue-600" size={18} />;
      case "processing":
        return <Loader2 className="text-yellow-600 animate-spin" size={18} />;
      case "pending":
        return <Clock className="text-orange-600" size={18} />;
      default:
        return <AlertCircle className="text-red-500" size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      delivered: "bg-green-100 text-green-700 border-green-300",
      ready: "bg-blue-100 text-blue-700 border-blue-300",
      processing: "bg-yellow-100 text-yellow-700 border-yellow-300",
      pending: "bg-orange-100 text-orange-700 border-orange-300"
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-xl font-semibold text-gray-700">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <Shield className="text-white" size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-3 px-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2">Manage all print orders and track statistics</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-blue-100 p-1.5 md:p-2 rounded-lg">
                <Package className="text-blue-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 truncate">Total Orders</p>
                <p className="text-lg md:text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-orange-100 p-1.5 md:p-2 rounded-lg">
                <Clock className="text-orange-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 truncate">Pending</p>
                <p className="text-lg md:text-xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-yellow-100 p-1.5 md:p-2 rounded-lg">
                <Loader2 className="text-yellow-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 truncate">Processing</p>
                <p className="text-lg md:text-xl font-bold text-yellow-600">{stats.processing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-blue-100 p-1.5 md:p-2 rounded-lg">
                <Package className="text-blue-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 truncate">Ready</p>
                <p className="text-lg md:text-xl font-bold text-blue-600">{stats.ready}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-green-100 p-1.5 md:p-2 rounded-lg">
                <CheckCircle className="text-green-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 truncate">Delivered</p>
                <p className="text-lg md:text-xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 md:p-4 shadow-lg border border-gray-100 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-purple-100 p-1.5 md:p-2 rounded-lg">
                <DollarSign className="text-purple-600" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs text-gray-600 truncate">Revenue</p>
                <p className="text-base md:text-xl font-bold text-purple-600">₹{stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 text-white">
              <FileText size={20} />
              <h3 className="text-lg md:text-xl font-bold">All Orders ({orders.length})</h3>
            </div>
            <button
              onClick={fetchOrders}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all flex items-center gap-2 text-sm md:text-base"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Package className="text-gray-400" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
              <p className="text-gray-600">Orders will appear here once customers place them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {orders.map((o) => (
                  <div 
                    key={o._id} 
                    className={`bg-white rounded-xl p-4 shadow-lg border border-gray-200 ${
                      updatingId === o._id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="text-indigo-600" size={18} />
                        <span className="text-sm font-bold text-gray-900">{o.orderNumber}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusBadge(o.orderStatus)}`}>
                        {getStatusIcon(o.orderStatus)}
                        <span className="text-[10px] font-semibold capitalize">{o.orderStatus}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="text-gray-400" size={14} />
                        <span className="text-gray-700">
                          {o.userId && o.userId.name ? o.userId.name : "Guest"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="text-green-600" size={14} />
                        <span className="font-bold text-green-600">₹{o.totalAmount}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      {o.files && o.files.map((file, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <a 
                            href={file.cloudinaryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1 mb-1"
                          >
                            <Download size={12} />
                            <span className="truncate">{file.filename}</span>
                          </a>
                          <div className="flex flex-wrap gap-1">
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {file.pages}p
                            </span>
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {file.copies}c
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              file.color === 'color' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {file.color === 'color' ? 'Color' : 'B&W'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        disabled={updatingId === o._id}
                        className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <button
                        onClick={() => deleteOrder(o._id, o.orderNumber)}
                        disabled={updatingId === o._id}
                        className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updatingId === o._id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden md:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Number</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Files</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o, idx) => (
                    <tr 
                      key={o._id} 
                      className={`hover:bg-indigo-50 transition-all ${
                        updatingId === o._id ? 'opacity-50' : ''
                      }`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="text-indigo-600" size={16} />
                          <span className="text-sm font-bold text-gray-900">{o.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="text-gray-400" size={16} />
                          <span className="text-sm text-gray-700 font-medium">
                            {o.userId && o.userId.name ? o.userId.name : "Guest"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="space-y-2 max-w-md">
                          {o.files && o.files.map((file, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <a 
                                href={file.cloudinaryUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-2 mb-2 group"
                              >
                                <Download size={14} className="group-hover:translate-y-1 transition-transform" />
                                <span className="truncate">{file.filename}</span>
                              </a>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">
                                  {file.pages} pages
                                </span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-medium">
                                  {file.copies} copies
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                  file.color === 'color' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {file.color === 'color' ? 'Color ₹5' : 'B&W ₹2'}
                                </span>
                                {file.doubleSided && (
                                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs font-medium">
                                    2-Sided
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="text-green-600" size={18} />
                          <span className="text-lg font-bold text-green-600">₹{o.totalAmount}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusBadge(o.orderStatus)}`}>
                          {getStatusIcon(o.orderStatus)}
                          <span className="text-xs font-semibold capitalize">{o.orderStatus}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => updateStatus(o._id, e.target.value)}
                            disabled={updatingId === o._id}
                            className="border-2 border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer hover:border-indigo-300"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => deleteOrder(o._id, o.orderNumber)}
                            disabled={updatingId === o._id}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Order"
                          >
                            {updatingId === o._id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
