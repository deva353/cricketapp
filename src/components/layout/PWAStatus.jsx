
import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {!isOnline && (
        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900">
          <WifiOff size={17} />
          You are offline. Some features may not be available.
        </div>
      )}

      {isOnline && installPrompt && !isInstalled && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <div>
            <p className="font-semibold text-green-900">
              Install Gully Cricket
            </p>
            <p className="text-sm text-green-800">
              Add the app to your device for quick access.
            </p>
          </div>

          <button
            type="button"
            onClick={installApp}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            <Download size={16} />
            Install
          </button>
        </div>
      )}
    </>
  );
}
