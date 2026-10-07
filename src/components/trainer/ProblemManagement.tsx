import React, { useState, useEffect } from 'react';
import { Problem, CourseId, Module, TestCase } from '../../types';
import {
  Plus,
  Trash2,
  Edit,
  Code,
  Search,
  Filter,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ProblemManagement: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseFilter, setCourseFilter] = useState<CourseId>('java');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState<CourseId>('java');
  const [levelNumber, setLevelNumber] = useState(1);
  const [moduleId, setModuleId] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [points, setPoints] = useState(10);
  const [description, setDescription] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 'tc1', input: '', expectedOutput: '', isHidden: false },
    { id: 'tc2', input: '', expectedOutput: '', isHidden: true }
  ]);

  useEffect(() => {
    loadProblems();
    loadModules();
  }, [courseFilter, levelFilter]);

  const loadProblems = () => {
    setLoading(true);
    let url = `/api/problems?courseId=${courseFilter}`;
    if (levelFilter !== 'all') {
      url += `&levelNumber=${levelFilter}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setProblems(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const loadModules = () => {
    fetch(`/api/modules?courseId=${courseFilter}`)
      .then(res => res.json())
      .then(data => {
        setModules(data);
        if (data.length > 0 && !moduleId) {
          setModuleId(data[0].id);
        }
      })
      .catch(e => console.error(e));
  };

  const handleOpenCreate = () => {
    setEditingProblemId(null);
    setTitle('');
    setCourseId(courseFilter);
    setLevelNumber(1);
    setModuleId(modules[0]?.id || `${courseFilter}-m1`);
    setDifficulty('Easy');
    setPoints(10);
    setDescription('');
    setInputFormat('Single line with test inputs.');
    setOutputFormat('Output format description.');
    setConstraints('1 <= N <= 10^5');
    setExampleInput('');
    setExampleOutput('');
    setStarterCode('');
    setTestCases([
      { id: 'tc1', input: '', expectedOutput: '', isHidden: false },
      { id: 'tc2', input: '', expectedOutput: '', isHidden: true }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prob: Problem) => {
    setEditingProblemId(prob.id);
    setTitle(prob.title);
    setCourseId(prob.courseId);
    setLevelNumber(prob.levelNumber);
    setModuleId(prob.moduleId);
    setDifficulty(prob.difficulty);
    setPoints(prob.points);
    setDescription(prob.description);
    setInputFormat(prob.inputFormat || '');
    setOutputFormat(prob.outputFormat || '');
    setConstraints(prob.constraints || '');
    setExampleInput(prob.exampleInput || '');
    setExampleOutput(prob.exampleOutput || '');
    setStarterCode((prob.starterCode as any)?.[prob.courseId] || '');
    setTestCases(prob.testCases?.length ? prob.testCases : [
      { id: 'tc1', input: '', expectedOutput: '', isHidden: false }
    ]);
    setIsModalOpen(true);
  };

  const handleDelete = async (probId: string) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      const res = await fetch(`/api/problems/${probId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('codeassess_token') || ''}`
        }
      });
      if (res.ok) {
        setProblems(prev => prev.filter(p => p.id !== probId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('codeassess_token') || '';
    const payload = {
      courseId,
      levelNumber: Number(levelNumber),
      moduleId: moduleId || `${courseId}-m1`,
      title,
      difficulty,
      points: Number(points),
      description,
      inputFormat,
      outputFormat,
      constraints,
      exampleInput,
      exampleOutput,
      starterCode: {
        [courseId]: starterCode
      },
      testCases
    };

    try {
      if (editingProblemId) {
        const res = await fetch(`/api/problems/${editingProblemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsModalOpen(false);
          loadProblems();
        }
      } else {
        const res = await fetch('/api/problems', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsModalOpen(false);
          loadProblems();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addTestCase = () => {
    setTestCases(prev => [
      ...prev,
      { id: 'tc' + (prev.length + 1), input: '', expectedOutput: '', isHidden: false }
    ]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
  };

  const filtered = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Problem Repository</h1>
          <p className="text-xs text-slate-400 mt-1">
            Author and configure coding problems, test cases, and EIS scoring rubrics.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Problem</span>
        </button>
      </div>

      {/* Course & Level Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Course select */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded border border-slate-800">
            {(['java', 'c', 'cpp', 'python'] as CourseId[]).map(c => (
              <button
                key={c}
                onClick={() => setCourseFilter(c)}
                className={`px-3 py-1 font-semibold rounded ${
                  courseFilter === c ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Level select */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All 5 Levels</option>
              <option value="1">Level 1 - Basics</option>
              <option value="2">Level 2 - Conditions</option>
              <option value="3">Level 3 - Loops & Math</option>
              <option value="4">Level 4 - Arrays & Strings</option>
              <option value="5">Level 5 - OOP & DSA</option>
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
            placeholder="Search problem title..."
            className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Problems List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No problems found for this criteria. Click "Create New Problem" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">EIS Points</th>
                  <th className="py-3 px-4">Test Cases</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
                {filtered.map(prob => (
                  <tr key={prob.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{prob.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{prob.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      Level {prob.levelNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          prob.difficulty === 'Easy'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                            : prob.difficulty === 'Medium'
                            ? 'bg-amber-950 text-amber-400 border border-amber-900'
                            : 'bg-rose-950 text-rose-400 border border-rose-900'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-400 tabular-nums">
                      +{prob.points}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400">
                      {prob.testCases?.length || 0} cases
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prob)}
                          className="p-1 text-slate-400 hover:text-sky-400"
                          title="Edit Problem"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prob.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-4">
              {editingProblemId ? 'Edit Problem' : 'Create New Problem'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Problem Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Reverse a Number"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Course</label>
                  <select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value as CourseId)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="java">Java</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Level (1 to 5)</label>
                  <select
                    value={levelNumber}
                    onChange={e => setLevelNumber(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="1">Level 1 - Basics</option>
                    <option value="2">Level 2 - Conditions</option>
                    <option value="3">Level 3 - Loops & Math</option>
                    <option value="4">Level 4 - Arrays & Strings</option>
                    <option value="5">Level 5 - OOP & DSA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => {
                      const d = e.target.value as 'Easy' | 'Medium' | 'Hard';
                      setDifficulty(d);
                      setPoints(d === 'Easy' ? 10 : d === 'Medium' ? 20 : 30);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">EIS Points</label>
                  <input
                    type="number"
                    value={points}
                    onChange={e => setPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain the problem statement clearly..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Input Format</label>
                  <input
                    type="text"
                    value={inputFormat}
                    onChange={e => setInputFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Output Format</label>
                  <input
                    type="text"
                    value={outputFormat}
                    onChange={e => setOutputFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Example Input</label>
                  <textarea
                    rows={2}
                    value={exampleInput}
                    onChange={e => setExampleInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Example Output</label>
                  <textarea
                    rows={2}
                    value={exampleOutput}
                    onChange={e => setExampleOutput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Test Cases Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                    Automated Test Cases
                  </label>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    + Add Test Case
                  </button>
                </div>

                {testCases.map((tc, index) => (
                  <div key={tc.id || index} className="grid grid-cols-12 gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Stdin input"
                        value={tc.input}
                        onChange={e => {
                          const updated = [...testCases];
                          updated[index].input = e.target.value;
                          setTestCases(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-[11px] text-white"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Expected stdout"
                        value={tc.expectedOutput}
                        onChange={e => {
                          const updated = [...testCases];
                          updated[index].expectedOutput = e.target.value;
                          setTestCases(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 font-mono text-[11px] text-white"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-1 text-[10px] text-slate-400">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={e => {
                            const updated = [...testCases];
                            updated[index].isHidden = e.target.checked;
                            setTestCases(updated);
                          }}
                        />
                        <span>Hidden</span>
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-semibold"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
