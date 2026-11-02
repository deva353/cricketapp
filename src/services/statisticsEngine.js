
import { getStorage } from "../utils/storage";

export const calculatePlayerStatistics = () => {
  const players = getStorage("gully_players", []);
  const matches = getStorage("gully_matches", []);

  const stats = players.map((player) => ({
    ...player,
    matchesPlayed: 0,
    runs: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    wickets: 0,
    runsConceded: 0,
    ballsBowled: 0,
    highestScore: 0,
    bestBowlingWickets: 0,
    bestBowlingRuns: Infinity,
    notOuts: 0,
    innings: 0,
  }));

  const playerStats = new Map(
    stats.map((player) => [player.id, player])
  );

  matches.forEach((match) => {
    const inningsKeys = [1, 2].map(
      (number) => `gully_live_${match.id}_innings_${number}`
    );

    let matchHasDeliveries = false;
    const appearedPlayers = new Set();

    inningsKeys.forEach((key) => {
      const innings = getStorage(key, null);
      const deliveries = innings?.deliveries || [];

      if (deliveries.length === 0) return;

      matchHasDeliveries = true;

      deliveries.forEach((ball) => {
        appearedPlayers.add(ball.batterId);
        appearedPlayers.add(ball.bowlerId);

        const batter = playerStats.get(ball.batterId);

        if (batter) {
          batter.runs += ball.batterRuns;
          batter.ballsFaced +=
            ball.legal || ball.extraType === "noBall" ? 1 : 0;
          batter.fours += ball.batterRuns === 4 ? 1 : 0;
          batter.sixes += ball.batterRuns === 6 ? 1 : 0;
        }

        const bowler = playerStats.get(ball.bowlerId);

        if (bowler) {
          const chargedRuns =
            ball.batterRuns +
            (
              ball.extraType === "wide" ||
              ball.extraType === "noBall"
                ? ball.extraRuns
                : 0
            );

          bowler.runsConceded += chargedRuns;
          bowler.ballsBowled += ball.legal ? 1 : 0;

          const creditedWicket =
            ball.wicket &&
            ![
              "Run Out",
              "Retired Out",
              "Obstructing the Field",
            ].includes(ball.dismissal);

          if (creditedWicket) {
            bowler.wickets += 1;
          }
        }
      });

      const battingIds = new Set(
        deliveries.map((ball) => ball.batterId)
      );

      battingIds.forEach((playerId) => {
        const player = playerStats.get(playerId);
        if (!player) return;

        const battingBalls = deliveries.filter(
          (ball) => ball.batterId === playerId
        );

        const inningsRuns = battingBalls.reduce(
          (sum, ball) => sum + ball.batterRuns,
          0
        );

        const dismissed = deliveries.some(
          (ball) =>
            ball.wicket && ball.dismissedPlayerId === playerId
        );

        player.innings += 1;
        player.highestScore = Math.max(
          player.highestScore,
          inningsRuns
        );

        if (!dismissed) player.notOuts += 1;
      });
    });

    if (matchHasDeliveries) {
      appearedPlayers.forEach((playerId) => {
        const player = playerStats.get(playerId);
        if (player) player.matchesPlayed += 1;
      });
    }
  });

  stats.forEach((player) => {
    const overs = player.ballsBowled / 6;

    player.battingAverage =
      player.innings - player.notOuts > 0
        ? (
            player.runs /
            (player.innings - player.notOuts)
          ).toFixed(2)
        : player.runs.toFixed(2);

    player.strikeRate =
      player.ballsFaced > 0
        ? (
            (player.runs / player.ballsFaced) * 100
          ).toFixed(2)
        : "0.00";

    player.economy =
      overs > 0
        ? (player.runsConceded / overs).toFixed(2)
        : "0.00";

    player.bowlingAverage =
      player.wickets > 0
        ? (player.runsConceded / player.wickets).toFixed(2)
        : "—";
  });

  return stats;
};

export const getTeamStandings = () => {
  const teams = getStorage("gully_teams", []);
  const matches = getStorage("gully_matches", []);

  const standings = teams.map((team) => ({
    ...team,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    points: 0,
    runsScored: 0,
    runsConceded: 0,
  }));

  const teamMap = new Map(
    standings.map((team) => [team.id, team])
  );

  matches.forEach((match) => {
    const first = getStorage(
      `gully_live_${match.id}_innings_1`,
      null
    );
    const second = getStorage(
      `gully_live_${match.id}_innings_2`,
      null
    );

    if (!first?.isCompleted || !second?.isCompleted) return;

    const firstRuns = first.stats?.runs ?? 0;
    const secondRuns = second.stats?.runs ?? 0;

    const firstBattingTeamId =
      match.firstBatting ||
      (
        match.tossDecision === "Bat"
          ? match.tossWinner
          : match.tossWinner === match.teamAId
            ? match.teamBId
            : match.teamAId
      );

    const firstIsA =
      firstBattingTeamId === match.teamAId ||
      firstBattingTeamId === match.teamAName;

    const firstTeamId = firstIsA ? match.teamAId : match.teamBId;
    const secondTeamId = firstIsA ? match.teamBId : match.teamAId;

    const firstTeam = teamMap.get(firstTeamId);
    const secondTeam = teamMap.get(secondTeamId);

    if (!firstTeam || !secondTeam) return;

    firstTeam.played += 1;
    secondTeam.played += 1;

    firstTeam.runsScored += firstRuns;
    firstTeam.runsConceded += secondRuns;

    secondTeam.runsScored += secondRuns;
    secondTeam.runsConceded += firstRuns;

    if (firstRuns > secondRuns) {
      firstTeam.won += 1;
      firstTeam.points += 2;
      secondTeam.lost += 1;
    } else if (secondRuns > firstRuns) {
      secondTeam.won += 1;
      secondTeam.points += 2;
      firstTeam.lost += 1;
    } else {
      firstTeam.tied += 1;
      secondTeam.tied += 1;
      firstTeam.points += 1;
      secondTeam.points += 1;
    }
  });

  return standings.sort(
    (a, b) =>
      b.points - a.points ||
      b.won - a.won ||
      (b.runsScored - b.runsConceded) -
        (a.runsScored - a.runsConceded)
  );
};
