
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  Trophy,
  Users,
  CircleDot,
  CheckCircle2,
  ShieldCheck,
  Swords,
  ClipboardCheck,
  Clock,
  UserRound,
  Crown,
  Goal,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

import { getStorage, setStorage } from "../utils/storage";
import { initialTeams, initialPlayers } from "../data/mockData";

import {
  matchFormats,
  defaultRules,
  ruleLabels,
} from "../data/matchConstants";

const initialForm = {
  name: "",
  teamA: "",
  teamB: "",
  date: "",
  ground: "",
  overs: 10,
  customOvers: "",
  ballType: "Tennis Ball",
  matchType: "Standard",
  playersA: [],
  playersB: [],
  captainA: "",
  captainB: "",
  wicketkeeperA: "",
  wicketkeeperB: "",
  tossWinner: "",
  tossDecision: "Bat",
  rules: { ...defaultRules },
};

const steps = [
  { label: "Match Details", icon: <Trophy size={18} /> },
  { label: "Playing XI", icon: <Users size={18} /> },
  { label: "Toss & Rules", icon: <ShieldCheck size={18} /> },
  { label: "Review", icon: <ClipboardCheck size={18} /> },
];

function getLocalDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export default function CreateMatch() {
  const navigate = useNavigate();

  const [teams] = useState(() =>
    getStorage("gully_teams", initialTeams)
  );

  const [players] = useState(() =>
    getStorage("gully_players", initialPlayers)
  );

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const teamA = teams.find((team) => team.id === form.teamA);
  const teamB = teams.find((team) => team.id === form.teamB);

  const squadA = useMemo(
    () => players.filter((player) =>
      (teamA?.playerIds || []).includes(player.id)
    ),
    [players, teamA]
  );

  const squadB = useMemo(
    () => players.filter((player) =>
      (teamB?.playerIds || []).includes(player.id)
    ),
    [players, teamB]
  );

  const selectedOvers =
    form.overs === "custom"
      ? Number(form.customOvers)
      : Number(form.overs);

  const firstBatting =
    form.tossDecision === "Bat"
      ? form.tossWinner
      : form.tossWinner === form.teamA
        ? form.teamB
        : form.teamA;

  const update = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const selectTeam = (field, teamId) => {
    const side = field === "teamA" ? "A" : "B";

    setForm((prev) => ({
      ...prev,
      [field]: teamId,
      [`players${side}`]: [],
      [`captain${side}`]: "",
      [`wicketkeeper${side}`]: "",
      tossWinner:
        prev.tossWinner === prev[field] ? "" : prev.tossWinner,
    }));

    setError("");
  };

  const togglePlayer = (side, playerId) => {
    const field = side === "A" ? "playersA" : "playersB";
    const current = form[field];
    const exists = current.includes(playerId);

    if (!exists && current.length >= 11) {
      setError("You can select a maximum of 11 players per team.");
      return;
    }

    const updated = exists
      ? current.filter((id) => id !== playerId)
      : [...current, playerId];

    setForm((prev) => ({
      ...prev,
      [field]: updated,
      [`captain${side}`]:
        !updated.includes(prev[`captain${side}`])
          ? ""
          : prev[`captain${side}`],
      [`wicketkeeper${side}`]:
        !updated.includes(prev[`wicketkeeper${side}`])
          ? ""
          : prev[`wicketkeeper${side}`],
    }));

    setError("");
  };

  const updateRule = (rule, checked) => {
    setForm((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [rule]: checked,
      },
    }));
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      if (!form.name.trim()) {
        setError("Enter a match name.");
        return false;
      }

      if (!form.teamA || !form.teamB) {
        setError("Select both teams.");
        return false;
      }

      if (form.teamA === form.teamB) {
        setError("A team cannot play against itself.");
        return false;
      }

      if (!form.date || !form.ground.trim()) {
        setError("Enter the match date and ground.");
        return false;
      }

      if (new Date(form.date).getTime() < Date.now() - 60000) {
        setError("Choose a valid future match date and time.");
        return false;
      }

      if (
        !Number.isInteger(selectedOvers) ||
        selectedOvers < 1 ||
        selectedOvers > 50
      ) {
        setError("Overs must be a whole number between 1 and 50.");
        return false;
      }
    }

    if (step === 2) {
      if (form.playersA.length < 2 || form.playersB.length < 2) {
        setError("Select at least 2 players for each team.");
        return false;
      }

      if (!form.captainA || !form.captainB) {
        setError("Select a captain for both teams.");
        return false;
      }

      if (!form.wicketkeeperA || !form.wicketkeeperB) {
        setError("Select a wicketkeeper for both teams.");
        return false;
      }

      if (
        !form.playersA.includes(form.captainA) ||
        !form.playersB.includes(form.captainB) ||
        !form.playersA.includes(form.wicketkeeperA) ||
        !form.playersB.includes(form.wicketkeeperB)
      ) {
        setError("Captain and wicketkeeper must be in the playing XI.");
        return false;
      }
    }

    if (step === 3 && !form.tossWinner) {
      setError("Select the toss winner.");
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const previousStep = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const getPlayerName = (id) =>
    players.find((player) => player.id === id)?.name || "Not selected";

  const handleCreate = () => {
    // Recheck required details before saving.
    if (
      !form.name.trim() ||
      !teamA ||
      !teamB ||
      teamA.id === teamB.id ||
      !form.date ||
      !form.ground.trim() ||
      !Number.isInteger(selectedOvers) ||
      selectedOvers < 1 ||
      selectedOvers > 50
    ) {
      setError("Please check your match details.");
      setStep(1);
      return;
    }

    if (
      form.playersA.length < 2 ||
      form.playersB.length < 2 ||
      !form.playersA.includes(form.captainA) ||
      !form.playersB.includes(form.captainB) ||
      !form.playersA.includes(form.wicketkeeperA) ||
      !form.playersB.includes(form.wicketkeeperB)
    ) {
      setError("Please check both playing XIs, captains and wicketkeepers.");
      setStep(2);
      return;
    }

    if (!form.tossWinner) {
      setError("Select the toss winner.");
      setStep(3);
      return;
    }

    const matches = getStorage("gully_matches", []);

    const match = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      teamA: form.teamA,
      teamB: form.teamB,
      teamAName: teamA.name,
      teamBName: teamB.name,
      date: form.date,
      ground: form.ground.trim(),
      overs: selectedOvers,
      ballType: form.ballType,
      matchType: form.matchType,
      playersA: form.playersA,
      playersB: form.playersB,
      captainA: form.captainA,
      captainB: form.captainB,
      wicketkeeperA: form.wicketkeeperA,
      wicketkeeperB: form.wicketkeeperB,
      tossWinner: form.tossWinner,
      tossDecision: form.tossDecision,
      firstBatting,
      status: "Upcoming",
      rules: form.rules,
      createdAt: new Date().toISOString(),
    };

    const saved = setStorage("gully_matches", [
      match,
      ...matches,
    ]);

    if (!saved) {
      setError("Unable to save match. Check browser storage.");
      return;
    }

    navigate("/matches");
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-7 pb-8">

      {/* Page heading */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/matches")}
          className="gc-btn-icon bg-white text-gray-600 shadow-sm hover:bg-green-50 hover:text-green-700"
          aria-label="Back to matches"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-green-700">
            <Swords size={15} />
            Gully Cricket / Matches
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Create New Match
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Configure your match, playing XI and rules.
          </p>
        </div>
      </div>

      {/* Step progress */}
      <div className="gc-card p-5 sm:p-7">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((item, index) => {
            const number = index + 1;
            const completed = step > number;
            const active = step === number;

            return (
              <div key={item.label} className="relative text-center">
                <button
                  type="button"
                  disabled={number > step}
                  onClick={() => {
                    if (number < step) {
                      setError("");
                      setStep(number);
                    }
                  }}
                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                    completed
                      ? "bg-green-700 text-white"
                      : active
                        ? "bg-green-100 text-green-800 ring-4 ring-green-50"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {completed ? <CheckCircle2 size={20} /> : item.icon}
                </button>

                <p className={`mt-2 hidden text-xs font-semibold sm:block ${
                  active
                    ? "text-green-700"
                    : completed
                      ? "text-gray-700"
                      : "text-gray-400"
                }`}>
                  {item.label}
                </p>

                <p className={`mt-2 text-[10px] font-semibold sm:hidden ${
                  active ? "text-green-700" : "text-gray-400"
                }`}>
                  Step {number}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
            style={{ width: `${step * 25}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-xs text-gray-400">
          <span>Step {step} of 4</span>
          <span>{step * 25}% completed</span>
        </div>
      </div>

      {/* Step 1: Match details */}
      {step === 1 && (
        <section className="gc-card space-y-6 p-5 sm:p-7">
          <SectionTitle
            icon={<Trophy size={21} />}
            title="Match Information"
            subtitle="Enter the basic details of your cricket match."
          />

          <FormField label="Match Name" required>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Example: Sunday Gully Championship"
              maxLength={80}
              className="form-control"
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <TeamSelect
              label="Team A"
              teams={teams}
              value={form.teamA}
              onChange={(value) => selectTeam("teamA", value)}
            />

            <TeamSelect
              label="Team B"
              teams={teams}
              value={form.teamB}
              onChange={(value) => selectTeam("teamB", value)}
            />
          </div>

          {teams.length < 2 && (
            <Notice type="warning">
              Create at least two teams before creating a match.
            </Notice>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Match Date and Time" required>
              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="datetime-local"
                  value={form.date}
                  min={getLocalDateTime()}
                  onChange={(e) => update("date", e.target.value)}
                  className="form-control pl-10"
                />
              </div>
            </FormField>

            <FormField label="Ground / Location" required>
              <div className="relative">
                <MapPin
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={form.ground}
                  onChange={(e) => update("ground", e.target.value)}
                  placeholder="Enter ground name"
                  className="form-control pl-10"
                />
              </div>
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Overs">
              <select
                value={form.overs}
                onChange={(e) =>
                  update(
                    "overs",
                    e.target.value === "custom"
                      ? "custom"
                      : Number(e.target.value)
                  )
                }
                className="form-control"
              >
                {matchFormats.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </FormField>

            {form.overs === "custom" && (
              <FormField label="Custom Overs" required>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={form.customOvers}
                  onChange={(e) => update("customOvers", e.target.value)}
                  placeholder="Enter 1 to 50 overs"
                  className="form-control"
                />
              </FormField>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Ball Type">
              <select
                value={form.ballType}
                onChange={(e) => update("ballType", e.target.value)}
                className="form-control"
              >
                <option>Tennis Ball</option>
                <option>Leather Ball</option>
                <option>Rubber Ball</option>
              </select>
            </FormField>

            <FormField label="Match Rules Type">
              <select
                value={form.matchType}
                onChange={(e) => update("matchType", e.target.value)}
                className="form-control"
              >
                <option>Standard</option>
                <option>Custom Gully</option>
                <option>Mixed Rules</option>
              </select>
            </FormField>
          </div>
        </section>
      )}

      {/* Step 2: Playing XI */}
      {step === 2 && (
        <section className="gc-card space-y-6 p-5 sm:p-7">
          <SectionTitle
            icon={<Users size={21} />}
            title="Select Playing XI"
            subtitle="Choose 2 to 11 players from each team."
          />

          <PlayerSelection
            title={teamA?.name || "Team A"}
            squad={squadA}
            selected={form.playersA}
            captain={form.captainA}
            wicketkeeper={form.wicketkeeperA}
            onToggle={(id) => togglePlayer("A", id)}
            onCaptain={(id) => update("captainA", id)}
            onWicketkeeper={(id) => update("wicketkeeperA", id)}
          />

          <PlayerSelection
            title={teamB?.name || "Team B"}
            squad={squadB}
            selected={form.playersB}
            captain={form.captainB}
            wicketkeeper={form.wicketkeeperB}
            onToggle={(id) => togglePlayer("B", id)}
            onCaptain={(id) => update("captainB", id)}
            onWicketkeeper={(id) => update("wicketkeeperB", id)}
          />
        </section>
      )}

      {/* Step 3: Toss and rules */}
      {step === 3 && (
        <section className="gc-card space-y-6 p-5 sm:p-7">
          <SectionTitle
            icon={<ShieldCheck size={21} />}
            title="Toss and Match Rules"
            subtitle="Configure the toss and rules for this match."
          />

          <FormField label="Toss Winner" required>
            <select
              value={form.tossWinner}
              onChange={(e) => update("tossWinner", e.target.value)}
              className="form-control"
            >
              <option value="">Select toss winner</option>
              {teamA && (
                <option value={teamA.id}>{teamA.name}</option>
              )}
              {teamB && (
                <option value={teamB.id}>{teamB.name}</option>
              )}
            </select>
          </FormField>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Toss Decision
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "Bat", label: "Bat First", icon: "🏏" },
                { value: "Bowl", label: "Bowl First", icon: "🎯" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update("tossDecision", option.value)}
                  className={`rounded-2xl border p-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                    form.tossDecision === option.value
                      ? "border-green-500 bg-green-50 text-green-800 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-green-200"
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <p className="mt-2 text-sm font-bold">{option.label}</p>
                  {form.tossDecision === option.value && (
                    <CheckCircle2 size={17} className="mx-auto mt-2 text-green-700" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-900">Match Rules</h3>
            <p className="mt-1 text-xs text-gray-500">
              Select the rules that apply to this match.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(ruleLabels).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
                    form.rules[key]
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>

                  <input
                    type="checkbox"
                    checked={Boolean(form.rules[key])}
                    onChange={(e) => updateRule(key, e.target.checked)}
                    className="h-4 w-4 accent-green-700"
                  />
                </label>
              ))}
            </div>
          </div>

          <Notice type="info">
            Custom rules are saved with the match configuration. Their scoring
            behaviour still depends on implementation in the scoring engine.
          </Notice>
        </section>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <section className="gc-card space-y-6 p-5 sm:p-7">
          <SectionTitle
            icon={<CheckCircle2 size={21} />}
            title="Review Match"
            subtitle="Check all details before creating your match."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReviewCard label="Match Name" value={form.name} />
            <ReviewCard label="Overs" value={`${selectedOvers} Overs`} />
            <ReviewCard label="Ball Type" value={form.ballType} />
            <ReviewCard label="Format" value={form.matchType} />
            <ReviewCard label="Ground" value={form.ground} />
            <ReviewCard
              label="Date and Time"
              value={form.date ? new Date(form.date).toLocaleString() : "-"}
            />
          </div>

          {/* Team comparison */}
          <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 p-5">
            <div className="flex items-center justify-center gap-3 text-center">
              <h3 className="font-bold text-green-950">
                {teamA?.name}
              </h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-green-700 shadow-sm">
                VS
              </span>
              <h3 className="font-bold text-green-950">
                {teamB?.name}
              </h3>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TeamReview
                name={teamA?.name}
                count={form.playersA.length}
                captain={getPlayerName(form.captainA)}
                wicketkeeper={getPlayerName(form.wicketkeeperA)}
              />

              <TeamReview
                name={teamB?.name}
                count={form.playersB.length}
                captain={getPlayerName(form.captainB)}
                wicketkeeper={getPlayerName(form.wicketkeeperB)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReviewCard
              label="Toss Winner"
              value={teams.find((t) => t.id === form.tossWinner)?.name}
            />

            <ReviewCard
              label="Toss Decision"
              value={`${form.tossDecision} first`}
            />

            <ReviewCard
              label="First Batting"
              value={teams.find((t) => t.id === firstBatting)?.name}
            />
          </div>

          <div>
            <h3 className="mb-3 font-bold text-gray-900">
              Enabled Rules
            </h3>

            <div className="flex flex-wrap gap-2">
              {Object.entries(form.rules)
                .filter(([, enabled]) => enabled)
                .map(([key]) => (
                  <span
                    key={key}
                    className="rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-800"
                  >
                    {ruleLabels[key]}
                  </span>
                ))}

              {!Object.values(form.rules).some(Boolean) && (
                <span className="text-sm text-gray-400">
                  No additional rules selected.
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previousStep}
          disabled={step === 1}
          className="gc-btn gc-btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="gc-btn gc-btn-primary"
          >
            Continue
            <ArrowRight size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            className="gc-btn gc-btn-primary"
          >
            <CheckCircle2 size={18} />
            Create Match
          </button>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function TeamSelect({ label, teams, value, onChange }) {
  return (
    <FormField label={label} required>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
      >
        <option value="">Select {label}</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </FormField>
  );
}

function PlayerSelection({
  title,
  squad,
  selected,
  captain,
  wicketkeeper,
  onToggle,
  onCaptain,
  onWicketkeeper,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <Users size={19} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Choose your playing XI</p>
          </div>
        </div>

        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
          selected.length >= 2
            ? "bg-green-50 text-green-700"
            : "bg-orange-50 text-orange-700"
        }`}>
          {selected.length}/11 selected
        </span>
      </div>

      {squad.length === 0 ? (
        <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 p-5 text-center">
          <Users size={25} className="mx-auto text-orange-400" />
          <p className="mt-2 text-sm font-semibold text-orange-800">
            No players available
          </p>
          <p className="mt-1 text-xs text-orange-700">
            Add players to this team in Teams Management first.
          </p>
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {squad.map((player) => {
            const isSelected = selected.includes(player.id);

            return (
              <label
                key={player.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-200 ${
                  isSelected
                    ? "border-green-300 bg-green-50"
                    : "border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-green-50/50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(player.id)}
                    className="h-4 w-4 accent-green-700"
                  />

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-green-800 shadow-sm">
                    {(player.name || "?").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {player.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {player.role}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-green-700"
                  />
                )}
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <FormField label="Captain">
          <select
            value={captain}
            onChange={(e) => onCaptain(e.target.value)}
            className="form-control"
          >
            <option value="">Select Captain</option>
            {squad
              .filter((player) => selected.includes(player.id))
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>
        </FormField>

        <FormField label="Wicketkeeper">
          <select
            value={wicketkeeper}
            onChange={(e) => onWicketkeeper(e.target.value)}
            className="form-control"
          >
            <option value="">Select Wicketkeeper</option>
            {squad
              .filter((player) => selected.includes(player.id))
              .map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
          </select>
        </FormField>
      </div>
    </div>
  );
}

function ReviewCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}

function TeamReview({ name, count, captain, wicketkeeper }) {
  return (
    <div className="rounded-xl bg-white/80 p-4">
      <h4 className="font-bold text-gray-900">{name}</h4>

      <div className="mt-3 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-gray-500">
            <Users size={15} />
            Players
          </span>
          <strong className="text-gray-900">{count}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Crown size={15} className="shrink-0 text-amber-600" />
          <span className="text-gray-500">Captain:</span>
          <strong className="truncate text-gray-900">{captain}</strong>
        </div>

        <div className="flex items-center gap-2">
          <Goal size={15} className="shrink-0 text-green-700" />
          <span className="text-gray-500">Keeper:</span>
          <strong className="truncate text-gray-900">{wicketkeeper}</strong>
        </div>
      </div>
    </div>
  );
}

function Notice({ type, children }) {
  const styles = {
    warning: "border-orange-100 bg-orange-50 text-orange-800",
    info: "border-blue-100 bg-blue-50 text-blue-800",
  };

  return (
    <div className={`rounded-xl border p-4 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}
