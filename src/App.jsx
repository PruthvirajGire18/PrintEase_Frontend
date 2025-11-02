import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Track from "./pages/Track";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProtectedRoute from "./routes/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ✅ Make Upload & Track protected for logged-in users */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <Track />
            </ProtectedRoute>
          }
        />

        {/* Dashboard for users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Unauthorized Access */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </div>
  );
}

export default App;
