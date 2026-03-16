import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/list", { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = login(username.trim(), password);

    if (success) {
      setUsername("");
      setPassword("");
    } else {
      setError("Invalid credentials. Try testuser / Test123");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">

      <div className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-2">
            Employee Insight
          </h1>

        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-300 shadow-2xl rounded-3xl overflow-hidden">

          <form onSubmit={handleSubmit} className="p-8 sm:p-10">

            {/* Credentials Info */}
            <div className="mb-8 p-4 rounded-2xl bg-gray-100 border border-gray-300">
              <p className="text-xs sm:text-sm text-gray-800 mb-2 font-medium">
                Demo Credentials:
              </p>

              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Username</p>
                  <p className="font-mono font-bold text-gray-900">testuser</p>
                </div>

                <div>
                  <p className="text-gray-600">Password</p>
                  <p className="font-mono font-bold text-gray-900">Test123</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4 mb-8">

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-black focus:ring-2 focus:ring-black/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-black focus:ring-2 focus:ring-black/20 outline-none"
                />
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-xl bg-black text-white font-semibold shadow-lg hover:bg-gray-900 hover:scale-[1.02] transition-all duration-200 disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Need help?{" "}
              <a href="#" className="font-semibold text-black hover:text-gray-800">
                Contact support
              </a>
            </p>

          </form>

        </div>

      </div>
    </div>
  );
}