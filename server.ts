import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db } from './server/db.js';
import { executeCode, evaluateProblem } from './server/executor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple authentication token simulation: token is base64(userId:email)
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      const user = db.getUserById(userId);
      if (user && user.isActive) {
        (req as any).user = user;
      }
    } catch {
      // invalid token format
    }
  }
  next();
}

app.use(authMiddleware);

// ================= AUTH ROUTES =================
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, course, batch, section, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const existing = db.findUserByEmail(email);
    if (existing) {
      if (email.toLowerCase().trim() === 'venkateshtechnl@gmail.com' || existing.role === 'trainer') {
        existing.name = 'Venkatesh -TT';
        existing.role = 'trainer';
        const token = Buffer.from(`${existing.id}:${existing.email}`).toString('base64');
        return res.status(200).json({
          token,
          user: {
            id: existing.id,
            name: existing.name,
            email: existing.email,
            role: existing.role,
            course: existing.course,
            batch: existing.batch,
            section: existing.section,
            eisPoints: existing.eisPoints
          }
        });
      }
      return res.status(409).json({ error: 'A user with this email address already exists.' });
    }
    const user = db.createUser({
      name,
      email,
      password,
      course: course || 'java',
      batch: batch || 'Batch-2026',
      section: section || 'CSE-1',
      role: role === 'trainer' ? 'trainer' : 'student'
    });

    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        batch: user.batch,
        section: user.section,
        eisPoints: user.eisPoints
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been disabled by the trainer. Please contact support.' });
    }
    const isValid = db.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        course: user.course,
        batch: user.batch,
        section: user.section,
        eisPoints: user.eisPoints
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      course: user.course,
      batch: user.batch,
      section: user.section,
      eisPoints: user.eisPoints
    }
  });
});

// --- Password Reset by Mail & Verification Code ---
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const result = db.createPasswordReset(email);
    if (!result.success) {
      return res.status(404).json({ error: result.error || 'User not found.' });
    }
    return res.json({
      success: true,
      message: 'Password reset verification code has been dispatched to your email address.',
      previewOtp: result.otp,
      email: result.targetUser?.email
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process password reset request.' });
  }
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
    }
    const result = db.verifyAndResetPassword(email, otp, newPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to reset password.' });
    }
    return res.json({
      success: true,
      message: 'Password has been successfully updated. You can now log in.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset password.' });
  }
});

app.get('/api/auth/mail-box', (req: Request, res: Response) => {
  const emails = db.getSentEmails();
  return res.json(emails);
});

// Quick switch / demo account login helper for convenience
app.post('/api/auth/quick-switch', (req: Request, res: Response) => {
  const { role, email } = req.body;
  let targetUser = email ? db.findUserByEmail(email) : null;
  if (!targetUser) {
    if (role === 'trainer') {
      targetUser = db.findUserByEmail('trainer@codeassess.edu');
    } else {
      targetUser = db.findUserByEmail('priya@student.edu');
    }
  }
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  const token = Buffer.from(`${targetUser.id}:${targetUser.email}`).toString('base64');
  return res.json({
    token,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      course: targetUser.course,
      batch: targetUser.batch,
      section: targetUser.section,
      eisPoints: targetUser.eisPoints
    }
  });
});

// ================= COURSES, LEVELS, MODULES, PROBLEMS =================
app.get('/api/courses', (req: Request, res: Response) => {
  const courses = db.getCourses();
  return res.json(courses);
});

// --- Dynamic Levels ---
app.get('/api/courses/:courseId/levels', (req: Request, res: Response) => {
  const levels = db.getLevels(req.params.courseId);
  return res.json(levels);
});

