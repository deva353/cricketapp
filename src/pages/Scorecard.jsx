
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { getStorage } from "../utils/storage";
import { calculateScorecard } from "../services/scorecardEngine";

function Scorecard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const matches = getStorage("gully_matches", []);
  const match = matches.find((item) => item.id === id);
  const players = getStorage("gully_players", []);

  const firstInnings = getStorage(
    `gully_live_${id}_innings_1`,
    null
  );

  const secondInnings = getStorage(
    `gully_live_${id}_innings_2`,
    null
  );

  const firstBattingIsA = match
    ? (
        match.firstBatting === match.teamAId ||
        match.firstBatting === match.teamAName ||
        (
          !match.firstBatting &&
          (
            match.tossDecision === "Bat"
              ? match.tossWinner === match.teamAId ||
                match.tossWinner === match.teamAName
              : match.tossWinner !== match.teamAId &&
                match.tossWinner !== match.teamAName
          )
        )
      )
    : true;

  const teamAPlayers = useMemo(
    () =>
      players.filter((player) =>
        (match?.playersA || []).includes(player.id)
      ),
    [players, match]
  );

  const teamBPlayers = useMemo(
    () =>
      players.filter((player) =>
        (match?.playersB || []).includes(player.id)
      ),
    [players, match]
  );

  if (!match) {
    return <p className="p-6">Match not found.</p>;
  }

  const firstBattingPlayers = firstBattingIsA
    ? teamAPlayers
    : teamBPlayers;

  const firstBowlingPlayers = firstBattingIsA
    ? teamBPlayers
    : teamAPlayers;

  const secondBattingPlayers = firstBowlingPlayers;
  const secondBowlingPlayers = firstBattingPlayers;

  const firstDeliveries = firstInnings?.deliveries || [];
  const secondDeliveries = secondInnings?.deliveries || [];

 const first = calculateScorecard(
  firstDeliveries,
  firstBattingPlayers,
  firstBowlingPlayers
);

