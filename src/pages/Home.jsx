import React from "react";
import { Link } from "react-router-dom";
import { Upload, Search, Shield, Zap, Clock, CreditCard } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-20">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              ✨ Professional Printing Services
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight px-2">
            Welcome to PrintEase
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Upload your documents online, choose print settings, pay easily, and track your orders instantly with our seamless platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-12 md:mb-16 px-4">
            <Link 
              to="/upload" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
            >
              <Upload size={18} className="group-hover:translate-y-[-2px] transition-transform" />
              Upload Documents
            </Link>
            <Link 
              to="/track" 
              className="group bg-white border-2 border-blue-600 text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto"
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform" />
              Track Order
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto w-full mt-8 md:mt-16 px-4">
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <Zap className="text-blue-600" size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Fast Processing</h3>
            <p className="text-sm md:text-base text-gray-600">Quick upload and instant order processing for your convenience.</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="bg-purple-100 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <CreditCard className="text-purple-600" size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Secure Payments</h3>
            <p className="text-sm md:text-base text-gray-600">Safe and secure payment gateway with multiple options.</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 sm:col-span-2 md:col-span-1">
            <div className="bg-green-100 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <Clock className="text-green-600" size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Real-time Tracking</h3>
            <p className="text-sm md:text-base text-gray-600">Track your order status in real-time with unique order numbers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
