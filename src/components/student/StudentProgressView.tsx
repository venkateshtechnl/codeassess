import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboardMetrics, Submission } from '../../types';
import {
  CheckCircle,
  Clock,
  Sparkles,
  BarChart3,
  Award,
  ChevronRight,
  Code
} from 'lucide-react';

export const StudentProgressView: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StudentDashboardMetrics | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/student/dashboard/${user.id}`).then(r => r.json()),
      fetch(`/api/submissions?studentId=${user.id}`).then(r => r.json())
    ])
      .then(([dashData, subsData]) => {
        setMetrics(dashData);
        setSubmissions(subsData);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !metrics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  const { student, totalProblemsCount, totalSolved, totalAttempted, overallProgress, courseStats } = metrics;
  const remainingProblems = totalProblemsCount - totalSolved;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Progress & Evaluation Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive breakdown of your problem-solving metrics, EIS point accumulation, and course completion.
        </p>
      </div>

      {/* High Level KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Total Problems</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">{totalProblemsCount}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-emerald-400">Problems Solved</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">{totalSolved}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-amber-400">Attempted</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">{totalAttempted}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-slate-400">Remaining</div>
          <div className="text-2xl font-bold text-slate-300 font-mono tabular-nums mt-1">{remainingProblems}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-sky-400">Completion %</div>
          <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums mt-1">{overallProgress}%</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="text-xs text-amber-300">Total EIS</div>
          <div className="text-2xl font-bold text-amber-300 font-mono tabular-nums mt-1">{student.eisPoints}</div>
        </div>
      </div>

      {/* Course Breakdown Deep Dive */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white">Course & Module Progression</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseStats.map(course => (
            <div
              key={course.courseId}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{course.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {course.solved} of {course.total} problems solved
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
                    {course.progress}%
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Completed</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>

              {/* Module Progress Table */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Module Breakdown
                </div>
                <div className="space-y-2">
                  {course.modules.map(mod => (
                    <div key={mod.moduleId} className="text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="truncate pr-2">{mod.title}</span>
                        <span className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                          {mod.solved} / {mod.total} ({mod.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-600 rounded-full"
                          style={{ width: `${mod.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Submissions History */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Complete Submissions Log</h2>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No submissions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Problem</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Tests Passed</th>
                  <th className="py-2.5 px-3">Runtime</th>
                  <th className="py-2.5 px-3">EIS Points</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-sans font-medium text-white">{sub.problemTitle}</td>
                    <td className="py-3 px-3 uppercase text-slate-400">{sub.language}</td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : sub.status === 'Wrong Answer'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 tabular-nums">{sub.testsPassed} / {sub.totalTests}</td>
                    <td className="py-3 px-3 tabular-nums text-slate-400">{sub.executionTimeMs}ms</td>
                    <td className="py-3 px-3 text-sky-400 font-semibold tabular-nums">
                      {sub.scoreAwarded > 0 ? `+${sub.scoreAwarded}` : '-'}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-500 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
