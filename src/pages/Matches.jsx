
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Plus,
  Search,
  CalendarDays,
  MapPin,
  Trophy,
  Trash2,
  Clock,
  CircleDot,
  Activity,
  Users,
  Filter,
  ChevronRight,
  Swords,
  X,
  Radio,
} from "lucide-react";

import { getStorage, setStorage } from "../utils/storage";

const statusStyles = {
  Live: "bg-red-50 text-red-700 border-red-200",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function Matches() {
  const [matches, setMatches] = useState(() =>
    getStorage("gully_matches", [])
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const stats = useMemo(() => ({
    total: matches.length,
    upcoming: matches.filter((m) => m.status === "Upcoming").length,
    live: matches.filter((m) => m.status === "Live").length,
    completed: matches.filter((m) => m.status === "Completed").length,
  }), [matches]);

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return matches.filter((match) => {
      const matchesSearch = [
        match.name,
        match.teamAName,
        match.teamBName,
        match.ground,
      ].some((value) =>
        (value || "").toLowerCase().includes(query)
      );

      const matchesFilter =
        filter === "All" || match.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [matches, search, filter]);

  const deleteMatch = (id) => {
    const match = matches.find((m) => m.id === id);

    if (!match) return;

    if (match.status !== "Upcoming") {
      alert("Only upcoming matches can be deleted.");
      return;
    }

    if (!window.confirm(`Delete "${match.name}"?`)) return;

    const updated = matches.filter((m) => m.id !== id);

    setMatches(updated);
    setStorage("gully_matches", updated);
  };

  return (
    <div className="animate-fade-in space-y-7 pb-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700">
            <Trophy size={16} />
            Gully Cricket / Matches
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Matches Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create, track and manage your cricket matches.
          </p>
        </div>

        <Link
          to="/create-match"
          className="gc-btn gc-btn-primary"
        >
          <Plus size={19} />
          Create Match
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Matches"
          value={stats.total}
          icon={<Trophy size={22} />}
          description="All registered matches"
          color="green"
        />

        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={<CalendarDays size={22} />}
          description="Scheduled matches"
          color="blue"
        />

        <StatCard
          title="Live Matches"
          value={stats.live}
          icon={<Radio size={22} />}
          description="Currently in progress"
          color="red"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<Activity size={22} />}
          description="Finished matches"
          color="purple"
        />
      </div>

      {/* Search and filter */}
      <div className="gc-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches, teams or grounds..."
              className="form-control pl-11 pr-10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Filter size={17} />
              Status
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-control min-w-0 flex-1 sm:min-w-[170px]"
            >
              <option value="All">All Matches</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Match list heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            All Matches
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View your match schedule and results.
          </p>
        </div>

        <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
          {filteredMatches.length} Matches
        </span>
      </div>

      {/* Match cards */}
      <div className="grid grid-cols-1 gap-5">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="gc-card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
          >
            {/* Card header */}
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {match.name}
                  </h3>

                  {match.status === "Live" && (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {match.date
                      ? new Date(match.date).toLocaleString()
                      : "Date not available"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {match.ground || "Ground not specified"}
                  </span>
                </div>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${
                  statusStyles[match.status] ||
                  "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {match.status}
              </span>
            </div>

            {/* Teams section */}
            <div className="mx-5 mb-5 rounded-2xl bg-gray-50 p-4 sm:mx-6 sm:p-5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">

                {/* Team A */}
                <div className="min-w-0 text-left">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-800 sm:h-14 sm:w-14">
                    <ShieldIcon />
                  </div>

                  <h3 className="break-words text-sm font-bold text-gray-900 sm:text-base">
                    {match.teamAName}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Users size={13} />
                    {match.playersA?.length ?? 0} Players
                  </p>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-extrabold text-gray-500 shadow-sm">
                    VS
                  </div>

                  <p className="mt-2 whitespace-nowrap text-xs font-semibold text-gray-500">
                    {match.overs} Overs
                  </p>
                </div>

                {/* Team B */}
                <div className="min-w-0 text-right">
                  <div className="mb-3 ml-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-800 sm:h-14 sm:w-14">
                    <ShieldIcon />
                  </div>

                  <h3 className="break-words text-sm font-bold text-gray-900 sm:text-base">
                    {match.teamBName}
                  </h3>

                  <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500">
                    <Users size={13} />
                    {match.playersB?.length ?? 0} Players
                  </p>
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CircleDot size={14} />
                  {match.ballType || "Ball type not specified"}
                </span>

                <span className="text-gray-300">•</span>

                <span className="flex items-center gap-1.5">
                  <Swords size={14} />
                  {match.matchType || "Match"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {match.status === "Upcoming" && (
                  <button
                    type="button"
                    onClick={() => deleteMatch(match.id)}
                    title="Delete match"
                    className="gc-btn-icon bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={17} />
                  </button>
                )}

                <Link
                  to={`/matches/${match.id}`}
                  className="gc-btn gc-btn-primary"
                >
                  View Match
                  <ChevronRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredMatches.length === 0 && (
          <div className="gc-card flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">
              <Trophy size={38} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              No Matches Found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {search || filter !== "All"
                ? "No matches match your current search or filter. Try changing your selection."
                : "You haven't created any matches yet. Create your first cricket match to get started."}
            </p>

            {search || filter !== "All" ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="gc-btn gc-btn-secondary mt-5"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/create-match"
                className="gc-btn gc-btn-primary mt-5"
              >
                <Plus size={18} />
                Create First Match
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ShieldIcon() {
  return <Trophy size={25} />;
}

function StatCard({ title, value, icon, description, color }) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="gc-stat-card group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h2>

          <p className="mt-2 text-xs text-gray-400">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
