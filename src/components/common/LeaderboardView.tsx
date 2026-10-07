import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LeaderboardEntry, CourseId } from '../../types';
import { Trophy, Medal, Filter, Search, Award } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = '/api/leaderboard';
    const params = new URLSearchParams();
    if (courseFilter !== 'all') params.append('courseId', courseFilter);
    if (batchFilter !== 'all') params.append('batch', batchFilter);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setLeaderboard(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [courseFilter, batchFilter]);

  const filtered = leaderboard.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Student Leaderboard</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global rankings determined by accepted problem evaluations, test precision, and EIS points.
          </p>
        </div>

        {/* Top 3 Podium preview for excitement */}
        <div className="flex items-center gap-3">
          {leaderboard.slice(0, 3).map((top, idx) => (
            <div
              key={top.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                idx === 0
                  ? 'bg-amber-950/40 border-amber-600/60 text-amber-300'
                  : idx === 1
                  ? 'bg-slate-800/80 border-slate-600 text-slate-200'
                  : 'bg-amber-900/20 border-amber-800 text-amber-400'
              }`}
            >
              <span className="font-bold font-mono">#{idx + 1}</span>
              <span className="font-medium truncate max-w-[80px]">{top.name.split(' ')[0]}</span>
              <span className="font-mono tabular-nums text-slate-400">({top.eisPoints}p)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Course filter */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Course:</span>
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Courses</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
            </select>
          </div>

          {/* Batch filter */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Batch:</span>
            <select
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Batches</option>
              <option value="Batch-2026-A">Batch-2026-A</option>
              <option value="Batch-2026-B">Batch-2026-B</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student name..."
            className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course Track</th>
                  <th className="py-3 px-4">Batch / Section</th>
                  <th className="py-3 px-4">Solved</th>
                  <th className="py-3 px-4">Overall Progress</th>
                  <th className="py-3 px-4 text-right">EIS Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                {filtered.map(entry => {
                  const isCurrentUser = user?.id === entry.id;
                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-sky-950/40 border-l-4 border-l-sky-500'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs">
                            1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold text-xs">
                            2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400">#{entry.rank}</span>
                        )}
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{entry.name}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-1.5 py-0.2 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{entry.email}</div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <span className="uppercase font-mono text-[11px] text-slate-300">
                          {entry.course}
                        </span>
                      </td>

                      {/* Batch & Section */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {entry.batch} · {entry.section}
                      </td>

                      {/* Solved count */}
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-200">
                        {entry.problemsSolved}
                      </td>

                      {/* Progress bar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full"
                              style={{ width: `${entry.progress}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                            {entry.progress}%
                          </span>
                        </div>
                      </td>

                      {/* EIS Points */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-400 text-sm tabular-nums">
                        {entry.eisPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
