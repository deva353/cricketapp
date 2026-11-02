import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    setError("");

    const result = login(email.trim(), password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* Left section */}

      <div className="hidden lg:flex bg-[#10271b] text-white p-12 flex-col justify-between">

        <div>
          <Link to="/" className="flex items-center gap-3">

            <div className="bg-green-500 p-3 rounded-xl">
              <Trophy size={27} />
            </div>

            <h1 className="text-2xl font-bold">
              Gully Cricket
            </h1>

          </Link>
        </div>

        <div>

          <p className="text-green-400 font-semibold tracking-widest text-sm">
            YOUR CRICKET COMMUNITY
          </p>

          <h2 className="text-5xl font-bold leading-tight mt-5">
            Every Run.
            <br />
            Every Wicket.
            <br />
            Every Victory.
          </h2>

          <p className="text-gray-300 mt-6 max-w-md">
            Manage your teams, organize matches and
            follow every moment of your cricket journey.
          </p>

        </div>

        <p className="text-gray-400 text-sm">
          © 2026 Gully Cricket
        </p>

      </div>

      {/* Login form */}

      <div className="flex items-center justify-center p-6 md:p-12">

        <div className="w-full max-w-md">

          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-green-800">
              🏏 Gully Cricket
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back!
          </h2>

          <p className="text-gray-500 mt-2">
            Login to continue your cricket journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <div>

              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">

                <Mail size={19} className="text-gray-400" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-4 outline-none"
                />

              </div>

            </div>

            <div>

              <div className="flex justify-between mb-2">

                <label className="text-sm font-semibold">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-green-700 font-semibold"
                >
                  Forgot password?
                </Link>

              </div>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">

                <Lock size={19} className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-4 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />
                  }
                </button>

              </div>

            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl transition"
            >
              Login to Account
            </button>

          </form>

          <p className="text-center text-gray-500 mt-7">
            Don't have an account?

            <Link
              to="/register"
              className="text-green-700 font-bold ml-1"
            >
              Create Account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}