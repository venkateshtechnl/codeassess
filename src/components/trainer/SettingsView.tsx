import React, { useState, useEffect } from 'react';
import { Settings } from '../../types';
import { Settings as SettingsIcon, Save, Sparkles, BookOpen, Bell, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const token = localStorage.getItem('codeassess_token') || '';
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings & Scoring</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure default EIS points per problem difficulty tier, Google Classroom links, and cohort announcements.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* EIS Point Configuration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>EIS Point Allocation per Difficulty</span>
          </div>
          <p className="text-slate-400 text-xs">
            Points awarded automatically when a student solves a problem for the first time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Easy Problem Points</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.easyPoints}
                onChange={e => setSettings({ ...settings, easyPoints: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Medium Problem Points</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.mediumPoints}
                onChange={e => setSettings({ ...settings, mediumPoints: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Hard Problem Points</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.hardPoints}
                onChange={e => setSettings({ ...settings, hardPoints: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Google Classroom Links */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Google Classroom Integration Links</span>
          </div>
          <p className="text-slate-400 text-xs">
            Direct Classroom invitation / class stream URLs provided to students for each track.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Java Classroom URL</label>
              <input
                type="url"
                value={settings.classroomLinks.java}
                onChange={e =>
                  setSettings({
                    ...settings,
                    classroomLinks: { ...settings.classroomLinks, java: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Python Classroom URL</label>
              <input
                type="url"
                value={settings.classroomLinks.python}
                onChange={e =>
                  setSettings({
                    ...settings,
                    classroomLinks: { ...settings.classroomLinks, python: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">C Classroom URL</label>
              <input
                type="url"
                value={settings.classroomLinks.c}
                onChange={e =>
                  setSettings({
                    ...settings,
                    classroomLinks: { ...settings.classroomLinks, c: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">C++ Classroom URL</label>
              <input
                type="url"
                value={settings.classroomLinks.cpp}
                onChange={e =>
                  setSettings({
                    ...settings,
                    classroomLinks: { ...settings.classroomLinks, cpp: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Global Announcement */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Bell className="w-4 h-4 text-sky-400" />
            <span>Platform Announcement Banner</span>
          </div>
          <textarea
            rows={2}
            value={settings.announcement}
            onChange={e => setSettings({ ...settings, announcement: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-xs"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
