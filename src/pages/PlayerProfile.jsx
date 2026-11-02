
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  UserRound,
  Trophy,
  Target,
  Activity,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Users,
  Award,
  TrendingUp,
  Medal,
  MapPin,
} from "lucide-react";

import { getStorage } from "../utils/storage";
import { calculatePlayerStatistics } from "../services/statisticsEngine";

function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const players = useMemo(
    () => calculatePlayerStatistics(),
    []
  );

  const player = players.find((item) => item.id === id);

  const teams = getStorage("gully_teams", []);

  if (!player) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="gc-card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <UserRound size={38} />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Player Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            This player may have been deleted or the profile link is invalid.
          </p>

          <button
            type="button"
            onClick={() => navigate("/players")}
            className="gc-btn gc-btn-primary mt-6"
          >
            <ArrowLeft size={17} />
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  const playerTeams = teams.filter((team) =>
    team.playerIds?.includes(player.id)
  );

  const stats = [
    {
      label: "Matches",
      value: player.matchesPlayed ?? 0,
      icon: <Activity size={20} />,
      color: "blue",
    },
    {
      label: "Innings",
      value: player.innings ?? 0,
      icon: <TrendingUp size={20} />,
      color: "purple",
    },
    {
      label: "Total Runs",
      value: player.runs ?? 0,
      icon: <Trophy size={20} />,
      color: "green",
    },
    {
      label: "Highest Score",
      value: player.highestScore ?? 0,
      icon: <Award size={20} />,
      color: "amber",
    },
    {
      label: "Batting Average",
      value: player.battingAverage ?? 0,
      icon: <Target size={20} />,
      color: "blue",
    },
    {
      label: "Strike Rate",
      value: player.strikeRate ?? 0,
      icon: <TrendingUp size={20} />,
      color: "purple",
    },
    {
      label: "Fours",
      value: player.fours ?? 0,
      icon: <Medal size={20} />,
      color: "green",
    },
    {
      label: "Sixes",
      value: player.sixes ?? 0,
      icon: <Trophy size={20} />,
      color: "amber",
    },
    {
      label: "Wickets",
      value: player.wickets ?? 0,
      icon: <Target size={20} />,
      color: "purple",
    },
    {
      label: "Runs Conceded",
      value: player.runsConceded ?? 0,
      icon: <Activity size={20} />,
      color: "blue",
    },
    {
      label: "Bowling Average",
      value: player.bowlingAverage ?? 0,
      icon: <TrendingUp size={20} />,
      color: "green",
    },
    {
      label: "Economy",
      value: player.economy ?? 0,
      icon: <Target size={20} />,
      color: "amber",
    },
  ];

  const roleColor = {
    Batsman: "bg-blue-100 text-blue-800",
    Bowler: "bg-purple-100 text-purple-800",
    "All Rounder": "bg-amber-100 text-amber-800",
    "Wicket Keeper": "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="animate-fade-in space-y-7 pb-10">

      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate("/players")}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-green-700"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm transition-all group-hover:bg-green-50">
          <ArrowLeft size={18} />
        </span>
        Back to Players
      </button>

      {/* Profile banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-green-950 to-green-800 p-6 text-white shadow-xl sm:p-8">

        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm sm:h-28 sm:w-28">
              <UserRound size={55} strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-bold text-green-200">
                  PLAYER PROFILE
                </span>

                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  roleColor[player.role] || "bg-white/15 text-white"
                }`}>
                  {player.role || "Player"}
                </span>
              </div>

              <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl">
                {player.name}
              </h1>

              <p className="mt-2 text-sm text-green-100/80">
                Gully Cricket Player
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-green-100/80">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Age: {player.age || "Not provided"}
                </span>

                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {playerTeams.length} Team(s)
                </span>
              </div>
            </div>
          </div>

          {/* Main stats */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <HeroStat
              label="Total Runs"
              value={player.runs ?? 0}
              icon={<Trophy size={20} />}
            />

            <HeroStat
              label="Total Wickets"
              value={player.wickets ?? 0}
              icon={<Target size={20} />}
            />

            <HeroStat
              label="Matches Played"
              value={player.matchesPlayed ?? 0}
              icon={<Activity size={20} />}
            />
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="gc-card p-5 sm:p-6">
        <SectionHeading
          icon={<UserRound size={19} />}
          title="Player Information"
          subtitle="Personal details and cricket background"
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <InfoCard
            icon={<Mail size={18} />}
            label="Email Address"
            value={player.email || "Not provided"}
          />

          <InfoCard
            icon={<Phone size={18} />}
            label="Phone Number"
            value={player.phone || "Not provided"}
          />

          <InfoCard
            icon={<Calendar size={18} />}
            label="Age"
            value={player.age ? `${player.age} years` : "Not provided"}
          />

          <InfoCard
            icon={<Trophy size={18} />}
            label="Playing Role"
            value={player.role || "Not provided"}
          />

          <InfoCard
            icon={<ShieldCheck size={18} />}
            label="Batting Style"
            value={player.battingStyle || "Not provided"}
          />

          <InfoCard
            icon={<Target size={18} />}
            label="Bowling Style"
            value={player.bowlingStyle || "Not provided"}
          />
        </div>
      </section>

      {/* Team information */}
      <section className="gc-card p-5 sm:p-6">
        <SectionHeading
          icon={<Users size={19} />}
          title="Team Information"
          subtitle="Teams this player is associated with"
        />

        {playerTeams.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {playerTeams.map((team) => (
              <div
                key={team.id}
                className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:bg-green-50 hover:shadow-md"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{
                    backgroundColor: team.color || "#15803d",
                  }}
                >
                  <ShieldCheck size={27} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-gray-900">
                    {team.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {team.shortName || "Cricket Team"}
                  </p>

                  {team.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      {team.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
            <Users size={32} className="mx-auto text-gray-300" />

            <p className="mt-3 font-semibold text-gray-700">
              No Team Assigned
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This player has not been added to any team yet.
            </p>
          </div>
        )}
      </section>

      {/* Career statistics */}
      <section className="gc-card p-5 sm:p-6">
        <SectionHeading
          icon={<Activity size={19} />}
          title="Career Statistics"
          subtitle="Overall batting and bowling performance"
        />

        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-7 w-1 rounded-full bg-green-600" />
            <h3 className="font-bold text-gray-800">
              Batting Statistics
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stats.slice(0, 8).map((stat) => (
              <CareerStat key={stat.label} stat={stat} />
            ))}
          </div>
        </div>

        <div className="my-7 border-t border-gray-100" />

        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-7 w-1 rounded-full bg-purple-600" />
            <h3 className="font-bold text-gray-800">
              Bowling Statistics
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stats.slice(8).map((stat) => (
              <CareerStat key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function HeroStat({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
      <div className="flex items-center justify-between">
        <p className="text-sm text-green-100/80">{label}</p>
        <span className="text-green-200">{icon}</span>
      </div>

      <p className="mt-3 text-3xl font-extrabold tracking-tight">
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

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all duration-200 hover:border-green-200 hover:bg-green-50">
      <div className="mt-0.5 shrink-0 text-green-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function CareerStat({ stat }) {
  const colorClasses = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">
          {stat.label}
        </p>

        <span className={`rounded-lg p-2 ${colorClasses[stat.color]}`}>
          {stat.icon}
        </span>
      </div>

      <p className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
        {stat.value}
      </p>
    </div>
  );
}

export default PlayerProfile;
