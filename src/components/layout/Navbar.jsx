
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
  Settings,
  Menu,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = user?.name || "Player";
  const userRole = user?.role || "Player";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">

      {/* Welcome section */}
      <div className="min-w-0">
        <h2 className="truncate text-base font-extrabold text-gray-900 sm:text-lg">
          Welcome back, {userName}!
        </h2>

        <p className="mt-1 hidden text-xs text-gray-500 sm:block">
          Manage your matches and teams.
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Notification icon - visual indicator only */}
        <div
          title="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-green-50 hover:text-green-700"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </div>

        {/* Divider */}
        <div className="hidden h-9 w-px bg-gray-200 sm:block" />

        {/* User profile dropdown */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
            className="flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 hover:bg-green-50 sm:gap-3 sm:px-2"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-lg font-bold text-white shadow-sm transition-transform duration-200 hover:scale-105">
              {initial}
            </div>

            {/* User information */}
            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-bold text-gray-800">
                {userName}
              </p>

              <p className="text-xs capitalize text-gray-500">
                {userRole}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-gray-400 transition-transform duration-200 sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl animate-fade-in">

                {/* Profile information */}
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="truncate text-sm font-bold text-gray-800">
                    {userName}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {user?.email || "Gully Cricket Member"}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-green-50 hover:text-green-700"
                >
                  <UserRound size={17} />
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-green-50 hover:text-green-700"
                >
                  <Settings size={17} />
                  Settings
                </Link>

                <div className="my-1 border-t border-gray-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
