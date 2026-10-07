import React, { useState, useEffect } from 'react';
import { CourseId, Course, Level, Module, Material } from '../../types';
import {
  Layers,
  FolderPlus,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Paperclip,
  ExternalLink,
  X,
  BookOpen,
  Filter,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const ContentManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseId>('java');
  const [levels, setLevels] = useState<Level[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view: 'hierarchy' (Levels & Modules) or 'materials' (Content posts)
  const [activeView, setActiveView] = useState<'hierarchy' | 'materials'>('hierarchy');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');

  // Modals state
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevelNumber, setEditingLevelNumber] = useState<number | null>(null);
  const [levelName, setLevelName] = useState('');
  const [levelDesc, setLevelDesc] = useState('');

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [moduleLevelNumber, setModuleLevelNumber] = useState<number>(1);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialLevelNumber, setMaterialLevelNumber] = useState<number>(1);
  const [materialModuleId, setMaterialModuleId] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialAttachmentName, setMaterialAttachmentName] = useState('');
  const [materialAttachmentType, setMaterialAttachmentType] = useState<'pdf' | 'doc' | 'code' | 'zip' | 'link'>('pdf');
  const [materialExternalLink, setMaterialExternalLink] = useState('');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const token = localStorage.getItem('codeassess_token') || '';

  // Load all courses, levels, modules, materials
  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, modulesRes, materialsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch(`/api/modules?courseId=${selectedCourse}`),
        fetch(`/api/materials?courseId=${selectedCourse}`)
      ]);

      const coursesData: Course[] = await coursesRes.json();
      const modulesData: Module[] = await modulesRes.json();
      const materialsData: Material[] = await materialsRes.json();

      setCourses(coursesData);
      setModules(modulesData);
      setMaterials(materialsData);

      const currentCourse = coursesData.find(c => c.id === selectedCourse);
      if (currentCourse) {
        setLevels(currentCourse.levels || []);
      }
    } catch (err: any) {
      console.error('Failed to load content management data', err);
      showNotification('Failed to load data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCourse]);

  // Open role-based Google Classroom
  const handleOpenGoogleClassroom = async () => {
    try {
      const res = await fetch('/api/classroom/target', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          window.open(data.url, '_blank', 'noopener,noreferrer');
          return;
        }
      }
    } catch {}
    window.open('https://classroom.google.com/u/0/h', '_blank', 'noopener,noreferrer');
  };

  // ================= LEVEL CRUD =================
  const handleOpenCreateLevel = () => {
    setEditingLevelNumber(null);
    const nextLevel = levels.length > 0 ? Math.max(...levels.map(l => l.levelNumber)) + 1 : 1;
    setLevelName(`Level ${nextLevel} - Advanced Concepts`);
    setLevelDesc('Detailed algorithmic topics and problem sets.');
    setIsLevelModalOpen(true);
  };

  const handleOpenEditLevel = (lvl: Level) => {
    setEditingLevelNumber(lvl.levelNumber);
    setLevelName(lvl.name);
    setLevelDesc(lvl.description);
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelName.trim()) return;

    try {
      if (editingLevelNumber !== null) {
        // Update level
        const res = await fetch(`/api/courses/${selectedCourse}/levels/${editingLevelNumber}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: levelName.trim(),
            description: levelDesc.trim()
          })
        });
        if (!res.ok) throw new Error('Failed to update level');
        showNotification(`Level ${editingLevelNumber} updated successfully!`);
      } else {
        // Create new level
        const nextNumber = levels.length > 0 ? Math.max(...levels.map(l => l.levelNumber)) + 1 : 1;
        const res = await fetch(`/api/courses/${selectedCourse}/levels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: levelName.trim(),
            description: levelDesc.trim(),
            levelNumber: nextNumber
          })
        });
        if (!res.ok) throw new Error('Failed to create level');
        showNotification(`New Level ${nextNumber} created successfully!`);
      }

      setIsLevelModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteLevel = async (lvlNumber: number) => {
    if (!confirm(`Are you sure you want to delete Level ${lvlNumber}? This will remove it from student view.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/courses/${selectedCourse}/levels/${lvlNumber}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete level');
      showNotification(`Level ${lvlNumber} removed successfully!`);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Delete failed', 'error');
    }
  };

  // ================= MODULE CRUD =================
  const handleOpenCreateModule = (targetLevelNumber?: number) => {
    setEditingModuleId(null);
    setModuleLevelNumber(targetLevelNumber || (levels[0]?.levelNumber ?? 1));
    setModuleTitle('');
    setModuleDesc('');
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: Module) => {
    setEditingModuleId(mod.id);
    setModuleLevelNumber(mod.levelNumber);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    try {
      if (editingModuleId) {
        // Update module
        const res = await fetch(`/api/modules/${editingModuleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: moduleTitle.trim(),
            description: moduleDesc.trim(),
            levelNumber: Number(moduleLevelNumber)
          })
        });
        if (!res.ok) throw new Error('Failed to update module');
        showNotification(`Module updated successfully!`);
      } else {
        // Create module
        const res = await fetch('/api/modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            courseId: selectedCourse,
            levelNumber: Number(moduleLevelNumber),
            title: moduleTitle.trim(),
            description: moduleDesc.trim()
          })
        });
        if (!res.ok) throw new Error('Failed to create module');
        showNotification(`New Module created successfully!`);
      }

      setIsModuleModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete module');
      showNotification('Module deleted successfully!');
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Delete failed', 'error');
    }
  };

  // ================= MATERIAL CRUD =================
  const handleOpenCreateMaterial = (defLevel?: number, defModuleId?: string) => {
    setEditingMaterialId(null);
    const lvl = defLevel || (levels[0]?.levelNumber ?? 1);
    setMaterialLevelNumber(lvl);

    const availableMods = modules.filter(m => m.levelNumber === lvl);
    setMaterialModuleId(defModuleId || availableMods[0]?.id || `${selectedCourse}-m1`);

    setMaterialTitle('');
    setMaterialDescription('');
    setMaterialAttachmentName('');
    setMaterialAttachmentType('pdf');
    setMaterialExternalLink('');
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (mat: Material) => {
    setEditingMaterialId(mat.id);
    setMaterialLevelNumber(mat.levelNumber);
    setMaterialModuleId(mat.moduleId);
    setMaterialTitle(mat.title);
    setMaterialDescription(mat.description);
    setMaterialAttachmentName(mat.attachmentName || '');
    setMaterialAttachmentType(mat.attachmentType || 'pdf');
    setMaterialExternalLink(mat.externalLink || '');
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle.trim()) return;

    try {
      const body = {
        courseId: selectedCourse,
        levelNumber: Number(materialLevelNumber),
        moduleId: materialModuleId || `${selectedCourse}-m1`,
        title: materialTitle.trim(),
        description: materialDescription.trim(),
        attachmentName: materialAttachmentName.trim() || undefined,
        attachmentType: materialAttachmentType,
        externalLink: materialExternalLink.trim() || undefined
      };

      if (editingMaterialId) {
        const res = await fetch(`/api/materials/${editingMaterialId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Failed to update material');
        showNotification('Material updated successfully!');
      } else {
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Failed to publish material');
        showNotification('Learning material published successfully!');
      }

      setIsMaterialModalOpen(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const res = await fetch(`/api/materials/${matId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete material');
      showNotification('Material post deleted successfully!');
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Delete failed', 'error');
    }
  };

  // Filtered materials for tab 2
  const filteredMaterials = materials.filter(m => {
    if (selectedLevelFilter !== 'all' && m.levelNumber !== Number(selectedLevelFilter)) return false;
    if (selectedModuleFilter !== 'all' && m.moduleId !== selectedModuleFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xl transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 border border-emerald-700 text-emerald-200'
              : 'bg-rose-950 border border-rose-700 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Practice Content & Learning Hierarchy
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamically create levels, assign modules, manage notes and study materials for technical courses.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Trainer Google Classroom Launch */}
          <button
            onClick={handleOpenGoogleClassroom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 transition-colors shadow-sm"
            title="Open Trainer Google Classroom to create classes and materials"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Google Classroom</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80" />
          </button>

          <button
            onClick={handleOpenCreateLevel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Level</span>
          </button>

          <button
            onClick={() => handleOpenCreateModule()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Create Module</span>
          </button>

          <button
            onClick={() => handleOpenCreateMaterial()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Add Material</span>
          </button>
        </div>
      </div>

      {/* Top Filter & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Track / Course Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
          {(['java', 'c', 'cpp', 'python'] as CourseId[]).map(cId => (
            <button
              key={cId}
              onClick={() => {
                setSelectedCourse(cId);
                setSelectedLevelFilter('all');
                setSelectedModuleFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedCourse === cId
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cId === 'cpp' ? 'C++' : cId.toUpperCase()}
            </button>
          ))}
        </div>

        {/* View Switcher: Hierarchy vs Published Materials */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setActiveView('hierarchy')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'hierarchy'
                  ? 'bg-slate-800 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Levels & Modules Tree</span>
            </button>

            <button
              onClick={() => setActiveView('materials')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeView === 'materials'
                  ? 'bg-slate-800 text-sky-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Published Content ({materials.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= VIEW 1: DYNAMIC LEVELS & MODULES TREE ================= */}
      {activeView === 'hierarchy' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              {selectedCourse.toUpperCase()} Course Structure ({levels.length} Levels Defined)
            </span>
            <span className="text-xs text-slate-500">
              Changes reflect immediately on student Practice and Content feeds.
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
            </div>
          ) : levels.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-900/40">
              No levels defined yet for this track. Click "+ Create Level" to define Level 1.
            </div>
          ) : (
            levels.map(lvl => {
              const levelModules = modules.filter(m => m.levelNumber === lvl.levelNumber);
              const levelMaterialsCount = materials.filter(m => m.levelNumber === lvl.levelNumber).length;

              return (
                <div
                  key={lvl.levelNumber}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-md space-y-3 p-5"
                >
                  {/* Level Header Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800 flex items-center justify-center font-mono font-bold text-xs text-sky-300">
                        L{lvl.levelNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-white tracking-tight">
                            {lvl.name}
                          </h2>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {levelModules.length} Modules
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                            {levelMaterialsCount} Materials
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {lvl.description || 'No description added.'}
                        </p>
                      </div>
                    </div>

                    {/* Level actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCreateModule(lvl.levelNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900/80 text-sky-300 border border-sky-800 rounded text-xs font-semibold transition-colors"
                        title="Add Module to this Level"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Module</span>
                      </button>

                      <button
                        onClick={() => handleOpenCreateMaterial(lvl.levelNumber)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-colors"
                        title="Add Material to this Level"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Add Material</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditLevel(lvl)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Edit Level"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteLevel(lvl.levelNumber)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        title="Delete Level"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Modules nested list under this level */}
                  <div className="space-y-2 pt-1 pl-2 sm:pl-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Modules in Level {lvl.levelNumber}:
                    </span>

                    {levelModules.length === 0 ? (
                      <div className="p-4 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
                        No modules created in Level {lvl.levelNumber} yet.
                        <button
                          onClick={() => handleOpenCreateModule(lvl.levelNumber)}
                          className="ml-2 text-sky-400 underline hover:text-sky-300"
                        >
                          + Create first module
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {levelModules.map(mod => {
                          const modMaterials = materials.filter(m => m.moduleId === mod.id);
                          return (
                            <div
                              key={mod.id}
                              className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-3 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                    <span>{mod.title}</span>
                                  </h3>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleOpenEditModule(mod)}
                                      className="p-1 text-slate-500 hover:text-sky-400 rounded transition-colors"
                                      title="Edit Module"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModule(mod.id)}
                                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                                      title="Delete Module"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                  {mod.description || 'No module description.'}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                                <span>{modMaterials.length} material(s) published</span>
                                <button
                                  onClick={() => handleOpenCreateMaterial(lvl.levelNumber, mod.id)}
                                  className="text-sky-400 hover:underline font-sans font-medium"
                                >
                                  + Add Notes
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Quick Add Level Card */}
          <button
            onClick={handleOpenCreateLevel}
            className="w-full p-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 hover:border-sky-500 text-slate-400 hover:text-sky-400 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Next Level for {selectedCourse.toUpperCase()}</span>
          </button>
        </div>
      )}

      {/* ================= VIEW 2: PUBLISHED MATERIALS CRUD ================= */}
      {activeView === 'materials' && (
        <div className="space-y-4">
          {/* Level and Module Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Level:</span>
                <select
                  value={selectedLevelFilter}
                  onChange={e => {
                    setSelectedLevelFilter(e.target.value);
                    setSelectedModuleFilter('all');
                  }}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">All Levels</option>
                  {levels.map(l => (
                    <option key={l.levelNumber} value={l.levelNumber}>
                      Level {l.levelNumber} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span>Module:</span>
                <select
                  value={selectedModuleFilter}
                  onChange={e => setSelectedModuleFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="all">All Modules</option>
                  {modules
                    .filter(m => selectedLevelFilter === 'all' || m.levelNumber === Number(selectedLevelFilter))
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => handleOpenCreateMaterial()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Learning Post</span>
            </button>
          </div>

          {/* Materials List */}
          <div className="space-y-3">
            {filteredMaterials.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-900/40">
                No materials found matching this filter. Click "+ Create Learning Post" to publish content.
              </div>
            ) : (
              filteredMaterials.map(mat => {
                const mod = modules.find(m => m.id === mat.moduleId);
                return (
                  <div
                    key={mat.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white text-sm">{mat.title}</h3>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {mat.courseId} · Level {mat.levelNumber}
                        </span>
                        {mod && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                            {mod.title}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
                        {mat.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>Posted {new Date(mat.postedAt).toLocaleDateString()}</span>
                        {mat.attachmentName && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Paperclip className="w-3 h-3 text-sky-400" />
                            <span>{mat.attachmentName}</span>
                          </span>
                        )}
                        {mat.externalLink && (
                          <a
                            href={mat.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 flex items-center gap-1 hover:underline font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Resource Link</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditMaterial(mat)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Edit Post"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT LEVEL ================= */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsLevelModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{editingLevelNumber !== null ? `Edit Level ${editingLevelNumber}` : `Create New Level`}</span>
            </h2>

            <form onSubmit={handleSaveLevel} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Level Name / Title</label>
                <input
                  type="text"
                  required
                  value={levelName}
                  onChange={e => setLevelName(e.target.value)}
                  placeholder="e.g. Level 6 - Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Level Description</label>
                <textarea
                  rows={3}
                  value={levelDesc}
                  onChange={e => setLevelDesc(e.target.value)}
                  placeholder="Summary of topics and target competencies covered in this level..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLevelModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingLevelNumber !== null ? 'Save Changes' : 'Create Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT MODULE ================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsModuleModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-sky-400" />
              <span>{editingModuleId ? 'Edit Module' : 'Create New Module'}</span>
            </h2>

            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Assign to Level</label>
                <select
                  value={moduleLevelNumber}
                  onChange={e => setModuleLevelNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
                >
                  {levels.map(l => (
                    <option key={l.levelNumber} value={l.levelNumber}>
                      Level {l.levelNumber} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={e => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 3 - Arrays and Matrix Multiplication"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Module Description</label>
                <textarea
                  rows={3}
                  value={moduleDesc}
                  onChange={e => setModuleDesc(e.target.value)}
                  placeholder="Brief learning objectives or syllabus breakdown..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingModuleId ? 'Save Module' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT MATERIAL ================= */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsMaterialModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{editingMaterialId ? 'Edit Learning Post' : 'Publish Learning Material'}</span>
            </h2>

            <form onSubmit={handleSaveMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={e => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Complete Java Collections Cheatsheet & Code Samples"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Level</label>
                  <select
                    value={materialLevelNumber}
                    onChange={e => {
                      const lvl = Number(e.target.value);
                      setMaterialLevelNumber(lvl);
                      const levelMods = modules.filter(m => m.levelNumber === lvl);
                      if (levelMods.length > 0) {
                        setMaterialModuleId(levelMods[0].id);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {levels.map(l => (
                      <option key={l.levelNumber} value={l.levelNumber}>
                        Level {l.levelNumber} - {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Module</label>
                  <select
                    value={materialModuleId}
                    onChange={e => setMaterialModuleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    {modules
                      .filter(m => m.levelNumber === Number(materialLevelNumber))
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Description / Code Snippet</label>
                <textarea
                  rows={5}
                  required
                  value={materialDescription}
                  onChange={e => setMaterialDescription(e.target.value)}
                  placeholder="Detailed lecture summary, algorithms, syntactical breakdown, or practice guidelines..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed font-mono resize-none text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Attachment File Name</label>
                  <input
                    type="text"
                    value={materialAttachmentName}
                    onChange={e => setMaterialAttachmentName(e.target.value)}
                    placeholder="e.g. Arrays_Reference.pdf"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Attachment Type</label>
                  <select
                    value={materialAttachmentType}
                    onChange={e => setMaterialAttachmentType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="code">Source Code (.java, .py, .c)</option>
                    <option value="doc">Text Notes (.txt, .md)</option>
                    <option value="link">External Web Reference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Google Drive or Classroom Link (Optional)</label>
                <input
                  type="url"
                  value={materialExternalLink}
                  onChange={e => setMaterialExternalLink(e.target.value)}
                  placeholder="https://classroom.google.com/... or https://drive.google.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingMaterialId ? 'Save Changes' : 'Publish to Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
