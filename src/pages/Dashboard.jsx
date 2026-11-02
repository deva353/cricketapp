
import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  Trophy,
  UserRound,
  Plus,
  ArrowUpRight,
  MapPin,
  Clock,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";

// Demo statistics
const stats = [
  {
    title: "Live Matches",
    value: "03",
    subtitle: "Currently running",
    icon: Activity,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    trend: "Live now",
    trendColor: "text-red-600",
  },
  {
    title: "My Teams",
    value: "08",
    subtitle: "Registered teams",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: "Team overview",
    trendColor: "text-blue-600",
  },
  {
    title: "Players",
    value: "124",
    subtitle: "Total registered",
    icon: UserRound,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    trend: "Player database",
    trendColor: "text-purple-600",
  },
  {
    title: "Tournaments",
    value: "05",
    subtitle: "Active tournaments",
    icon: Trophy,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    trend: "View tournaments",
    trendColor: "text-orange-600",
  },
];

// Demo live matches
const liveMatches = [
  {
    id: 1,
    team1: "Hyderabad Kings",
    team2: "Street Warriors",
    score1: "78/3",
    score2: "Yet to bat",
    overs: "8.4 Overs",
    status: "LIVE",
    ground: "Madhapur Ground",
    innings: "First innings",
  },
  {
    id: 2,
    team1: "Royal Strikers",
    team2: "Super Challengers",
    score1: "92/5",
    score2: "Yet to bat",
    overs: "10 Overs",
    status: "LIVE",
    ground: "Kukatpally Ground",
    innings: "First innings",
  },
];

// Demo recent matches
const recentMatches = [
  {
    id: 1,
    team1: "Warriors",
    team2: "Kings",
    result: "Warriors won by 15 runs",
    date: "Yesterday",
    score: "145/6 - 130/8",
  },
  {
    id: 2,
    team1: "Royal XI",
    team2: "Super Stars",
    result: "Royal XI won by 4 wickets",
    date: "28 Oct 2026",
    score: "120/5 - 121/6",
  },
  {
    id: 3,
    team1: "Thunder",
    team2: "Titans",
    result: "Titans won by 2 wickets",
    date: "25 Oct 2026",
    score: "110/9 - 111/8",
  },
];

// Statistics card
function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {item.title}
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">
            {item.value}
          </h2>

          <p className="mt-2 text-xs text-gray-400">
            {item.subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${item.iconBg} ${item.iconColor}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <div className={`mt-5 flex items-center gap-1 text-xs font-semibold ${item.trendColor}`}>
        <TrendingUp size={14} />
        {item.trend}
      </div>
    </div>
  );
}

// Live match card
function LiveMatchCard({ match }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          {match.status}
        </span>

        <span className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={14} />
          {match.ground}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {match.team1}
          </p>

          <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">
            {match.score1}
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            {match.overs}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">
            {match.team2}
          </p>

          <h3 className="mt-2 text-xl font-bold text-gray-500">
            {match.score2}
          </h3>

          <p className="mt-1 text-xs text-gray-400">
            Second innings
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-500">
          {match.innings}
        </span>

        <Link
          to={`/matches/${match.id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-green-700 transition-all hover:gap-2 hover:text-green-900"
        >
          View Score
          <ChevronRight size={17} />
        </Link>
      </div>
    </div>
  );
}

// Quick action card
function QuickAction({ title, description, icon, link }) {
  return (
    <Link
      to={link}
      className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700 transition-all duration-300 group-hover:bg-green-700 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-gray-800">
        {title}
      </h3>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-green-700 transition-all group-hover:gap-2">
        Explore
        <ArrowUpRight size={14} />
      </div>
    </Link>
  );
}

// Dashboard
export default function Dashboard() {
  return (
    <div className="animate-fade-in space-y-8">

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123c27] via-[#17643a] to-[#21834c] p-6 text-white shadow-lg sm:p-9">

        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[30px] border-white/5" />
        <div className="absolute -bottom-24 right-36 h-64 w-64 rounded-full border-[30px] border-white/5" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-green-100">
            <Zap size={14} />
            YOUR CRICKET COMMUNITY
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Welcome to Gully Cricket!
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-green-100 sm:text-base">
            Organize matches, manage teams and track every run.
            Bring your local cricket community together.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/create-match"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-900 shadow-md transition-all duration-200 hover:-translate-y-1 hover:bg-green-50 hover:shadow-lg"
            >
              <Plus size={18} />
              Create Match
            </Link>

            <Link
              to="/teams"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-white/10"
            >
              <Users size={17} />
              Manage Teams
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[-30px] right-8 hidden text-[170px] opacity-15 md:block">
          🏏
        </div>
      </section>

      {/* Statistics */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Dashboard Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your cricket activity at a glance
            </p>
          </div>

          <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500">
            Demo statistics
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      {/* Live matches */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Live Matches
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Follow ongoing cricket matches
            </p>
          </div>

          <Link
            to="/matches"
            className="inline-flex items-center gap-1 text-sm font-bold text-green-700 transition-all hover:gap-2 hover:text-green-900"
          >
            View All
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {liveMatches.map((match) => (
            <LiveMatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Recent matches */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Recent Matches
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Check your recent match results
            </p>
          </div>

          <Link
            to="/matches"
            className="text-sm font-bold text-green-700 transition-colors hover:text-green-900"
          >
            View All
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {recentMatches.map((match, index) => (
            <div
              key={match.id}
              className="group flex flex-col justify-between gap-3 border-b border-gray-100 p-5 last:border-b-0 transition-colors duration-200 hover:bg-green-50/50 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-xs font-bold text-green-700">
                    {index + 1}
                  </span>

                  <h3 className="font-bold text-gray-800">
                    {match.team1} vs {match.team2}
                  </h3>
                </div>

                <p className="ml-10 mt-2 text-sm font-medium text-gray-600">
                  {match.score}
                </p>

                <p className="ml-10 mt-1 text-xs font-semibold text-green-700">
                  {match.result}
                </p>
              </div>

              <span className="ml-10 inline-flex items-center gap-2 text-xs text-gray-400 sm:ml-0">
                <Clock size={14} />
                {match.date}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quickly access your cricket management tools
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <QuickAction
            title="Create Match"
            description="Start a new cricket match"
            icon={<Plus size={21} />}
            link="/create-match"
          />

          <QuickAction
            title="Manage Teams"
            description="Create and manage squads"
            icon={<Users size={21} />}
            link="/teams"
          />

          <QuickAction
            title="Tournaments"
            description="Manage cricket tournaments"
            icon={<Trophy size={21} />}
            link="/tournaments"
          />

          <QuickAction
            title="Leaderboard"
            description="Check player rankings"
            icon={<Target size={21} />}
            link="/leaderboard"
          />
        </div>
      </section>
    </div>
  );
}
