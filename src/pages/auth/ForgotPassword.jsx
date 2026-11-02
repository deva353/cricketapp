import { useState } from "react";
import { Link } from "react-router-dom";

import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    setMessage(
      "Password reset will be available after backend integration."
    );

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f5] p-5">

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="w-14 h-14 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-6">
          <Mail size={27} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Forgot Password?
        </h1>

        <p className="text-gray-500 text-sm mt-3">
          Enter your registered email address to begin
          the password recovery process.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">

          <label className="block text-sm font-semibold mb-2">
            Email Address
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-xl p-4 outline-none focus:border-green-600"
          />

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-bold py-4 rounded-xl mt-5 hover:bg-green-800"
          >
            Continue
          </button>

        </form>

        {message && (
          <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg mt-4">
            {message}
          </p>
        )}

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-green-700 font-semibold mt-6"
        >
          <ArrowLeft size={17} />
          Back to Login
        </Link>

      </div>

    </div>
  );
}