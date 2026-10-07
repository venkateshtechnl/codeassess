import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboardMetrics, CourseId } from '../../types';
import {
  Code,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Terminal,
  Trophy,
  Activity
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string, params?: { courseId?: CourseId; problemId?: string }) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StudentDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/student/dashboard/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
      })
      .catch(err => console.error('Failed to load student dashboard:', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading || !metrics) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-xs text-slate-400">Loading your student dashboard...</p>
        </div>
      </div>
    );
  }

  const { student, rank, totalRanked, totalProblemsCount, totalSolved, overallProgress, courseStats, recentSubmissions, recentMaterials } = metrics;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>{student.batch}</span>
              <span aria-hidden="true">·</span>
              <span>{student.section}</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-400 font-semibold">{student.course.toUpperCase()} Track</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome, {student.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Your technical assessment and structured coding progress dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('practice', { courseId: student.course })}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Resume Practice</span>
            </button>
            <button
              onClick={() => onNavigate('compiler')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open Compiler</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: EIS Points */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">EIS Points</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {student.eisPoints}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Earned via accepted submissions
          </p>
        </div>

        {/* Metric 2: Problems Solved */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Problems Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {totalSolved} <span className="text-lg font-normal text-slate-500">/ {totalProblemsCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {metrics.totalAttempted} attempted in total
          </p>
        </div>

        {/* Metric 3: Overall Progress */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Overall Progress</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            {overallProgress}%
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Leaderboard Position */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Leaderboard Rank</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums">
            #{rank} <span className="text-lg font-normal text-slate-500">/ {totalRanked}</span>
          </div>
          <button
            onClick={() => onNavigate('leaderboard')}
            className="mt-1 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Course Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Course Learning Paths */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Course Progress</h2>
            <span className="text-xs text-slate-400">Structured across 5 Levels</span>
          </div>

          <div className="space-y-4">
            {courseStats.map(course => (
              <div
                key={course.courseId}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{course.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{course.solved} of {course.total} solved</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{course.progress}% Completed</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('practice', { courseId: course.courseId })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-400 bg-sky-950/60 border border-sky-800/60 rounded-md hover:bg-sky-900/50 transition-colors"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                {/* Module badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                  {course.modules.slice(0, 3).map(mod => (
                    <div key={mod.moduleId} className="text-slate-400">
                      <div className="truncate font-medium text-slate-300">{mod.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">{mod.solved}/{mod.total} solved</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Google Classroom Integration Card */}
          <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-950/60 rounded-lg border border-emerald-800/60 text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Google Classroom Connection</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronize trainer assignments, lecture links, and official course announcements.
                </p>
              </div>
            </div>
            <a
              href="https://classroom.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-300 bg-emerald-900/40 border border-emerald-700/60 rounded-lg hover:bg-emerald-800/40 transition-colors shrink-0"
            >
              <span>Open Classroom</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity & Recent Materials */}
        <div className="space-y-6">
          {/* Recent Submissions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Recent Activity</h3>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                View all
              </button>
            </div>

            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No submissions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.slice(0, 5).map(sub => (
                  <div
                    key={sub.id}
                    className="flex items-start justify-between text-xs pb-3 border-b border-slate-800/70 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{sub.problemTitle}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="uppercase font-mono">{sub.language}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{sub.testsPassed}/{sub.totalTests} tests</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[11px] font-semibold ${
                          sub.status === 'Accepted'
                            ? 'text-emerald-400'
                            : sub.status === 'Wrong Answer'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {sub.status === 'Accepted' ? 'Solved' : sub.status}
                      </span>
                      {sub.scoreAwarded > 0 && (
                        <div className="text-[10px] text-sky-400 font-mono">+{sub.scoreAwarded} EIS</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Materials Posted by Trainer */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Course Materials</h3>
              <button
                onClick={() => onNavigate('content')}
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                Feed
              </button>
            </div>

            {recentMaterials.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No materials posted yet.</p>
            ) : (
              <div className="space-y-3">
                {recentMaterials.slice(0, 3).map(mat => (
                  <div
                    key={mat.id}
                    onClick={() => onNavigate('content')}
                    className="cursor-pointer group rounded-lg p-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="font-medium text-xs text-slate-200 group-hover:text-sky-400 transition-colors">
                      {mat.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="uppercase font-semibold">{mat.courseId}</span>
                      <span aria-hidden="true">·</span>
                      <span>Level {mat.levelNumber}</span>
                      {mat.attachmentName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400">{mat.attachmentName}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
