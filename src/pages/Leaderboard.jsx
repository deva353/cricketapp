
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Search } from "lucide-react";
import {
  calculatePlayerStatistics,
  getTeamStandings,
} from "../services/statisticsEngine";

function Leaderboard() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("runs");
  const [search, setSearch] = useState("");

  const players = useMemo(
    () => calculatePlayerStatistics(),
    []
  );

  const teams = useMemo(() => getTeamStandings(), []);

  const categories = [
    { value: "runs", label: "Most Runs", field: "runs" },
    { value: "wickets", label: "Most Wickets", field: "wickets" },
    { value: "sixes", label: "Most Sixes", field: "sixes" },
    { value: "fours", label: "Most Fours", field: "fours" },
    { value: "average", label: "Best Average", field: "battingAverage" },
    { value: "economy", label: "Best Economy", field: "economy" },
  ];

  const selectedCategory = categories.find(
    (item) => item.value === category
  );

  const filteredPlayers = players
    .filter((player) =>
      player.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (category === "average") {
        return Number(b.battingAverage) - Number(a.battingAverage);
      }

      if (category === "economy") {
        const aValue = a.ballsBowled > 0 ? Number(a.economy) : Infinity;
        const bValue = b.ballsBowled > 0 ? Number(b.economy) : Infinity;
        return aValue - bValue;
      }

      return b[selectedCategory.field] - a[selectedCategory.field];
    })
    .filter((player) => {
      if (category === "average") return player.innings > 0;
      if (category === "economy") return player.ballsBowled > 0;
      return player.matchesPlayed > 0;
    });

  const formatValue = (player) => {
    if (category === "average") return player.battingAverage;
    if (category === "economy") return player.economy;
    return player[selectedCategory.field];
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Player and team performance across recorded matches.
        </p>
      </div>

      <div className="rounded-2xl bg-gray-900 p-6 text-white">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold">Player Rankings</h2>
            <p className="text-sm text-gray-300">
              Select a statistic to rank players.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.value}
            onClick={() => setCategory(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              category === item.value
                ? "bg-green-700 text-white"
                : "bg-white text-gray-600 border"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          className="form-control pl-10"
          placeholder="Search player..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-bold">{selectedCategory.label}</h2>
        </div>

        {filteredPlayers.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No statistics available yet. Record some match deliveries first.
          </p>
        ) : (
          <div className="divide-y">
            {filteredPlayers.map((player, index) => (
              <button
                key={player.id}
                onClick={() => navigate(`/players/${player.id}`)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-800">
                    {index < 3 ? (
                      <Medal size={20} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {player.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {player.matchesPlayed} matches · {player.role}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 text-xl font-bold text-green-700">
                  {formatValue(player)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Team Standings</h2>

        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3">Team</th>
              <th className="p-3">P</th>
              <th className="p-3">W</th>
              <th className="p-3">L</th>
              <th className="p-3">T</th>
              <th className="p-3">Pts</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id} className="border-b">
                <td className="p-3 font-semibold">
                  {index + 1}. {team.name}
                </td>
                <td className="p-3">{team.played}</td>
                <td className="p-3">{team.won}</td>
                <td className="p-3">{team.lost}</td>
                <td className="p-3">{team.tied}</td>
                <td className="p-3 font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {teams.every((team) => team.played === 0) && (
          <p className="mt-3 text-sm text-gray-500">
            Team standings appear after both innings of a match are completed.
          </p>
        )}
      </section>
    </div>
  );
}

export default Leaderboard;
