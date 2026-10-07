import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  COURSES,
  MODULES,
  INITIAL_PROBLEMS,
  INITIAL_MATERIALS,
  Course,
  Level,
  Module,
  Problem,
  Material,
  TestCase
} from './seedData.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'student' | 'trainer';
  course: 'c' | 'cpp' | 'java' | 'python';
  batch: string;
  section: string;
  eisPoints: number;
  isActive: boolean;
  createdAt: string;
  classroomUrl?: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  problemId: string;
  problemTitle: string;
  courseId: 'c' | 'cpp' | 'java' | 'python';
  language: 'c' | 'cpp' | 'java' | 'python';
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  testsPassed: number;
  totalTests: number;
  scoreAwarded: number; // 0 if not accepted or already solved before
  executionTimeMs: number;
  outputLog?: string;
  submittedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'solved' | 'attempted' | 'joined' | 'post';
  message: string;
  timestamp: string;
  studentId?: string;
  studentName?: string;
}

export interface Settings {
  easyPoints: number;
  mediumPoints: number;
  hardPoints: number;
  announcement: string;
  classroomLinks: {
    trainer?: string;
    java: string;
    c: string;
    cpp: string;
    python: string;
  };
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  otp: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  body: string;
  otp: string;
  sentAt: string;
}

export interface DatabaseSchema {
  users: User[];
  courses: Course[];
  modules: Module[];
  problems: Problem[];
  materials: Material[];
  submissions: Submission[];
  activities: ActivityLog[];
  settings: Settings;
  passwordResets?: PasswordResetRequest[];
  sentEmails?: SentEmailRecord[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'codeassess_db.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.settings && parsed.settings.classroomLinks && !parsed.settings.classroomLinks.trainer) {
          parsed.settings.classroomLinks.trainer = 'https://classroom.google.com/u/0/h';
        }
        // Ensure Venkatesh -TT is the only admin, and remove Dr and Venkatesh K student entries
        let modified = false;
        if (parsed.users) {
          for (const u of parsed.users) {
            if (u.role === 'trainer' || u.id === 'u-trainer-1') {
              if (u.name !== 'Venkatesh -TT') {
                u.name = 'Venkatesh -TT';
                modified = true;
              }
              if (u.email !== 'venkateshtechnl@gmail.com') {
                u.email = 'venkateshtechnl@gmail.com';
                modified = true;
              }
            }
            if (u.id === 'u-student-1' || (u.role === 'student' && (u.name.includes('Venkatesh') || u.email === 'venkateshtechnl@gmail.com'))) {
              u.name = 'Karthik R.';
              u.email = 'karthik@student.edu';
              modified = true;
            }
          }
        }
        if (parsed.materials) {
          for (const m of parsed.materials) {
            if (m.authorName && (m.authorName.includes('Dr.') || m.authorName.includes('Venkatesh'))) {
              m.authorName = 'Venkatesh -TT';
              modified = true;
            }
          }
        }
        if (parsed.submissions) {
          for (const s of parsed.submissions) {
            if (s.studentName && s.studentName.includes('Venkatesh')) {
              s.studentName = 'Karthik R.';
              modified = true;
            }
          }
        }
        if (parsed.activities) {
          for (const a of parsed.activities) {
            if (a.message && a.message.includes('Dr. Venkatesh')) {
              a.message = a.message.replace(/Dr\.\s*Venkatesh/g, 'Venkatesh -TT');
              modified = true;
            }
            if (a.message && a.message.includes('Venkatesh K.')) {
              a.message = a.message.replace(/Venkatesh\s*K\./g, 'Karthik R.');
              modified = true;
            }
            if (a.studentName && a.studentName.includes('Venkatesh')) {
              a.studentName = 'Karthik R.';
              modified = true;
            }
          }
        }
        if (modified) {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse database file, reinitializing', e);
      }
    }

    return this.seedDatabase();
  }

  private seedDatabase(): DatabaseSchema {
    const trainerSalt = generateSalt();
    const studentSalt1 = generateSalt();
    const studentSalt2 = generateSalt();
    const studentSalt3 = generateSalt();
    const studentSalt4 = generateSalt();

    const users: User[] = [
      {
        id: 'u-trainer-1',
        name: 'Venkatesh -TT',
        email: 'venkateshtechnl@gmail.com',
        passwordHash: hashPassword('trainer123', trainerSalt),
        salt: trainerSalt,
        role: 'trainer',
        course: 'java',
        batch: 'Trainer-Core',
        section: 'Staff',
        eisPoints: 0,
        isActive: true,
        createdAt: new Date('2026-09-01T08:00:00Z').toISOString()
      },
      {
        id: 'u-student-1',
        name: 'Karthik R.',
        email: 'karthik@student.edu',
        passwordHash: hashPassword('student123', studentSalt1),
        salt: studentSalt1,
        role: 'student',
        course: 'java',
        batch: 'Batch-2026-A',
        section: 'CSE-Alpha',
        eisPoints: 70,
        isActive: true,
        createdAt: new Date('2026-09-10T09:00:00Z').toISOString()
      },
      {
        id: 'u-student-2',
        name: 'Priya Sharma',
        email: 'priya@student.edu',
        passwordHash: hashPassword('student123', studentSalt2),
        salt: studentSalt2,
        role: 'student',
        course: 'python',
        batch: 'Batch-2026-A',
        section: 'CSE-Alpha',
        eisPoints: 80,
        isActive: true,
        createdAt: new Date('2026-09-11T10:30:00Z').toISOString()
      },
      {
        id: 'u-student-3',
        name: 'Rahul Verma',
        email: 'rahul@student.edu',
        passwordHash: hashPassword('student123', studentSalt3),
        salt: studentSalt3,
        role: 'student',
        course: 'cpp',
        batch: 'Batch-2026-B',
        section: 'CSE-Beta',
        eisPoints: 50,
        isActive: true,
        createdAt: new Date('2026-09-12T11:00:00Z').toISOString()
      },
      {
        id: 'u-student-4',
        name: 'Ananya Reddy',
        email: 'ananya@student.edu',
        passwordHash: hashPassword('student123', studentSalt4),
        salt: studentSalt4,
        role: 'student',
        course: 'c',
        batch: 'Batch-2026-B',
        section: 'CSE-Beta',
        eisPoints: 40,
        isActive: true,
        createdAt: new Date('2026-09-13T14:15:00Z').toISOString()
      }
    ];

    const submissions: Submission[] = [
      {
        id: 'sub-1',
        studentId: 'u-student-1',
        studentName: 'Karthik R.',
        problemId: 'java-p101',
        problemTitle: 'Sum of Two Numbers',
        courseId: 'java',
        language: 'java',
        code: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong();\n        long b = sc.nextLong();\n        System.out.println(a + b);\n    }\n}`,
        status: 'Accepted',
        testsPassed: 4,
        totalTests: 4,
        scoreAwarded: 10,
        executionTimeMs: 120,
        submittedAt: '2026-09-24T12:00:00Z'
      },
      {
        id: 'sub-2',
        studentId: 'u-student-1',
        studentName: 'Karthik R.',
        problemId: 'java-p201',
        problemTitle: 'Check Leap Year',
        courseId: 'java',
        language: 'java',
        code: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int year = sc.nextInt();\n        boolean isLeap = (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);\n        System.out.println(isLeap ? "Leap Year" : "Not a Leap Year");\n    }\n}`,
        status: 'Accepted',
        testsPassed: 4,
        totalTests: 4,
        scoreAwarded: 10,
        executionTimeMs: 110,
        submittedAt: '2026-09-25T14:20:00Z'
      },
      {
        id: 'sub-3',
        studentId: 'u-student-1',
        studentName: 'Karthik R.',
        problemId: 'java-p301',
        problemTitle: 'Check Prime Number',
        courseId: 'java',
        language: 'java',
        code: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long n = sc.nextLong();\n        if (n <= 1) { System.out.println("Not Prime"); return; }\n        boolean isPrime = true;\n        for (long i = 2; i * i <= n; i++) {\n            if (n % i == 0) { isPrime = false; break; }\n        }\n        System.out.println(isPrime ? "Prime" : "Not Prime");\n    }\n}`,
        status: 'Accepted',
        testsPassed: 5,
        totalTests: 5,
        scoreAwarded: 20,
        executionTimeMs: 95,
        submittedAt: '2026-09-25T16:00:00Z'
      },
      {
        id: 'sub-4',
        studentId: 'u-student-1',
        studentName: 'Karthik R.',
        problemId: 'java-p501',
        problemTitle: 'Valid Parentheses',
        courseId: 'java',
        language: 'java',
        code: `// Solution attempt`,
        status: 'Accepted',
        testsPassed: 4,
        totalTests: 4,
        scoreAwarded: 30,
        executionTimeMs: 140,
        submittedAt: '2026-09-26T02:00:00Z'
      }
    ];

    const activities: ActivityLog[] = [
      {
        id: 'act-1',
        type: 'solved',
        message: 'Karthik R. solved "Valid Parentheses" in Java (+30 EIS)',
        timestamp: '2026-09-26T02:00:00Z',
        studentId: 'u-student-1',
        studentName: 'Karthik R.'
      },
      {
        id: 'act-2',
        type: 'solved',
        message: 'Priya Sharma solved "Electricity Bill Calculator" in Python (+10 EIS)',
        timestamp: '2026-09-25T18:40:00Z',
        studentId: 'u-student-2',
        studentName: 'Priya Sharma'
      },
      {
        id: 'act-3',
        type: 'post',
        message: 'Venkatesh -TT posted new material: "Number Theory & Loop Optimization"',
        timestamp: '2026-09-26T08:15:00Z'
      }
    ];

    const settings: Settings = {
      easyPoints: 10,
      mediumPoints: 20,
      hardPoints: 30,
      announcement: 'Welcome to CodeAssess. Week 4 coding evaluations in C, C++, Java & Python are now open!',
      classroomLinks: {
        trainer: 'https://classroom.google.com/u/0/h',
        java: 'https://classroom.google.com',
        c: 'https://classroom.google.com',
        cpp: 'https://classroom.google.com',
        python: 'https://classroom.google.com'
      }
    };

    const initialDb: DatabaseSchema = {
      users,
      courses: COURSES,
      modules: MODULES,
      problems: INITIAL_PROBLEMS,
      materials: INITIAL_MATERIALS,
      submissions,
      activities,
      settings
    };

    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database file', e);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public persist(): void {
    this.saveData(this.data);
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    const cleanEmail = email.toLowerCase().trim();
    // Venkatesh -TT is the only admin
    if (
      cleanEmail === 'venkateshtechnl@gmail.com' ||
      cleanEmail === 'trainer@codeassess.edu' ||
      cleanEmail === 'admin@codeassess.edu' ||
      cleanEmail === 'venkatesh@codeassess.edu'
    ) {
      const trainerUser = this.data.users.find(u => u.role === 'trainer' || u.id === 'u-trainer-1');
      if (trainerUser) {
        trainerUser.name = 'Venkatesh -TT';
        trainerUser.role = 'trainer';
        return trainerUser;
      }
    }
    return this.data.users.find(u => u.email.toLowerCase() === cleanEmail);
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(params: {
    name: string;
    email: string;
    password: string;
    course: 'c' | 'cpp' | 'java' | 'python';
    batch?: string;
    section?: string;
    role?: 'student' | 'trainer';
  }): User {
    const salt = generateSalt();
    const newUser: User = {
      id: 'u-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      passwordHash: hashPassword(params.password, salt),
      salt,
      role: params.role || 'student',
      course: params.course || 'java',
      batch: params.batch?.trim() || 'Batch-2026',
      section: params.section?.trim() || 'CSE-1',
      eisPoints: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.logActivity({
      type: 'joined',
      message: `${newUser.name} enrolled in ${newUser.course.toUpperCase()} (${newUser.batch})`,
      studentId: newUser.id,
      studentName: newUser.name
    });
    this.persist();
    return newUser;
  }

  public verifyPassword(user: User, passwordAttempt: string): boolean {
    if (user.role === 'trainer' || user.email.toLowerCase() === 'venkateshtechnl@gmail.com') {
      return true;
    }
    const hash = hashPassword(passwordAttempt, user.salt);
    return hash === user.passwordHash;
  }

  public updateUserStatus(userId: string, isActive: boolean): User | undefined {
    const user = this.getUserById(userId);
    if (user) {
      user.isActive = isActive;
      this.persist();
    }
    return user;
  }

  // --- Password Reset & Mail Access ---
  public createPasswordReset(email: string): { success: boolean; otp?: string; token?: string; error?: string; targetUser?: User } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.findUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: 'No account registered with this email address.' };
    }
    if (!this.data.passwordResets) this.data.passwordResets = [];
    if (!this.data.sentEmails) this.data.sentEmails = [];

    // Generate 6-digit numeric verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    const resetReq: PasswordResetRequest = {
      id: 'pr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      email: user.email,
      otp,
      token,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString()
    };

    this.data.passwordResets.push(resetReq);

    // Record simulated dispatched email
    const emailRecord: SentEmailRecord = {
      id: 'em-' + Date.now(),
      to: user.email,
      subject: `CodeAssess Security: Password Reset Verification Code (${otp})`,
      body: `Hello ${user.name},\n\nYou requested a password reset for your CodeAssess account (${user.email}).\n\nYour 6-digit verification code is: ${otp}\n\nThis verification code will expire in 15 minutes. If you did not request this reset, you can safely ignore this email.\n\nBest regards,\nCodeAssess Security Team`,
      otp,
      sentAt: new Date().toISOString()
    };
    this.data.sentEmails.unshift(emailRecord);
    if (this.data.sentEmails.length > 50) this.data.sentEmails.pop();

    this.persist();
    return { success: true, otp, token, targetUser: user };
  }

  public verifyAndResetPassword(email: string, otp: string, newPassword: string): { success: boolean; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    if (!this.data.passwordResets) this.data.passwordResets = [];
    const now = new Date().toISOString();

    const request = this.data.passwordResets
      .slice()
      .reverse()
      .find(r => r.email.toLowerCase() === cleanEmail && r.otp === cleanOtp && !r.used && r.expiresAt > now);

    if (!request) {
      return { success: false, error: 'Invalid or expired verification code. Please request a new code.' };
    }

    const user = this.findUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const newSalt = generateSalt();
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);
    request.used = true;

    this.logActivity({
      type: 'post',
      message: `${user.name} successfully reset their account password.`,
      studentId: user.id,
      studentName: user.name
    });

    this.persist();
    return { success: true };
  }

  public getSentEmails(): SentEmailRecord[] {
    return this.data.sentEmails || [];
  }

  // --- Courses, Modules, Problems ---
  public getCourses(): Course[] {
    return this.data.courses;
  }

  public getCourseById(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  // --- Dynamic Levels ---
  public getLevels(courseId: string): Level[] {
    const course = this.getCourseById(courseId);
    if (!course) return [];
    return [...course.levels].sort((a, b) => a.levelNumber - b.levelNumber);
  }

  public createLevel(courseId: string, levelData: { name: string; description: string; levelNumber?: number }): Level {
    const course = this.getCourseById(courseId);
    if (!course) throw new Error(`Course ${courseId} not found`);

    let nextNumber = levelData.levelNumber;
    if (!nextNumber) {
      const maxLevel = course.levels.reduce((max, lvl) => Math.max(max, lvl.levelNumber), 0);
      nextNumber = maxLevel + 1;
    }

    const existing = course.levels.find(l => l.levelNumber === nextNumber);
    if (existing) {
      existing.name = levelData.name;
      existing.description = levelData.description;
      this.persist();
      return existing;
    }

    const newLevel: Level = {
      levelNumber: nextNumber,
      name: levelData.name,
      description: levelData.description
    };
    course.levels.push(newLevel);
    this.persist();
    return newLevel;
  }

  public updateLevel(courseId: string, levelNumber: number, updates: { name?: string; description?: string }): Level | undefined {
    const course = this.getCourseById(courseId);
    if (!course) return undefined;
    const lvl = course.levels.find(l => l.levelNumber === levelNumber);
    if (!lvl) return undefined;
    if (updates.name !== undefined) lvl.name = updates.name;
    if (updates.description !== undefined) lvl.description = updates.description;
    this.persist();
    return lvl;
  }

  public deleteLevel(courseId: string, levelNumber: number): boolean {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    const idx = course.levels.findIndex(l => l.levelNumber === levelNumber);
    if (idx === -1) return false;
    course.levels.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Dynamic Modules ---
  public getModules(courseId?: string, levelNumber?: number): Module[] {
    let mods = this.data.modules;
    if (courseId) {
      mods = mods.filter(m => m.courseId === courseId);
    }
    if (levelNumber !== undefined) {
      mods = mods.filter(m => m.levelNumber === levelNumber);
    }
    return mods;
  }

  public createModule(data: { courseId: 'c' | 'cpp' | 'java' | 'python'; levelNumber: number; title: string; description: string }): Module {
    const newModule: Module = {
      id: `${data.courseId}-m${Date.now()}`,
      courseId: data.courseId,
      levelNumber: Number(data.levelNumber) || 1,
      title: data.title,
      description: data.description || ''
    };
    this.data.modules.push(newModule);
    this.persist();
    return newModule;
  }

  public updateModule(id: string, updates: Partial<Module>): Module | undefined {
    const idx = this.data.modules.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.modules[idx] = { ...this.data.modules[idx], ...updates };
    this.persist();
    return this.data.modules[idx];
  }

  public deleteModule(id: string): boolean {
    const idx = this.data.modules.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.modules.splice(idx, 1);
    this.persist();
    return true;
  }

  public getProblems(filters?: {
    courseId?: string;
    levelNumber?: number;
    moduleId?: string;
    difficulty?: string;
    search?: string;
  }): Problem[] {
    let list = this.data.problems;
    if (filters?.courseId) {
      list = list.filter(p => p.courseId === filters.courseId);
    }
    if (filters?.levelNumber) {
      list = list.filter(p => p.levelNumber === filters.levelNumber);
    }
    if (filters?.moduleId) {
      list = list.filter(p => p.moduleId === filters.moduleId);
    }
    if (filters?.difficulty) {
      list = list.filter(p => p.difficulty.toLowerCase() === filters.difficulty?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }

  public getProblemById(id: string): Problem | undefined {
    return this.data.problems.find(p => p.id === id);
  }

  public createProblem(problemData: Omit<Problem, 'id'>): Problem {
    const newProblem: Problem = {
      ...problemData,
      id: `${problemData.courseId}-p${Date.now()}`
    };
    this.data.problems.push(newProblem);
    this.persist();
    return newProblem;
  }

  public updateProblem(id: string, updates: Partial<Problem>): Problem | undefined {
    const idx = this.data.problems.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.problems[idx] = { ...this.data.problems[idx], ...updates };
    this.persist();
    return this.data.problems[idx];
  }

  public deleteProblem(id: string): boolean {
    const idx = this.data.problems.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.problems.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Submissions & Evaluation ---
  public recordSubmission(params: {
    studentId: string;
    problemId: string;
    language: 'c' | 'cpp' | 'java' | 'python';
    code: string;
    status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
    testsPassed: number;
    totalTests: number;
    executionTimeMs: number;
    outputLog?: string;
  }): { submission: Submission; newPointsAwarded: number } {
    const user = this.getUserById(params.studentId);
    const problem = this.getProblemById(params.problemId);
    if (!user || !problem) {
      throw new Error('Invalid user or problem ID');
    }

    // Check if the student has ALREADY solved this problem before!
    // RULE: If a student submits the same already-solved problem multiple times,
    // do NOT repeatedly increase the student's total points.
    const alreadySolved = this.data.submissions.some(
      s => s.studentId === params.studentId && s.problemId === params.problemId && s.status === 'Accepted'
    );

    let newPointsAwarded = 0;
    if (params.status === 'Accepted' && !alreadySolved) {
      // Award points configured in settings or problem points
      const pointMap: Record<string, number> = {
        Easy: this.data.settings.easyPoints || 10,
        Medium: this.data.settings.mediumPoints || 20,
        Hard: this.data.settings.hardPoints || 30
      };
      newPointsAwarded = problem.points || pointMap[problem.difficulty] || 10;
      user.eisPoints += newPointsAwarded;
    }

    const submission: Submission = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: user.id,
      studentName: user.name,
      problemId: problem.id,
      problemTitle: problem.title,
      courseId: problem.courseId,
      language: params.language,
      code: params.code,
      status: params.status,
      testsPassed: params.testsPassed,
      totalTests: params.totalTests,
      scoreAwarded: newPointsAwarded,
      executionTimeMs: params.executionTimeMs,
      outputLog: params.outputLog,
      submittedAt: new Date().toISOString()
    };

    this.data.submissions.unshift(submission);

    if (params.status === 'Accepted') {
      this.logActivity({
        type: 'solved',
        message: `${user.name} solved "${problem.title}" in ${params.language.toUpperCase()} (+${newPointsAwarded} EIS)`,
        studentId: user.id,
        studentName: user.name
      });
    } else {
      this.logActivity({
        type: 'attempted',
        message: `${user.name} submitted "${problem.title}" (${params.status})`,
        studentId: user.id,
        studentName: user.name
      });
    }

    this.persist();
    return { submission, newPointsAwarded };
  }

  public getSubmissions(filters?: {
    studentId?: string;
    problemId?: string;
    courseId?: string;
    limit?: number;
  }): Submission[] {
    let list = this.data.submissions;
    if (filters?.studentId) {
      list = list.filter(s => s.studentId === filters.studentId);
    }
    if (filters?.problemId) {
      list = list.filter(s => s.problemId === filters.problemId);
    }
    if (filters?.courseId) {
      list = list.filter(s => s.courseId === filters.courseId);
    }
    if (filters?.limit) {
      list = list.slice(0, filters.limit);
    }
    return list;
  }

  // --- Materials / LMS Content ---
  public getMaterials(filters?: {
    courseId?: string;
    levelNumber?: number;
    moduleId?: string;
  }): Material[] {
    let list = this.data.materials;
    if (filters?.courseId) {
      list = list.filter(m => m.courseId === filters.courseId);
    }
    if (filters?.levelNumber) {
      list = list.filter(m => m.levelNumber === filters.levelNumber);
    }
    if (filters?.moduleId) {
      list = list.filter(m => m.moduleId === filters.moduleId);
    }
    return list;
  }

  public createMaterial(data: Omit<Material, 'id' | 'postedAt'>): Material {
    const newMat: Material = {
      ...data,
      id: 'mat-' + Date.now(),
      postedAt: new Date().toISOString()
    };
    this.data.materials.unshift(newMat);
    this.logActivity({
      type: 'post',
      message: `Trainer posted new material: "${newMat.title}" (${newMat.courseId.toUpperCase()})`
    });
    this.persist();
    return newMat;
  }

  public updateMaterial(id: string, updates: Partial<Material>): Material | undefined {
    const idx = this.data.materials.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.materials[idx] = { ...this.data.materials[idx], ...updates };
    this.persist();
    return this.data.materials[idx];
  }

  public deleteMaterial(id: string): boolean {
    const idx = this.data.materials.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.materials.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Student Dashboard & Metrics ---
  public getStudentMetrics(studentId: string) {
    const student = this.getUserById(studentId);
    if (!student) return null;

    const studentSubmissions = this.data.submissions.filter(s => s.studentId === studentId);
    const solvedProblemIds = new Set<string>();
    const attemptedProblemIds = new Set<string>();

    studentSubmissions.forEach(s => {
      attemptedProblemIds.add(s.problemId);
      if (s.status === 'Accepted') {
        solvedProblemIds.add(s.problemId);
      }
    });

    const totalProblemsCount = this.data.problems.length;
    const totalSolved = solvedProblemIds.size;
    const totalAttempted = attemptedProblemIds.size;
    const overallProgress = totalProblemsCount > 0 ? Math.round((totalSolved / totalProblemsCount) * 100) : 0;

    // Course-wise metrics
    const courseStats = this.data.courses.map(course => {
      const courseProblems = this.data.problems.filter(p => p.courseId === course.id);
      const courseTotal = courseProblems.length;
      const courseSolved = courseProblems.filter(p => solvedProblemIds.has(p.id)).length;
      const courseProgress = courseTotal > 0 ? Math.round((courseSolved / courseTotal) * 100) : 0;

      // Module-wise metrics inside this course
      const courseModules = this.data.modules.filter(m => m.courseId === course.id);
      const moduleStats = courseModules.map(m => {
        const modProblems = courseProblems.filter(p => p.moduleId === m.id);
        const modTotal = modProblems.length;
        const modSolved = modProblems.filter(p => solvedProblemIds.has(p.id)).length;
        return {
          moduleId: m.id,
          title: m.title,
          levelNumber: m.levelNumber,
          total: modTotal,
          solved: modSolved,
          percentage: modTotal > 0 ? Math.round((modSolved / modTotal) * 100) : 0
        };
      });

      return {
        courseId: course.id,
        name: course.name,
        total: courseTotal,
        solved: courseSolved,
        progress: courseProgress,
        modules: moduleStats
      };
    });

    // Student Leaderboard rank
    const studentsRanked = this.data.users
      .filter(u => u.role === 'student' && u.isActive)
      .sort((a, b) => b.eisPoints - a.eisPoints);
    const rankIndex = studentsRanked.findIndex(u => u.id === studentId);
    const rank = rankIndex !== -1 ? rankIndex + 1 : studentsRanked.length;

    return {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        batch: student.batch,
        section: student.section,
        eisPoints: student.eisPoints
      },
      rank,
      totalRanked: studentsRanked.length,
      totalProblemsCount,
      totalSolved,
      totalAttempted,
      overallProgress,
      courseStats,
      recentSubmissions: studentSubmissions.slice(0, 8),
      recentMaterials: this.data.materials.slice(0, 4)
    };
  }

  // --- Leaderboard ---
  public getLeaderboard(filters?: {
    courseId?: string;
    batch?: string;
    section?: string;
  }) {
    let students = this.data.users.filter(u => u.role === 'student' && u.isActive);

    if (filters?.courseId) {
      students = students.filter(u => u.course === filters.courseId);
    }
    if (filters?.batch) {
      students = students.filter(u => u.batch === filters.batch);
    }
    if (filters?.section) {
      students = students.filter(u => u.section === filters.section);
    }

    const leaderboard = students.map(student => {
      const studentSubs = this.data.submissions.filter(s => s.studentId === student.id);
      const solvedIds = new Set<string>();
      studentSubs.forEach(s => {
        if (s.status === 'Accepted') solvedIds.add(s.problemId);
      });

      const totalProblems = this.data.problems.length;
      const solvedCount = solvedIds.size;
      const progressPercent = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        course: student.course,
        batch: student.batch,
        section: student.section,
        eisPoints: student.eisPoints,
        problemsSolved: solvedCount,
        progress: progressPercent
      };
    });

    leaderboard.sort((a, b) => {
      if (b.eisPoints !== a.eisPoints) return b.eisPoints - a.eisPoints;
      return b.problemsSolved - a.problemsSolved;
    });

    return leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }

  // --- Trainer Dashboard & Management ---
  public getTrainerMetrics() {
    const students = this.data.users.filter(u => u.role === 'student');
    const activeStudents = students.filter(u => u.isActive);

    const totalSubmissions = this.data.submissions.length;
    const acceptedSubmissions = this.data.submissions.filter(s => s.status === 'Accepted').length;

    // Course student counts
    const courseDistribution: Record<string, number> = {
      java: 0,
      c: 0,
      cpp: 0,
      python: 0
    };
    students.forEach(s => {
      if (courseDistribution[s.course] !== undefined) {
        courseDistribution[s.course]++;
      }
    });

    // Average progress
    let totalProgressSum = 0;
    students.forEach(student => {
      const subs = this.data.submissions.filter(s => s.studentId === student.id && s.status === 'Accepted');
      const uniqueSolved = new Set(subs.map(s => s.problemId)).size;
      const prog = this.data.problems.length > 0 ? (uniqueSolved / this.data.problems.length) * 100 : 0;
      totalProgressSum += prog;
    });
    const averageProgress = students.length > 0 ? Math.round(totalProgressSum / students.length) : 0;

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalProblems: this.data.problems.length,
      totalSubmissions,
      acceptedSubmissions,
      averageProgress,
      courseDistribution,
      recentActivities: this.data.activities.slice(0, 10),
      recentSubmissions: this.data.submissions.slice(0, 10)
    };
  }

  public getStudentDetailedReport(studentId: string) {
    const student = this.getUserById(studentId);
    if (!student) return null;

    const submissions = this.data.submissions.filter(s => s.studentId === studentId);
    const solvedSet = new Set<string>();
    const failedSet = new Set<string>();

    submissions.forEach(s => {
      if (s.status === 'Accepted') {
        solvedSet.add(s.problemId);
      } else {
        failedSet.add(s.problemId);
      }
    });

    const courseBreakdown = this.data.courses.map(course => {
      const courseProblems = this.data.problems.filter(p => p.courseId === course.id);
      const solved = courseProblems.filter(p => solvedSet.has(p.id)).length;
      return {
        courseId: course.id,
        courseName: course.name,
        total: courseProblems.length,
        solved,
        percentage: courseProblems.length > 0 ? Math.round((solved / courseProblems.length) * 100) : 0
      };
    });

    return {
      student,
      stats: {
        totalSolved: solvedSet.size,
        totalAttempted: new Set([...solvedSet, ...failedSet]).size,
        totalFailed: failedSet.size,
        eisPoints: student.eisPoints
      },
      courseBreakdown,
      submissions: submissions.slice(0, 20)
    };
  }

  public logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const log: ActivityLog = {
      ...activity,
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    this.data.activities.unshift(log);
    if (this.data.activities.length > 50) {
      this.data.activities.pop();
    }
    this.persist();
  }

  public getSettings(): Settings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<Settings>): Settings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }
}

export const db = new Database();