const second = calculateScorecard(
  secondDeliveries,
  secondBattingPlayers,
  secondBowlingPlayers
);

  const target = first.runs + 1;
  const runsNeeded = Math.max(0, target - second.runs);
  

  const secondInningsComplete =
    secondInnings?.isCompleted === true;

  let result = "Second innings has not started.";

  if (secondDeliveries.length > 0 && !secondInningsComplete) {
    result = `${secondBattingIsA ? match.teamAName : match.teamBName} need ${runsNeeded} runs to win.`;
  }

  if (secondInningsComplete) {
    if (second.runs > first.runs) {
      const wicketsRemaining = Math.max(
        0,
        secondBattingPlayers.length - 1 - second.wickets
      );

      result = `${secondBattingIsA ? match.teamAName : match.teamBName} won by ${wicketsRemaining} wicket(s).`;
    } else if (second.runs < first.runs) {
      result = `${firstBattingIsA ? match.teamAName : match.teamBName} won by ${first.runs - second.runs} runs.`;
    } else {
      result = "Match tied.";
    }
  }

  function InningsCard({
    title,
    teamName,
    score,
    deliveries,
  }) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-500">{teamName}</p>
          </div>

          <div className="text-right">
            <p className="text-3xl font-extrabold">
              {score.runs}/{score.wickets}
            </p>
            <p className="text-sm text-gray-500">
              {score.overs} overs
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <h3 className="mb-3 font-semibold">Batting</h3>

          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Batter</th>
                <th className="p-3">Status</th>
                <th className="p-3">R</th>
                <th className="p-3">B</th>
                <th className="p-3">4s</th>
                <th className="p-3">6s</th>
              </tr>
            </thead>

            <tbody>
              {score.batting.map((batter) => (
                <tr key={batter.playerId} className="border-b">
                  <td className="p-3 font-semibold">{batter.name}</td>
                  <td className="p-3 text-gray-500">{batter.status}</td>
                  <td className="p-3 font-bold">{batter.runs}</td>
                  <td className="p-3">{batter.balls}</td>
                  <td className="p-3">{batter.fours}</td>
                  <td className="p-3">{batter.sixes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 overflow-x-auto">
          <h3 className="mb-3 font-semibold">Bowling</h3>

          <table className="w-full min-w-[440px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3">Bowler</th>
                <th className="p-3">O</th>
                <th className="p-3">R</th>
                <th className="p-3">W</th>
                <th className="p-3">Econ</th>
              </tr>
            </thead>

            <tbody>
              {score.bowling.map((bowler) => (
                <tr key={bowler.playerId} className="border-b">
                  <td className="p-3 font-semibold">{bowler.name}</td>
                  <td className="p-3">{bowler.overs}</td>
                  <td className="p-3">{bowler.runs}</td>
                  <td className="p-3 font-bold">{bowler.wickets}</td>
                  <td className="p-3">{bowler.economy}</td>
                </tr>
              ))}

              {score.bowling.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-gray-500">
                    No bowling data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <h3 className="font-semibold">Extras</h3>
          <p className="mt-2 text-sm text-gray-600">
            Wides: {score.extras.wides} · No balls: {score.extras.noBalls}
          </p>
          <p className="text-sm text-gray-600">
            Byes: {score.extras.byes} · Leg byes: {score.extras.legByes}
          </p>
          <p className="mt-1 font-bold">
            Total extras: {score.extras.total}
          </p>
        </div>

        <div className="mt-5">
          <h3 className="font-semibold">Fall of wickets</h3>

          {score.fallOfWickets.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No wickets yet.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {score.fallOfWickets.map((wicket) => (
                <p
                  key={wicket.wicket}
                  className="text-sm text-gray-600"
                >
                  {wicket.wicket}-{wicket.score}: {wicket.batter} ({wicket.dismissal})
                </p>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  const secondBattingIsA = !firstBattingIsA;

  return (
    <div className="space-y-6 pb-8">
      <button
        onClick={() => navigate(`/matches/${id}`)}
        className="flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft size={18} /> Match details
      </button>

      <div className="rounded-2xl bg-gray-900 p-6 text-white">
        <p className="text-sm text-gray-300">
          {match.name || "Cricket Match"}
        </p>

        <h1 className="mt-2 text-2xl font-bold">Match Scorecard</h1>

        <div className="mt-5 flex items-center gap-3">
          <Trophy className="text-yellow-400" size={25} />
          <p className="font-semibold">{result}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-sm text-gray-300">
              {firstBattingIsA ? match.teamAName : match.teamBName}
            </p>
            <p className="mt-1 text-2xl font-bold">
              {first.runs}/{first.wickets}
            </p>
            <p className="text-xs text-gray-300">{first.overs} overs</p>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-sm text-gray-300">
              {secondBattingIsA ? match.teamAName : match.teamBName}
            </p>
            <p className="mt-1 text-2xl font-bold">
              {second.runs}/{second.wickets}
            </p>
            <p className="text-xs text-gray-300">{second.overs} overs</p>
          </div>
        </div>

        {firstDeliveries.length > 0 && !secondInningsComplete && (
          <p className="mt-4 text-sm text-yellow-200">
            Target: {target} · Runs needed: {runsNeeded}
          </p>
        )}
      </div>

      <InningsCard
        title="1st Innings"
        teamName={
          firstBattingIsA ? match.teamAName : match.teamBName
        }
        score={first}
        deliveries={firstDeliveries}
      />

      {secondInnings && (
        <InningsCard
          title="2nd Innings"
          teamName={
            secondBattingIsA ? match.teamAName : match.teamBName
          }
          score={second}
          deliveries={secondDeliveries}
        />
      )}

      <button
        onClick={() => navigate(`/matches/${id}/live`)}
        className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white"
      >
        {secondInnings ? "Continue Scoring" : "Open Live Scoring"}
      </button>
    </div>
  );
}

export default Scorecard;
