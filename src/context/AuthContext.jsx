// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// 1️⃣ Create context
const AuthContext = createContext();

// 2️⃣ AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: null,
    role: null,
    name: null,
  });
  const [loading, setLoading] = useState(true);

  // 3️⃣ Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    if (token && role) {
      setUser({ token, role, name });
    }
    setLoading(false);
  }, []);

  // 4️⃣ Login function - navigation will be handled by the component calling this
  const login = ({ token, role, name }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name || "");

    setUser({ token, role, name: name || "" });

    // Return the redirect path so the calling component can handle navigation
    return role === "admin" ? "/admin" : "/dashboard";
  };

  // 5️⃣ Logout function - navigation will be handled by the component calling this
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    setUser({ token: null, role: null, name: null });
    
    // Return the redirect path
    return "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6️⃣ Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
