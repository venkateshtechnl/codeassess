import { Problem, TestCase } from './seedData.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput?: string;
  exitCode: number;
  executionTimeMs: number;
  memoryKb?: number;
  isError: boolean;
  statusText?: string;
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

const JUDGE0_URL = 'https://ce.judge0.com/submissions?wait=true';

const LANGUAGE_ID_MAP: Record<string, number> = {
  c: 103,           // C (GCC 14.1.0)
  cpp: 105,         // C++ (GCC 14.1.0)
  'c++': 105,
  cpp14: 52,        // C++ (GCC 7.4.0)
  cpp17: 53,        // C++ (GCC 8.3.0)
  cpp20: 105,       // C++ (GCC 14.1.0)
  java: 91,         // Java (JDK 17.0.6)
  python: 92,       // Python (3.11.2)
  python3: 92,
  python2: 70,      // Python 2.7.17
  py: 92,
  javascript: 97,   // Node.js 20.17.0
  js: 97,
  node: 97,
  typescript: 94,   // TypeScript 5.0.3
  ts: 94,
  csharp: 51,       // C# (Mono 6.6.0.161)
  cs: 51,
  'c#': 51,
  go: 95,           // Go (1.18.5)
  golang: 95,
  rust: 73,         // Rust (1.40.0)
  rs: 73,
  kotlin: 78,       // Kotlin (1.3.70)
  kt: 78,
  php: 98,          // PHP (8.3.11)
  ruby: 72,         // Ruby (2.7.0)
  rb: 72,
  swift: 83,        // Swift (5.2.3)
  sql: 82,          // SQLite 3.27.2
  bash: 46,         // Bash (5.0.0)
  sh: 46,
  shell: 46,
  perl: 85,         // Perl (5.28.1)
  pl: 85,
  r: 99,            // R (4.4.1)
  dart: 90,         // Dart (2.19.2)
  scala: 112,       // Scala (3.4.2)
  haskell: 61,      // Haskell (GHC 8.8.1)
  hs: 61,
  pascal: 67,       // Pascal (FPC 3.0.4)
  assembly: 45,     // Assembly (NASM 2.14.02)
  asm: 45,
  lua: 64           // Lua (5.3.5)
};

function normalizeStdin(stdin?: string): string {
  if (stdin === undefined || stdin === null || stdin === '') return '';
  let str = String(stdin).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!str.endsWith('\n')) {
    str += '\n';
  }
  return str;
}

function parseCliArgs(argsStr?: string): string[] {
  if (!argsStr || !argsStr.trim()) return [];
  // Split while respecting spaces, or simple whitespace split
  return argsStr.trim().split(/\s+/);
}

// ----------------- NATIVE RUNNERS -----------------

