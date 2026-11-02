
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Trophy,
  CalendarDays,
  UserRound,
  Activity,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { getStorage, setStorage } from "../utils/storage";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState(() =>
    getStorage("gully_users", [])
  );

  const [matches] = useState(() =>
    getStorage("gully_matches", [])
  );

  const [teams] = useState(() =>
    getStorage("gully_teams", [])
  );

  const [players] = useState(() =>
    getStorage("gully_players", [])
  );

  const [tournaments] = useState(() =>
    getStorage("gully_tournaments", [])
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    setStorage("gully_users", users);
  }, [users]);

  const currentUser = getStorage("gully_user", null);
  const isAdmin = currentUser?.role === "admin";

  const liveMatches = matches.filter(
    (match) => match.status === "Live"
  );

  const upcomingMatches = matches.filter(
    (match) => match.status === "Upcoming"
  );

  const completedMatches = matches.filter(
    (match) => match.status === "Completed"
  );

  const activeTournaments = tournaments.filter(
    (tournament) => tournament.status === "Ongoing"
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user.name || "";
      const email = user.email || "";
      const role = user.role || "player";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const changeUserRole = (userId, newRole) => {
    if (userId === currentUser?.id) {
      alert("You cannot change your own admin role here.");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? { ...user, role: newRole }
        : user
    );

    setUsers(updatedUsers);
  };

  const deleteUser = (userId) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    const user = users.find((item) => item.id === userId);

    if (!window.confirm(`Delete user ${user?.name || user?.email}?`)) {
      return;
    }

    setUsers((previous) =>
      previous.filter((item) => item.id !== userId)
    );
  };

  const roleCounts = {
    admin: users.filter((user) => user.role === "admin").length,
    scorer: users.filter((user) => user.role === "scorer").length,
    captain: users.filter((user) => user.role === "captain").length,
    player: users.filter(
      (user) => !user.role || user.role === "player"
    ).length,
  };

  const recentMatches = [...matches]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.date || 0) -
        new Date(a.createdAt || a.date || 0)
    )
    .slice(0, 5);

  const recentTournaments = [...tournaments]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5);
    

  return (
    <div className="space-y-7 pb-8">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-700" size={27} />
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Manage users, matches, teams and tournaments.
          </p>
        </div>

        <div className="rounded-xl bg-green-50 px-4 py-3">
          <p className="text-xs text-green-700">Administrator</p>
          <p className="font-bold text-green-900">
            {currentUser?.name || currentUser?.email || "Admin"}
          </p>
          
        </div>
      </div>
      

      {/* Overview cards */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Registered Users"
          value={users.length}
          icon={<Users />}
          description="All registered accounts"
        />

        <StatCard
          title="Total Teams"
          value={teams.length}
          icon={<ShieldCheck />}
          description="Created cricket teams"
        />

        <StatCard
          title="Total Players"
          value={players.length}
          icon={<UserRound />}
          description="Registered cricket players"
        />

        <StatCard
          title="Tournaments"
          value={tournaments.length}
          icon={<Trophy />}
          description="All tournaments"
        />
      </div>

      {/* Match overview */}

      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Match Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Live Matches"
            value={liveMatches.length}
            icon={<Activity />}
            description="Currently in progress"
          />

          <StatCard
            title="Upcoming Matches"
            value={upcomingMatches.length}
            icon={<CalendarDays />}
            description="Scheduled matches"
          />

          <StatCard
            title="Completed Matches"
            value={completedMatches.length}
            icon={<Trophy />}
            description="Finished matches"
          />
        </div>
      </section>

      {/* User roles */}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">User Roles</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm capitalize text-gray-500">
                {role}
              </p>
              <p className="mt-1 text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick navigation */}

      <section>
        <h2 className="mb-4 text-lg font-bold">Quick Management</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            title="Manage Players"
            description="View and update players"
            onClick={() => navigate("/players")}
          />

          <QuickLink
            title="Manage Teams"
            description="View and update teams"
            onClick={() => navigate("/teams")}
          />

          <QuickLink
            title="Manage Matches"
            description="Monitor match schedules"
            onClick={() => navigate("/matches")}
          />

          <QuickLink
            title="Manage Tournaments"
            description="Monitor tournaments"
            onClick={() => navigate("/tournaments")}
          />
        </div>
      </section>

      {/* User management */}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-bold">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Change account roles or remove demo accounts.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="form-control pl-10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="form-control sm:w-48"
          >
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="scorer">Scorer</option>
            <option value="captain">Captain</option>
            <option value="player">Player</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Change Role</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">
                    <p className="font-semibold">
                      {user.name || "Unnamed User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email}
                    </p>
                  </td>

                  <td className="p-4 capitalize">
                    {user.role || "player"}
                  </td>

                  <td className="p-4">
                    <select
                      value={user.role || "player"}
                      disabled={user.id === currentUser?.id}
                      onChange={(event) =>
                        changeUserRole(user.id, event.target.value)
                      }
                      className="rounded-lg border p-2 disabled:opacity-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="scorer">Scorer</option>
                      <option value="captain">Captain</option>
                      <option value="player">Player</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={user.id === currentUser?.id}
                      className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-8 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      

      {/* Recent activity */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Recent Matches</h2>
            <button
              onClick={() => navigate("/matches")}
              className="text-sm font-semibold text-green-700"
            >
              View all
            </button>
          </div>

          {recentMatches.length === 0 ? (
            <p className="text-sm text-gray-500">
              No matches created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-semibold">
                      {match.teamAName} vs {match.teamBName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {match.date || "Date not specified"}
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {match.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Recent Tournaments</h2>
            <button
              onClick={() => navigate("/tournaments")}
              className="text-sm font-semibold text-green-700"
            >
              View all
            </button>
          </div>

          {recentTournaments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tournaments created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-semibold">
                      {tournament.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tournament.teamIds?.length || 0} teams
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {tournament.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>

        <div className="rounded-xl bg-green-100 p-3 text-green-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-green-300 hover:bg-green-50"
    >
      <div className="flex items-center justify-between">
        <p className="font-bold">{title}</p>
        <ArrowUpRight size={18} className="text-green-700" />
      </div>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </button>
  );
}
