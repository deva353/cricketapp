
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Users,
  MapPin,
  Trophy,
  Edit,
  Trash2,
  X,
  ShieldCheck,
  UserPlus,
  Crown,
  ChevronRight,
  UsersRound,
  Palette,
} from "lucide-react";

import { initialTeams, initialPlayers } from "../data/mockData";
import { getStorage, setStorage } from "../utils/storage";

const emptyForm = {
  name: "",
  shortName: "",
  location: "",
  captainId: "",
  playerIds: [],
  color: "#15803d",
};

const colors = [
  "#15803d",
  "#2563eb",
  "#9333ea",
  "#dc2626",
  "#ea580c",
  "#0891b2",
];

export default function Teams() {
  const [teams, setTeams] = useState(() =>
    getStorage("gully_teams", initialTeams)
  );

  const [players, setPlayers] = useState(() =>
    getStorage("gully_players", initialPlayers)
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSquad, setShowSquad] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setStorage("gully_teams", teams);
  }, [teams]);

  useEffect(() => {
    setStorage("gully_players", players);
  }, [players]);

  const filteredTeams = useMemo(() => {
    const query = search.toLowerCase().trim();

    return teams.filter((team) =>
      [team.name, team.location, team.shortName]
        .some((value) => (value || "").toLowerCase().includes(query))
    );
  }, [teams, search]);

  const totalSquadMembers = teams.reduce(
    (sum, team) => sum + (team.playerIds || []).length,
    0
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingId(team.id);

    setForm({
      name: team.name || "",
      shortName: team.shortName || "",
      location: team.location || "",
      captainId: team.captainId || "",
      playerIds: team.playerIds || [],
      color: team.color || "#15803d",
    });

    setShowModal(true);
  };

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePlayer = (playerId) => {
    setForm((prev) => {
      const exists = prev.playerIds.includes(playerId);

      const playerIds = exists
        ? prev.playerIds.filter((id) => id !== playerId)
        : [...prev.playerIds, playerId];

      return {
        ...prev,
        playerIds,
        captainId:
          exists && prev.captainId === playerId
            ? ""
            : prev.captainId,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.shortName.trim() || !form.location.trim()) {
      alert("Please complete all team details.");
      return;
    }

    if (form.shortName.trim().length > 4) {
      alert("Team short name must be 4 characters or fewer.");
      return;
    }

    const duplicate = teams.some(
      (team) =>
        team.name.toLowerCase() === form.name.trim().toLowerCase() &&
        team.id !== editingId
    );

    if (duplicate) {
      alert("A team with this name already exists.");
      return;
    }

    if (
      form.captainId &&
      !form.playerIds.includes(form.captainId)
    ) {
      alert("Captain must be part of the team squad.");
      return;
    }

    const teamData = {
      ...form,
      name: form.name.trim(),
      shortName: form.shortName.trim().toUpperCase(),
      location: form.location.trim(),
    };

    if (editingId) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingId
            ? { ...team, ...teamData }
            : team
        )
      );
    } else {
      setTeams((prev) => [
        ...prev,
        {
          ...teamData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    setShowModal(false);
    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const deleteTeam = (teamId) => {
    const team = teams.find((item) => item.id === teamId);

    if (!window.confirm(`Delete ${team?.name}?`)) return;

    setTeams((prev) => prev.filter((team) => team.id !== teamId));

    if (selectedTeam?.id === teamId) {
      setSelectedTeam(null);
      setShowSquad(false);
    }
  };

  const viewSquad = (team) => {
    setSelectedTeam(team);
    setShowSquad(true);
  };

  const getCaptain = (team) =>
    players.find((player) => player.id === team.captainId);

  const getSquad = (team) =>
    players.filter((player) =>
      (team.playerIds || []).includes(player.id)
    );

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  return (
    <div className="animate-fade-in space-y-7">

      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-700">
            <ShieldCheck size={15} />
            Cricket Management
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Teams Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create teams, manage squads and assign captains.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="gc-btn-primary w-full sm:w-auto"
        >
          <Plus size={19} />
          Create Team
        </button>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <StatCard
          title="Total Teams"
          value={teams.length}
          subtitle="Registered teams"
          icon={<ShieldCheck size={23} />}
          color="bg-green-50 text-green-700"
        />

        <StatCard
          title="Total Players"
          value={players.length}
          subtitle="Registered players"
          icon={<Users size={23} />}
          color="bg-blue-50 text-blue-700"
        />

        <StatCard
          title="Squad Members"
          value={totalSquadMembers}
          subtitle="Across all teams"
          icon={<Trophy size={23} />}
          color="bg-orange-50 text-orange-700"
        />

      </section>

      {/* Search */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="font-bold text-gray-900">
              Your Cricket Teams
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Search and manage your registered teams.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, location or code..."
              className="form-control pl-10"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* Team cards */}
      <section>
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredTeams.map((team) => {
              const captain = getCaptain(team);
              const squad = getSquad(team);

              return (
                <div
                  key={team.id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
                >
                  {/* Team colour strip */}
                  <div
                    className="h-2 transition-all duration-300 group-hover:h-3"
                    style={{ backgroundColor: team.color || "#15803d" }}
                  />

                  <div className="p-5">

                    {/* Team header */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white shadow-md transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundColor: team.color || "#15803d" }}
                        >
                          {team.shortName}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-base font-extrabold text-gray-900">
                            {team.name}
                          </h3>

                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={13} />
                            <span className="truncate">
                              {team.location || "Location not added"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Edit and delete */}
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openEdit(team)}
                          title="Edit team"
                          className="gc-btn-icon text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => deleteTeam(team.id)}
                          title="Delete team"
                          className="gc-btn-icon text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                    </div>

                    {/* Team statistics */}
                    <div className="mt-6 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-gray-50 p-3 transition-colors hover:bg-green-50">
                        <div className="flex items-center gap-2 text-gray-500">
                          <UsersRound size={15} />
                          <p className="text-xs font-medium">
                            Squad Size
                          </p>
                        </div>

                        <p className="mt-2 text-2xl font-extrabold text-gray-900">
                          {squad.length}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-yellow-50">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Crown size={15} />
                          <p className="text-xs font-medium">
                            Captain
                          </p>
                        </div>

                        <p className="mt-2 truncate text-sm font-bold text-gray-900">
                          {captain?.name || "Not assigned"}
                        </p>
                      </div>

                    </div>

                    {/* Captain information */}
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-100 p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-700">
                        <Crown size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Team Captain
                        </p>
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {captain?.name || "Captain not assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-xs font-medium text-gray-400">
                        Squad details
                      </span>

                      <button
                        onClick={() => viewSquad(team)}
                        className="inline-flex items-center gap-1 text-sm font-bold text-green-700 transition-all hover:gap-2 hover:text-green-900"
                      >
                        View Squad
                        <ChevronRight size={16} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        ) : (
          <div className="gc-empty">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Users size={32} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900">
              No teams found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {search
                ? "No teams match your search. Try another team name or location."
                : "You haven't created any teams yet. Create your first cricket team."}
            </p>

            {search ? (
              <button
                onClick={() => setSearch("")}
                className="gc-btn-secondary mt-5"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={openCreate}
                className="gc-btn-primary mt-5"
              >
                <Plus size={17} />
                Create First Team
              </button>
            )}
          </div>
        )}
      </section>

      {/* Create/Edit Team Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[92vh] w-full max-w-xl animate-fade-in overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {editingId ? "Edit Team" : "Create New Team"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter your team details and manage its squad.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="gc-btn-icon"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

              <FormField label="Team Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  placeholder="Example: Hyderabad Kings"
                  className="form-control"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Short Name">
                  <input
                    name="shortName"
                    value={form.shortName}
                    onChange={updateField}
                    required
                    maxLength={4}
                    placeholder="HK"
                    className="form-control uppercase"
                  />
                </FormField>

                <FormField label="Location">
                  <input
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    required
                    placeholder="Hyderabad"
                    className="form-control"
                  />
                </FormField>
              </div>

              {/* Team colours */}
              <FormField label="Team Color">
                <div className="flex flex-wrap items-center gap-3">
                  <Palette size={18} className="text-gray-400" />

                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, color }))
                      }
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all duration-200 hover:scale-110 ${
                        form.color === color
                          ? "border-gray-800 ring-2 ring-gray-200"
                          : "border-white shadow-sm"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Choose ${color}`}
                      aria-pressed={form.color === color}
                    />
                  ))}
                </div>
              </FormField>

              {/* Player selection */}
              <FormField label="Select Players">
                <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">

                  {players.map((player) => (
                    <label
                      key={player.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-green-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                          {player.name?.charAt(0)?.toUpperCase() || "P"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {player.name}
                          </p>

                          <p className="text-xs capitalize text-gray-500">
                            {player.role}
                          </p>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={form.playerIds.includes(player.id)}
                        onChange={() => togglePlayer(player.id)}
                        className="h-4 w-4 accent-green-700"
                      />
                    </label>
                  ))}

                  {players.length === 0 && (
                    <div className="p-6 text-center">
                      <Users size={25} className="mx-auto text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        Add players before creating a team.
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-2 text-xs font-semibold text-green-700">
                  {form.playerIds.length} player(s) selected
                </p>
              </FormField>

              {/* Captain */}
              <FormField label="Team Captain">
                <select
                  name="captainId"
                  value={form.captainId}
                  onChange={updateField}
                  className="form-control"
                >
                  <option value="">Select Captain</option>

                  {players
                    .filter((player) =>
                      form.playerIds.includes(player.id)
                    )
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
              </FormField>

              {/* Form actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={closeModal}
                  className="gc-btn-secondary flex-1"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="gc-btn-primary flex-1"
                >
                  {editingId ? (
                    <>
                      <Edit size={17} />
                      Update Team
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Team
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Squad Modal */}
      {showSquad && selectedTeam && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowSquad(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-lg animate-fade-in overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-extrabold text-white"
                  style={{
                    backgroundColor: selectedTeam.color || "#15803d",
                  }}
                >
                  {selectedTeam.shortName}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-extrabold text-gray-900">
                    {selectedTeam.name}
                  </h2>

                  <p className="text-xs text-gray-500">
                    {getSquad(selectedTeam).length} Squad Members
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSquad(false)}
                className="gc-btn-icon"
                aria-label="Close squad"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 p-5">

              {getSquad(selectedTeam).map((player) => {
                const isCaptain = selectedTeam.captainId === player.id;

                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-green-200 hover:bg-green-50/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                        {player.name?.charAt(0)?.toUpperCase() || "P"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-800">
                          {player.name}
                        </p>

                        <p className="text-xs capitalize text-gray-500">
                          {player.role}
                        </p>
                      </div>
                    </div>

                    {isCaptain && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                        <Crown size={13} />
                        Captain
                      </span>
                    )}
                  </div>
                );
              })}

              {getSquad(selectedTeam).length === 0 && (
                <div className="py-10 text-center">
                  <Users size={32} className="mx-auto text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    No players added to this team.
                  </p>
                </div>
              )}

            </div>

            <div className="border-t border-gray-100 p-5">
              <button
                onClick={() => {
                  setShowSquad(false);
                  openEdit(selectedTeam);
                }}
                className="gc-btn-primary w-full"
              >
                <UserPlus size={17} />
                Manage Squad
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Statistics card
function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            {value}
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Form field
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
