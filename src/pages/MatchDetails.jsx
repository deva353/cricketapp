
import { useParams, useNavigate } from "react-router-dom";

import { getStorage, setStorage } from "../utils/storage";

import {
  ArrowLeft,
  Play,
  MapPin,
  Calendar,
  Clock,
  Trophy,
  Users,
  ShieldCheck,
  CircleDot,
  ClipboardList,
  Target,
  Swords,
  ChevronRight,
  Radio,
  CheckCircle2,
  Crown,
  Goal,
} from "lucide-react";

const statusStyles = {
  Upcoming: "border-blue-200 bg-blue-50 text-blue-700",
  Live: "border-red-200 bg-red-50 text-red-700",
  Completed: "border-gray-200 bg-gray-100 text-gray-700",
};

function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const matches = getStorage("gully_matches", []);
  const match = matches.find((item) => item.id === id);

  if (!match) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="gc-card w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <Trophy size={38} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Match Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            This match may have been deleted or the match URL is invalid.
          </p>

          <button
            type="button"
            onClick={() => navigate("/matches")}
            className="gc-btn gc-btn-primary mt-6"
          >
            <ArrowLeft size={17} />
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const tossWinnerName =
    match.tossWinner === match.teamA
      ? match.teamAName
      : match.tossWinner === match.teamB
        ? match.teamBName
        : match.tossWinner || "Not specified";

  const firstBattingName =
    match.firstBatting === match.teamA
      ? match.teamAName
      : match.firstBatting === match.teamB
        ? match.teamBName
        : "Not specified";

  const startScoring = () => {
    if (match.status === "Completed") return;

    if (match.status === "Upcoming") {
      const updatedMatches = matches.map((item) =>
        item.id === id
          ? { ...item, status: "Live" }
          : item
      );

      const saved = setStorage("gully_matches", updatedMatches);

      if (!saved) {
        alert("Unable to update match status. Check browser storage.");
        return;
      }
    }

    navigate(`/matches/${id}/live`);
  };

  const isCompleted = match.status === "Completed";
  const isLive = match.status === "Live";

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-7 pb-8">

      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate("/matches")}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-green-700"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm transition-colors group-hover:bg-green-50">
          <ArrowLeft size={18} />
        </span>
        Back to Matches
      </button>

      {/* Match hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-green-950 to-green-800 p-6 text-white shadow-xl sm:p-8">

        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />

        <div className="relative z-10">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              statusStyles[match.status] ||
              "border-white/20 bg-white/10 text-white"
            }`}>
              {isLive && (
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
              {match.status}
            </span>

            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-green-100">
              {match.matchType || "Cricket Match"}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-green-200">
              MATCH DETAILS
            </p>

            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">
              {match.name || "Cricket Match"}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-green-100/80">
              <span className="flex items-center gap-2">
                <Calendar size={15} />
                {match.date
                  ? new Date(match.date).toLocaleString()
                  : "Date not specified"}
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={15} />
                {match.ground || "Ground not specified"}
              </span>
            </div>
          </div>

          {/* Team comparison */}
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm sm:p-6">

            <TeamHero
              name={match.teamAName}
              players={match.playersA?.length ?? 0}
              alignment="left"
            />

            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-extrabold">
                VS
              </div>

              <p className="mt-2 whitespace-nowrap text-xs font-semibold text-green-100">
                {match.overs} Overs
              </p>
            </div>

            <TeamHero
              name={match.teamBName}
              players={match.playersB?.length ?? 0}
              alignment="right"
            />
          </div>
        </div>
      </section>

      {/* Quick match information */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <InfoStat
          icon={<Clock size={20} />}
          label="Overs"
          value={match.overs ?? "-"}
          color="green"
        />

        <InfoStat
          icon={<CircleDot size={20} />}
          label="Ball Type"
          value={match.ballType || "-"}
          color="blue"
        />

        <InfoStat
          icon={<Swords size={20} />}
          label="Format"
          value={match.matchType || "-"}
          color="purple"
        />

        <InfoStat
          icon={<Users size={20} />}
          label="Total Players"
          value={
            (match.playersA?.length ?? 0) +
            (match.playersB?.length ?? 0)
          }
          color="amber"
        />
      </div>

      {/* Match actions */}
      <section className="gc-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900">
          Match Actions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Continue scoring or view the match scorecard.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="button"
            onClick={startScoring}
            disabled={isCompleted}
            className="gc-btn gc-btn-primary justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLive ? (
              <>
                <Play size={19} />
                Continue Scoring
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 size={19} />
                Match Completed
              </>
            ) : (
              <>
                <Play size={19} />
                Start Scoring
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/matches/${id}/scorecard`)}
            className="gc-btn gc-btn-secondary justify-center py-3.5"
          >
            <ClipboardList size={19} />
            View Scorecard
            <ChevronRight size={17} />
          </button>
        </div>

        {isCompleted && (
          <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
            This match is completed. You can view its scorecard, but live scoring is disabled.
          </p>
        )}
      </section>

      {/* Toss information */}
      <section className="gc-card p-5 sm:p-6">
        <SectionHeading
          icon={<Trophy size={20} />}
          title="Toss Information"
          subtitle="Toss result and first innings details"
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DetailCard
            label="Toss Winner"
            value={tossWinnerName}
            icon={<Crown size={18} />}
          />

          <DetailCard
            label="Toss Decision"
            value={match.tossDecision || "Not specified"}
            icon={<ShieldCheck size={18} />}
          />

          <DetailCard
            label="First Batting"
            value={firstBattingName}
            icon={<Goal size={18} />}
          />
        </div>
      </section>

      {/* Team and player information */}
      <section className="gc-card p-5 sm:p-6">
        <SectionHeading
          icon={<Users size={20} />}
          title="Team Information"
          subtitle="Playing XI and team leadership"
        />

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <TeamDetails
            title={match.teamAName}
            playerIds={match.playersA || []}
            captainId={match.captainA}
            wicketkeeperId={match.wicketkeeperA}
          />

          <TeamDetails
            title={match.teamBName}
            playerIds={match.playersB || []}
            captainId={match.captainB}
            wicketkeeperId={match.wicketkeeperB}
          />
        </div>
      </section>

      {/* Rules */}
      {match.rules && (
        <section className="gc-card p-5 sm:p-6">
          <SectionHeading
            icon={<ShieldCheck size={20} />}
            title="Match Rules"
            subtitle="Rules configured for this match"
          />

          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(match.rules)
              .filter(([, enabled]) => enabled)
              .map(([key]) => (
                <span
                  key={key}
                  className="rounded-full border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800"
                >
                  {key}
                </span>
              ))}

            {!Object.values(match.rules).some(Boolean) && (
              <p className="text-sm text-gray-400">
                No additional rules enabled.
              </p>
            )}
          </div>
        </section>
      )}

    </div>
  );
}

function TeamHero({ name, players, alignment }) {
  const right = alignment === "right";

  return (
    <div className={`min-w-0 ${right ? "text-right" : "text-left"}`}>
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-green-100 sm:h-14 sm:w-14 ${
        right ? "ml-auto" : ""
      }`}>
        <ShieldCheck size={27} />
      </div>

      <h2 className="break-words text-sm font-bold sm:text-lg">
        {name || "Team"}
      </h2>

      <p className="mt-1 text-xs text-green-100/70">
        {players} Players
      </p>
    </div>
  );
}

