
import { NavLink } from "react-router-dom";

import {
  Home,
  CalendarDays,
  Users,
  Trophy,
  UserRound,
} from "lucide-react";

const items = [
  { label: "Home", path: "/", icon: Home },
  { label: "Matches", path: "/matches", icon: CalendarDays },
  { label: "Teams", path: "/teams", icon: Users },
  { label: "Tournaments", path: "/tournaments", icon: Trophy },
  { label: "Profile", path: "/profile", icon: UserRound },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 shadow-[0_-5px_25px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:hidden">

      <div
        className="mx-auto grid max-w-2xl grid-cols-5 px-2 pt-2"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `group relative flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-green-700"
                    : "text-gray-400 hover:bg-green-50 hover:text-green-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute -top-2 h-1 w-8 rounded-full bg-green-600 shadow-sm shadow-green-300" />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-green-50"
                        : "group-hover:-translate-y-1"
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={isActive ? 2.6 : 2}
                      className="transition-transform duration-300 group-active:scale-90"
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] transition-all duration-200 ${
                      isActive
                        ? "font-extrabold"
                        : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
