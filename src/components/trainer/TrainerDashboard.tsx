import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrainerDashboardMetrics } from '../../types';
import {
  Users,
  Code,
  FileCheck,
  TrendingUp,
  Activity,
  Plus,
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface TrainerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<TrainerDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trainer/dashboard')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(e => console.error('Failed to load trainer metrics', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Trainer Control Console</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Instructor Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Welcome back, Venkatesh -TT. Monitor cohort performance, review submissions, and manage course assets.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('trainer-problems')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem</span>
            </button>
            <button
              onClick={() => onNavigate('trainer-content')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Post Material</span>
            </button>
            <button
              onClick={() => onNavigate('trainer-reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {metrics.totalStudents}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {metrics.activeStudents} active in current cohorts
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Problems</span>
            <Code className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {metrics.totalProblems}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Across 4 programming languages
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Submissions</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {metrics.totalSubmissions}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {metrics.acceptedSubmissions} passed evaluation
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Average Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {metrics.averageProgress}%
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${metrics.averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course Distribution & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Course Student Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Course Cohort Enrollment</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(metrics.courseDistribution).map(([courseKey, count]) => (
                <div key={courseKey} className="rounded-lg bg-slate-950 p-4 border border-slate-800">
                  <div className="text-[11px] font-semibold uppercase text-slate-400 font-mono">
                    {courseKey} Track
                  </div>
                  <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                    {count} <span className="text-xs font-normal text-slate-500">Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Recent Student Submissions</h2>
              <button
                onClick={() => onNavigate('trainer-students')}
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                View all students
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3">Problem</th>
                    <th className="py-2 px-3">Lang</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Tests</th>
                    <th className="py-2 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                  {metrics.recentSubmissions.slice(0, 6).map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-white">{sub.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-300">{sub.problemTitle}</td>
                      <td className="py-2.5 px-3 uppercase font-mono text-[11px] text-slate-400">{sub.language}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            sub.status === 'Accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                              : 'bg-rose-950 text-rose-400 border border-rose-900'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-400">
                        {sub.testsPassed}/{sub.totalTests}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Live Activity Stream */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white">Live Platform Activity</h2>
          </div>

          <div className="space-y-3">
            {metrics.recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent activity logs.</p>
            ) : (
              metrics.recentActivities.slice(0, 8).map(act => (
                <div key={act.id} className="text-xs pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div className="text-slate-200 font-medium leading-relaxed">{act.message}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(act.timestamp).toLocaleTimeString()} · {new Date(act.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
