
export const getInningsStats = (deliveries = []) => {
  const stats = {
    runs: 0,
    wickets: 0,
    legalBalls: 0,
    batterRuns: 0,
    extras: 0,
    fours: 0,
    sixes: 0,
    overs: "0.0",
    runRate: "0.00",
  };

  for (const ball of deliveries) {
    const totalRuns = Number(ball.totalRuns ?? 0);
    const batterRuns = Number(ball.batterRuns ?? 0);
    const extraRuns = Number(ball.extraRuns ?? 0);

    stats.runs += totalRuns;
    stats.batterRuns += batterRuns;
    stats.extras += extraRuns;

    if (ball.legal) stats.legalBalls += 1;
    if (ball.wicket) stats.wickets += 1;
    if (batterRuns === 4) stats.fours += 1;
    if (batterRuns === 6) stats.sixes += 1;
  }

  const completedOvers = Math.floor(stats.legalBalls / 6);
  const ballsInOver = stats.legalBalls % 6;

  stats.overs = `${completedOvers}.${ballsInOver}`;

  const oversDecimal = stats.legalBalls / 6;

  stats.runRate =
    oversDecimal > 0
      ? (stats.runs / oversDecimal).toFixed(2)
      : "0.00";

  return stats;
};

// Runs that cause the batters to change ends.
// Wide-ball penalty runs and no-ball penalty runs alone do not
// count as completed runs for strike rotation.
const getStrikeRotationRuns = (delivery) => {
  if (Number.isInteger(delivery.strikeRotationRuns)) {
    return delivery.strikeRotationRuns;
  }

  const extraType = String(delivery.extraType || "").toLowerCase();

  if (extraType === "wide" || extraType === "wides") {
    return Number(delivery.batterRuns ?? 0) +
      Number(delivery.completedRuns ?? 0);
  }

  if (
    extraType === "bye" ||
    extraType === "byes" ||
    extraType === "legbye" ||
    extraType === "legbyes" ||
    extraType === "leg-bye" ||
    extraType === "leg-byes"
  ) {
    return Number(delivery.completedRuns ?? delivery.extraRuns ?? 0);
  }

  return Number(delivery.batterRuns ?? 0) +
    Number(delivery.completedRuns ?? 0);
};

export const addDelivery = (state, delivery, inningsConfig) => {
  if (state.isCompleted) {
    throw new Error("This innings is already completed.");
  }

  if (!delivery || typeof delivery !== "object") {
    throw new Error("Invalid delivery.");
  }

  if (!inningsConfig || !Array.isArray(inningsConfig.battingPlayers)) {
    throw new Error("Invalid innings configuration.");
  }

  const totalRuns = Number(delivery.totalRuns ?? 0);
  const batterRuns = Number(delivery.batterRuns ?? 0);
  const extraRuns = Number(delivery.extraRuns ?? 0);

  if (
    !Number.isInteger(totalRuns) ||
    !Number.isInteger(batterRuns) ||
    !Number.isInteger(extraRuns) ||
    totalRuns < 0 ||
    batterRuns < 0 ||
    extraRuns < 0 ||
    totalRuns !== batterRuns + extraRuns
  ) {
    throw new Error("Invalid delivery run values.");
  }

  if (delivery.wicket && !delivery.dismissedPlayerId) {
    throw new Error("Select the dismissed batter.");
  }

  const deliveries = [...state.deliveries, delivery];
  const stats = getInningsStats(deliveries);

  let strikerId = state.strikerId;
  let nonStrikerId = state.nonStrikerId;

  // Remember which end the dismissed batter occupied before
  // applying normal strike rotation.
  const dismissedEnd = delivery.wicket
    ? delivery.dismissedPlayerId === strikerId
      ? "striker"
      : delivery.dismissedPlayerId === nonStrikerId
        ? "nonStriker"
        : null
    : null;

  if (delivery.wicket && !dismissedEnd) {
    throw new Error("Dismissed batter is not currently at the crease.");
  }

  // Apply completed-run strike rotation.
  const strikeRotationRuns = getStrikeRotationRuns(delivery);

  if (strikeRotationRuns % 2 !== 0) {
    [strikerId, nonStrikerId] = [nonStrikerId, strikerId];
  }

  // Apply end-of-over rotation.
  const overCompleted =
    delivery.legal &&
    stats.legalBalls > 0 &&
    stats.legalBalls % 6 === 0;

  if (overCompleted) {
    [strikerId, nonStrikerId] = [nonStrikerId, strikerId];
  }

  // Replace the dismissed batter at the end where they were
  // dismissed. For run-outs involving completed runs, the caller
  // must provide replacementEnd if the crossing rule changes the end.
  if (delivery.wicket && delivery.nextBatterId) {
    const replacementEnd = delivery.replacementEnd || dismissedEnd;

    if (replacementEnd === "striker") {
      strikerId = delivery.nextBatterId;
    } else if (replacementEnd === "nonStriker") {
      nonStrikerId = delivery.nextBatterId;
    } else {
      throw new Error("Invalid replacement batter position.");
    }
  }

  const totalBatters = inningsConfig.battingPlayers.length;

  if (totalBatters < 2) {
    throw new Error("At least two batting players are required.");
  }

  const allOut = stats.wickets >= totalBatters - 1;

  const maxOvers = Number(inningsConfig.maxOvers);

  if (!Number.isInteger(maxOvers) || maxOvers < 1) {
    throw new Error("Invalid maximum overs.");
  }

  const oversFinished = stats.legalBalls >= maxOvers * 6;

  return {
    ...state,
    deliveries,
    strikerId,
    nonStrikerId,
    stats,
    isCompleted: allOut || oversFinished,
    needsNewBowler:
      overCompleted &&
      !allOut &&
      !oversFinished,
  };
};

export const undoDelivery = (state, inningsConfig) => {
  if (!state.deliveries?.length) return state;

  const deliveries = state.deliveries.slice(0, -1);

  let restored = {
    ...state,
    deliveries: [],
    strikerId: inningsConfig.openingStrikerId,
    nonStrikerId: inningsConfig.openingNonStrikerId,
    stats: getInningsStats([]),
    isCompleted: false,
    needsNewBowler: false,
  };

  for (const ball of deliveries) {
    restored = addDelivery(restored, ball, inningsConfig);
  }

  return {
    ...restored,
    // Preserve unrelated state properties from the original state.
    bowlerId: state.bowlerId,
  };
};
