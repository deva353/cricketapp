
import { useEffect, useState } from "react";
import { User, Mail, Phone, Shield, Save, Lock } from "lucide-react";
import { getStorage, setStorage } from "../utils/storage";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStorage("gully_user", null);

    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "player",
      });
    }
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const updateProfile = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const currentUser = getStorage("gully_user", null);
    const users = getStorage("gully_users", []);

    if (!currentUser) {
      setError("User session not found. Please log in again.");
      return;
    }

    if (!profile.name.trim() || !profile.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    const emailExists = users.some(
      (user) =>
        user.email?.toLowerCase() === profile.email.trim().toLowerCase() &&
        user.id !== currentUser.id
    );

    if (emailExists) {
      setError("This email is already registered.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: profile.name.trim(),
      email: profile.email.trim().toLowerCase(),
      phone: profile.phone.trim(),
    };

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id ? updatedUser : user
    );

    // Keep the logged-in user and users list synchronized.
    if (!users.some((user) => user.id === currentUser.id)) {
      updatedUsers.push(updatedUser);
    }

    setStorage("gully_user", updatedUser);
    setStorage("gully_users", updatedUsers);

    setMessage("Profile updated successfully. Refreshing the page...");
    window.location.reload();
  };

  const updatePassword = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const currentUser = getStorage("gully_user", null);
    const users = getStorage("gully_users", []);

    if (!currentUser) {
      setError("Please log in again.");
      return;
    }

    if (!passwords.currentPassword || !passwords.newPassword) {
      setError("Enter your current and new password.");
      return;
    }

    if (currentUser.password !== passwords.currentPassword) {
      setError("Current password is incorrect.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      password: passwords.newPassword,
    };

    const updatedUsers = users.map((user) =>
      user.id === currentUser.id ? updatedUser : user
    );

    setStorage("gully_user", updatedUser);
    setStorage("gully_users", updatedUsers);

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setMessage("Password changed successfully.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information and password.
        </p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={updateProfile}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 text-green-700">
            <User size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-500">Update your account details.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Full name
            </span>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                className="form-control pl-10"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Email address
            </span>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                className="form-control pl-10"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Phone number
            </span>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                className="form-control pl-10"
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="Enter phone number"
              />
            </div>
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Account role
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700">
              <Shield size={18} />
              <span className="capitalize">{profile.role || "Player"}</span>
              <span className="ml-auto text-xs text-gray-400">Managed by admin</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
        >
          <Save size={18} /> Save Profile
        </button>
      </form>

      <form
        onSubmit={updatePassword}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3 text-blue-700">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">
              Use a password with at least 6 characters.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Current password
            </span>
            <input
              className="form-control"
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              New password
            </span>
            <input
              className="form-control"
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              minLength={6}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Confirm new password
            </span>
            <input
              className="form-control"
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              minLength={6}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
        >
          <Lock size={18} /> Update Password
        </button>
      </form>
    </div>
  );
}