// Java Local Runner
function executeJavaLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_java_'));

    let processedCode = code;
    if (!processedCode.includes('class Main')) {
      processedCode = processedCode.replace(/(?:public\s+)?class\s+([A-Za-z0-9_]+)/, 'public class Main');
    }

    const sourceFile = path.join(tempDir, 'Main.java');
    fs.writeFileSync(sourceFile, processedCode, 'utf-8');

    // 1. Compile
    const javac = spawn('javac', [sourceFile]);
    let compileStderr = '';

    javac.stderr.on('data', d => { compileStderr += d.toString(); });

    javac.on('close', (compileExitCode) => {
      if (compileExitCode !== 0) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        return resolve({
          stdout: '',
          stderr: '',
          compileOutput: compileStderr.trim(),
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
          isError: true,
          statusText: 'Compilation Error'
        });
      }

      // 2. Execute
      const runStartTime = Date.now();
      const java = spawn('java', ['-cp', tempDir, '-Xmx256m', 'Main', ...cliArgs]);

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        java.kill('SIGKILL');
      }, 7000);

      const finalStdin = normalizeStdin(stdin);
      if (finalStdin) {
        java.stdin.write(finalStdin);
      }
      java.stdin.end();

      java.stdout.on('data', d => { stdout += d.toString(); });
      java.stderr.on('data', d => { stderr += d.toString(); });

      java.on('close', (runExitCode) => {
        clearTimeout(timer);
        const duration = Date.now() - runStartTime;
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

        if (timedOut) {
          return resolve({
            stdout,
            stderr: 'Time Limit Exceeded (7000ms)',
            exitCode: 1,
            executionTimeMs: 7000,
            isError: true,
            statusText: 'Time Limit Exceeded'
          });
        }

        const isErr = runExitCode !== 0;
        return resolve({
          stdout,
          stderr,
          compileOutput: '',
          exitCode: runExitCode ?? (isErr ? 1 : 0),
          executionTimeMs: duration,
          isError: isErr,
          statusText: isErr ? 'Runtime Error' : 'Success'
        });
      });

      java.on('error', (err) => {
        clearTimeout(timer);
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        reject(err);
      });
    });

    javac.on('error', (err) => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// C Local Runner
function executeCLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_c_'));
    const sourceFile = path.join(tempDir, 'main.c');
    const binFile = path.join(tempDir, 'main');

    fs.writeFileSync(sourceFile, code, 'utf-8');

    // 1. Compile
    const gcc = spawn('gcc', [sourceFile, '-O2', '-lm', '-o', binFile]);
    let compileStderr = '';

    gcc.stderr.on('data', d => { compileStderr += d.toString(); });

    gcc.on('close', (compileExitCode) => {
      if (compileExitCode !== 0) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        return resolve({
          stdout: '',
          stderr: '',
          compileOutput: compileStderr.trim(),
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
          isError: true,
          statusText: 'Compilation Error'
        });
      }

      // 2. Execute
      const runStartTime = Date.now();
      const bin = spawn(binFile, cliArgs);

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        bin.kill('SIGKILL');
      }, 7000);

      const finalStdin = normalizeStdin(stdin);
      if (finalStdin) {
        bin.stdin.write(finalStdin);
      }
      bin.stdin.end();

      bin.stdout.on('data', d => { stdout += d.toString(); });
      bin.stderr.on('data', d => { stderr += d.toString(); });

      bin.on('close', (runExitCode) => {
        clearTimeout(timer);
        const duration = Date.now() - runStartTime;
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

        if (timedOut) {
          return resolve({
            stdout,
            stderr: 'Time Limit Exceeded (7000ms)',
            exitCode: 1,
            executionTimeMs: 7000,
            isError: true,
            statusText: 'Time Limit Exceeded'
          });
        }

        const isErr = runExitCode !== 0;
        return resolve({
          stdout,
          stderr,
          compileOutput: '',
          exitCode: runExitCode ?? (isErr ? 1 : 0),
          executionTimeMs: duration,
          isError: isErr,
          statusText: isErr ? 'Runtime Error' : 'Success'
        });
      });

      bin.on('error', (err) => {
        clearTimeout(timer);
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        reject(err);
      });
    });

    gcc.on('error', (err) => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// C++ Local Runner
function executeCppLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_cpp_'));
    const sourceFile = path.join(tempDir, 'main.cpp');
    const binFile = path.join(tempDir, 'main');

    fs.writeFileSync(sourceFile, code, 'utf-8');

    // 1. Compile
    const gpp = spawn('g++', [sourceFile, '-O2', '-std=c++17', '-o', binFile]);
    let compileStderr = '';

    gpp.stderr.on('data', d => { compileStderr += d.toString(); });

    gpp.on('close', (compileExitCode) => {
      if (compileExitCode !== 0) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        return resolve({
          stdout: '',
          stderr: '',
          compileOutput: compileStderr.trim(),
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
          isError: true,
          statusText: 'Compilation Error'
        });
      }

      // 2. Execute
      const runStartTime = Date.now();
      const bin = spawn(binFile, cliArgs);

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        bin.kill('SIGKILL');
      }, 7000);

      const finalStdin = normalizeStdin(stdin);
      if (finalStdin) {
        bin.stdin.write(finalStdin);
      }
      bin.stdin.end();

      bin.stdout.on('data', d => { stdout += d.toString(); });
      bin.stderr.on('data', d => { stderr += d.toString(); });

      bin.on('close', (runExitCode) => {
        clearTimeout(timer);
        const duration = Date.now() - runStartTime;
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

        if (timedOut) {
          return resolve({
            stdout,
            stderr: 'Time Limit Exceeded (7000ms)',
            exitCode: 1,
            executionTimeMs: 7000,
            isError: true,
            statusText: 'Time Limit Exceeded'
          });
        }

        const isErr = runExitCode !== 0;
        return resolve({
          stdout,
          stderr,
          compileOutput: '',
          exitCode: runExitCode ?? (isErr ? 1 : 0),
          executionTimeMs: duration,
          isError: isErr,
          statusText: isErr ? 'Runtime Error' : 'Success'
        });
      });

      bin.on('error', (err) => {
        clearTimeout(timer);
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
        reject(err);
      });
    });

    gpp.on('error', (err) => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// Python Local Runner
function executePythonLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_py_'));
    const sourceFile = path.join(tempDir, 'main.py');
    fs.writeFileSync(sourceFile, code, 'utf-8');

    const proc = spawn('python3', [sourceFile, ...cliArgs]);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, 7000);

    const finalStdin = normalizeStdin(stdin);
    if (finalStdin) {
      proc.stdin.write(finalStdin);
    }
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (codeExit) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (timedOut) {
        return resolve({
          stdout,
          stderr: 'Time Limit Exceeded (7000ms)',
          exitCode: 1,
          executionTimeMs: 7000,
          isError: true,
          statusText: 'Time Limit Exceeded'
        });
      }

      const isErr = codeExit !== 0;
      return resolve({
        stdout,
        stderr,
        compileOutput: '',
        exitCode: codeExit ?? (isErr ? 1 : 0),
        executionTimeMs: duration,
        isError: isErr,
        statusText: isErr ? 'Runtime Error' : 'Success'
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// JavaScript (Node.js) Local Runner
function executeJsLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_js_'));
    const sourceFile = path.join(tempDir, 'index.js');
    fs.writeFileSync(sourceFile, code, 'utf-8');

    const proc = spawn('node', [sourceFile, ...cliArgs]);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, 7000);

    const finalStdin = normalizeStdin(stdin);
    if (finalStdin) {
      proc.stdin.write(finalStdin);
    }
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (codeExit) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (timedOut) {
        return resolve({
          stdout,
          stderr: 'Time Limit Exceeded (7000ms)',
          exitCode: 1,
          executionTimeMs: 7000,
          isError: true,
          statusText: 'Time Limit Exceeded'
        });
      }

      const isErr = codeExit !== 0;
      return resolve({
        stdout,
        stderr,
        compileOutput: '',
        exitCode: codeExit ?? (isErr ? 1 : 0),
        executionTimeMs: duration,
        isError: isErr,
        statusText: isErr ? 'Runtime Error' : 'Success'
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// TypeScript Local Runner
function executeTsLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_ts_'));
    const sourceFile = path.join(tempDir, 'main.ts');
    fs.writeFileSync(sourceFile, code, 'utf-8');

    const proc = spawn('npx', ['--no-install', 'tsx', sourceFile, ...cliArgs]);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, 8000);

    const finalStdin = normalizeStdin(stdin);
    if (finalStdin) {
      proc.stdin.write(finalStdin);
    }
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (codeExit) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (timedOut) {
        return resolve({
          stdout,
          stderr: 'Time Limit Exceeded (8000ms)',
          exitCode: 1,
          executionTimeMs: 8000,
          isError: true,
          statusText: 'Time Limit Exceeded'
        });
      }

      const isErr = codeExit !== 0;
      return resolve({
        stdout,
        stderr,
        compileOutput: '',
        exitCode: codeExit ?? (isErr ? 1 : 0),
        executionTimeMs: duration,
        isError: isErr,
        statusText: isErr ? 'Runtime Error' : 'Success'
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// SQL (SQLite3) Local Runner
function executeSqlLocal(code: string): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_sql_'));
    const dbFile = path.join(tempDir, 'database.sqlite');
    const sqlFile = path.join(tempDir, 'query.sql');

    fs.writeFileSync(sqlFile, code, 'utf-8');

    // Run sqlite3 with clean headers and columns
    const proc = spawn('sqlite3', ['-header', '-column', dbFile, `.read ${sqlFile}`]);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, 5000);

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (codeExit) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (timedOut) {
        return resolve({
          stdout,
          stderr: 'Time Limit Exceeded (5000ms)',
          exitCode: 1,
          executionTimeMs: 5000,
          isError: true,
          statusText: 'Time Limit Exceeded'
        });
      }

      const isErr = codeExit !== 0 || Boolean(stderr.trim());
      return resolve({
        stdout: stdout || (isErr ? '' : 'Query executed successfully with 0 rows returned.\n'),
        stderr,
        compileOutput: '',
        exitCode: codeExit ?? (isErr ? 1 : 0),
        executionTimeMs: duration,
        isError: isErr,
        statusText: isErr ? 'SQL Error' : 'Success'
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// Bash Shell Local Runner
function executeBashLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_bash_'));
    const sourceFile = path.join(tempDir, 'script.sh');
    fs.writeFileSync(sourceFile, code, 'utf-8');

    const proc = spawn('bash', [sourceFile, ...cliArgs]);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, 6000);

    const finalStdin = normalizeStdin(stdin);
    if (finalStdin) {
      proc.stdin.write(finalStdin);
    }
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (codeExit) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (timedOut) {
        return resolve({
          stdout,
          stderr: 'Time Limit Exceeded (6000ms)',
          exitCode: 1,
          executionTimeMs: 6000,
          isError: true,
          statusText: 'Time Limit Exceeded'
        });
      }

      const isErr = codeExit !== 0;
      return resolve({
        stdout,
        stderr,
        compileOutput: '',
        exitCode: codeExit ?? (isErr ? 1 : 0),
        executionTimeMs: duration,
        isError: isErr,
        statusText: isErr ? 'Runtime Error' : 'Success'
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// Perl Local Runner
function executePerlLocal(code: string, stdin: string, cliArgs: string[] = []): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeassess_perl_'));
    const sourceFile = path.join(tempDir, 'script.pl');
    fs.writeFileSync(sourceFile, code, 'utf-8');

    const proc = spawn('perl', [sourceFile, ...cliArgs]);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
    }, 6000);

    const finalStdin = normalizeStdin(stdin);
    if (finalStdin) {
      proc.stdin.write(finalStdin);
    }
    proc.stdin.end();

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', (codeExit) => {
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

      if (timedOut) {
        return resolve({
          stdout,
          stderr: 'Time Limit Exceeded (6000ms)',
          exitCode: 1,
          executionTimeMs: 6000,
          isError: true,
          statusText: 'Time Limit Exceeded'
        });
      }

      const isErr = codeExit !== 0;
      return resolve({
        stdout,
        stderr,
        compileOutput: '',
        exitCode: codeExit ?? (isErr ? 1 : 0),
        executionTimeMs: duration,
        isError: isErr,
        statusText: isErr ? 'Runtime Error' : 'Success'
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
      reject(err);
    });
  });
}

// Judge0 Remote Runner (For C#, Go, Rust, Kotlin, PHP, Ruby, Swift, R, Dart, Scala, etc.)
async function executeJudge0(
  languageId: number,
  code: string,
  stdin: string,
  commandLineArgs: string = '',
  startTime: number
): Promise<ExecutionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const payload: any = {
    language_id: languageId,
    source_code: code,
    stdin: normalizeStdin(stdin),
    cpu_time_limit: 5.0,
    memory_limit: 128000
  };

  if (commandLineArgs && commandLineArgs.trim()) {
    payload.command_line_arguments = commandLineArgs.trim();
  }

  const response = await fetch(JUDGE0_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify(payload)
  });

  clearTimeout(timeoutId);
  const duration = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(`Judge0 service HTTP ${response.status}`);
  }

  const data = await response.json();
  const statusId = data.status?.id;
  const isAccepted = statusId === 3;
  const isCompileError = statusId === 6;
  const isTimeLimit = statusId === 5;
  const isRuntimeError = statusId >= 7 && statusId <= 12;

  let statusText = 'Success';
  if (isCompileError) statusText = 'Compilation Error';
  else if (isTimeLimit) statusText = 'Time Limit Exceeded';
  else if (isRuntimeError) statusText = 'Runtime Error';
  else if (!isAccepted && data.stderr) statusText = 'Runtime Error';

  return {
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compileOutput: data.compile_output || '',
    exitCode: isAccepted ? 0 : 1,
    executionTimeMs: Math.round(parseFloat(data.time || '0.05') * 1000) || duration,
    memoryKb: data.memory,
    isError: !isAccepted && (Boolean(data.compile_output) || Boolean(data.stderr) || isTimeLimit),
    statusText
  };
}

