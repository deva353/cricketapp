
export const generateFixtures = (teamIds, format) => {
  if (teamIds.length < 2) {
    return [];
  }

  const fixtures = [];
  let fixtureNumber = 1;

  if (format === "Round Robin") {
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        fixtures.push({
          id: crypto.randomUUID(),
          fixtureNumber: fixtureNumber++,
          teamAId: teamIds[i],
          teamBId: teamIds[j],
          status: "Upcoming",
          winnerId: null,
          teamAScore: null,
          teamBScore: null,
        });
      }
    }
  }

  if (format === "Knockout") {
    const shuffledTeams = [...teamIds];

    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (!shuffledTeams[i + 1]) break;

      fixtures.push({
        id: crypto.randomUUID(),
        fixtureNumber: fixtureNumber++,
        teamAId: shuffledTeams[i],
        teamBId: shuffledTeams[i + 1],
        status: "Upcoming",
        winnerId: null,
        teamAScore: null,
        teamBScore: null,
        round: "Round 1",
      });
    }
  }

  return fixtures;
};

export const calculateTournamentStandings = (
  tournament,
  teams
) => {
  const standings = tournament.teamIds.map((teamId) => {
    const team = teams.find((item) => item.id === teamId);

    return {
      teamId,
      teamName: team?.name || "Unknown Team",
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      runsScored: 0,
      runsConceded: 0,
    };
  });

  const standingsMap = new Map(
    standings.map((team) => [team.teamId, team])
  );

  tournament.fixtures.forEach((fixture) => {
    if (fixture.status !== "Completed") return;

    const teamA = standingsMap.get(fixture.teamAId);
    const teamB = standingsMap.get(fixture.teamBId);

    if (!teamA || !teamB) return;

    if (
      typeof fixture.teamAScore !== "number" ||
      typeof fixture.teamBScore !== "number"
    ) {
      return;
    }

    teamA.played += 1;
    teamB.played += 1;

    teamA.runsScored += fixture.teamAScore;
    teamA.runsConceded += fixture.teamBScore;

    teamB.runsScored += fixture.teamBScore;
    teamB.runsConceded += fixture.teamAScore;

    if (fixture.teamAScore > fixture.teamBScore) {
      teamA.won += 1;
      teamA.points += 2;
      teamB.lost += 1;
    } else if (fixture.teamBScore > fixture.teamAScore) {
      teamB.won += 1;
      teamB.points += 2;
      teamA.lost += 1;
    } else {
      teamA.tied += 1;
      teamB.tied += 1;
      teamA.points += 1;
      teamB.points += 1;
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