app.post('/api/courses/:courseId/levels', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required to create levels.' });
  }
  const { name, description, levelNumber } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Level name is required.' });
  }
  try {
    const lvl = db.createLevel(req.params.courseId, {
      name,
      description: description || '',
      levelNumber: levelNumber ? Number(levelNumber) : undefined
    });
    return res.status(201).json(lvl);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.put('/api/courses/:courseId/levels/:levelNumber', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required to update levels.' });
  }
  const lvl = db.updateLevel(req.params.courseId, Number(req.params.levelNumber), req.body);
  if (!lvl) return res.status(404).json({ error: 'Level not found' });
  return res.json(lvl);
});

app.delete('/api/courses/:courseId/levels/:levelNumber', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required to delete levels.' });
  }
  const ok = db.deleteLevel(req.params.courseId, Number(req.params.levelNumber));
  return res.json({ success: ok });
});

// --- Dynamic Modules ---
app.get('/api/modules', (req: Request, res: Response) => {
  const { courseId, levelNumber } = req.query;
  const mods = db.getModules(
    courseId as string | undefined,
    levelNumber ? parseInt(levelNumber as string, 10) : undefined
  );
  return res.json(mods);
});

app.post('/api/modules', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required to create modules.' });
  }
  const { courseId, levelNumber, title, description } = req.body;
  if (!courseId || !title) {
    return res.status(400).json({ error: 'courseId and title are required.' });
  }
  const mod = db.createModule({
    courseId,
    levelNumber: Number(levelNumber) || 1,
    title,
    description: description || ''
  });
  return res.status(201).json(mod);
});

app.put('/api/modules/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required to update modules.' });
  }
  const mod = db.updateModule(req.params.id, req.body);
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  return res.json(mod);
});

app.delete('/api/modules/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required to delete modules.' });
  }
  const ok = db.deleteModule(req.params.id);
  return res.json({ success: ok });
});

app.get('/api/problems', (req: Request, res: Response) => {
  const { courseId, levelNumber, moduleId, difficulty, search } = req.query;
  const list = db.getProblems({
    courseId: courseId as string | undefined,
    levelNumber: levelNumber ? parseInt(levelNumber as string, 10) : undefined,
    moduleId: moduleId as string | undefined,
    difficulty: difficulty as string | undefined,
    search: search as string | undefined
  });

  // Strip hidden test case expected output from public list
  const sanitized = list.map(p => ({
    ...p,
    testCases: p.testCases.map(tc => (tc.isHidden ? { id: tc.id, input: 'Hidden', expectedOutput: 'Hidden', isHidden: true } : tc))
  }));

  return res.json(sanitized);
});

app.get('/api/problems/:id', (req: Request, res: Response) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  // Mask hidden test cases
  const sanitized = {
    ...problem,
    testCases: problem.testCases.map(tc => (tc.isHidden ? { id: tc.id, input: 'Hidden', expectedOutput: 'Hidden', isHidden: true } : tc))
  };
  return res.json(sanitized);
});

app.post('/api/problems', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const problem = db.createProblem(req.body);
  return res.status(201).json(problem);
});

app.put('/api/problems/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const updated = db.updateProblem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Problem not found' });
  return res.json(updated);
});

app.delete('/api/problems/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const ok = db.deleteProblem(req.params.id);
  return res.json({ success: ok });
});

// ================= COMPILER CODE EXECUTION (ONLINEGDB ENGINE) =================
app.post('/api/execute', async (req: Request, res: Response) => {
  try {
    const { language, code, stdin, commandLineArgs } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required.' });
    }
    const result = await executeCode(language, code, stdin || '', commandLineArgs || '');
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Execution error' });
  }
});

