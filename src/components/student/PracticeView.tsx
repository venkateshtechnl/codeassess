import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Course, CourseId, Module, Problem, Submission } from '../../types';
import {
  Code,
  CheckCircle2,
  ChevronRight,
  Filter,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

interface PracticeViewProps {
  initialCourseId?: CourseId;
  onSelectProblem: (problemId: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ initialCourseId, onSelectProblem }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseId>(initialCourseId || user?.course || 'java');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load courses
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then((data: Course[]) => {
        setCourses(data);
      })
      .catch(err => console.error('Failed to load courses', err));
  }, []);

  // Update selected course if prop changes
  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourse(initialCourseId);
    }
  }, [initialCourseId]);

  // Load modules for course and level
  useEffect(() => {
    fetch(`/api/modules?courseId=${selectedCourse}`)
      .then(res => res.json())
      .then((data: Module[]) => {
        setModules(data);
        setSelectedModuleId('all');
      })
      .catch(err => console.error('Failed to load modules', err));
  }, [selectedCourse]);

  // Load problems for course
  useEffect(() => {
    setLoading(true);
    let url = `/api/problems?courseId=${selectedCourse}&levelNumber=${selectedLevel}`;
    if (selectedModuleId !== 'all') {
      url += `&moduleId=${selectedModuleId}`;
    }
    if (difficultyFilter !== 'all') {
      url += `&difficulty=${difficultyFilter}`;
    }
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    fetch(url)
      .then(res => res.json())
      .then((data: Problem[]) => {
        setProblems(data);
      })
      .catch(err => console.error('Failed to load problems', err))
      .finally(() => setLoading(false));

    // Load student's submissions to mark solved problems
    if (user) {
      fetch(`/api/submissions?studentId=${user.id}&courseId=${selectedCourse}`)
        .then(res => res.json())
        .then((subs: Submission[]) => {
          setSubmissions(subs);
        })
        .catch(err => console.error('Failed to load submissions', err));
    }
  }, [selectedCourse, selectedLevel, selectedModuleId, difficultyFilter, searchQuery, user]);

  const solvedProblemIds = new Set(
    submissions.filter(s => s.status === 'Accepted').map(s => s.problemId)
  );

  const activeCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Course Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Coding Practice</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a language course, work through the 5 learning levels, and test your code against automated judges.
          </p>
        </div>

        {/* Language Course Pill Buttons */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {(['java', 'c', 'cpp', 'python'] as CourseId[]).map(cId => {
            const courseMeta = courses.find(c => c.id === cId);
            const isActive = selectedCourse === cId;
            return (
              <button
                key={cId}
                onClick={() => {
                  setSelectedCourse(cId);
                  setSelectedLevel(1);
                  setSelectedModuleId('all');
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {courseMeta ? courseMeta.name.split(' ')[0] : cId.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Levels Stepper */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {activeCourseData?.name || selectedCourse.toUpperCase()} · {activeCourseData?.levels.length || 0} Learning Levels
          </span>
          <span className="text-xs text-sky-400 font-mono">
            Level {selectedLevel} of {activeCourseData?.levels.length || 1} Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {activeCourseData?.levels.map(lvl => {
            const isSelected = selectedLevel === lvl.levelNumber;
            return (
              <button
                key={lvl.levelNumber}
                onClick={() => {
                  setSelectedLevel(lvl.levelNumber);
                  setSelectedModuleId('all');
                }}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-mono font-semibold ${isSelected ? 'text-sky-400' : 'text-slate-400'}`}>
                    Level {lvl.levelNumber}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>}
                </div>
                <div className="font-semibold text-xs text-slate-200 truncate">{lvl.name}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{lvl.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Module Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedModuleId}
              onChange={e => setSelectedModuleId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Modules in Level {selectedLevel}</option>
              {modules
                .filter(m => m.levelNumber === selectedLevel)
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 text-xs">
            {['all', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  difficultyFilter === d
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
        </div>
      ) : problems.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <Code className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No problems found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try choosing a different level or clearing your difficulty filter.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {problems.map(prob => {
            const isSolved = solvedProblemIds.has(prob.id);
            return (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob.id)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all cursor-pointer gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-1.5 rounded-full ${
                      isSolved
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isSolved ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                        {prob.title}
                      </h4>
                      {isSolved && (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-900">
                          Solved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{prob.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-xs">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                      prob.difficulty === 'Easy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : prob.difficulty === 'Medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {prob.difficulty}
                  </span>

                  <span className="font-mono tabular-nums text-slate-400">+{prob.points} EIS</span>

                  <div className="flex items-center gap-1 text-sky-400 group-hover:translate-x-0.5 transition-transform font-medium">
                    <span>Solve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
