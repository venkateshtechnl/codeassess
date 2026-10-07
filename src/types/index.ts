export type CourseId =
  | 'c'
  | 'cpp'
  | 'java'
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'kotlin'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'sql'
  | 'bash'
  | 'perl'
  | 'r'
  | 'dart'
  | 'scala'
  | 'html_web'
  | 'fullstack'
  | 'datascience'
  | 'cloud_devops'
  | 'cybersecurity'
  | 'mobile_dev'
  | 'genai_llm'
  | 'blockchain'
  | 'bigdata'
  | 'iot_embedded'
  | 'qa_automation'
  | 'system_design';

export interface CourseInfo {
  id: CourseId;
  name: string;
  category: 'language' | 'technology';
  extension: string;
  defaultFile: string;
  iconName?: string;
  description: string;
}

export const ALL_COURSES_LIST: CourseInfo[] = [
  // Core Programming Languages
  { id: 'c', name: 'C Programming', category: 'language', extension: 'c', defaultFile: 'main.c', description: 'Foundational procedural language, pointers & memory management' },
  { id: 'cpp', name: 'C++ (Modern C++17/20)', category: 'language', extension: 'cpp', defaultFile: 'main.cpp', description: 'High-performance systems, STL & competitive programming' },
  { id: 'java', name: 'Java (OpenJDK)', category: 'language', extension: 'java', defaultFile: 'Main.java', description: 'Enterprise object-oriented programming & robust backend systems' },
  { id: 'python', name: 'Python 3', category: 'language', extension: 'py', defaultFile: 'main.py', description: 'Modern high-level scripting, automation, AI & data science' },
  { id: 'javascript', name: 'JavaScript (Node.js)', category: 'language', extension: 'js', defaultFile: 'index.js', description: 'Full-stack ECMAScript runtime for modern web & server applications' },
  { id: 'typescript', name: 'TypeScript', category: 'language', extension: 'ts', defaultFile: 'main.ts', description: 'Strict typed superset of JavaScript for scalable software' },
  { id: 'csharp', name: 'C# (.NET / Mono)', category: 'language', extension: 'cs', defaultFile: 'Program.cs', description: 'Modern multi-paradigm language for enterprise, cloud & game dev' },
  { id: 'go', name: 'Go (Golang)', category: 'language', extension: 'go', defaultFile: 'main.go', description: 'Ultra-fast, concurrent systems programming by Google' },
  { id: 'rust', name: 'Rust', category: 'language', extension: 'rs', defaultFile: 'main.rs', description: 'Memory-safe systems programming without garbage collector overhead' },
  { id: 'kotlin', name: 'Kotlin', category: 'language', extension: 'kt', defaultFile: 'Main.kt', description: 'Concise, expressive language for Android & backend microservices' },
  { id: 'php', name: 'PHP 8', category: 'language', extension: 'php', defaultFile: 'index.php', description: 'Dynamic server-side scripting powering web portals & APIs' },
  { id: 'ruby', name: 'Ruby', category: 'language', extension: 'rb', defaultFile: 'main.rb', description: 'Elegant dynamic programming language prioritizing developer happiness' },
  { id: 'swift', name: 'Swift', category: 'language', extension: 'swift', defaultFile: 'main.swift', description: 'Fast, secure programming for Apple iOS, macOS & modern cloud' },
  { id: 'sql', name: 'SQL (SQLite / RDBMS)', category: 'language', extension: 'sql', defaultFile: 'query.sql', description: 'Structured Query Language for relational database querying & schema design' },
  { id: 'bash', name: 'Bash / Linux Shell', category: 'language', extension: 'sh', defaultFile: 'script.sh', description: 'Unix shell scripting, process orchestration & system automation' },
  { id: 'perl', name: 'Perl', category: 'language', extension: 'pl', defaultFile: 'script.pl', description: 'Powerful text-processing, system administration & legacy pipelines' },
  { id: 'r', name: 'R Language', category: 'language', extension: 'r', defaultFile: 'analysis.r', description: 'Statistical computing, graphics, bioinformatics & data mining' },
  { id: 'dart', name: 'Dart', category: 'language', extension: 'dart', defaultFile: 'main.dart', description: 'Client-optimized programming language for multi-platform UI & Flutter' },
  { id: 'scala', name: 'Scala', category: 'language', extension: 'scala', defaultFile: 'Main.scala', description: 'Functional & object-oriented programming for high-throughput big data' },
  { id: 'html_web', name: 'HTML5 / CSS3 / JavaScript Web', category: 'language', extension: 'html', defaultFile: 'index.html', description: 'Front-end web engineering, interactive DOM manipulation & styling' },

  // Engineering Technologies & Specializations
  { id: 'fullstack', name: 'Full-Stack Web Development', category: 'technology', extension: 'ts', defaultFile: 'app.ts', description: 'Modern MERN, Next.js, RESTful APIs & database architecture' },
  { id: 'datascience', name: 'Data Science & Machine Learning', category: 'technology', extension: 'py', defaultFile: 'pipeline.py', description: 'Predictive modeling, NumPy, Pandas, scikit-learn & data visualization' },
  { id: 'cloud_devops', name: 'Cloud Computing & DevOps', category: 'technology', extension: 'sh', defaultFile: 'deploy.sh', description: 'AWS, Docker containers, Kubernetes orchestration & CI/CD pipelines' },
  { id: 'cybersecurity', name: 'Cybersecurity & Ethical Hacking', category: 'technology', extension: 'py', defaultFile: 'audit.py', description: 'Vulnerability assessment, penetration testing, network defense & cryptography' },
  { id: 'mobile_dev', name: 'Mobile App Development', category: 'technology', extension: 'kt', defaultFile: 'App.kt', description: 'Native Android, Flutter & React Native cross-platform engineering' },
  { id: 'genai_llm', name: 'Generative AI & LLM Engineering', category: 'technology', extension: 'py', defaultFile: 'agent.py', description: 'Prompt engineering, RAG pipelines, LangChain, embeddings & Gemini APIs' },
  { id: 'blockchain', name: 'Blockchain & Web3 Technologies', category: 'technology', extension: 'ts', defaultFile: 'contract.ts', description: 'Smart contracts, decentralized ledgers, cryptography & dApps' },
  { id: 'bigdata', name: 'Big Data & Analytics Engineering', category: 'technology', extension: 'py', defaultFile: 'spark.py', description: 'Distributed data pipelines, Apache Spark, Kafka & data lakes' },
  { id: 'iot_embedded', name: 'Embedded Systems & IoT', category: 'technology', extension: 'c', defaultFile: 'firmware.c', description: 'Microcontrollers, sensor integration, real-time operating systems & edge computing' },
  { id: 'qa_automation', name: 'Software QA & Test Automation', category: 'technology', extension: 'ts', defaultFile: 'test.ts', description: 'Automated end-to-end testing, Cypress, Playwright, Selenium & CI quality gates' },
  { id: 'system_design', name: 'System Design & High-Scalability Architecture', category: 'technology', extension: 'java', defaultFile: 'Architecture.java', description: 'Distributed systems, caching, microservices, load balancing & fault tolerance' }
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'trainer';
  course: CourseId;
  batch: string;
  section: string;
  eisPoints: number;
  isActive?: boolean;
  classroomUrl?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  courseId: CourseId;
  levelNumber: number;
  moduleId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  exampleInput: string;
  exampleOutput: string;
  explanation?: string;
  testCases: TestCase[];
  starterCode: Partial<Record<CourseId, string>>;
}

