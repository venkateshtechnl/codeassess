import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Material, Course, CourseId, Module } from '../../types';
import {
  FileText,
  FileCode,
  Download,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Filter,
  Paperclip,
  Layers,
  Sparkles
} from 'lucide-react';

interface ContentFeedProps {
  onNavigateToPractice?: (courseId: CourseId) => void;
}

export const ContentFeed: React.FC<ContentFeedProps> = ({ onNavigateToPractice }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseId>(user?.course || 'java');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [modules, setModules] = useState<Module[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Load courses
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(e => console.error(e));
  }, []);

  // Load modules for course
  useEffect(() => {
    fetch(`/api/modules?courseId=${selectedCourse}`)
      .then(res => res.json())
      .then(data => {
        setModules(data);
        setSelectedModule('all');
      })
      .catch(e => console.error(e));
  }, [selectedCourse]);

  // Load materials
  useEffect(() => {
    setLoading(true);
    let url = `/api/materials?courseId=${selectedCourse}`;
    if (selectedLevel !== 'all') {
      url += `&levelNumber=${selectedLevel}`;
    }
    if (selectedModule !== 'all') {
      url += `&moduleId=${selectedModule}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [selectedCourse, selectedLevel, selectedModule]);

  const activeCourse = courses.find(c => c.id === selectedCourse);

  const handleOpenGoogleClassroom = async () => {
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
    const fallback = user?.classroomUrl || activeCourse?.classroomUrl || 'https://classroom.google.com/u/0/';
    window.open(fallback, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (material: Material) => {
    const content = `CodeAssess Learning Material\n\nTitle: ${material.title}\nCourse: ${material.courseId.toUpperCase()}\nLevel: ${material.levelNumber}\nAuthor: ${material.authorName}\nDate: ${new Date(material.postedAt).toLocaleDateString()}\n\nNotes & Content:\n${material.description}\n\nCodeAssess Technical Training Platform`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.attachmentName || `${material.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <span>Course Materials & Lecture Notes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Classroom lecture materials, cheat sheets, and coding notes organized dynamically by level and module.
          </p>
        </div>

        {/* Role-Based Google Classroom Direct Button */}
        <button
          onClick={handleOpenGoogleClassroom}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/50 transition-colors shadow-sm"
          title="Open your Google Classroom for this course track"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Open Google Classroom</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5 text-emerald-400/80" />
        </button>
      </div>

      {/* Course, Dynamic Level & Dynamic Module Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
        {/* Course buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-md border border-slate-800">
          {(['java', 'c', 'cpp', 'python'] as CourseId[]).map(cId => {
            const courseMeta = courses.find(c => c.id === cId);
            const isActive = selectedCourse === cId;
            return (
              <button
                key={cId}
                onClick={() => {
                  setSelectedCourse(cId);
                  setSelectedLevel('all');
                  setSelectedModule('all');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
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

        {/* Dynamic Level & Module filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {/* Level filter dropdown (dynamically populated from backend database!) */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
            <select
              value={selectedLevel}
              onChange={e => {
                setSelectedLevel(e.target.value);
                setSelectedModule('all');
              }}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Levels</option>
              {activeCourse?.levels?.map(lvl => (
                <option key={lvl.levelNumber} value={lvl.levelNumber}>
                  Level {lvl.levelNumber} - {lvl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module filter dropdown */}
          <div className="flex items-center gap-1.5">
            <span>Module:</span>
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Modules</option>
              {modules
                .filter(m => selectedLevel === 'all' || m.levelNumber === Number(selectedLevel))
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Stream */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No materials posted yet for this selection</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            The trainer will publish lecture notes, cheat sheets, and coding exercises for this module soon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map(mat => {
            const mod = modules.find(m => m.id === mat.moduleId);
            return (
              <div
                key={mat.id}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition-colors space-y-4"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{mat.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="font-semibold text-slate-300">{mat.authorName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-sky-400">Level {mat.levelNumber}</span>
                        {mod && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-300">{mod.title}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="uppercase font-mono text-[11px]">{mat.courseId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(mat.postedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-11">
                  {mat.description}
                </p>

                {/* Attachment / Actions */}
                <div className="pl-11 flex flex-wrap items-center gap-3 pt-2">
                  {mat.attachmentName && (
                    <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-xs">
                      <Paperclip className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200">{mat.attachmentName}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{mat.attachmentType || 'Document'}</div>
                      </div>
                      <button
                        onClick={() => handleDownload(mat)}
                        className="ml-3 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}

                  {mat.externalLink && (
                    <a
                      href={mat.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-sky-400 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <span>External Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {onNavigateToPractice && (
                    <button
                      onClick={() => onNavigateToPractice(mat.courseId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-sky-950/60 hover:bg-sky-900/60 text-sky-400 rounded-lg text-xs font-medium border border-sky-800/60 transition-colors"
                    >
                      <span>Practice Problems for this Topic</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