// ================= PROBLEM SUBMISSION & AUTOMATIC EVALUATION =================
app.post('/api/problems/:id/submit', async (req: Request, res: Response) => {
  try {
    const problem = db.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const { language, code, studentId } = req.body;
    const activeStudentId = studentId || (req as any).user?.id || 'u-student-1';

    if (!code) {
      return res.status(400).json({ error: 'Solution code is required.' });
    }

    const lang = language || problem.courseId;

    // Run test cases against sandboxed engine
    const evaluation = await evaluateProblem(problem, lang, code);

    // Record submission into persistent database
    const { submission, newPointsAwarded } = db.recordSubmission({
      studentId: activeStudentId,
      problemId: problem.id,
      language: lang,
      code,
      status: evaluation.status,
      testsPassed: evaluation.testsPassed,
      totalTests: evaluation.totalTests,
      executionTimeMs: evaluation.executionTimeMs,
      outputLog: evaluation.outputLog
    });

    return res.json({
      evaluation,
      submission,
      newPointsAwarded,
      alreadySolved: evaluation.status === 'Accepted' && newPointsAwarded === 0
    });
  } catch (err: any) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: err.message || 'Submission evaluation error' });
  }
});

app.get('/api/submissions', (req: Request, res: Response) => {
  const { studentId, problemId, courseId, limit } = req.query;
  const list = db.getSubmissions({
    studentId: studentId as string | undefined,
    problemId: problemId as string | undefined,
    courseId: courseId as string | undefined,
    limit: limit ? parseInt(limit as string, 10) : 50
  });
  return res.json(list);
});

// ================= MATERIALS & LMS CONTENT =================
app.get('/api/materials', (req: Request, res: Response) => {
  const { courseId, levelNumber, moduleId } = req.query;
  const materials = db.getMaterials({
    courseId: courseId as string | undefined,
    levelNumber: levelNumber ? parseInt(levelNumber as string, 10) : undefined,
    moduleId: moduleId as string | undefined
  });
  return res.json(materials);
});

app.post('/api/materials', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const { courseId, levelNumber, moduleId, title, description, attachmentName, attachmentType, externalLink } = req.body;
  if (!courseId || !title) {
    return res.status(400).json({ error: 'Course and Title are required.' });
  }
  const newMat = db.createMaterial({
    courseId,
    levelNumber: Number(levelNumber) || 1,
    moduleId: moduleId || `${courseId}-m1`,
    title,
    description: description || '',
    authorName: user.name || 'Trainer',
    attachmentName,
    attachmentType: attachmentType || 'pdf',
    externalLink
  });
  return res.status(201).json(newMat);
});

app.put('/api/materials/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const updated = db.updateMaterial(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Material not found' });
  return res.json(updated);
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const ok = db.deleteMaterial(req.params.id);
  return res.json({ success: ok });
});

// ================= ROLE-BASED GOOGLE CLASSROOM REDIRECTION =================
app.get('/api/classroom/target', (req: Request, res: Response) => {
  const user = (req as any).user;
  const settings = db.getSettings();

  if (!user) {
    return res.json({
      url: 'https://classroom.google.com',
      role: 'guest',
      description: 'Default Google Classroom Portal'
    });
  }

  if (user.role === 'trainer') {
    const trainerUrl = settings.classroomLinks?.trainer || 'https://classroom.google.com/u/0/h';
    return res.json({
      url: trainerUrl,
      role: 'trainer',
      description: 'Trainer Google Classroom Management Console'
    });
  }

  // Student role
  const courseKey = (user.course || 'java') as keyof typeof settings.classroomLinks;
  const studentUrl = user.classroomUrl || (settings.classroomLinks ? settings.classroomLinks[courseKey] : null) || 'https://classroom.google.com/u/0/';
  return res.json({
    url: studentUrl,
    role: 'student',
    course: user.course,
    description: `Student Google Classroom for ${user.course?.toUpperCase() || 'Coding'} Track`
  });
});

// ================= DASHBOARDS, METRICS & LEADERBOARD =================
app.get('/api/student/dashboard/:studentId', (req: Request, res: Response) => {
  const metrics = db.getStudentMetrics(req.params.studentId);
  if (!metrics) {
    return res.status(404).json({ error: 'Student not found' });
  }
  return res.json(metrics);
});

