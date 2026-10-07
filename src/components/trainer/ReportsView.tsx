import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, BarChart2, CheckCircle2, Users, FileCheck } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadStudentsCsv = () => {
    window.open('/api/reports/export/students-csv', '_blank');
  };

  if (loading || !summary) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Assessment & Cohort Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated institutional statistics, language pass rates, and downloadable CSV gradebook records.
          </p>
        </div>

        <button
          onClick={handleDownloadStudentsCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Student Gradebook (CSV)</span>
        </button>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-400">Total Enrolled</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
            {summary.totalStudents}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{summary.activeStudents} active</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-400">Problems in Bank</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
            {summary.totalProblems}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automated test cases</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-slate-400">Total Evaluated</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
            {summary.totalSubmissions}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Submitted code files</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="text-xs text-emerald-400">Accepted Solutions</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {summary.totalAccepted}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {summary.totalSubmissions > 0 ? Math.round((summary.totalAccepted / summary.totalSubmissions) * 100) : 0}% success rate
          </div>
        </div>
      </div>

      {/* Course Performance Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Course Performance & Pass Rates</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-4">Students Enrolled</th>
                <th className="py-3 px-4">Available Problems</th>
                <th className="py-3 px-4">Total Submissions</th>
                <th className="py-3 px-4">Passed</th>
                <th className="py-3 px-4">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {summary.courseBreakdown.map((cb: any) => (
                <tr key={cb.courseId} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-semibold text-white">{cb.courseName}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-400">{cb.enrolled}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-400">{cb.problemCount}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-400">{cb.totalSubmissions}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-emerald-400">{cb.solvedSubmissions}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${cb.passRate}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-emerald-400 font-bold">{cb.passRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
