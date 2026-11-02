import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  UserRound,
  Mail,
  Lock,
  Trophy,
  Eye,
  EyeOff,
  Phone
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Register() {

  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "player"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    setError("");

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    alert("Registration successful! Please login.");

    navigate("/login");

  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">

      {/* Branding */}

      <div className="hidden lg:flex bg-[#10271b] text-white p-12 flex-col justify-between">

        <Link to="/" className="flex items-center gap-3">

          <div className="bg-green-500 p-3 rounded-xl">
            <Trophy size={27} />
          </div>

          <h1 className="text-2xl font-bold">
            Gully Cricket
          </h1>

        </Link>

        <div>

          <p className="text-green-400 font-semibold tracking-widest text-sm">
            JOIN THE COMMUNITY
          </p>

          <h2 className="text-5xl font-bold leading-tight mt-5">
            Create Your
            <br />
            Cricket Story.
          </h2>

          <p className="text-gray-300 mt-6 max-w-md">
            Join your friends, create teams and compete
            in local cricket tournaments.
          </p>

        </div>

        <p className="text-gray-400 text-sm">
          © 2026 Gully Cricket
        </p>

      </div>

      {/* Registration form */}

      <div className="flex items-center justify-center p-6 md:p-12">

        <div className="w-full max-w-md">

          <div className="lg:hidden text-center mb-7">
            <h1 className="text-3xl font-bold text-green-800">
              🏏 Gully Cricket
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Create an account
          </h2>

          <p className="text-gray-500 mt-2">
            Register to start playing cricket.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">

            {/* Name */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Full Name
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">
                <UserRound size={18} className="text-gray-400" />

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full p-3 outline-none"
                />
              </div>
            </div>

            {/* Email */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">
                <Mail size={18} className="text-gray-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full p-3 outline-none"
                />
              </div>
            </div>

            {/* Phone */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Mobile Number
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">
                <Phone size={18} className="text-gray-400" />

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="w-full p-3 outline-none"
                />
              </div>
            </div>

            {/* Role */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Register As
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 outline-none bg-white"
              >
                <option value="player">Player</option>
                <option value="captain">Captain</option>
                <option value="scorer">Scorer</option>
              </select>
            </div>

            {/* Password */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">

                <Lock size={18} className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Create password"
                  className="w-full p-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />
                  }
                </button>

              </div>
            </div>

            {/* Confirm password */}

            <div>
              <label className="block text-sm font-semibold mb-2">
                Confirm Password
              </label>

              <div className="flex items-center border border-gray-300 rounded-xl px-4">

                <Lock size={18} className="text-gray-400" />

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                  className="w-full p-3 outline-none"
                />

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
              Create Account
            </button>

          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?

            <Link
              to="/login"
              className="text-green-700 font-bold ml-1"
            >
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}