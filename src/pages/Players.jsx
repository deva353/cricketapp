
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Users,
  Trophy,
  Target,
  UserRound,
  UserPlus,
  Filter,
  Mail,
  Phone,
  Calendar,
  Eye,
  SlidersHorizontal,
  ShieldCheck,
  Activity,
  Award,
  ChevronDown,
} from "lucide-react";

import { initialPlayers } from "../data/mockData";
import { getStorage, setStorage } from "../utils/storage";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  role: "Batsman",
  battingStyle: "Right Hand",
  bowlingStyle: "Right Arm Medium",
};

const roles = [
  "All",
  "Batsman",
  "Bowler",
  "All Rounder",
  "Wicket Keeper",
];

const roleColors = {
  Batsman: "bg-blue-50 text-blue-700 border-blue-100",
  Bowler: "bg-purple-50 text-purple-700 border-purple-100",
  "All Rounder": "bg-amber-50 text-amber-700 border-amber-100",
  "Wicket Keeper": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function Players() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState(() =>
    getStorage("gully_players", initialPlayers)
  );

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setStorage("gully_players", players);
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        (player.name || "").toLowerCase().includes(query) ||
        (player.email || "").toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" || player.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [players, search, roleFilter]);

  const stats = useMemo(() => ({
    total: players.length,
    batsmen: players.filter((p) => p.role === "Batsman").length,
    bowlers: players.filter((p) => p.role === "Bowler").length,
    allRounders: players.filter((p) => p.role === "All Rounder").length,
  }), [players]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (player) => {
    setEditingId(player.id);
    setForm({
      name: player.name || "",
      email: player.email || "",
      phone: player.phone || "",
      age: player.age || "",
      role: player.role || "Batsman",
      battingStyle: player.battingStyle || "Right Hand",
      bowlingStyle: player.bowlingStyle || "Right Arm Medium",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = form.email.trim().toLowerCase();

    const emailExists = players.some(
      (player) =>
        player.email?.toLowerCase() === email &&
        player.id !== editingId
    );

    if (emailExists) {
      alert("A player with this email already exists.");
      return;
    }

    const playerData = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      age: Number(form.age),
    };

    if (editingId) {
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === editingId
            ? { ...player, ...playerData }
            : player
        )
      );
    } else {
      setPlayers((prev) => [
        ...prev,
        {
          ...playerData,
          id: crypto.randomUUID(),
          matches: 0,
          runs: 0,
          wickets: 0,
        },
      ]);
    }

    closeModal();
  };

  const deletePlayer = (id) => {
    const player = players.find((item) => item.id === id);

    if (!window.confirm(`Delete ${player?.name}?`)) return;

    setPlayers((prev) =>
      prev.filter((item) => item.id !== id)
    );

    // Remove the player from all team squads.
    const teams = getStorage("gully_teams", []);

    const updatedTeams = teams.map((team) => ({
      ...team,
      playerIds: (team.playerIds || []).filter(
        (playerId) => playerId !== id
      ),
      captainId: team.captainId === id ? "" : team.captainId,
    }));

    setStorage("gully_teams", updatedTeams);
  };

  return (
    <div className="space-y-7 animate-fade-in">

      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700">
            <Users size={16} />
            Gully Cricket / Players
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Players Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your players, playing roles and cricket profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="gc-btn gc-btn-primary"
        >
          <Plus size={19} />
          Add Player
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Players"
          value={stats.total}
          icon={<Users size={22} />}
          description="Registered players"
          color="green"
        />

        <StatCard
          title="Batsmen"
          value={stats.batsmen}
          icon={<Trophy size={22} />}
          description="Batting specialists"
          color="blue"
        />

        <StatCard
          title="Bowlers"
          value={stats.bowlers}
          icon={<Target size={22} />}
          description="Bowling specialists"
          color="purple"
        />

        <StatCard
          title="All Rounders"
          value={stats.allRounders}
          icon={<Award size={22} />}
          description="Batting and bowling"
          color="amber"
        />
      </div>

      {/* Search and filters */}
      <div className="gc-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players by name or email..."
              className="form-control pl-11"
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
              <SlidersHorizontal size={17} />
              <span>Role</span>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control min-w-full appearance-none pr-10 sm:min-w-[180px]"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === "All" ? "All Roles" : role}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Players table */}
      <div className="gc-card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Registered Players
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Player directory and performance overview
            </p>
          </div>

          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
            {filteredPlayers.length} Players
          </span>
        </div>

        <div className="table-wrapper">
          <table className="gc-table min-w-[850px]">
            <thead>
              <tr>
                <th>Player</th>
                <th>Playing Role</th>
                <th>Age</th>
                <th>Matches</th>
                <th>Runs</th>
                <th>Wickets</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 text-lg font-bold text-green-800">
                        {(player.name || "?").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {player.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500">
                          <Mail size={12} />
                          {player.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        roleColors[player.role] ||
                        "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {player.role}
                    </span>
                  </td>

                  <td>
                    <span className="font-medium text-gray-700">
                      {player.age || "-"}
                    </span>
                  </td>

                  <td>
                    <span className="font-semibold text-gray-700">
                      {player.matches ?? 0}
                    </span>
                  </td>

                  <td>
                    <span className="font-bold text-gray-900">
                      {player.runs ?? 0}
                    </span>
                  </td>

                  <td>
                    <span className="font-bold text-green-700">
                      {player.wickets ?? 0}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/players/${player.id}`)}
                        title="View profile"
                        className="gc-btn-icon bg-green-50 text-green-700 hover:bg-green-100"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(player)}
                        title="Edit player"
                        className="gc-btn-icon bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Edit size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deletePlayer(player.id)}
                        title="Delete player"
                        className="gc-btn-icon bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                        <UserRound size={30} />
                      </div>

                      <h3 className="font-bold text-gray-800">
                        No players found
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        {search || roleFilter !== "All"
                          ? "Try changing your search or role filter."
                          : "Add your first player to get started."}
                      </p>

                      {!search && roleFilter === "All" && (
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="gc-btn gc-btn-primary mt-5"
                        >
                          <Plus size={17} />
                          Add First Player
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
          Showing {filteredPlayers.length} of {players.length} registered players
        </div>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="animate-fade-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-5 sm:p-6">
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-green-700">
                  <UserPlus size={16} />
                  Player Management
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Player" : "Add New Player"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the player's information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="gc-btn-icon bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                  <UserRound size={17} className="text-green-700" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Full Name">
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      required
                      maxLength={60}
                      className="form-control"
                      placeholder="Enter player name"
                    />
                  </FormField>

                  <FormField label="Email Address">
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      required
                      className="form-control"
                      placeholder="player@example.com"
                    />
                  </FormField>

                  <FormField label="Phone Number">
                    <div className="relative">
                      <Phone
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateField}
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className="form-control pl-10"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </FormField>

                  <FormField label="Age">
                    <div className="relative">
                      <Calendar
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        name="age"
                        type="number"
                        min="10"
                        max="100"
                        value={form.age}
                        onChange={updateField}
                        required
                        className="form-control pl-10"
                        placeholder="Enter age"
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-800">
                  <ShieldCheck size={17} className="text-green-700" />
                  Cricket Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Playing Role">
                    <select
                      name="role"
                      value={form.role}
                      onChange={updateField}
                      className="form-control"
                    >
                      <option>Batsman</option>
                      <option>Bowler</option>
                      <option>All Rounder</option>
                      <option>Wicket Keeper</option>
                    </select>
                  </FormField>

                  <FormField label="Batting Style">
                    <select
                      name="battingStyle"
                      value={form.battingStyle}
                      onChange={updateField}
                      className="form-control"
                    >
                      <option>Right Hand</option>
                      <option>Left Hand</option>
                    </select>
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Bowling Style">
                      <select
                        name="bowlingStyle"
                        value={form.bowlingStyle}
                        onChange={updateField}
                        className="form-control"
                      >
                        <option>Right Arm Fast</option>
                        <option>Right Arm Medium</option>
                        <option>Right Arm Spin</option>
                        <option>Left Arm Fast</option>
                        <option>Left Arm Spin</option>
                        <option>None</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="gc-btn gc-btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gc-btn gc-btn-primary"
                >
                  {editingId ? (
                    <>
                      <Edit size={17} />
                      Update Player
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Save Player
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, description, color }) {
  const colorClasses = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="gc-stat-card group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h2>
          <p className="mt-2 text-xs text-gray-400">{description}</p>
        </div>

        <div className={`rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
