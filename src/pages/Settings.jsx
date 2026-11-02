
import { useEffect, useState } from "react";
import { Bell, Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { getStorage, setStorage } from "../utils/storage";

const defaultSettings = {
  defaultOvers: "10",
  defaultBallType: "Tennis Ball",
  matchNotifications: true,
  tournamentNotifications: true,
  resultNotifications: true,
  soundEnabled: true,
};

export default function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedSettings = getStorage("gully_settings", defaultSettings);
    setSettings({ ...defaultSettings, ...savedSettings });
  }, []);

  const updateSetting = (name, value) => {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));
    setMessage("");
  };

  const saveSettings = (e) => {
    e.preventDefault();

    const saved = setStorage("gully_settings", settings);

    setMessage(
      saved
        ? "Settings saved successfully."
        : "Unable to save settings. Check your browser storage."
    );
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setStorage("gully_settings", defaultSettings);
    setMessage("Settings restored to default.");
  };

  const Toggle = ({ label, description, name }) => (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-0">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={settings[name]}
        onClick={() => updateSetting(name, !settings[name])}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          settings[name] ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            settings[name] ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your Gully Cricket preferences.
        </p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={saveSettings} className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <SettingsIcon size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Match Preferences</h2>
              <p className="text-sm text-gray-500">
                Choose the defaults for creating new matches.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Default overs
              </span>
              <select
                className="form-control"
                value={settings.defaultOvers}
                onChange={(e) => updateSetting("defaultOvers", e.target.value)}
              >
                <option value="5">5 Overs</option>
                <option value="6">6 Overs</option>
                <option value="10">10 Overs</option>
                <option value="15">15 Overs</option>
                <option value="20">20 Overs</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Default ball type
              </span>
              <select
                className="form-control"
                value={settings.defaultBallType}
                onChange={(e) =>
                  updateSetting("defaultBallType", e.target.value)
                }
              >
                <option value="Tennis Ball">Tennis Ball</option>
                <option value="Leather Ball">Leather Ball</option>
                <option value="Rubber Ball">Rubber Ball</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-500">
                Select which notifications you want enabled.
              </p>
            </div>
          </div>

          <Toggle
            name="matchNotifications"
            label="Match updates"
            description="Receive updates about match status."
          />
          <Toggle
            name="tournamentNotifications"
            label="Tournament updates"
            description="Receive tournament schedule and fixture updates."
          />
          <Toggle
            name="resultNotifications"
            label="Match results"
            description="Receive completed match result notifications."
          />
          <Toggle
            name="soundEnabled"
            label="Sound effects"
            description="Enable sound effects during live scoring."
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
          >
            <Save size={18} /> Save Settings
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={18} /> Reset Defaults
          </button>
        </div>
      </form>
    </div>
  );
}
