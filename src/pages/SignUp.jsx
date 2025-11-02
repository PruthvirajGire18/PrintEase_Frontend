import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserPlus, User, Mail, Lock, Loader2 } from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/signup", { 
        name, 
        email, 
        password, 
        role: "user" 
      });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 px-4 py-8 md:py-12">
      <div className="bg-white shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <UserPlus className="text-white" size={24} />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h2>
          <p className="text-sm md:text-base text-gray-600">Join PrintEase and start printing today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 md:space-y-5">
          <div className="space-y-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={14} className="text-purple-600" />
              Full Name
            </label>
            <input 
              type="text" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
              className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={14} className="text-purple-600" />
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={14} className="text-purple-600" />
              Password
            </label>
            <input 
              type="password" 
              placeholder="Create a password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-3 md:py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] transform"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing up...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <span 
              className="text-purple-600 font-semibold cursor-pointer hover:text-purple-700 hover:underline transition-colors"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