export interface Module {
  id: string;
  courseId: CourseId;
  levelNumber: number;
  title: string;
  description: string;
}

export interface Level {
  levelNumber: number;
  name: string;
  description: string;
}

export interface Course {
  id: CourseId;
  name: string;
  badge: string;
  iconName: string;
  description: string;
  levels: Level[];
  classroomUrl: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  problemId: string;
  problemTitle: string;
  courseId: CourseId;
  language: CourseId;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  testsPassed: number;
  totalTests: number;
  scoreAwarded: number;
  executionTimeMs: number;
  outputLog?: string;
  submittedAt: string;
}

export interface Material {
  id: string;
  courseId: CourseId;
  levelNumber: number;
  moduleId: string;
  title: string;
  description: string;
  authorName: string;
  postedAt: string;
  attachmentName?: string;
  attachmentType?: 'pdf' | 'doc' | 'code' | 'zip' | 'link';
  attachmentUrl?: string;
  externalLink?: string;
}

export interface EvaluationResult {
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  testsPassed: number;
  totalTests: number;
  executionTimeMs: number;
  outputLog: string;
  testCaseResults: {
    id: string;
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    isHidden: boolean;
    error?: string;
  }[];
}

export interface StudentDashboardMetrics {
  student: User;
  rank: number;
  totalRanked: number;
  totalProblemsCount: number;
  totalSolved: number;
  totalAttempted: number;
  overallProgress: number;
  courseStats: {
    courseId: CourseId;
    name: string;
    total: number;
    solved: number;
    progress: number;
    modules: {
      moduleId: string;
      title: string;
      levelNumber: number;
      total: number;
      solved: number;
      percentage: number;
    }[];
  }[];
  recentSubmissions: Submission[];
  recentMaterials: Material[];
}

export interface TrainerDashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  totalProblems: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  averageProgress: number;
  courseDistribution: Record<string, number>;
  recentActivities: {
    id: string;
    type: 'solved' | 'attempted' | 'joined' | 'post';
    message: string;
    timestamp: string;
    studentId?: string;
    studentName?: string;
  }[];
  recentSubmissions: Submission[];
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  email: string;
  course: CourseId;
  batch: string;
  section: string;
  eisPoints: number;
  problemsSolved: number;
  progress: number;
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
