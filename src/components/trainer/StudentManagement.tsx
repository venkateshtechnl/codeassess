import React, { useState, useEffect } from 'react';
import { User, CourseId, Submission } from '../../types';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Shield,
  X,
  Code,
  Sparkles
} from 'lucide-react';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  course: CourseId;
  batch: string;
  section: string;
  eisPoints: number;
  isActive: boolean;
  problemsSolved: number;
  submissionsCount: number;
  createdAt: string;
}

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected student for report modal
  const [selectedStudentReport, setSelectedStudentReport] = useState<any | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Selected code view modal
  const [inspectSubmission, setInspectSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    setLoading(true);
    fetch('/api/trainer/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleToggleStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/trainer/students/${studentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setStudents(prev =>
          prev.map(s => (s.id === studentId ? { ...s, isActive: !currentStatus } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openStudentReport = async (studentId: string) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/trainer/students/${studentId}/report`);
      const data = await res.json();
      setSelectedStudentReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  const filtered = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === 'all' || s.course === courseFilter;
    const matchBatch = batchFilter === 'all' || s.batch === batchFilter;
    return matchSearch && matchCourse && matchBatch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Student Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor enrolled students, review detailed individual progress reports, and manage access permissions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs">
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

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Batch / Section</th>
                  <th className="py-3 px-4">EIS Points</th>
                  <th className="py-3 px-4">Solved</th>
                  <th className="py-3 px-4">Submissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                {filtered.map(st => (
                  <tr key={st.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{st.name}</div>
                      <div className="text-[11px] text-slate-400">{st.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase font-mono text-[11px] text-sky-400 font-semibold">
                        {st.course}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {st.batch} · {st.section}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 tabular-nums">
                      {st.eisPoints}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-200">
                      {st.problemsSolved}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                      {st.submissionsCount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          st.isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        }`}
                      >
                        {st.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStudentReport(st.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 rounded hover:bg-sky-900/60 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(st.id, st.isActive)}
                          className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                            st.isActive
                              ? 'text-rose-400 hover:bg-rose-950/50'
                              : 'text-emerald-400 hover:bg-emerald-950/50'
                          }`}
                        >
                          {st.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Student Report Modal */}
      {selectedStudentReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedStudentReport(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
                <span>Individual Assessment Report</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {selectedStudentReport.student.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{selectedStudentReport.student.email}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedStudentReport.student.batch} ({selectedStudentReport.student.section})</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-400 font-bold">{selectedStudentReport.stats.eisPoints} EIS</span>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Problems Solved</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {selectedStudentReport.stats.totalSolved}
                </div>
              </div>
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Attempted</div>
                <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                  {selectedStudentReport.stats.totalAttempted}
                </div>
              </div>
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Failed Attempts</div>
                <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                  {selectedStudentReport.stats.totalFailed}
                </div>
              </div>
            </div>

            {/* Course Progress Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Course Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedStudentReport.courseBreakdown.map((cb: any) => (
                  <div key={cb.courseId} className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{cb.courseName}</span>
                      <span className="font-mono tabular-nums text-sky-400">{cb.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${cb.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {cb.solved} of {cb.total} problems solved
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Submissions Log
              </h3>
              {selectedStudentReport.submissions.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No submissions yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedStudentReport.submissions.map((sub: Submission) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div>
                        <div className="font-medium text-white">{sub.problemTitle}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {sub.language.toUpperCase()} · {sub.testsPassed}/{sub.totalTests} tests · {sub.executionTimeMs}ms
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold text-[11px] ${
                            sub.status === 'Accepted'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <button
                          onClick={() => setInspectSubmission(sub)}
                          className="px-2 py-1 text-[10px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded"
                        >
                          Inspect Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Inspection Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setInspectSubmission(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm font-bold text-white">
                Student Solution: {inspectSubmission.problemTitle}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                {inspectSubmission.studentName} · {inspectSubmission.language.toUpperCase()} · Status: {inspectSubmission.status}
              </div>
            </div>
            <pre className="rounded bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-96 whitespace-pre-wrap">
              {inspectSubmission.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
