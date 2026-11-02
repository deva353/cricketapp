
import { getInningsStats } from "./scoringEngine";

export const calculateScorecard = (deliveries = [],   battingPlayers = [],
  bowlingPlayers = []) => {
  const innings = getInningsStats(deliveries);

  const batting = battingPlayers.map((player) => {
    const balls = deliveries.filter(
      (ball) => ball.batterId === player.id
    );

    const runs = balls.reduce(
      (sum, ball) => sum + ball.batterRuns,
      0
    );

    const facedBalls = balls.filter(
      (ball) => ball.legal || ball.extraType === "noBall"
    ).length;

    const outBall = balls.find(
      (ball) => ball.wicket &&
        ball.dismissedPlayerId === player.id
    );

    return {
      playerId: player.id,
      name: player.name,
      runs,
      balls: facedBalls,
      fours: balls.filter((ball) => ball.batterRuns === 4).length,
      sixes: balls.filter((ball) => ball.batterRuns === 6).length,
      status: outBall
        ? `Out - ${outBall.dismissal}`
        : balls.length > 0
          ? "Not out"
          : "Did not bat",
    };
  });

  const bowling = bowlingPlayers.map((player) => {
    const balls = deliveries.filter(
      (ball) => ball.bowlerId === player.id
    );

    const legalBalls = balls.filter((ball) => ball.legal).length;

    const conceded = balls.reduce((sum, ball) => {
      // Byes and leg byes are not charged to the bowler.
      const chargedExtras =
        ball.extraType === "wide" || ball.extraType === "noBall"
          ? ball.extraRuns
          : 0;

      return sum + ball.batterRuns + chargedExtras;
    }, 0);

    const wickets = balls.filter((ball) => {
      if (!ball.wicket) return false;

      return ![
        "Run Out",
        "Retired Out",
        "Obstructing the Field",
      ].includes(ball.dismissal);
    }).length;

    const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

    const economy =
      legalBalls > 0
        ? (conceded / (legalBalls / 6)).toFixed(2)
        : "0.00";

    return {
      playerId: player.id,
      name: player.name,
      overs,
      legalBalls,
      runs: conceded,
      wickets,
      economy,
    };
  }).filter((player) => player.legalBalls > 0 || player.runs > 0);

  const extras = {
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    total: 0,
  };

  deliveries.forEach((ball) => {
    switch (ball.extraType) {
      case "wide":
        extras.wides += ball.extraRuns;
        break;
      case "noBall":
        extras.noBalls += ball.extraRuns;
        break;
      case "bye":
        extras.byes += ball.extraRuns;
        break;
      case "legBye":
        extras.legByes += ball.extraRuns;
        break;
      default:
        break;
    }
  });

  extras.total =
    extras.wides + extras.noBalls + extras.byes + extras.legByes;

  let wicketsLost = 0;

  const fallOfWickets = deliveries
    .filter((ball) => ball.wicket)
    .map((ball) => {
      wicketsLost += 1;

      const runsAtWicket = deliveries
        .slice(0, deliveries.indexOf(ball) + 1)
        .reduce((sum, item) => sum + item.totalRuns, 0);

      return {
        wicket: wicketsLost,
        score: runsAtWicket,
        batter: players.find(
          (player) => player.id === ball.dismissedPlayerId
        )?.name || "Unknown batter",
        dismissal: ball.dismissal,
      };
    });

  return {
    ...innings,
    batting,
    bowling,
    extras,
    fallOfWickets,
  };
};