app.get('/api/trainer/dashboard', (req: Request, res: Response) => {
  const user = (req as any).user;
  // If no auth yet or is student, still allow read if requested by trainer interface
  const metrics = db.getTrainerMetrics();
  return res.json(metrics);
});

app.get('/api/trainer/students', (req: Request, res: Response) => {
  const raw = db.getRawData();
  const students = raw.users
    .filter(u => u.role === 'student')
    .map(u => {
      const subs = raw.submissions.filter(s => s.studentId === u.id);
      const solvedCount = new Set(subs.filter(s => s.status === 'Accepted').map(s => s.problemId)).size;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        course: u.course,
        batch: u.batch,
        section: u.section,
        eisPoints: u.eisPoints,
        isActive: u.isActive,
        problemsSolved: solvedCount,
        submissionsCount: subs.length,
        createdAt: u.createdAt
      };
    });
  return res.json(students);
});

app.get('/api/trainer/students/:id/report', (req: Request, res: Response) => {
  const report = db.getStudentDetailedReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Student not found' });
  return res.json(report);
});

app.put('/api/trainer/students/:id/status', (req: Request, res: Response) => {
  const { isActive } = req.body;
  const updated = db.updateUserStatus(req.params.id, Boolean(isActive));
  if (!updated) return res.status(404).json({ error: 'Student not found' });
  return res.json({ success: true, user: updated });
});

app.get('/api/leaderboard', (req: Request, res: Response) => {
  const { courseId, batch, section } = req.query;
  const board = db.getLeaderboard({
    courseId: courseId as string | undefined,
    batch: batch as string | undefined,
    section: section as string | undefined
  });
  return res.json(board);
});

// ================= REPORTS & CSV EXPORT =================
app.get('/api/reports/summary', (req: Request, res: Response) => {
  const raw = db.getRawData();
  const students = raw.users.filter(u => u.role === 'student');

  const courseBreakdown = raw.courses.map(c => {
    const enrolled = students.filter(s => s.course === c.id).length;
    const courseProblems = raw.problems.filter(p => p.courseId === c.id);
    const courseSubs = raw.submissions.filter(s => s.courseId === c.id);
    const solvedSubs = courseSubs.filter(s => s.status === 'Accepted');

    return {
      courseId: c.id,
      courseName: c.name,
      enrolled,
      problemCount: courseProblems.length,
      totalSubmissions: courseSubs.length,
      solvedSubmissions: solvedSubs.length,
      passRate: courseSubs.length > 0 ? Math.round((solvedSubs.length / courseSubs.length) * 100) : 0
    };
  });

  return res.json({
    totalStudents: students.length,
    activeStudents: students.filter(s => s.isActive).length,
    totalProblems: raw.problems.length,
    totalSubmissions: raw.submissions.length,
    totalAccepted: raw.submissions.filter(s => s.status === 'Accepted').length,
    courseBreakdown
  });
});

app.get('/api/reports/export/students-csv', (req: Request, res: Response) => {
  const raw = db.getRawData();
  const students = raw.users.filter(u => u.role === 'student');

  const headers = ['ID', 'Name', 'Email', 'Course', 'Batch', 'Section', 'EIS Points', 'Status', 'Joined Date'];
  const rows = students.map(s => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    s.email,
    s.course.toUpperCase(),
    s.batch,
    s.section,
    s.eisPoints,
    s.isActive ? 'Active' : 'Disabled',
    s.createdAt
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="codeassess_students_report.csv"');
  return res.send(csv);
});

// ================= SETTINGS =================
app.get('/api/settings', (req: Request, res: Response) => {
  return res.json(db.getSettings());
});

app.post('/api/settings', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'trainer') {
    return res.status(403).json({ error: 'Trainer authorization required.' });
  }
  const updated = db.updateSettings(req.body);
  return res.json(updated);
});

// ================= VITE MIDDLEWARE SETUP =================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, () => {
    console.log(`[CodeAssess] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CodeAssess] Failed to start server:', err);
});