function InfoStat({ icon, label, value, color }) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="gc-stat-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>

      <p className="text-xs font-medium text-gray-500">{label}</p>

      <p className="mt-1 break-words text-lg font-bold text-gray-900 sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function DetailCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:border-green-200 hover:bg-green-50">
      <div className="flex items-center gap-2 text-green-700">
        {icon}
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>

      <p className="mt-3 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function TeamDetails({
  title,
  playerIds,
  captainId,
  wicketkeeperId,
}) {
  const players = getStorage("gully_players", []);

  const getPlayerName = (id) =>
    players.find((player) => player.id === id)?.name || "Not assigned";

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h3 className="font-bold text-gray-900">{title || "Team"}</h3>

      <div className="mt-3 space-y-2">
        <DetailRow
          icon={<Users size={15} />}
          label="Playing XI"
          value={`${playerIds.length} Players`}
        />

        <DetailRow
          icon={<Crown size={15} />}
          label="Captain"
          value={getPlayerName(captainId)}
        />

        <DetailRow
          icon={<Goal size={15} />}
          label="Wicketkeeper"
          value={getPlayerName(wicketkeeperId)}
        />
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-3">
      <span className="flex shrink-0 items-center gap-2 text-xs text-gray-500">
        {icon}
        {label}
      </span>

      <span className="break-words text-right text-xs font-semibold text-gray-800">
        {value}
      </span>
    </div>
  );
}

export default MatchDetails;
