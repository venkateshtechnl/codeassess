import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCheck, ShieldAlert, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const studentTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'practice', label: 'Practice' },
    { id: 'content', label: 'Content' },
    { id: 'compiler', label: 'Open Compiler' },
    { id: 'progress', label: 'Progress' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profile', label: 'Profile' }
  ];

  const trainerTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'problems', label: 'Problems' },
    { id: 'content', label: 'Content' },
    { id: 'reports', label: 'Reports' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'settings', label: 'Settings' }
  ];

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
    } catch (e) {
      console.error('Failed to resolve classroom URL', e);
    }
    const fallbackUrl = user?.role === 'trainer' ? 'https://classroom.google.com/u/0/h' : 'https://classroom.google.com/u/0/';
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  };

  const activeTabs = user?.role === 'trainer' ? trainerTabs : studentTabs;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('dashboard')}
            className="text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors"
          >
            CodeAssess
          </button>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500 uppercase tracking-wider">
            {user?.role === 'trainer' ? 'Trainer Console' : `${user?.course.toUpperCase() || 'JAVA'} Hub`}
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {activeTabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`transition-colors whitespace-nowrap py-1 ${
                  isActive
                    ? 'text-sky-400 font-semibold border-b-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Role-Based Google Classroom Direct Button */}
          <button
            onClick={handleOpenGoogleClassroom}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-800/80 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 hover:text-white transition-colors shadow-sm"
            title={
              user?.role === 'trainer'
                ? 'Open Trainer Google Classroom (Create classes, assignments, materials)'
                : 'Open Student Google Classroom (Enrolled classes)'
            }
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Google Classroom</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80" />
          </button>

          {/* User Profile Badge & Direct Logout - No suggestions */}
          {user && (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-2.5 py-1 text-xs rounded-md border font-medium ${
                  user.role === 'trainer'
                    ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {user.role === 'trainer' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                <span className="font-semibold max-w-[140px] truncate">
                  {user.role === 'trainer' ? 'Venkatesh -TT' : user.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                    user.role === 'trainer'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {user.role === 'trainer' ? 'Admin' : 'Student'}
                </span>
              </div>

              {user.role === 'student' && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 rounded">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>{user.eisPoints} EIS</span>
                </div>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-rose-300 bg-slate-900 border border-slate-800 hover:bg-rose-950/60 hover:border-rose-800/70 rounded-md transition-colors shadow-sm"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav drawer tabs */}
      <div className="md:hidden flex items-center overflow-x-auto border-t border-slate-800/80 px-4 py-2 gap-4 text-xs font-medium scrollbar-none">
        {activeTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap ${
              currentTab === tab.id ? 'text-sky-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
