import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CourseId, ALL_COURSES_LIST } from '../../types';
import {
  Code,
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
  Inbox,
  X,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'trainer'>('student');
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states - start completely empty, NO suggestions
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState<CourseId>('java');
  const [batch, setBatch] = useState('Batch-2026-A');
  const [section, setSection] = useState('CSE-Alpha');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Java', 'Python', 'Full-Stack', 'C++']);

  const AVAILABLE_TECH_SKILLS = [
    'C', 'C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Rust', 'Kotlin', 'PHP', 'Ruby', 'Swift', 'SQL', 'Bash', 'Perl', 'R', 'Dart', 'Scala', 'HTML/CSS', 'Full-Stack', 'React', 'Node.js', 'Data Science', 'AI / ML', 'GenAI / LLMs', 'Cloud & DevOps', 'Docker', 'Kubernetes', 'Cybersecurity', 'Mobile Dev', 'Blockchain', 'System Design'
  ];

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [receivedOtpPreview, setReceivedOtpPreview] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Mail modal
  const [showMailModal, setShowMailModal] = useState(false);
  const [sentMails, setSentMails] = useState<any[]>([]);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleTabChange = (role: 'student' | 'trainer') => {
    setSelectedRole(role);
    setMode('login');
    setError(null);
    setEmail('');
    setPassword('');
  };

  const loadSentMails = async () => {
    try {
      const res = await fetch('/api/auth/mail-box');
      if (res.ok) {
        const data = await res.json();
        setSentMails(data);
      }
    } catch {}
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send password reset email');
      } else {
        setOtpSent(true);
        setReceivedOtpPreview(data.previewOtp || null);
        loadSentMails();
      }
    } catch (err: any) {
      setError(err.message || 'Network error while requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetOtp.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: resetOtp.trim(),
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setResetSuccessMessage('Password reset successfully! Please sign in with your new password.');
        setMode('login');
        setEmail(forgotEmail);
        setPassword('');
        setOtpSent(false);
        setResetOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setReceivedOtpPreview(null);
      }
    } catch (err: any) {
      setError(err.message || 'Network error while resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const res = await register({
          name,
          email,
          password,
          course,
          batch,
          section,
          role: selectedRole
        });

        if (!res.success) {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyOtpToInput = (otp: string) => {
    setResetOtp(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-sky-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CodeAssess Technical Evaluation Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5 pt-1">
            <span className="p-2 bg-sky-600/20 border border-sky-500/40 rounded-xl text-sky-400">
              <Code className="w-7 h-7" />
            </span>
            <span>CodeAssess</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Sign in to access your role-based learning dashboard, OnlineGDB compiler, and curriculum.
          </p>
        </div>

        {/* Role Selection Buttons: Student vs Admin */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                selectedRole === 'student'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('trainer')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                selectedRole === 'trainer'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {mode === 'forgot' ? (
                  <>
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Reset Password via Mail</span>
                  </>
                ) : selectedRole === 'trainer' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    <span>Admin Portal</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 text-sky-400" />
                    <span>{mode === 'login' ? 'Student Sign In' : 'Register New Student'}</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'forgot'
                  ? 'Enter your registered email address to receive a secure verification code'
                  : selectedRole === 'trainer'
                  ? 'Manage dynamic levels, modules, content, and assessments'
                  : 'Access coding tracks, OnlineGDB compiler & Google Classroom'}
              </p>
            </div>

            {mode !== 'forgot' && selectedRole === 'student' && (
              <div className="flex text-xs bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    mode === 'login' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    mode === 'register' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Success Notification Banner */}
          {resetSuccessMessage && (
            <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' ? (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendResetEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Your Registered Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="e.g. name@student.edu or venkateshtechnl@gmail.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Verification Code to Mail</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Simulated Mail Dispatched Banner */}
                  <div className="bg-amber-950/60 border border-amber-800/80 rounded-xl p-3 text-xs text-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                        <Mail className="w-4 h-4" />
                        Verification Email Dispatched
                      </span>
                      <button
                        type="button"
                        onClick={() => { setShowMailModal(true); loadSentMails(); }}
                        className="text-[11px] underline text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>View Mail Inbox</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-300/80">
                      A 6-digit code has been sent to <span className="font-mono text-white">{forgotEmail}</span>.
                    </p>
                    {receivedOtpPreview && (
                      <div className="pt-1.5 flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Code:</span>
                        <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-amber-700">
                          {receivedOtpPreview}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyOtpToInput(receivedOtpPreview)}
                          className="text-[11px] text-amber-400 hover:text-white bg-amber-900/40 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-800"
                        >
                          {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedOtp ? 'Pasted!' : 'Auto-Fill Code'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">6-Digit Verification Code</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        autoComplete="off"
                        value={resetOtp}
                        onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 481920"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white tracking-widest placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Update Password & Finish</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            /* MODE: LOGIN & REGISTER */
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* ALL PROGRAMMING LANGUAGES & TECHNOLOGIES */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Track, Language & Technology
                    </label>
                    <select
                      value={course}
                      onChange={e => setCourse(e.target.value as CourseId)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <optgroup label="Core Programming Languages">
                        {ALL_COURSES_LIST.filter(c => c.category === 'language').map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.extension})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Engineering Technologies & Specializations">
                        {ALL_COURSES_LIST.filter(c => c.category === 'technology').map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      {ALL_COURSES_LIST.find(c => c.id === course)?.description}
                    </p>
                  </div>

                  {/* Multi-select Technologies & Programming Languages */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300">
                        Interested Technologies & Languages ({selectedSkills.length} selected)
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedSkills(AVAILABLE_TECH_SKILLS.slice(0, 10))}
                        className="text-[10px] text-sky-400 hover:underline"
                      >
                        Quick Select
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
                      {AVAILABLE_TECH_SKILLS.map(skill => {
                        const active = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setSelectedSkills(selectedSkills.filter(s => s !== skill));
                              } else {
                                setSelectedSkills([...selectedSkills, skill]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                              active
                                ? 'bg-sky-600 text-white border border-sky-400'
                                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}{skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Batch</label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={batch}
                        onChange={e => setBatch(e.target.value)}
                        placeholder="Batch-2026-A"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Section / Group</label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        placeholder="CSE-Alpha"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={selectedRole === 'trainer' ? 'Enter admin email (e.g. venkateshtechnl@gmail.com)' : 'Enter student email'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                        setForgotEmail(email);
                        setOtpSent(false);
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedRole === 'trainer'
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? selectedRole === 'trainer'
                          ? 'Sign In as Admin'
                          : 'Sign In as Student'
                        : 'Complete Registration'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info & Mail Access Link */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>CodeAssess Secure Evaluation Engine & Learning Management System</div>
          <button
            type="button"
            onClick={() => { setShowMailModal(true); loadSentMails(); }}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Check Dispatched System Mails (Inbox Viewer)</span>
          </button>
        </div>
      </div>

      {/* Mail Inbox Viewer Modal */}
      {showMailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">System Mail Inbox</h3>
                  <p className="text-[11px] text-slate-400">View sent password reset verification emails</p>
                </div>
              </div>
              <button
                onClick={() => setShowMailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {sentMails.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No emails have been dispatched yet. Request a password reset to see sent messages.
                </div>
              ) : (
                sentMails.map(mail => (
                  <div key={mail.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{mail.subject}</div>
                        <div className="text-[11px] text-slate-400">To: <span className="font-mono text-slate-300">{mail.to}</span></div>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(mail.sentAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded p-2.5 text-[11px] font-mono text-slate-300 whitespace-pre-wrap border border-slate-800/80">
                      {mail.body}
                    </div>

                    {mail.otp && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">Verification Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                            {mail.otp}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setForgotEmail(mail.to);
                              setResetOtp(mail.otp);
                              setOtpSent(true);
                              setMode('forgot');
                              setShowMailModal(false);
                            }}
                            className="text-[11px] px-2 py-0.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium transition-colors"
                          >
                            Use Code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowMailModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
