import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Problem, Submission, CourseId } from '../../types';
import { handleCodeEditorKeyDown } from '../../utils/editorUtils';
import {
  ArrowLeft,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Terminal,
  FileCode,
  Copy,
  Check,
  AlertTriangle,
  History,
  Info
} from 'lucide-react';

interface ProblemEditorProps {
  problemId: string;
  onBack: () => void;
}

const DEFAULT_STARTERS: Partial<Record<CourseId, (p: Problem) => string>> = {
  java: (p) => `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Solution for: ${p.title}
        
    }
}`,

  c: (p) => `#include <stdio.h>

int main() {
    // Solution for: ${p.title}
    
    return 0;
}`,

  cpp: (p) => `#include <iostream>

using namespace std;

int main() {
    // Solution for: ${p.title}
    
    return 0;
}`,

  python: (p) => `# Solution for: ${p.title}
import sys

def solve():
    pass

if __name__ == '__main__':
    solve()
`
};

export const ProblemEditor: React.FC<ProblemEditorProps> = ({ problemId, onBack }) => {
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<CourseId>('java');
  const [code, setCode] = useState<string>('');
  const [stdinInput, setStdinInput] = useState<string>('');
  const [leftTab, setLeftTab] = useState<'statement' | 'submissions'>('statement');
  const [bottomTab, setBottomTab] = useState<'tests' | 'terminal'>('tests');

  // Submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [runResult, setRunResult] = useState<{
    stdout: string;
    stderr: string;
    compileOutput?: string;
    exitCode: number;
    executionTimeMs: number;
    isError: boolean;
    statusText?: string;
  } | null>(null);

  // Interactive input in terminal
  const [interactiveInputValue, setInteractiveInputValue] = useState('');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [copiedInputIdx, setCopiedInputIdx] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Load problem details and submission history
  useEffect(() => {
    setLoading(true);
    fetch(`/api/problems/${problemId}`)
      .then(res => res.json())
      .then((data: Problem) => {
        setProblem(data);
        const initialLang = data.courseId;
        setLanguage(initialLang);
        const starter = DEFAULT_STARTERS[initialLang]?.(data) || data.starterCode?.[initialLang] || '// Write your solution here\n';
        setCode(starter);
        if (data.testCases && data.testCases.length > 0) {
          setStdinInput(data.testCases[0].input);
        }
      })
      .catch(err => console.error('Failed to load problem:', err))
      .finally(() => setLoading(false));

    // Load submissions
    fetch(`/api/submissions?problemId=${problemId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubmissions(data);
      })
      .catch(err => console.error('Failed to load submissions:', err));
  }, [problemId]);

  // Sync line numbers scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Cursor tracking
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const { selectionStart, value } = textareaRef.current;
    const lines = value.slice(0, selectionStart).split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  // Language switch
  const handleLanguageChange = (newLang: CourseId) => {
    setLanguage(newLang);
    if (problem) {
      const starter = DEFAULT_STARTERS[newLang]?.(problem) || problem.starterCode?.[newLang] || '// Write your solution here\n';
      setCode(starter);
    }
  };

  // Reset starter
  const handleReset = () => {
    if (problem && confirm('Reset code to starter template?')) {
      const starter = DEFAULT_STARTERS[language]?.(problem) || problem.starterCode?.[language] || '// Write your solution here\n';
      setCode(starter);
    }
  };

  // Copy sample testcase input
  const handleCopyInput = (input: string, idx: number) => {
    navigator.clipboard.writeText(input);
    setCopiedInputIdx(idx);
    setStdinInput(input);
    setTimeout(() => setCopiedInputIdx(null), 2000);
  };

  // Run against custom stdin / sample test case
  const handleRun = async (overrideStdin?: string) => {
    if (isRunning || isSubmitting || !code) return;
    setIsRunning(true);
    setBottomTab('terminal');

    const effectiveStdin = overrideStdin !== undefined ? overrideStdin : (stdinInput || problem?.testCases[0]?.input || '');

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          stdin: effectiveStdin
        })
      });

      const data = await res.json();
      setRunResult(data);
    } catch (err: any) {
      setRunResult({
        stdout: '',
        stderr: err.message || 'Execution failed',
        exitCode: 1,
        executionTimeMs: 0,
        isError: true,
        statusText: 'Runtime Error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution for full evaluation
  const handleSubmit = async () => {
    if (isSubmitting || isRunning || !code) return;
    setIsSubmitting(true);
    setBottomTab('tests');

    try {
      const res = await fetch(`/api/problems/${problemId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id || 'u-student-1',
          language,
          code
        })
      });

      const data = await res.json();
      if (data.evaluation) {
        setEvaluationResult(data.evaluation);
        setActiveTestCaseIndex(0);
      }
      if (data.submission) {
        setSubmissions(prev => [data.submission, ...prev]);
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter to Run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, stdinInput, isRunning, isSubmitting]);

  if (loading || !problem) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-xs text-slate-400">Loading problem details...</p>
        </div>
      </div>
    );
  }

  const sampleCases = problem.testCases.filter(tc => !tc.isHidden);
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-4">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Practice</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-semibold border border-slate-700">
              {problem.courseId.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">Level {problem.levelNumber}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                problem.difficulty === 'Easy'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/70'
                  : problem.difficulty === 'Medium'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800/70'
                  : 'bg-rose-950 text-rose-400 border border-rose-800/70'
              }`}
            >
              {problem.difficulty}
            </span>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              +{problem.points} EIS
            </span>
          </div>
        </div>

        {/* Language selector & Run / Submit buttons */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            {(['java', 'c', 'cpp', 'python'] as CourseId[]).map(lang => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase transition-all ${
                  language === lang
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          {/* Run Code */}
          <button
            onClick={() => handleRun()}
            disabled={isRunning || isSubmitting}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all ${
              isRunning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Run against Sample Case 1 / Stdin (Ctrl+Enter)"
          >
            {isRunning ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
            )}
            <span>Run</span>
          </button>

          {/* Submit Solution */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all ${
              isSubmitting
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Problem Details & Submissions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur overflow-hidden min-h-[580px]">
          {/* Left Tabs */}
          <div className="flex items-center border-b border-slate-800 px-3 pt-2 bg-slate-900">
            <button
              onClick={() => setLeftTab('statement')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                leftTab === 'statement'
                  ? 'border-sky-400 text-sky-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Problem Statement</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                leftTab === 'submissions'
                  ? 'border-sky-400 text-sky-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
              {submissions.length > 0 && (
                <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                  {submissions.length}
                </span>
              )}
            </button>
          </div>

          {/* Left Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-sm">
            {leftTab === 'statement' && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {problem.title}
                  </h2>
                  <p className="mt-3 text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {problem.description}
                  </p>
                </div>

                {/* Input / Output Format */}
                <div className="space-y-4 text-xs">
                  <div>
                    <h3 className="font-semibold text-white uppercase text-[11px] tracking-wider text-slate-400">
                      Input Format
                    </h3>
                    <p className="mt-1 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                      {problem.inputFormat}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white uppercase text-[11px] tracking-wider text-slate-400">
                      Output Format
                    </h3>
                    <p className="mt-1 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                      {problem.outputFormat}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white uppercase text-[11px] tracking-wider text-slate-400">
                      Constraints
                    </h3>
                    <p className="mt-1 text-slate-400 font-mono bg-slate-950/40 p-2 rounded border border-slate-800/80">
                      {problem.constraints}
                    </p>
                  </div>
                </div>

                {/* Sample Test Cases with Copy button */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-semibold text-white uppercase text-[11px] tracking-wider text-slate-400">
                    Sample Test Cases
                  </h3>

                  {sampleCases.map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Sample Case {idx + 1}</span>
                        <button
                          onClick={() => handleCopyInput(tc.input, idx)}
                          className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors"
                        >
                          {copiedInputIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied to Stdin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Use as Input</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <div className="text-[10px] text-slate-500 mb-0.5 font-sans">Input:</div>
                          <pre className="bg-black/80 p-2 rounded border border-slate-900 text-slate-300 overflow-x-auto whitespace-pre">
                            {tc.input || '(empty)'}
                          </pre>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 mb-0.5 font-sans">Expected Output:</div>
                          <pre className="bg-black/80 p-2 rounded border border-slate-900 text-emerald-400 overflow-x-auto whitespace-pre">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Submissions Tab */}
            {leftTab === 'submissions' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-white text-xs mb-3">
                  Submission History ({submissions.length})
                </h3>

                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No submissions made for this problem yet.
                  </p>
                ) : (
                  submissions.map(sub => (
                    <div
                      key={sub.id}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            sub.status === 'Accepted'
                              ? 'text-emerald-400'
                              : sub.status === 'Wrong Answer'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="uppercase font-mono font-medium">{sub.language}</span>
                        <span>•</span>
                        <span className="font-mono tabular-nums">{sub.testsPassed}/{sub.totalTests} tests passed</span>
                        <span>•</span>
                        <span className="font-mono">{sub.executionTimeMs}ms</span>
                        {sub.scoreAwarded > 0 && (
                          <span className="text-sky-400 font-semibold font-mono">+{sub.scoreAwarded} EIS</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Evaluation Dock (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Code Editor Panel */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>Solution.{language === 'java' ? 'java' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'c'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Reset starter template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[10px]">Reset</span>
                </button>
              </div>
            </div>

            {/* Textarea with Line Numbers & Smart Indentation */}
            <div className="relative flex min-h-[340px] font-mono text-xs">
              <div
                ref={lineNumbersRef}
                className="w-10 select-none border-r border-slate-800/80 bg-slate-900/30 py-3 text-right font-mono text-slate-600 overflow-hidden"
                style={{ lineHeight: '1.4rem' }}
              >
                {lineNumbers.map(n => (
                  <div key={n} className="px-2">
                    {n}
                  </div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  updateCursorPosition();
                }}
                onKeyDown={e => {
                  handleCodeEditorKeyDown(e, code, setCode, { tabSize: 4 });
                  setTimeout(updateCursorPosition, 0);
                }}
                onClick={updateCursorPosition}
                onKeyUp={updateCursorPosition}
                onScroll={handleScroll}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="flex-1 resize-none bg-transparent p-3 text-slate-200 focus:outline-none selection:bg-sky-900/60 leading-[1.4rem] font-mono overflow-auto whitespace-pre"
                style={{
                  tabSize: 4,
                  lineHeight: '1.4rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }}
              />
            </div>

            {/* Editor Footer Status Bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                <span>•</span>
                <span>Tab: 4 spaces</span>
              </div>
              <div className="text-emerald-400">
                Auto-Indentation Active
              </div>
            </div>
          </div>

          {/* Bottom Dock: Test Cases & Terminal Console */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            {/* Dock Header Tabs */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBottomTab('tests')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    bottomTab === 'tests'
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Cases</span>
                  {evaluationResult && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        evaluationResult.status === 'Accepted'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {evaluationResult.testsPassed}/{evaluationResult.totalTests}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setBottomTab('terminal')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    bottomTab === 'terminal'
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal Console</span>
                  {runResult && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({runResult.executionTimeMs}ms)
                    </span>
                  )}
                </button>
              </div>

              {/* Status indicators */}
              <div>
                {evaluationResult && bottomTab === 'tests' && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      evaluationResult.status === 'Accepted'
                        ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800/80'
                        : 'text-rose-400 bg-rose-950/80 border border-rose-800/80'
                    }`}
                  >
                    {evaluationResult.status}
                  </span>
                )}
              </div>
            </div>

            {/* Dock Content */}
            <div className="p-4 min-h-[220px] max-h-[300px] overflow-y-auto">
              {/* Tab 1: Test Cases */}
              {bottomTab === 'tests' && (
                <div>
                  {!evaluationResult ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      <p>Click <strong className="text-emerald-400">Submit Solution</strong> to evaluate your code against all {problem.testCases.length} test cases.</p>
                      <p className="mt-1 text-[11px] text-slate-600">Sample test cases can also be run individually in the Terminal Console.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Overall banner */}
                      <div
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          evaluationResult.status === 'Accepted'
                            ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                            : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {evaluationResult.status === 'Accepted' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <div>
                            <span className="font-bold text-sm">{evaluationResult.status}</span>
                            <span className="ml-2 font-mono text-[11px] text-slate-400">
                              ({evaluationResult.testsPassed} of {evaluationResult.totalTests} tests passed)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evaluationResult.executionTimeMs} ms</span>
                        </div>
                      </div>

                      {/* Test case tab selector */}
                      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
                        {evaluationResult.testCaseResults.map((tcRes: any, i: number) => (
                          <button
                            key={tcRes.id}
                            onClick={() => setActiveTestCaseIndex(i)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                              activeTestCaseIndex === i
                                ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tcRes.passed ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-rose-400" />
                            )}
                            <span>Case {i + 1} {tcRes.isHidden ? '(Hidden)' : ''}</span>
                          </button>
                        ))}
                      </div>

                      {/* Active Test Case Detail */}
                      {evaluationResult.testCaseResults[activeTestCaseIndex] && (
                        <div className="rounded-lg bg-black/60 border border-slate-800 p-3 space-y-2 text-xs font-mono">
                          {evaluationResult.testCaseResults[activeTestCaseIndex].isHidden ? (
                            <div className="text-slate-400 py-2">
                              {evaluationResult.testCaseResults[activeTestCaseIndex].passed ? (
                                <p className="text-emerald-400 font-semibold">✓ Hidden test case passed.</p>
                              ) : (
                                <p className="text-rose-400 font-semibold">✗ Hidden test case failed.</p>
                              )}
                              <p className="text-[10px] text-slate-500 mt-1">Hidden test case inputs and expected outputs are protected.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <span className="text-[10px] text-slate-500 font-sans">Input:</span>
                                <pre className="bg-black p-2 rounded border border-slate-900 text-slate-300 mt-1 whitespace-pre">
                                  {evaluationResult.testCaseResults[activeTestCaseIndex].input}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-sans">Expected Output:</span>
                                <pre className="bg-black p-2 rounded border border-slate-900 text-emerald-400 mt-1 whitespace-pre">
                                  {evaluationResult.testCaseResults[activeTestCaseIndex].expectedOutput}
                                </pre>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-[10px] text-slate-500 font-sans">Your Output:</span>
                                <pre
                                  className={`bg-black p-2 rounded border border-slate-900 mt-1 whitespace-pre ${
                                    evaluationResult.testCaseResults[activeTestCaseIndex].passed
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {evaluationResult.testCaseResults[activeTestCaseIndex].actualOutput || '(no output)'}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Terminal Console */}
              {bottomTab === 'terminal' && (
                <div className="space-y-3 font-mono text-xs">
                  {/* Interactive Terminal Bar */}
                  <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 select-none font-bold">❯</span>
                    <input
                      type="text"
                      value={interactiveInputValue}
                      onChange={e => setInteractiveInputValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleRun(interactiveInputValue);
                        }
                      }}
                      placeholder="Type custom input and press Enter to Run..."
                      className="flex-1 bg-transparent text-white placeholder:text-slate-600 focus:outline-none font-mono"
                    />
                    <button
                      onClick={() => handleRun(interactiveInputValue)}
                      disabled={isRunning}
                      className="inline-flex items-center gap-1 rounded bg-sky-600 hover:bg-sky-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run</span>
                    </button>
                  </div>

                  {/* Terminal Output Log */}
                  {!runResult ? (
                    <div className="text-slate-500 text-xs py-4 text-center">
                      No run executed yet. Click <strong>Run</strong> above or enter input and press Enter.
                    </div>
                  ) : (
                    <div className="rounded-lg bg-black p-3 space-y-2 border border-slate-800">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-900">
                        <span>Exit Code: {runResult.exitCode}</span>
                        <span>Duration: {runResult.executionTimeMs}ms</span>
                      </div>

                      {runResult.compileOutput && (
                        <div className="text-rose-400 whitespace-pre-wrap bg-rose-950/20 p-2 rounded border border-rose-900/40">
                          {runResult.compileOutput}
                        </div>
                      )}

                      {runResult.stdout && (
                        <div>
                          <div className="text-[10px] text-slate-500 font-sans">Program Output:</div>
                          <pre className="text-slate-200 whitespace-pre-wrap mt-0.5">
                            {runResult.stdout}
                          </pre>
                        </div>
                      )}

                      {runResult.stderr && (
                        <div className="text-rose-400 whitespace-pre-wrap">
                          {runResult.stderr}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
