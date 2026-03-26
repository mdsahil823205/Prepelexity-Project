import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useAuth from "../hooks/useAuth";
import { PiEyeLight } from "react-icons/pi";
import { PiEyeSlash } from "react-icons/pi";
import { BiError } from "react-icons/bi";
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
        <div className="w-full max-w-md rounded-2xl border border-[#F3F4F4]/40 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur sm:p-8">
          {/* Header */}
          <h1 className="text-2xl font-bold text-[#F3F4F4] sm:text-3xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Sign in with your email and password.
          </p>

          <form onSubmit={submitForm} className="mt-8 space-y-5">
            {/* Error Message */}
            {loginError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span>
                  <BiError className="size-5" /> {loginError}
                </span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none focus:border-[#F7B980]"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 pr-12 text-zinc-100 outline-none focus:border-[#F7B980]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[calc(50%-10px)] text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? (
                    <PiEyeSlash className="size-5" />
                  ) : (
                    <PiEyeLight className="size-5" />
                  )}
                </button>
              </div>
            <p className="mt-1.5 text-xs text-zinc-400">password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.</p>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#F3F4F4] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#e4dbcb] active:scale-99 disabled:opacity-50"
            >
              {loading ? <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent"></div>
                <span>Logging in...</span>
              </div> : "Login"}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm text-zinc-300">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#F7B980] hover:text-[#DFD0B8]"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
