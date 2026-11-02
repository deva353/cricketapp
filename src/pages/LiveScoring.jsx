
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";

import { getStorage, setStorage } from "../utils/storage";
import { useRef } from "react";
import {
  addDelivery,
  getInningsStats,
  undoDelivery,
} from "../services/scoringEngine";

const getPlayers = (ids = [], allPlayers = []) =>
  ids
    .map((id) => allPlayers.find((player) => player.id === id))
    .filter(Boolean);

const makeInitialState = (
  strikerId,
  nonStrikerId,
  bowlerId
) => ({
  deliveries: [],
  strikerId,
  nonStrikerId,
  bowlerId,
  stats: getInningsStats([]),
  isCompleted: false,
  needsNewBowler: false,
});

const getCurrentOverBalls = (deliveries = []) => {
  const balls = [];
  let legalCount = 0;

  for (let i = deliveries.length - 1; i >= 0; i--) {
    const ball = deliveries[i];

    if (ball.legal) {
      if (legalCount === 6) break;
      legalCount++;
    }

    balls.unshift(ball);
  }

  return balls;
};

const getBallLabel = (ball) => {
  if (ball.wicket) return "W";

  if (ball.extraType === "wide") return "WD";
  if (ball.extraType === "noBall") return "NB";
  if (ball.extraType === "bye") return "B";
  if (ball.extraType === "legBye") return "LB";

  return String(ball.batterRuns ?? 0);
};

