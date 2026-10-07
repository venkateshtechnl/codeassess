import React from 'react';
import { ExternalLink, Terminal, BookOpen, Globe, Code, Sparkles, CheckCircle2 } from 'lucide-react';

interface PlatformItem {
  id: string;
  name: string;
  category: 'Integrated Compiler' | 'Classroom LMS' | 'Practice Hub';
  description: string;
  url: string;
  features: string[];
  isPrimary?: boolean;
}

const PLATFORMS: PlatformItem[] = [
  {
    id: 'onlinegdb',
    name: 'OnlineGDB',
    category: 'Integrated Compiler',
    description: 'CodeAssess official external compiler & debugging infrastructure. Supports C, C++, Java, Python, interactive stdin console, GDB stepping, and code formatting.',
    url: 'https://www.onlinegdb.com',
    features: ['Real GDB Debugger', 'Java 17/21 OpenJDK', 'GCC 14 C/C++', 'Python 3.12', 'Interactive stdin/stdout', 'Shareable code snippets'],
    isPrimary: true
  },
  {
    id: 'google-classroom',
    name: 'Google Classroom',
    category: 'Classroom LMS',
    description: 'Central learning management system for official cohort syllabus updates, lecture recordings, and trainer announcements.',
    url: 'https://classroom.google.com',
    features: ['Course Stream', 'Classwork Hub', 'Trainer Announcements', 'Grading Integration', 'Google Drive files'],
    isPrimary: true
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    category: 'Practice Hub',
    description: 'Industry-standard technical interview coding platform covering medium and hard algorithmic data structures.',
    url: 'https://leetcode.com',
    features: ['Top Interview 150', 'Company Tags', 'Time/Space Complexity Graphs', 'Mock Interviews']
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    category: 'Practice Hub',
    description: 'Skill certifications and language-specific domain practice for foundational mastery in Java, C, C++, and Python.',
    url: 'https://www.hackerrank.com',
    features: ['Skill Badges', 'Problem Solving Track', 'Timed Assessments', 'Speed Challenges']
  },
  {
    id: 'gfg',
    name: 'GeeksforGeeks',
    category: 'Practice Hub',
    description: 'Extensive theoretical articles, code examples, and practice problems for computer science core subjects.',
    url: 'https://www.geeksforgeeks.org',
    features: ['DSA Tutorials', 'Language Cheatsheets', 'Core CS Fundamentals', 'Interview Archive']
  }
];

interface PlatformsViewProps {
  onNavigateToCompiler?: () => void;
}

export const PlatformsView: React.FC<PlatformsViewProps> = ({ onNavigateToCompiler }) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Integrated Platforms & Ecosystem</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official tools and external platforms integrated with CodeAssess for hands-on programming and cohort learning.
          </p>
        </div>

        {onNavigateToCompiler && (
          <button
            onClick={onNavigateToCompiler}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors shadow-sm"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Launch OnlineGDB Compiler</span>
          </button>
        )}
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORMS.map(platform => (
          <div
            key={platform.id}
            className={`rounded-xl border p-6 flex flex-col justify-between space-y-4 transition-colors ${
              platform.isPrimary
                ? 'bg-slate-900/80 border-sky-800/80 shadow-md ring-1 ring-sky-500/20'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{platform.name}</h3>
                  {platform.isPrimary && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
                      Primary Integration
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  {platform.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {platform.description}
              </p>

              <div className="pt-2 border-t border-slate-800/70">
                <div className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5">
                  Key Capabilities:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {platform.features.map(feat => (
                    <span
                      key={feat}
                      className="px-2 py-0.5 text-[11px] rounded bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              {platform.id === 'google-classroom' ? (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/classroom/target', {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem('codeassess_token') || ''}`
                        }
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data?.url) {
                          window.open(data.url, '_blank', 'noopener,noreferrer');
                          return;
                        }
                      }
                    } catch {}
                    window.open('https://classroom.google.com', '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <span>Launch Google Classroom</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <span>Launch {platform.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
