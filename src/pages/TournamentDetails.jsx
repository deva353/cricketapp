
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy, CalendarDays } from "lucide-react";
import { getStorage, setStorage } from "../utils/storage";
import { calculateTournamentStandings } from "../services/tournamentEngine";

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState(() =>
    getStorage("gully_tournaments", [])
  );

  const teams = getStorage("gully_teams", []);

  const tournament = tournaments.find(
    (item) => item.id === id
  );

  useEffect(() => {
    setStorage("gully_tournaments", tournaments);
  }, [tournaments]);

  if (!tournament) {
    return (
      <div className="p-6">
        <h2 className="font-bold">Tournament not found.</h2>
        <button
          onClick={() => navigate("/tournaments")}
          className="mt-3 text-green-700"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  const standings = calculateTournamentStandings(
    tournament,
    teams
  );

  const getTeamName = (teamId) =>
    teams.find((team) => team.id === teamId)?.name ||
    "Unknown Team";

  const updateFixtureResult = (fixture) => {
    const scoreA = window.prompt(
      `Enter runs scored by ${getTeamName(fixture.teamAId)}`
    );

    if (scoreA === null) return;

    const scoreB = window.prompt(
      `Enter runs scored by ${getTeamName(fixture.teamBId)}`
    );

    if (scoreB === null) return;

    const runsA = Number(scoreA);
    const runsB = Number(scoreB);

    if (
      scoreA.trim() === "" ||
      scoreB.trim() === "" ||
      !Number.isInteger(runsA) ||
      !Number.isInteger(runsB) ||
      runsA < 0 ||
      runsB < 0
    ) {
      alert("Enter valid non-negative whole-number scores.");
      return;
    }

    const updated = tournaments.map((item) => {
      if (item.id !== id) return item;

      return {
        ...item,
        status: "Ongoing",
        fixtures: item.fixtures.map((current) =>
          current.id === fixture.id
            ? {
                ...current,
                teamAScore: runsA,
                teamBScore: runsB,
                status: "Completed",
                winnerId:
                  runsA > runsB
                    ? current.teamAId
                    : runsB > runsA
                      ? current.teamBId
                      : null,
              }
            : current
        ),
      };
    });

    setTournaments(updated);
  };

  const completedFixtures = tournament.fixtures.filter(
    (fixture) => fixture.status === "Completed"
  ).length;

  const allFixturesCompleted =
    tournament.fixtures.length > 0 &&
    completedFixtures === tournament.fixtures.length;

  const finishTournament = () => {
    if (!allFixturesCompleted) {
      alert("Complete all fixtures before finishing the tournament.");
      return;
    }

    const updated = tournaments.map((item) =>
      item.id === id
        ? { ...item, status: "Completed" }
        : item
    );

    setTournaments(updated);
  };

  const startTournament = () => {
    const updated = tournaments.map((item) =>
      item.id === id
        ? { ...item, status: "Ongoing" }
        : item
    );

    setTournaments(updated);
  };

  return (
    <div className="space-y-6 pb-8">

      <button
        onClick={() => navigate("/tournaments")}
        className="flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft size={18} /> Back to Tournaments
      </button>

      {/* Tournament header */}

      <div className="rounded-2xl bg-gray-900 p-6 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-green-300">
              {tournament.format} Tournament
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              {tournament.name}
            </h1>

            <p className="mt-2 text-sm text-gray-300">
              {tournament.location || "Location not specified"}
            </p>
          </div>

          <Trophy size={32} className="text-yellow-400" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Summary
            label="Teams"
            value={tournament.teamIds.length}
          />

          <Summary
            label="Fixtures"
            value={tournament.fixtures.length}
          />

          <Summary
            label="Completed"
            value={completedFixtures}
          />
        </div>

        <p className="mt-5 flex items-center gap-2 text-sm text-gray-300">
          <CalendarDays size={16} />
          {tournament.startDate} to {tournament.endDate}
        </p>

        {tournament.status === "Upcoming" && (
          <button
            onClick={startTournament}
            className="mt-5 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Start Tournament
          </button>
        )}

        {tournament.status === "Ongoing" && (
          <button
            onClick={finishTournament}
            disabled={!allFixturesCompleted}
            className="mt-5 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Finish Tournament
          </button>
        )}

        {tournament.status === "Completed" && (
          <p className="mt-5 font-semibold text-green-300">
            Tournament completed
          </p>
        )}
      </div>

      {/* Registered teams */}

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Registered Teams</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tournament.teamIds.map((teamId) => (
            <div
              key={teamId}
              className="rounded-xl bg-gray-50 p-4"
            >
              <p className="font-semibold">
                {getTeamName(teamId)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fixtures */}

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Tournament Fixtures</h2>

        {tournament.fixtures.length === 0 ? (
          <p className="text-sm text-gray-500">
            No fixtures available.
          </p>
        ) : (
          <div className="space-y-3">
            {tournament.fixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Match {fixture.fixtureNumber}
                    {fixture.round ? ` · ${fixture.round}` : ""}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      fixture.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {fixture.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                  <div className="space-y-3">
                    <p className="font-semibold">
                      {getTeamName(fixture.teamAId)}
                    </p>

                    <p className="font-semibold">
                      {getTeamName(fixture.teamBId)}
                    </p>
                  </div>

                  <div className="text-right font-bold">
                    <p>
                      {fixture.teamAScore ?? "—"}
                    </p>
                    <p>
                      {fixture.teamBScore ?? "—"}
                    </p>
                  </div>
                </div>

                {fixture.status !== "Completed" &&
                  tournament.status !== "Completed" && (
                    <button
                      onClick={() => updateFixtureResult(fixture)}
                      className="mt-4 w-full rounded-lg border border-green-700 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                    >
                      Enter Match Result
                    </button>
                  )}

                {fixture.status === "Completed" && (
                  <p className="mt-3 text-sm font-semibold text-green-700">
                    {fixture.winnerId
                      ? `${getTeamName(fixture.winnerId)} won`
                      : "Match tied"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Points table */}

      <section className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Tournament Points Table</h2>

        <table className="w-full min-w-[580px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3">Team</th>
              <th className="p-3">P</th>
              <th className="p-3">W</th>
              <th className="p-3">L</th>
              <th className="p-3">T</th>
              <th className="p-3">Runs +/-</th>
              <th className="p-3">Pts</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((team, index) => (
              <tr key={team.teamId} className="border-b">
                <td className="p-3 font-semibold">
                  {index + 1}. {team.teamName}
                </td>
                <td className="p-3">{team.played}</td>
                <td className="p-3">{team.won}</td>
                <td className="p-3">{team.lost}</td>
                <td className="p-3">{team.tied}</td>
                <td className="p-3">
                  {team.runsScored - team.runsConceded}
                </td>
                <td className="p-3 font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-xs text-gray-500">
          Points: win = 2, tie = 1, loss = 0. Runs difference is shown instead of official net run rate.
        </p>
      </section>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 p-4">
      <p className="text-sm text-gray-300">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
