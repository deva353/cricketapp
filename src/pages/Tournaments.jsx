
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trophy,
  CalendarDays,
  Users,
  Trash2,
  Edit,
  Eye,
  X,
} from "lucide-react";
import { getStorage, setStorage } from "../utils/storage";
import { generateFixtures } from "../services/tournamentEngine";

const emptyForm = {
  name: "",
  location: "",
  startDate: "",
  endDate: "",
  format: "Round Robin",
  teamIds: [],
};

export default function Tournaments() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState(() =>
    getStorage("gully_tournaments", [])
  );

  const [teams] = useState(() =>
    getStorage("gully_teams", [])
  );

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setStorage("gully_tournaments", tournaments);
  }, [tournaments]);

  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (tournament) => {
    setEditingId(tournament.id);

    setForm({
      name: tournament.name,
      location: tournament.location,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      format: tournament.format,
      teamIds: tournament.teamIds || [],
    });

    setShowModal(true);
  };

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleTeam = (teamId) => {
    setForm((previous) => ({
      ...previous,
      teamIds: previous.teamIds.includes(teamId)
        ? previous.teamIds.filter((id) => id !== teamId)
        : [...previous.teamIds, teamId],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.teamIds.length < 2) {
      alert("Select at least two teams.");
      return;
    }

    if (form.endDate < form.startDate) {
      alert("End date cannot be before the start date.");
      return;
    }

    if (editingId) {
      setTournaments((previous) =>
        previous.map((tournament) =>
          tournament.id === editingId
            ? {
                ...tournament,
                ...form,
                updatedAt: new Date().toISOString(),
              }
            : tournament
        )
      );
    } else {
      const tournament = {
        id: crypto.randomUUID(),
        ...form,
        fixtures: generateFixtures(
          form.teamIds,
          form.format
        ),
        status: "Upcoming",
        createdAt: new Date().toISOString(),
      };

      setTournaments((previous) => [
        tournament,
        ...previous,
      ]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteTournament = (id) => {
    const tournament = tournaments.find(
      (item) => item.id === id
    );

    if (!window.confirm(`Delete ${tournament?.name}?`)) {
      return;
    }

    setTournaments((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const getStatusClass = (status) => {
    if (status === "Ongoing") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Completed") {
      return "bg-gray-100 text-gray-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tournament Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create tournaments and manage participating teams.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          <Plus size={19} />
          Create Tournament
        </button>
      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Tournaments"
          value={tournaments.length}
          icon={<Trophy />}
        />

        <StatCard
          title="Ongoing"
          value={
            tournaments.filter(
              (item) => item.status === "Ongoing"
            ).length
          }
          icon={<CalendarDays />}
        />

        <StatCard
          title="Registered Teams"
          value={
            tournaments.reduce(
              (total, item) =>
                total + (item.teamIds?.length || 0),
              0
            )
          }
          icon={<Users />}
        />
      </div>

      {/* Search */}

      <input
        className="form-control"
        placeholder="Search tournaments..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {/* Tournament Cards */}

      {filteredTournaments.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
          <Trophy
            size={42}
            className="mx-auto text-gray-300"
          />
          <h2 className="mt-3 font-bold text-gray-800">
            No tournaments found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create your first tournament to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-100 p-3 text-green-700">
                    <Trophy size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-gray-900">
                      {tournament.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {tournament.location || "Location not specified"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(tournament.status)}`}
                >
                  {tournament.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Format</p>
                  <p className="mt-1 font-semibold">
                    {tournament.format}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Teams</p>
                  <p className="mt-1 font-semibold">
                    {tournament.teamIds?.length || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Start date</p>
                  <p className="mt-1 font-semibold">
                    {tournament.startDate}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Fixtures</p>
                  <p className="mt-1 font-semibold">
                    {tournament.fixtures?.length || 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    navigate(`/tournaments/${tournament.id}`)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  onClick={() => openEditModal(tournament)}
                  className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                  title="Edit tournament"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => deleteTournament(tournament.id)}
                  className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  title="Delete tournament"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white">

            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Tournament" : "Create Tournament"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >
              <FormField label="Tournament Name">
                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  className="form-control"
                  placeholder="Enter tournament name"
                  required
                />
              </FormField>

              <FormField label="Location">
                <input
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  className="form-control"
                  placeholder="Enter ground or location"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Start Date">
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={updateField}
                    className="form-control"
                    required
                  />
                </FormField>

                <FormField label="End Date">
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={updateField}
                    className="form-control"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Tournament Format">
                <select
                  name="format"
                  value={form.format}
                  onChange={updateField}
                  className="form-control"
                >
                  <option>Round Robin</option>
                  <option>Knockout</option>
                </select>
              </FormField>

              <div>
                <h3 className="mb-3 font-semibold">
                  Register Teams ({form.teamIds.length} selected)
                </h3>

                {teams.length === 0 ? (
                  <p className="text-sm text-red-600">
                    Create teams first before creating a tournament.
                  </p>
                ) : (
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border p-3">
                    {teams.map((team) => (
                      <label
                        key={team.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={form.teamIds.includes(team.id)}
                          onChange={() => toggleTeam(team.id)}
                        />

                        <span className="font-medium">
                          {team.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
                >
                  {editingId ? "Update Tournament" : "Create Tournament"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-2 text-3xl font-bold">{value}</h2>
      </div>

      <div className="rounded-xl bg-green-100 p-3 text-green-700">
        {icon}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
