import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, BookOpen, Sparkles, Award, Shield, Calendar } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Student Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Your personal registration information, cohort affiliation, and EIS credentials.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-sky-950/80 border border-sky-700/80 flex items-center justify-center text-sky-400 font-bold text-xl font-mono">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user.email}</span>
              <span aria-hidden="true">·</span>
              <span className="uppercase text-sky-400 font-mono font-semibold">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-slate-400">Assigned Track:</span>
            <div className="text-sm font-semibold text-white mt-1 uppercase font-mono">
              {user.course} Programming
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-slate-400">Batch / Cohort:</span>
            <div className="text-sm font-semibold text-white mt-1">
              {user.batch}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-slate-400">Section:</span>
            <div className="text-sm font-semibold text-white mt-1">
              {user.section}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-4 border border-slate-800">
            <span className="text-slate-400">Accumulated EIS:</span>
            <div className="text-sm font-semibold text-amber-400 font-mono tabular-nums mt-1">
              {user.eisPoints} Points
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Account Status: Active & Verified</span>
          </div>
          <span>CodeAssess Educational Sandbox</span>
        </div>
      </div>
    </div>
  );
};
