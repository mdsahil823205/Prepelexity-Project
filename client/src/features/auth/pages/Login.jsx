import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { loading } = useSelector((state) => state.auth);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Submit Handler
  const submitForm = async (event) => {
    event.preventDefault();
    setLoginError("");

    const payload = { email, password };
    const result = await handleLogin(payload);

    if (result) {
      navigate("/");
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">
          
          {/* Header */}
          <h1 className="text-2xl font-bold text-[#31b8c6] sm:text-3xl">Welcome Back</h1>
          <p className="mt-2 text-sm text-zinc-300">Sign in with your email and password.</p>

          <form onSubmit={submitForm} className="mt-8 space-y-5">
            
            {/* Error Message */}
            {loginError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span>⚠️ {loginError}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none focus:border-[#31b8c6]"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 pr-12 text-zinc-100 outline-none focus:border-[#31b8c6]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm text-zinc-300">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[#31b8c6] hover:text-[#45c7d4]">
              Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