// Main Execution Dispatcher
export async function executeCode(
  language: string,
  code: string,
  stdin: string = '',
  commandLineArgs: string = ''
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const langKey = language.toLowerCase().trim();
  const cliArgs = parseCliArgs(commandLineArgs);

  // HTML / Web Preview Sandbox (Zero Latency)
  if (langKey === 'html' || langKey === 'html_web' || langKey === 'web') {
    return {
      stdout: 'HTML5/CSS3/JavaScript web page compiled and rendered in live preview frame.',
      stderr: '',
      compileOutput: '',
      exitCode: 0,
      executionTimeMs: 4,
      isError: false,
      statusText: 'Success'
    };
  }

  // 1. Try ultra-fast native local execution first for directly installed compilers
  try {
    if (langKey === 'c') {
      return await executeCLocal(code, stdin, cliArgs);
    }
    if (langKey === 'cpp' || langKey === 'c++' || langKey === 'cpp14' || langKey === 'cpp17' || langKey === 'cpp20') {
      return await executeCppLocal(code, stdin, cliArgs);
    }
    if (langKey === 'java') {
      return await executeJavaLocal(code, stdin, cliArgs);
    }
    if (langKey === 'python' || langKey === 'python3' || langKey === 'py') {
      return await executePythonLocal(code, stdin, cliArgs);
    }
    if (langKey === 'javascript' || langKey === 'js' || langKey === 'node') {
      return await executeJsLocal(code, stdin, cliArgs);
    }
    if (langKey === 'typescript' || langKey === 'ts') {
      return await executeTsLocal(code, stdin, cliArgs);
    }
    if (langKey === 'sql') {
      return await executeSqlLocal(code);
    }
    if (langKey === 'bash' || langKey === 'sh' || langKey === 'shell') {
      return await executeBashLocal(code, stdin, cliArgs);
    }
    if (langKey === 'perl' || langKey === 'pl') {
      return await executePerlLocal(code, stdin, cliArgs);
    }
  } catch (localErr: any) {
    console.warn(`Local execution exception for ${language}: ${localErr.message}. Attempting fallback.`);
  }

  // 2. High-performance fallback / specialized languages via Judge0
  try {
    const languageId = LANGUAGE_ID_MAP[langKey] || LANGUAGE_ID_MAP.python;
    let processedCode = code;
    if (langKey === 'java' && !processedCode.includes('class Main')) {
      processedCode = processedCode.replace(/(?:public\s+)?class\s+([A-Za-z0-9_]+)/, 'public class Main');
    }
    return await executeJudge0(languageId, processedCode, stdin, commandLineArgs, startTime);
  } catch (err: any) {
    return {
      stdout: '',
      stderr: err.name === 'AbortError'
        ? 'Execution timed out after 20 seconds.'
        : `Execution engine message: ${err.message}`,
      exitCode: 1,
      executionTimeMs: Date.now() - startTime,
      isError: true,
      statusText: err.name === 'AbortError' ? 'Time Limit Exceeded' : 'Runtime Error'
    };
  }
}

