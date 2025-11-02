import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Upload, Search, LayoutDashboard, Shield, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user.token;

  const handleLogout = () => {
    const redirectPath = logout();
    navigate(redirectPath);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl sticky top-0 z-50 w-full left-0 right-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center h-16 md:h-20 w-full">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-all">
            <Upload className="text-white" size={24} />
          </div>
          <span className="text-xl md:text-2xl font-extrabold tracking-wide text-white">PrintEase</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2 font-semibold">
          {!isLoggedIn ? (
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-2 text-white"
            >
              <User size={18} />
              Login
            </Link>
          ) : (
            <>
              <Link 
                to="/upload" 
                className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-2 text-white"
              >
                <Upload size={18} />
                Upload
              </Link>
              <Link 
                to="/track" 
                className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-2 text-white"
              >
                <Search size={18} />
                Track
              </Link>
              {user.role === "user" && (
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-2 text-white"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link 
                  to="/admin" 
                  className="px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex items-center gap-2 text-white"
                >
                  <Shield size={18} />
                  Admin
                </Link>
              )}
              {user.name && (
                <div className="px-3 py-1 mx-2 bg-white bg-opacity-20 rounded-full text-sm text-white font-medium">
                  👤 {user.name}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white px-6 py-4 space-y-3 font-medium border-t border-blue-500">
          {!isLoggedIn ? (
            <Link 
              to="/login" 
              className="block px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          ) : (
            <>
              <Link 
                to="/upload" 
                className="block px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Upload size={18} />
                Upload
              </Link>
              <Link 
                to="/track" 
                className="block px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Search size={18} />
                Track
              </Link>
              {user.role === "user" && (
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link 
                  to="/admin" 
                  className="block px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <Shield size={18} />
                  Admin
                </Link>
              )}
              {user.name && (
                <div className="px-4 py-2 text-sm bg-white bg-opacity-20 rounded-lg text-white">
                  👤 {user.name}
                </div>
              )}
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="w-full px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
