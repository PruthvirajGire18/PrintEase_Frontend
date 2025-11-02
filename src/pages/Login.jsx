import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("https://print-ease-backend-new-qlv6.vercel.app/api/login", { email, password });
      console.log("Login response:", res.data);
      
      if (res.data.success && res.data.token && res.data.user) {
        const redirectPath = login({ 
          token: res.data.token, 
          role: res.data.user.role, 
          name: res.data.user.name || "" 
        });
        navigate(redirectPath);
      } else {
        alert("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error details:", err.response?.data);
      alert(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 md:py-12">
      <div className="bg-white shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-3 md:mb-4 shadow-lg">
            <LogIn className="text-white" size={24} />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-sm md:text-base text-gray-600">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div className="space-y-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={14} className="text-blue-600" />
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={14} className="text-blue-600" />
              Password
            </label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-3 md:p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm md:text-base"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-3 md:py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base ${
              loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] transform"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <span 
              className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline transition-colors"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