function normalizeOutput(str: string): string {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');
}

export async function evaluateProblem(
  problem: Problem,
  language: 'c' | 'cpp' | 'java' | 'python',
  code: string
): Promise<EvaluationResult> {
  const testCases = problem.testCases;
  let testsPassed = 0;
  let overallStatus: EvaluationResult['status'] = 'Accepted';
  let compileOutputLog = '';

  // Execute all test cases in parallel for fast evaluation
  const execResults = await Promise.all(
    testCases.map(tc => executeCode(language, code, tc.input))
  );

  let totalDuration = 0;
  const testCaseResults: EvaluationResult['testCaseResults'] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const exec = execResults[i];
    totalDuration += exec.executionTimeMs;

    if (exec.statusText === 'Compilation Error') {
      overallStatus = 'Compilation Error';
      compileOutputLog = exec.compileOutput || exec.stderr || 'Compilation error';
      testCaseResults.push({
        id: tc.id,
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: '',
        isHidden: tc.isHidden,
        error: compileOutputLog
      });
      break;
    }

    if (exec.statusText === 'Time Limit Exceeded') {
      if (overallStatus === 'Accepted') overallStatus = 'Time Limit Exceeded';
      testCaseResults.push({
        id: tc.id,
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: exec.stdout,
        isHidden: tc.isHidden,
        error: 'Time Limit Exceeded (5000ms)'
      });
      continue;
    }

    if (exec.statusText === 'Runtime Error') {
      if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
      testCaseResults.push({
        id: tc.id,
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: exec.stdout,
        isHidden: tc.isHidden,
        error: exec.stderr || 'Runtime Exception'
      });
      continue;
    }

    const normActual = normalizeOutput(exec.stdout);
    const normExpected = normalizeOutput(tc.expectedOutput);
    const isMatch = normActual === normExpected;

    if (isMatch) {
      testsPassed++;
      testCaseResults.push({
        id: tc.id,
        passed: true,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: exec.stdout.trim(),
        isHidden: tc.isHidden
      });
    } else {
      if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer';
      testCaseResults.push({
        id: tc.id,
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: exec.stdout.trim(),
        isHidden: tc.isHidden
      });
    }
  }

  return {
    status: overallStatus,
    testsPassed,
    totalTests: testCases.length,
    executionTimeMs: Math.round(totalDuration / (testCaseResults.length || 1)),
    outputLog: compileOutputLog,
    testCaseResults
  };
}