function LiveScoring() {
  const { id } = useParams();
  const navigate = useNavigate();
const [matches] = useState(() =>
  getStorage("gully_matches", [])
);

const [allPlayers] = useState(() =>
  getStorage("gully_players", [])
);

const match = useMemo(
  () => matches.find((item) => item.id === id),
  [matches, id]
);
const activeStorageKeyRef = useRef(null);
activeStorageKeyRef.current = storageKey;
useEffect(() => {
  if (!state) return;

  if (activeStorageKeyRef.current !== storageKey) return;

  setStorage(storageKey, state);
}, [state, storageKey]);

  const [inningsNumber, setInningsNumber] = useState(1);
  const [state, setState] = useState(null);

  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  const [inningsConfig, setInningsConfig] = useState(null);

  const [selectedExtra, setSelectedExtra] = useState("none");
  const [extraRuns, setExtraRuns] = useState(1);

  const [isWicket, setIsWicket] = useState(false);
  const [dismissal, setDismissal] = useState("Bowled");
  const [dismissedPlayerId, setDismissedPlayerId] = useState("");
  const [nextBatterId, setNextBatterId] = useState("");

  const [selectedBowlerId, setSelectedBowlerId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const storageKey = `gully_live_${id}_innings_${inningsNumber}`;
  const targetKey = `gully_live_${id}_target`;

  const target = getStorage(targetKey, null);

  const teamAPlayers = useMemo(
    () => getPlayers(match?.playersA, allPlayers),
    [match, allPlayers]
  );

  const teamBPlayers = useMemo(
    () => getPlayers(match?.playersB, allPlayers),
    [match, allPlayers]
  );

  // Initialize the selected innings.
  useEffect(() => {
    if (!match) return;

    const battingFirst =
      match.firstBatting ||
      (match.tossDecision === "Bat"
        ? match.tossWinner
        : match.tossWinner === match.teamAId
          ? match.teamBId
          : match.teamAId);

    const firstInningsIsA =
      battingFirst === match.teamAId ||
      battingFirst === match.teamAName;

    const firstIsA =
      inningsNumber === 1
        ? firstInningsIsA
        : !firstInningsIsA;

    const batPlayers = firstIsA
      ? teamAPlayers
      : teamBPlayers;

    const bowlPlayers = firstIsA
      ? teamBPlayers
      : teamAPlayers;

    if (batPlayers.length < 2 || bowlPlayers.length < 1) {
      return;
    }

    const openingStriker =
      match.openingStrikerId || batPlayers[0].id;

    const openingNonStriker =
      match.openingNonStrikerId || batPlayers[1].id;

    const openingBowler =
      match.openingBowlerId || bowlPlayers[0].id;

    const config = {
      battingPlayers: batPlayers,
      bowlingPlayers: bowlPlayers,
      maxOvers: Number(match.overs) || 5,
      openingStrikerId: openingStriker,
      openingNonStrikerId: openingNonStriker,
    };

    setBattingTeam({
      name: firstIsA ? match.teamAName : match.teamBName,
      id: firstIsA ? match.teamAId : match.teamBId,
      players: batPlayers,
    });

    setBowlingTeam({
      name: firstIsA ? match.teamBName : match.teamAName,
      id: firstIsA ? match.teamBId : match.teamAId,
      players: bowlPlayers,
    });

    setInningsConfig(config);

    const saved = getStorage(storageKey, null);

    if (saved) {
      setState(saved);
    } else {
      setState(
        makeInitialState(
          openingStriker,
          openingNonStriker,
          openingBowler
        )
      );
    }

    setSelectedBowlerId("");
    setErrorMessage("");
  }, [id, inningsNumber, match, teamAPlayers, teamBPlayers, storageKey]);

  // Save the active innings after every state change.
  useEffect(() => {
    if (state) {
      setStorage(storageKey, state);
    }
  }, [state, storageKey]);

  if (!match) {
    return (
      <div className="rounded-xl bg-white p-6">
        <h2 className="font-bold text-red-600">
          Match not found.
        </h2>
        <button
          onClick={() => navigate("/matches")}
          className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white"
        >
          Back to matches
        </button>
      </div>
    );
  }

  if (!state || !inningsConfig || !battingTeam || !bowlingTeam) {
    return (
      <div className="p-6">
        <h2 className="font-bold">Preparing scoring...</h2>
        <p className="mt-2 text-sm text-gray-500">
          Check that both teams have selected players and the match has valid toss details.
        </p>
      </div>
    );
  }

  const stats = getInningsStats(state.deliveries);

  const striker = battingTeam.players.find(
    (player) => player.id === state.strikerId
  );

  const nonStriker = battingTeam.players.find(
    (player) => player.id === state.nonStrikerId
  );

  const bowler = bowlingTeam.players.find(
    (player) => player.id === state.bowlerId
  );

  const availableBatters = battingTeam.players.filter(
    (player) =>
      player.id !== state.strikerId &&
      player.id !== state.nonStrikerId &&
      !state.deliveries.some(
        (ball) =>
          ball.wicket &&
          ball.dismissedPlayerId === player.id
      )
  );

  const currentOverBalls = getCurrentOverBalls(state.deliveries);

  const runsNeeded =
    inningsNumber === 2 && target
      ? Math.max(0, target - stats.runs)
      : null;

  const ballsRemaining =
    Math.max(0, inningsConfig.maxOvers * 6 - stats.legalBalls);

  const getBatterStats = (playerId) => {
    const balls = state.deliveries.filter(
      (ball) => ball.batterId === playerId
    );

    const runs = balls.reduce(
      (sum, ball) => sum + Number(ball.batterRuns || 0),
      0
    );

    const facedBalls = balls.filter(
      (ball) =>
        ball.legal ||
        ball.extraType === "noBall"
    ).length;

    const fours = balls.filter(
      (ball) => ball.batterRuns === 4
    ).length;

    const sixes = balls.filter(
      (ball) => ball.batterRuns === 6
    ).length;

    const strikeRate =
      facedBalls > 0
        ? ((runs / facedBalls) * 100).toFixed(2)
        : "0.00";

    return {
      runs,
      balls: facedBalls,
      fours,
      sixes,
      strikeRate,
    };
  };

  const handleDelivery = (runs, extraType = "none") => {
    if (state.isCompleted) return;

    if (state.needsNewBowler) {
      setErrorMessage(
        "Select the next bowler before continuing."
      );
      return;
    }

    setErrorMessage("");

    const isWide = extraType === "wide";
    const isNoBall = extraType === "noBall";
    const isBye = extraType === "bye";
    const isLegBye = extraType === "legBye";
    const isExtra = extraType !== "none";

    const batterRuns =
      isBye || isLegBye ? 0 : Number(runs);

    const enteredExtras = isExtra
      ? Math.max(1, Number(extraRuns) || 1)
      : 0;

    const extras = isWide || isNoBall
      ? enteredExtras
      : enteredExtras;

    const totalRuns = batterRuns + extras;
    const legal = !isWide && !isNoBall;

    // Completed runs affect strike rotation.
    // Wide/no-ball penalty runs alone do not.
    const completedRuns =
      isBye || isLegBye
        ? extras
        : batterRuns;

    if (isWicket && !dismissedPlayerId) {
      setErrorMessage("Select the dismissed batter.");
      return;
    }

    if (
      isWicket &&
      dismissedPlayerId !== state.strikerId &&
      dismissedPlayerId !== state.nonStrikerId
    ) {
      setErrorMessage(
        "Select one of the two batters currently at the crease."
      );
      return;
    }

    // Basic dismissal restrictions for this version.
    if (isWicket && isWide) {
      const allowedOnWide = [
        "Run Out",
        "Stumped",
        "Hit Wicket",
        "Obstructing the Field",
      ];

      if (!allowedOnWide.includes(dismissal)) {
        setErrorMessage(
          "Select a dismissal allowed on a wide delivery."
        );
        return;
      }
    }

    if (isWicket && isNoBall) {
      const allowedOnNoBall = [
        "Run Out",
        "Obstructing the Field",
      ];

      if (!allowedOnNoBall.includes(dismissal)) {
        setErrorMessage(
          "Select a dismissal allowed on a no-ball."
        );
        return;
      }
    }

    const allOutAfterWicket =
      stats.wickets + 1 >=
      inningsConfig.battingPlayers.length - 1;

    if (isWicket && !nextBatterId && !allOutAfterWicket) {
      setErrorMessage("Select the next batter.");
      return;
    }

    if (
      isWicket &&
      nextBatterId &&
      (
        nextBatterId === state.strikerId ||
        nextBatterId === state.nonStrikerId ||
        state.deliveries.some(
          (ball) =>
            ball.wicket &&
            ball.dismissedPlayerId === nextBatterId
        )
      )
    ) {
      setErrorMessage(
        "Select an available batter who has not been dismissed."
      );
      return;
    }

    const delivery = {
      id: crypto.randomUUID(),
      batterId: state.strikerId,
      bowlerId: state.bowlerId,

      batterRuns,
      extraRuns: extras,
      extraType,
      totalRuns,

      legal,
      completedRuns,
      strikeRotationRuns: completedRuns,

      wicket: isWicket,
      dismissal: isWicket ? dismissal : "",
      dismissedPlayerId: isWicket
        ? dismissedPlayerId
        : "",
      nextBatterId: isWicket
        ? nextBatterId
        : "",

      timestamp: new Date().toISOString(),
    };

    try {
      const updated = addDelivery(
        state,
        delivery,
        inningsConfig
      );

      // Finish the chase immediately when the target is reached.
      if (
        inningsNumber === 2 &&
        target &&
        updated.stats.runs >= target
      ) {
        updated.isCompleted = true;
        updated.needsNewBowler = false;
      }

      setState(updated);

      setSelectedExtra("none");
      setExtraRuns(1);
      setIsWicket(false);
      setDismissedPlayerId("");
      setNextBatterId("");
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to record this delivery."
      );
    }
  };

  const handleUndo = () => {
    if (state.deliveries.length === 0) return;

    const confirmed = window.confirm(
      "Undo the last delivery?"
    );

    if (!confirmed) return;

    try {
      const updated = undoDelivery(state, inningsConfig);

      // Recheck target after undoing a delivery.
      if (
        inningsNumber === 2 &&
        target &&
        updated.stats.runs < target
      ) {
        updated.isCompleted = false;
      }

      setState(updated);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to undo the delivery."
      );
    }
  };

  const handleBowlerChange = (playerId) => {
    if (!state.needsNewBowler) {
      setErrorMessage(
        "You can change the bowler only after a completed over."
      );
      return;
    }

    if (!playerId) return;

    if (playerId === state.bowlerId) {
      setErrorMessage(
        "The same bowler cannot bowl consecutive overs."
      );
      return;
    }

    setState((previous) => ({
      ...previous,
      bowlerId: playerId,
      needsNewBowler: false,
    }));

    setSelectedBowlerId("");
    setErrorMessage("");
  };

  const changeInnings = () => {
    if (inningsNumber === 1) {
      const firstInningsTarget = stats.runs + 1;

      setStorage(targetKey, firstInningsTarget);

      const currentMatches = getStorage("gully_matches", []);

      const updatedMatches = currentMatches.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Live",
              firstInningsRuns: stats.runs,
              target: firstInningsTarget,
            }
          : item
      );

      setStorage("gully_matches", updatedMatches);

      setInningsNumber(2);
      setState(null);
      setSelectedBowlerId("");
      setErrorMessage("");
      return;
    }

    const firstInningsState = getStorage(
      `gully_live_${id}_innings_1`,
      null
    );

    const firstRuns =
      firstInningsState?.stats?.runs ??
      getInningsStats(firstInningsState?.deliveries || []).runs;

    const secondRuns = stats.runs;

    let result = "";
    let winnerId = null;
    let winnerName = null;

    if (secondRuns >= target) {
      const wicketsRemaining = Math.max(
        0,
        inningsConfig.battingPlayers.length - 1 - stats.wickets
      );

      result = `${battingTeam.name} won by ${wicketsRemaining} wickets`;
      winnerId = battingTeam.id;
      winnerName = battingTeam.name;
    } else if (secondRuns === firstRuns) {
      result = "Match tied";
    } else {
      result = `${bowlingTeam.name} won by ${firstRuns - secondRuns} runs`;
      winnerId = bowlingTeam.id;
      winnerName = bowlingTeam.name;
    }

    const currentMatches = getStorage("gully_matches", []);

    const updatedMatches = currentMatches.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "Completed",
            result,
            winnerId,
            winnerName,
            firstInningsRuns: firstRuns,
            secondInningsRuns: secondRuns,
            target,
            completedAt: new Date().toISOString(),
          }
        : item
    );

    setStorage("gully_matches", updatedMatches);

    alert(`Match completed: ${result}`);

    navigate(`/matches/${id}`);
  };

  const getRunButtonClass = (runs) => {
    if (runs === 4 || runs === 6) {
      return "bg-green-700 hover:bg-green-800";
    }

    return "bg-gray-800 hover:bg-gray-900";
  };

  return (
    <div className="space-y-5 pb-8">

      {/* Back navigation */}
      <button
        onClick={() => navigate(`/matches/${id}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-green-700"
      >
        <ArrowLeft size={18} />
        Match details
      </button>

      {/* Match scoreboard */}
      <div className="rounded-2xl bg-gray-900 p-6 text-white">

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-300">
              {match.name || "Gully Cricket Match"}
            </p>

            <p className="mt-1 text-sm text-green-300">
              Innings {inningsNumber} · {battingTeam.name} batting
            </p>
          </div>

          <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
            LIVE
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <h1 className="text-5xl font-extrabold">
            {stats.runs}/{stats.wickets}
          </h1>

          <p className="pb-1 text-gray-300">
            ({stats.overs} overs)
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-700 pt-4 text-sm">
          <p>
            Run rate: <strong>{stats.runRate}</strong>
          </p>

          <p>
            Overs limit: <strong>{inningsConfig.maxOvers}</strong>
          </p>

          <p>
            Extras: <strong>{stats.extras}</strong>
          </p>

          <p>
            Legal balls: <strong>{stats.legalBalls}</strong>
          </p>

          <p>
            Balls remaining: <strong>{ballsRemaining}</strong>
          </p>

          {inningsNumber === 2 && target && (
            <>
              <p>
                Target: <strong>{target}</strong>
              </p>

              <p>
                Runs needed: <strong>{runsNeeded}</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Batting section */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Batting</h2>

        {[striker, nonStriker].filter(Boolean).map((player) => {
          const playerStats = getBatterStats(player.id);

          return (
            <div
              key={player.id}
              className="flex justify-between border-b py-3 last:border-0"
            >
              <div>
                <p className="font-semibold">
                  {player.name}
                  {player.id === state.strikerId ? " *" : ""}
                </p>

                <p className="text-xs text-gray-500">
                  {playerStats.balls} balls · SR {playerStats.strikeRate}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold">{playerStats.runs}</p>

                <p className="text-xs text-gray-500">
                  {playerStats.fours} fours · {playerStats.sixes} sixes
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bowler section */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Bowler</h2>

        <p className="mt-2">
          {bowler?.name || "Select bowler"}
        </p>

        <label className="mt-3 block text-sm text-gray-600">
          Change bowler
        </label>

        <select
          className="form-control mt-1"
          value={selectedBowlerId}
          disabled={
            !state.needsNewBowler ||
            state.isCompleted
          }
          onChange={(event) => {
            setSelectedBowlerId(event.target.value);
            handleBowlerChange(event.target.value);
          }}
        >
          <option value="">Select next bowler</option>

          {bowlingTeam.players
            .filter((player) => player.id !== state.bowlerId)
            .map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
        </select>

        {state.needsNewBowler && (
          <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            Over completed. Select the next bowler before continuing.
          </p>
        )}
      </div>

      {/* Add delivery */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold">Add delivery</h2>

        <p className="mb-2 text-sm text-gray-500">
          Batter runs
        </p>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[0, 1, 2, 3, 4, 6].map((runs) => (
            <button
              key={runs}
              disabled={
                state.isCompleted ||
                state.needsNewBowler
              }
              onClick={() => handleDelivery(runs)}
              className={`rounded-lg py-4 text-lg font-bold text-white disabled:opacity-40 ${getRunButtonClass(runs)}`}
            >
              {runs}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-6 text-sm text-gray-500">
          Extras
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["wide", "Wide"],
            ["noBall", "No ball"],
            ["bye", "Bye"],
            ["legBye", "Leg bye"],
          ].map(([value, label]) => (
            <button
              key={value}
              disabled={
                state.isCompleted ||
                state.needsNewBowler
              }
              onClick={() => {
                setSelectedExtra(value);
                setExtraRuns(1);
                setIsWicket(false);
                handleDelivery(0, value);
              }}
              className="rounded-lg border border-gray-300 py-3 font-semibold hover:bg-gray-100 disabled:opacity-40"
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Each extra button records one extra run. The scoring engine stores the extra type separately.
        </p>
      </div>

      {/* Wicket section */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Wicket</h2>

        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={isWicket}
            disabled={
              state.isCompleted ||
              state.needsNewBowler
            }
            onChange={(event) => {
              setIsWicket(event.target.checked);
              setDismissedPlayerId(state.strikerId);
              setNextBatterId("");
              setErrorMessage("");
            }}
          />

          Wicket on this delivery
        </label>

        {isWicket && (
          <div className="mt-4 space-y-3">

            <label className="block text-sm font-medium text-gray-600">
              Dismissal type
            </label>

            <select
              className="form-control"
              value={dismissal}
              onChange={(event) =>
                setDismissal(event.target.value)
              }
            >
              {[
                "Bowled",
                "Caught",
                "LBW",
                "Run Out",
                "Stumped",
                "Hit Wicket",
                "Retired Out",
                "Obstructing the Field",
              ].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-600">
              Dismissed batter
            </label>

            <select
              className="form-control"
              value={dismissedPlayerId}
              onChange={(event) =>
                setDismissedPlayerId(event.target.value)
              }
            >
              <option value={state.strikerId}>
                {striker?.name} (Striker)
              </option>

              <option value={state.nonStrikerId}>
                {nonStriker?.name} (Non-striker)
              </option>
            </select>

            {availableBatters.length > 0 && (
              <>
                <label className="block text-sm font-medium text-gray-600">
                  Next batter
                </label>

                <select
                  className="form-control"
                  value={nextBatterId}
                  onChange={(event) =>
                    setNextBatterId(event.target.value)
                  }
                >
                  <option value="">Select next batter</option>

                  {availableBatters.map((player) => (
                    <option
                      key={player.id}
                      value={player.id}
                    >
                      {player.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              onClick={() => handleDelivery(0, selectedExtra)}
              disabled={
                state.isCompleted ||
                state.needsNewBowler
              }
              className="w-full rounded-lg bg-red-600 py-3 font-bold text-white disabled:opacity-40"
            >
              Confirm wicket
            </button>
          </div>
        )}
      </div>

      {/* Current over */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold">Current over</h2>

        <div className="flex flex-wrap gap-2">
          {currentOverBalls.map((ball) => (
            <span
              key={ball.id}
              className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 font-bold ${
                ball.wicket
                  ? "bg-red-100 text-red-700"
                  : ball.extraType !== "none"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {getBallLabel(ball)}
            </span>
          ))}

          {currentOverBalls.length === 0 && (
            <p className="text-sm text-gray-500">
              No deliveries yet.
            </p>
          )}
        </div>
      </div>

      {/* Undo */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleUndo}
          disabled={state.deliveries.length === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-semibold disabled:opacity-40"
        >
          <RotateCcw size={17} />
          Undo last delivery
        </button>
      </div>

      {/* Innings completed */}
      {state.isCompleted && (
        <div className="rounded-xl bg-green-50 p-5">
          <div className="flex items-center gap-2 font-bold text-green-800">
            <Trophy size={20} />
            {inningsNumber === 2 && target && stats.runs >= target
              ? "Target reached"
              : "Innings completed"}
          </div>

          <p className="mt-2 text-sm text-green-800">
            {battingTeam.name}: {stats.runs}/{stats.wickets} in {stats.overs} overs.
          </p>

          {inningsNumber === 2 && target && (
            <p className="mt-2 text-sm text-green-800">
              Target: {target} · Current score: {stats.runs}
            </p>
          )}

          <button
            onClick={changeInnings}
            className="mt-4 w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
          >
            {inningsNumber === 1
              ? "Start second innings"
              : "Finish match"}
          </button>
        </div>
      )}
    </div>
  );
}

export default LiveScoring;
