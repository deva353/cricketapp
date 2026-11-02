
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  UserRound,
  Trophy,
  CalendarDays,
  BarChart3,
  Settings,
  ShieldCheck,
  Plus,
  ChevronRight,
  Activity,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Matches",
    path: "/matches",
    icon: CalendarDays,
  },
  {
    title: "Teams",
    path: "/teams",
    icon: ShieldCheck,
  },
  {
    title: "Players",
    path: "/players",
    icon: Users,
  },
  {
    title: "Tournaments",
    path: "/tournaments",
    icon: Trophy,
  },
  {
    title: "Leaderboard",
    path: "/leaderboard",
    icon: BarChart3,
  },
];

const accountItems = [
  {
    title: "My Profile",
    path: "/profile",
    icon: UserRound,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function NavigationItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
          isActive
            ? "translate-x-1 bg-green-600 text-white shadow-lg shadow-green-950/30"
            : "text-green-100/70 hover:translate-x-1 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-green-200" />
          )}

          <Icon
            size={19}
            strokeWidth={isActive ? 2.5 : 2}
            className="shrink-0 transition-transform duration-300 group-hover:scale-110"
          />

          <span className="flex-1 text-sm font-semibold">
            {item.title}
          </span>

          <ChevronRight
            size={15}
            className={`transition-all duration-300 ${
              isActive
                ? "translate-x-0 opacity-100"
                : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col overflow-y-auto border-r border-white/10 bg-gradient-to-b from-[#102d1e] via-[#123b27] to-[#0b2116] text-white shadow-xl lg:flex">

      {/* Logo and branding */}
      <div className="border-b border-white/10 px-6 py-7">
        <NavLink to="/" className="group flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-2xl shadow-lg shadow-green-950/40 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
            🏏
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              Gully Cricket
            </h1>

            <p className="mt-1 text-[11px] font-medium tracking-wider text-green-300">
              PLAY. SCORE. COMPETE.
            </p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-7">

        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/60">
          Main Menu
        </p>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavigationItem key={item.path} item={item} />
          ))}
        </nav>

        <div className="my-7 border-t border-white/10" />

        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-green-300/60">
          Account
        </p>

        <nav className="space-y-2">
          {accountItems.map((item) => (
            <NavigationItem key={item.path} item={item} />
          ))}
        </nav>

      </div>

      {/* Create Match promotional card */}
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl border border-green-400/20 bg-gradient-to-br from-green-700/70 to-green-950/80 p-4">

          <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[12px] border-white/5" />

          <div className="relative z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-green-200">
              <Activity size={19} />
            </div>

            <h3 className="mt-4 text-sm font-bold">
              Ready for a match?
            </h3>

            <p className="mt-1 text-xs leading-5 text-green-100/70">
              Create your next cricket match and start scoring.
            </p>

            <NavLink
              to="/create-match"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-green-400 px-3 py-2.5 text-xs font-bold text-green-950 shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-green-300 hover:shadow-lg active:scale-95"
            >
              <Plus size={16} />
              Create Match
            </NavLink>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-green-200/40">
          Gully Cricket Management
        </p>
      </div>

    </aside>
  );
}
