/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/common/AuthModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { PracticeView } from './components/student/PracticeView';
import { ProblemEditor } from './components/student/ProblemEditor';
import { OpenCompiler } from './components/student/OpenCompiler';
import { ContentFeed } from './components/student/ContentFeed';
import { StudentProgressView } from './components/student/StudentProgressView';
import { ProfileView } from './components/student/ProfileView';
import { LeaderboardView } from './components/common/LeaderboardView';
import { ContestsView } from './components/contests/ContestsView';
import { PlatformsView } from './components/platforms/PlatformsView';

import { TrainerDashboard } from './components/trainer/TrainerDashboard';
import { StudentManagement } from './components/trainer/StudentManagement';
import { ProblemManagement } from './components/trainer/ProblemManagement';
import { ContentManagement } from './components/trainer/ContentManagement';
import { ReportsView } from './components/trainer/ReportsView';
import { SettingsView } from './components/trainer/SettingsView';
import { LoginPage } from './components/auth/LoginPage';
import { CourseId } from './types';
import { Bell } from 'lucide-react';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<CourseId | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('');

  // Fetch settings for global announcement
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.announcement) setAnnouncement(data.announcement);
      })
      .catch(() => {});
  }, []);

  // Guard role-specific tabs: if student, block trainer tabs
  useEffect(() => {
    if (user?.role === 'student') {
      const trainerOnlyTabs = ['students', 'problems', 'reports', 'settings'];
      if (trainerOnlyTabs.includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [user, currentTab]);

  const handleNavigate = (tab: string, params?: { courseId?: CourseId; problemId?: string }) => {
    if (params?.problemId) {
      setActiveProblemId(params.problemId);
      setCurrentTab('practice');
    } else {
      setActiveProblemId(null);
      if (params?.courseId) setActiveCourseId(params.courseId);
      setCurrentTab(tab);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
          <span className="text-xs font-mono text-slate-400">Loading CodeAssess...</span>
        </div>
      </div>
    );
  }

  // REQUIREMENT 4: Show proper login page when unauthenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      {/* Optional Trainer Announcement Banner */}
      {announcement && (
        <div className="bg-sky-950/70 border-b border-sky-900/60 px-4 py-1.5 text-center text-xs text-sky-300 flex items-center justify-center gap-2">
          <Bell className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate">{announcement}</span>
        </div>
      )}

      {/* Primary Top Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={tab => {
          setActiveProblemId(null);
          setCurrentTab(tab);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {/* 1. Dashboard */}
        {currentTab === 'dashboard' && (
          user?.role === 'trainer' ? (
            <TrainerDashboard onNavigate={tab => setCurrentTab(tab)} />
          ) : (
            <StudentDashboard onNavigate={handleNavigate} />
          )
        )}

        {/* 2. Practice */}
        {currentTab === 'practice' && (
          activeProblemId ? (
            <ProblemEditor
              problemId={activeProblemId}
              onBack={() => setActiveProblemId(null)}
            />
          ) : (
            <PracticeView
              initialCourseId={activeCourseId}
              onSelectProblem={id => setActiveProblemId(id)}
            />
          )
        )}

        {/* 3. Open Compiler */}
        {currentTab === 'compiler' && (
          <OpenCompiler />
        )}

        {/* 4. Content */}
        {currentTab === 'content' && (
          user?.role === 'trainer' ? (
            <ContentManagement />
          ) : (
            <ContentFeed
              onNavigateToPractice={courseId => {
                setActiveCourseId(courseId);
                setActiveProblemId(null);
                setCurrentTab('practice');
              }}
            />
          )
        )}

        {/* 5. Progress (Student) */}
        {currentTab === 'progress' && (
          <StudentProgressView />
        )}

        {/* 6. Leaderboard / Rankings */}
        {(currentTab === 'leaderboard' || currentTab === 'rankings') && (
          <LeaderboardView />
        )}

        {/* 7. Profile */}
        {currentTab === 'profile' && (
          <ProfileView />
        )}

        {/* Trainer Specific Views */}
        {currentTab === 'students' && user?.role === 'trainer' && (
          <StudentManagement />
        )}

        {currentTab === 'problems' && user?.role === 'trainer' && (
          <ProblemManagement />
        )}

        {currentTab === 'reports' && user?.role === 'trainer' && (
          <ReportsView />
        )}

        {currentTab === 'settings' && user?.role === 'trainer' && (
          <SettingsView />
        )}

        {/* Optional Contests & Platforms */}
        {currentTab === 'contests' && (
          <ContestsView
            onNavigateToPractice={courseId => {
              setActiveCourseId(courseId);
              setActiveProblemId(null);
              setCurrentTab('practice');
            }}
            onNavigateToCompiler={() => setCurrentTab('compiler')}
          />
        )}

        {currentTab === 'platforms' && (
          <PlatformsView
            onNavigateToCompiler={() => setCurrentTab('compiler')}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
