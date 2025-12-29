import React, { useEffect, useState } from "react";
import { getApi, putApi } from "../../services/axios.service";
import { toast } from "react-toastify";

type Theme = "dark" | "light";

type UserSettings = {
  theme: Theme;
  language: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const UserSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = (await getApi("/api/v1/users/settings")) as ApiResponse<UserSettings>;
      setSettings(res.data);
    } catch (e: any) {
      console.log("Error: ", e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const save = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const payload = {
        theme: settings.theme,
        language: settings.language,
        currency: settings.currency,
        timezone: settings.timezone,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
      };
      const res = (await putApi("/api/v1/users/settings", payload)) as ApiResponse<UserSettings>;
      setSettings(res.data);
      toast.success(res.message || "Settings saved");
    } catch (e: any) {
      console.log("Error: ", e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen px-12 py-6 text-white">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="mt-6">Loading…</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="w-full min-h-screen px-12 py-6 text-white">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="mt-6">No settings available.</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-12 py-6 text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-primary-900-high-emphasis hover:bg-primary-900-medium-emphasis disabled:opacity-60"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Appearance</div>
          <label className="block text-sm text-gray-300 mb-2">Theme</label>
          <select
            className="w-full rounded-lg border border-white/20 bg-foreground-night-100 px-3 py-2 text-white"
            value={settings.theme}
            onChange={(e) => update("theme", e.target.value as Theme)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Locale</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Language</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-foreground-night-100 px-3 py-2 text-white"
                value={settings.language}
                onChange={(e) => update("language", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Currency</label>
              <input
                className="w-full rounded-lg border border-white/20 bg-foreground-night-100 px-3 py-2 text-white"
                value={settings.currency}
                onChange={(e) => update("currency", e.target.value)}
              />
            </div>
          </div>

          <label className="block text-sm text-gray-300 mt-4 mb-2">Timezone</label>
          <input
            className="w-full rounded-lg border border-white/20 bg-foreground-night-100 px-3 py-2 text-white"
            value={settings.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Notifications</div>

          <label className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
            <span>Email notifications</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => update("emailNotifications", e.target.checked)}
            />
          </label>

          <label className="mt-3 flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
            <span>Push notifications</span>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => update("pushNotifications", e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
