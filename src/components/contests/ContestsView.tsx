import React, { useState } from 'react';
import { Trophy, Clock, Calendar, Award, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { CourseId } from '../../types';

interface Contest {
  id: string;
  title: string;
  course: CourseId;
  description: string;
  status: 'Live Now' | 'Upcoming' | 'Completed';
  startDate: string;
  duration: string;
  problemsCount: number;
  totalPoints: number;
  participants: number;
}

const CONTESTS_LIST: Contest[] = [
  {
    id: 'contest-1',
    title: 'Weekly Speed Coding Sprint #4',
    course: 'java',
    description: 'Fast-paced algorithmic challenge focusing on time complexity, loop optimizations, and array problem solving.',
    status: 'Live Now',
    startDate: 'Started 2 hours ago',
    duration: '90 Minutes',
    problemsCount: 4,
    totalPoints: 100,
    participants: 28
  },
  {
    id: 'contest-2',
    title: 'Mid-Term Java OOP & Collections Exam',
    course: 'java',
    description: 'Official cohort milestone assessment evaluating object-oriented design patterns, polymorphism, and Java collections.',
    status: 'Upcoming',
    startDate: 'Sept 29, 2026 · 10:00 AM',
    duration: '120 Minutes',
    problemsCount: 5,
    totalPoints: 150,
    participants: 45
  },
  {
    id: 'contest-3',
    title: 'C & C++ Pointer Mastery Sprint',
    course: 'cpp',
    description: 'Low-level memory manipulation, pointer arithmetic, dynamic allocations, and STL container optimizations.',
    status: 'Upcoming',
    startDate: 'Oct 02, 2026 · 02:00 PM',
    duration: '75 Minutes',
    problemsCount: 3,
    totalPoints: 80,
    participants: 32
  },
  {
    id: 'contest-4',
    title: 'Pythonic Algorithmic Qualifier',
    course: 'python',
    description: 'Foundational Python problem solving covering list comprehensions, dict mapping, and string algorithms.',
    status: 'Completed',
    startDate: 'Completed Sept 20, 2026',
    duration: '60 Minutes',
    problemsCount: 4,
    totalPoints: 90,
    participants: 41
  }
];

interface ContestsViewProps {
  onNavigateToPractice?: (courseId: CourseId) => void;
  onNavigateToCompiler?: () => void;
}

export const ContestsView: React.FC<ContestsViewProps> = ({ onNavigateToPractice, onNavigateToCompiler }) => {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const filtered = CONTESTS_LIST.filter(c => {
    if (filter === 'live') return c.status === 'Live Now';
    if (filter === 'upcoming') return c.status === 'Upcoming';
    if (filter === 'completed') return c.status === 'Completed';
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Contests & Technical Exams</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scheduled coding assessments, speed challenges, and trainer mid-term exams. Test and run your programs with OnlineGDB.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {(['all', 'live', 'upcoming', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 font-semibold rounded-md transition-colors capitalize ${
                filter === tab ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Contests' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Contests List */}
      <div className="space-y-4">
        {filtered.map(contest => (
          <div
            key={contest.id}
            className={`rounded-xl border p-5 transition-colors ${
              contest.status === 'Live Now'
                ? 'bg-slate-900/80 border-amber-600/50 shadow-lg ring-1 ring-amber-500/20'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      contest.status === 'Live Now'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                        : contest.status === 'Upcoming'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {contest.status}
                  </span>
                  <span className="uppercase text-[11px] font-mono text-slate-400 font-semibold">
                    {contest.course} Track
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">{contest.duration}</span>
                </div>

                <h3 className="text-base font-bold text-white">{contest.title}</h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  {contest.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>{contest.startDate}</span>
                  <span className="text-slate-600">·</span>
                  <span>{contest.problemsCount} Problems</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-mono font-semibold">+{contest.totalPoints} EIS Awarded</span>
                  <span className="text-slate-600">·</span>
                  <span>{contest.participants} Enrolled</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                {contest.status === 'Live Now' ? (
                  <button
                    onClick={() => onNavigateToPractice && onNavigateToPractice(contest.course)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    <span>Enter Live Contest</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : contest.status === 'Upcoming' ? (
                  <button
                    onClick={() => alert(`Registered for ${contest.title}! Starting on ${contest.startDate}`)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors"
                  >
                    Register for Contest
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateToPractice && onNavigateToPractice(contest.course)}
                    className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white font-medium text-xs rounded-lg border border-slate-800 transition-colors"
                  >
                    View Archives & Solutions
                  </button>
                )}

                {onNavigateToCompiler && (
                  <button
                    onClick={onNavigateToCompiler}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Open OnlineGDB Workspace
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
