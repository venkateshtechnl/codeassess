import React, { useState, useRef, useEffect } from 'react';
import { handleCodeEditorKeyDown } from '../../utils/editorUtils';
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Keyboard,
  Info,
  Maximize2,
  Minimize2,
  Columns,
  Rows,
  Settings,
  Wand2,
  Trash2,
  ChevronDown,
  Layers,
  Database,
  Cpu,
  Globe,
  Share2,
  HelpCircle,
  ExternalLink,
  Code
} from 'lucide-react';

export type CompilerLanguage =
  | 'c'
  | 'cpp'
  | 'cpp14'
  | 'cpp17'
  | 'cpp20'
  | 'java'
  | 'python'
  | 'python2'
  | 'javascript'
  | 'typescript'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'kotlin'
  | 'swift'
  | 'sql'
  | 'bash'
  | 'perl'
  | 'r'
  | 'dart'
  | 'scala'
  | 'haskell'
  | 'html';

interface LanguageConfig {
  id: CompilerLanguage;
  name: string;
  version: string;
  fileName: string;
  extension: string;
  category: 'c_cpp' | 'core_oop' | 'scripting_web' | 'systems_modern' | 'data_markup';
  starterCode: string;
}

const LANGUAGE_CONFIGS: Record<CompilerLanguage, LanguageConfig> = {
  c: {
    id: 'c',
    name: 'C (GCC 12.3)',
    version: 'gcc 12.3.0',
    fileName: 'main.c',
    extension: '.c',
    category: 'c_cpp',
    starterCode: `#include <stdio.h>

int main() {
    printf("OnlineGDB C Engine Ready! (GCC 12.3)\\n");
    
    char name[100];
    printf("Enter your name: ");
    if (scanf("%99s", name) == 1) {
        printf("Hello, %s! Welcome to OnlineGDB C Compiler.\\n", name);
    } else {
        printf("Hello, World!\\n");
    }
    return 0;
}`
  },
  cpp: {
    id: 'cpp',
    name: 'C++ (G++ 12.3, C++17)',
    version: 'g++ 12.3.0',
    fileName: 'main.cpp',
    extension: '.cpp',
    category: 'c_cpp',
    starterCode: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    cout << "OnlineGDB C++ Engine Ready! (C++17)\\n";
    
    string name;
    cout << "Enter your name: ";
    if (cin >> name) {
        cout << "Hello, " << name << "! Welcome to OnlineGDB C++ Compiler.\\n";
    } else {
        cout << "Hello, World!\\n";
    }
    return 0;
}`
  },
  cpp14: {
    id: 'cpp14',
    name: 'C++14 (G++ 7.4)',
    version: 'g++ 7.4.0 (C++14)',
    fileName: 'main.cpp',
    extension: '.cpp',
    category: 'c_cpp',
    starterCode: `#include <iostream>
#include <string>

using namespace std;

int main() {
    cout << "OnlineGDB C++14 Engine Ready!\\n";
    string name;
    cout << "Enter your name: ";
    if (cin >> name) {
        cout << "Hello, " << name << "! Welcome to OnlineGDB C++14.\\n";
    } else {
        cout << "Hello, World!\\n";
    }
    return 0;
}`
  },
  cpp17: {
    id: 'cpp17',
    name: 'C++17 (G++ 8.3)',
    version: 'g++ 8.3.0 (C++17)',
    fileName: 'main.cpp',
    extension: '.cpp',
    category: 'c_cpp',
    starterCode: `#include <iostream>
#include <string_view>

using namespace std;

int main() {
    cout << "OnlineGDB C++17 Engine Ready!\\n";
    string name;
    cout << "Enter your name: ";
    if (cin >> name) {
        cout << "Hello, " << name << "! Welcome to OnlineGDB C++17.\\n";
    } else {
        cout << "Hello, World!\\n";
    }
    return 0;
}`
  },
  cpp20: {
    id: 'cpp20',
    name: 'C++20 (G++ 14.1)',
    version: 'g++ 14.1.0 (C++20)',
    fileName: 'main.cpp',
    extension: '.cpp',
    category: 'c_cpp',
    starterCode: `#include <iostream>
#include <format>
#include <string>

using namespace std;

int main() {
    cout << "OnlineGDB C++20 Engine Ready!\\n";
    string name;
    cout << "Enter your name: ";
    if (cin >> name) {
        cout << "Hello, " << name << "! Welcome to OnlineGDB C++20 Compiler.\\n";
    } else {
        cout << "Hello, World!\\n";
    }
    return 0;
}`
  },
  java: {
    id: 'java',
    name: 'Java (OpenJDK 17)',
    version: 'OpenJDK 17.0.6',
    fileName: 'Main.java',
    extension: '.java',
    category: 'core_oop',
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("OnlineGDB Java Engine Ready! (OpenJDK 17)");
        
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your name: ");
        if (sc.hasNext()) {
            String name = sc.next();
            System.out.println("Hello, " + name + "! Welcome to OnlineGDB Java Compiler.");
        } else {
            System.out.println("Hello, World!");
        }
        sc.close();
    }
}`
  },
  python: {
    id: 'python',
    name: 'Python 3 (Python 3.11)',
    version: 'Python 3.11.2',
    fileName: 'main.py',
    extension: '.py',
    category: 'core_oop',
    starterCode: `import sys

print("OnlineGDB Python 3 Engine Ready!")

try:
    name = input("Enter your name: ")
    print(f"Hello, {name}! Welcome to OnlineGDB Python 3 Compiler.")
except EOFError:
    print("Hello, World!")
`
  },
  python2: {
    id: 'python2',
    name: 'Python 2.7',
    version: 'Python 2.7.17',
    fileName: 'main.py',
    extension: '.py',
    category: 'core_oop',
    starterCode: `print "OnlineGDB Python 2.7 Engine Ready!"

try:
    name = raw_input("Enter your name: ")
    print "Hello, " + name + "! Welcome to OnlineGDB Python 2.7 Compiler."
except:
    print "Hello, World!"
`
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js 20)',
    version: 'Node.js 20.17.0',
    fileName: 'index.js',
    extension: '.js',
    category: 'scripting_web',
    starterCode: `console.log("OnlineGDB JavaScript (Node.js) Ready!");

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    const user = name.trim() || 'World';
    console.log(\`Hello, \${user}! Welcome to OnlineGDB JavaScript Compiler.\`);
    rl.close();
});`
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript (TS 5.6)',
    version: 'TypeScript 5.6.2',
    fileName: 'main.ts',
    extension: '.ts',
    category: 'scripting_web',
    starterCode: `console.log("OnlineGDB TypeScript Engine Ready!");

interface Developer {
    name: string;
    role: string;
    skills: string[];
}

const dev: Developer = {
    name: "Alex",
    role: "Full-Stack Software Engineer",
    skills: ["TypeScript", "React", "Node.js", "Python"]
};

console.log(\`Hello, \${dev.name} (\${dev.role})!\`);
console.log(\`Active Tech Stack: \${dev.skills.join(', ')}\`);
`
  },
  csharp: {
    id: 'csharp',
    name: 'C# (Mono 6.6 / .NET)',
    version: 'Mono 6.6.0.161',
    fileName: 'Program.cs',
    extension: '.cs',
    category: 'core_oop',
    starterCode: `using System;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("OnlineGDB C# Engine Ready!");
        Console.Write("Enter your name: ");
        string name = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(name)) {
            name = "World";
        }
        Console.WriteLine($"Hello, {name}! Welcome to OnlineGDB C# Compiler.");
    }
}`
  },
  php: {
    id: 'php',
    name: 'PHP 8.3',
    version: 'PHP 8.3.11',
    fileName: 'index.php',
    extension: '.php',
    category: 'scripting_web',
    starterCode: `<?php
echo "OnlineGDB PHP Engine Ready!\n";
echo "Enter your name: ";
$name = trim(fgets(STDIN));
if (empty($name)) $name = "World";
echo "Hello, $name! Welcome to OnlineGDB PHP Compiler.\n";
?>`
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby 3.2',
    version: 'Ruby 2.7.0 / 3.2',
    fileName: 'main.rb',
    extension: '.rb',
    category: 'scripting_web',
    starterCode: `puts "OnlineGDB Ruby Engine Ready!"
print "Enter your name: "
name = gets&.strip
name = "World" if name.nil? || name.empty?
puts "Hello, #{name}! Welcome to OnlineGDB Ruby Compiler."
`
  },
  go: {
    id: 'go',
    name: 'Go (Golang 1.23)',
    version: 'Go 1.18.5 / 1.23',
    fileName: 'main.go',
    extension: '.go',
    category: 'systems_modern',
    starterCode: `package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	fmt.Println("OnlineGDB Go (Golang) Engine Ready!")
	fmt.Print("Enter your name: ")
	reader := bufio.NewReader(os.Stdin)
	name, _ := reader.ReadString('\\n')
	name = strings.TrimSpace(name)
	if name == "" {
		name = "World"
	}
	fmt.Printf("Hello, %s! Welcome to OnlineGDB Go Compiler.\\n", name)
}`
  },
  rust: {
    id: 'rust',
    name: 'Rust (1.85)',
    version: 'Rust 1.40.0 / 1.85',
    fileName: 'main.rs',
    extension: '.rs',
    category: 'systems_modern',
    starterCode: `use std::io::{self, BufRead};

fn main() {
    println!("OnlineGDB Rust Engine Ready!");
    print!("Enter your name: ");
    let stdin = io::stdin();
    let mut iterator = stdin.lock().lines();
    if let Some(Ok(name)) = iterator.next() {
        let trimmed = name.trim();
        let display = if trimmed.is_empty() { "World" } else { trimmed };
        println!("Hello, {}! Welcome to OnlineGDB Rust Compiler.", display);
    } else {
        println!("Hello, World!");
    }
}`
  },
  kotlin: {
    id: 'kotlin',
    name: 'Kotlin (JVM 2.1)',
    version: 'Kotlin 2.1.10',
    fileName: 'Main.kt',
    extension: '.kt',
    category: 'systems_modern',
    starterCode: `import java.util.Scanner

fun main() {
    println("OnlineGDB Kotlin Engine Ready!")
    print("Enter your name: ")
    val scanner = Scanner(System.\`in\`)
    val name = if (scanner.hasNextLine()) scanner.nextLine().trim() else "World"
    println("Hello, $name! Welcome to OnlineGDB Kotlin Compiler.")
}`
  },
  swift: {
    id: 'swift',
    name: 'Swift 5.8',
    version: 'Swift 5.2.3 / 5.8',
    fileName: 'main.swift',
    extension: '.swift',
    category: 'systems_modern',
    starterCode: `import Foundation

print("OnlineGDB Swift Engine Ready!")
print("Enter your name: ", terminator: "")
if let name = readLine(), !name.trimmingCharacters(in: .whitespaces).isEmpty {
    print("Hello, \\(name.trimmingCharacters(in: .whitespaces))! Welcome to OnlineGDB Swift Compiler.")
} else {
    print("Hello, World!")
}`
  },
  sql: {
    id: 'sql',
    name: 'SQL (SQLite 3.40)',
    version: 'SQLite 3.40.1',
    fileName: 'query.sql',
    extension: '.sql',
    category: 'data_markup',
    starterCode: `-- OnlineGDB SQL Engine (SQLite 3 In-Memory)
CREATE TABLE engineers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    technology TEXT,
    salary REAL
);

INSERT INTO engineers (name, technology, salary) VALUES
    ('Aarav Patel', 'Full-Stack Web Dev', 95000),
    ('Priya Sharma', 'Data Science & AI', 88000),
    ('Rahul Verma', 'Cloud & DevOps', 92000),
    ('Ananya Iyer', 'Cybersecurity', 98000);

-- Query: Average salary and staff count per discipline
SELECT technology, COUNT(*) AS staff_count, ROUND(AVG(salary), 2) AS avg_salary
FROM engineers
GROUP BY technology
ORDER BY avg_salary DESC;`
  },
  bash: {
    id: 'bash',
    name: 'Bash / Shell (5.0)',
    version: 'Bash 5.0.0',
    fileName: 'script.sh',
    extension: '.sh',
    category: 'scripting_web',
    starterCode: `#!/bin/bash
echo "OnlineGDB Bash Shell Engine Ready!"
read -p "Enter your name: " name
name=\${name:-"World"}
echo "Hello, \$name! Welcome to OnlineGDB Bash Compiler."
echo "Current Date: \$(date)"
echo "Host Kernel: \$(uname -s -r)"
`
  },
  perl: {
    id: 'perl',
    name: 'Perl (5.28)',
    version: 'Perl 5.28.1',
    fileName: 'script.pl',
    extension: '.pl',
    category: 'scripting_web',
    starterCode: `use strict;
use warnings;

print "OnlineGDB Perl Engine Ready!\\n";
print "Enter your name: ";
my $name = <STDIN>;
chomp($name) if defined $name;
$name = "World" unless length($name);
print "Hello, $name! Welcome to OnlineGDB Perl Compiler.\\n";
`
  },
  r: {
    id: 'r',
    name: 'R Language (4.4)',
    version: 'R 4.4.1',
    fileName: 'analysis.r',
    extension: '.r',
    category: 'data_markup',
    starterCode: `cat("OnlineGDB R Engine Ready!\\n")
name <- readline(prompt = "Enter your name: ")
if (nchar(name) == 0) name <- "World"
cat(paste("Hello,", name, "! Welcome to OnlineGDB R Compiler.\\n"))

# Matrix and vector statistical demo
data_sample <- c(15, 28, 42, 59, 74, 91)
cat("Sample Summary:\\n")
print(summary(data_sample))
`
  },
  dart: {
    id: 'dart',
    name: 'Dart (2.19)',
    version: 'Dart 2.19.2',
    fileName: 'main.dart',
    extension: '.dart',
    category: 'systems_modern',
    starterCode: `import 'dart:io';

void main() {
  print('OnlineGDB Dart Engine Ready!');
  stdout.write('Enter your name: ');
  String? name = stdin.readLineSync();
  name = (name == null || name.trim().isEmpty) ? 'World' : name.trim();
  print('Hello, $name! Welcome to OnlineGDB Dart Compiler.');
}`
  },
  scala: {
    id: 'scala',
    name: 'Scala (3.4)',
    version: 'Scala 3.4.2',
    fileName: 'Main.scala',
    extension: '.scala',
    category: 'systems_modern',
    starterCode: `object Main {
  def main(args: Array[String]): Unit = {
    println("OnlineGDB Scala Engine Ready!")
    print("Enter your name: ")
    val name = scala.io.StdIn.readLine()
    val clean = if (name != null && name.trim.nonEmpty) name.trim else "World"
    println(s"Hello, $clean! Welcome to OnlineGDB Scala Compiler.")
  }
}`
  },
  haskell: {
    id: 'haskell',
    name: 'Haskell (GHC 8.8)',
    version: 'GHC 8.8.1',
    fileName: 'main.hs',
    extension: '.hs',
    category: 'systems_modern',
    starterCode: `main :: IO ()
main = do
    putStrLn "OnlineGDB Haskell (GHC) Engine Ready!"
    putStr "Enter your name: "
    name <- getLine
    let user = if null name then "World" else name
    putStrLn ("Hello, " ++ user ++ "! Welcome to OnlineGDB Haskell Compiler.")`
  },
  html: {
    id: 'html',
    name: 'HTML / CSS / JS (Live Web Canvas)',
    version: 'HTML5 / ECMAScript 2024',
    fileName: 'index.html',
    extension: '.html',
    category: 'data_markup',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OnlineGDB Web Canvas</title>
  <style>
    body {
      margin: 0;
      padding: 2rem;
      background: #090d16;
      color: #f1f5f9;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 2rem;
      max-width: 520px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.6);
    }
    h1 { color: #38bdf8; margin-top: 0; font-size: 1.5rem; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #0369a1; }
    .status {
      margin-top: 1.25rem;
      padding: 0.85rem;
      border-radius: 8px;
      background: #064e3b;
      color: #34d399;
      font-weight: 500;
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>OnlineGDB Interactive Web Canvas</h1>
    <p>Live HTML5, CSS3, and JavaScript Sandbox. Modify elements, click Run, or trigger client-side scripts.</p>
    <button onclick="document.getElementById('status').style.display='block'">Run Web Action</button>
    <div id="status" class="status">⚡ JavaScript Interactive Event Fired Successfully!</div>
  </div>
</body>
</html>`
  }
};

export const OpenCompiler: React.FC = () => {
  const [language, setLanguage] = useState<CompilerLanguage>('c');
  const [code, setCode] = useState<string>(LANGUAGE_CONFIGS.c.starterCode);
  const [stdinInput, setStdinInput] = useState<string>('Alex');
  const [commandLineArgs, setCommandLineArgs] = useState<string>('');
  const [compilerFlags, setCompilerFlags] = useState<string>('');
  const [activeIoTab, setActiveIoTab] = useState<'stdin' | 'args' | 'flags' | 'output' | 'preview'>('stdin');
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical' | 'fullscreen'>('horizontal');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>(
    'OnlineGDB Interactive Compiler & IDE ready.\nSupports all 24 programming languages. Choose your language, provide STDIN, and click "Run" (or press F9 / Ctrl+Enter).'
  );
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>('Ready');
  const [isErrorState, setIsErrorState] = useState<boolean>(false);

  // Editor Settings
  const [editorTheme, setEditorTheme] = useState<'dark' | 'monokai' | 'vsdark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabSize, setTabSize] = useState<number>(4);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConfig = LANGUAGE_CONFIGS[language];

  // Sync line numbers scroll with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Track cursor position
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const { selectionStart, value } = textareaRef.current;
    const lines = value.slice(0, selectionStart).split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  // Change Language
  const handleLanguageChange = (newLang: CompilerLanguage) => {
    setLanguage(newLang);
    const cfg = LANGUAGE_CONFIGS[newLang];
    setCode(cfg.starterCode);
    setConsoleOutput(`Language switched to ${cfg.name}.\nFile: ${cfg.fileName} · Ready to compile.`);
    setExecutionTime(null);
    setExitCode(null);
    setStatusText('Ready');
    setIsErrorState(false);
    if (newLang === 'html') {
      setActiveIoTab('preview');
    } else {
      setActiveIoTab('stdin');
    }
  };

  // Reset to starter code
  const handleReset = () => {
    if (confirm(`Reset ${activeConfig.fileName} to default template?`)) {
      setCode(activeConfig.starterCode);
    }
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download source file
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeConfig.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Upload source file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        setCode(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Beautify / Format code (auto-indent)
  const handleBeautifyCode = () => {
    const lines = code.split('\n');
    let indentLevel = 0;
    const indentString = ' '.repeat(tabSize);
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      const indented = indentLevel > 0 ? indentString.repeat(indentLevel) + trimmed : trimmed;
      if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
        indentLevel++;
      }
      return indented;
    }).join('\n');
    setCode(formatted);
  };

  // Execute Code
  const runCode = async () => {
    if (isRunning) return;

    if (language === 'html') {
      setActiveIoTab('preview');
      setStatusText('Rendered');
      setExecutionTime(4);
      setExitCode(0);
      setIsErrorState(false);
      setConsoleOutput('HTML5/CSS3/JavaScript live web preview refreshed.');
      return;
    }

    setIsRunning(true);
    setActiveIoTab('output');
    setStatusText('Running...');
    setIsErrorState(false);

    setConsoleOutput(`$ Compiling & executing ${activeConfig.fileName} (${activeConfig.name})...\n`);

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          stdin: stdinInput,
          commandLineArgs: commandLineArgs
        })
      });

      const data = await res.json();
      setExecutionTime(data.executionTimeMs || 0);
      setExitCode(data.exitCode ?? 0);
      setStatusText(data.statusText || (data.exitCode === 0 ? 'Success' : 'Error'));
      setIsErrorState(Boolean(data.isError));

      let log = '';
      if (data.compileOutput) {
        log += `--- Compilation Log ---\n${data.compileOutput}\n\n`;
      }
      if (data.stdout) {
        log += data.stdout;
      }
      if (data.stderr) {
        log += `\n[STDERR]\n${data.stderr}`;
      }
      if (!log.trim()) {
        log = 'Program executed successfully with no console output.';
      }

      const finishBanner = `\n\n--------------------------------\nProcess finished with exit code ${data.exitCode ?? 0} (${data.executionTimeMs || 0} ms)`;
      setConsoleOutput(log + finishBanner);
    } catch (err: any) {
      setIsErrorState(true);
      setStatusText('Runtime Error');
      setConsoleOutput(`Execution failed: ${err.message || 'Network error connecting to OnlineGDB compiler engine.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter or F9 to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if (e.key === 'F9') {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, stdinInput, commandLineArgs, isRunning]);

  const lineCount = Math.max(code.split('\n').length, 1);

  // Theme styling
  const themeClasses = {
    dark: 'bg-[#1e1e1e] text-[#d4d4d4] selection:bg-[#264f78]',
    monokai: 'bg-[#272822] text-[#f8f8f2] selection:bg-[#49483e]',
    vsdark: 'bg-[#18181b] text-[#fafafa] selection:bg-[#3f3f46]',
    light: 'bg-[#f8fafc] text-[#0f172a] selection:bg-[#bae6fd]'
  };

  return (
    <div className={`flex flex-col bg-[#0b0f19] text-slate-100 ${
      layoutMode === 'fullscreen' ? 'fixed inset-0 z-50 p-2' : 'h-[calc(100vh-4rem)] p-2.5 sm:p-3.5'
    }`}>
      {/* Top Header & OnlineGDB Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        {/* Left: Branding & Language Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Cpu className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight text-white">OnlineGDB IDE</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-800">
                  Full Compiler Engine
                </span>
              </div>
              <span className="text-[10px] text-slate-400">All 24 Languages · Zero Latency · Interactive STDIN</span>
            </div>
          </div>

          {/* Language Selector Dropdown with all categories */}
          <div className="relative">
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value as CompilerLanguage)}
              className="bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer pr-7 shadow-sm"
            >
              <optgroup label="C / C++ Compilers">
                <option value="c">C (GCC 12.3)</option>
                <option value="cpp">C++ (G++ 12.3, C++17)</option>
                <option value="cpp14">C++14 (G++ 7.4)</option>
                <option value="cpp17">C++17 (G++ 8.3)</option>
                <option value="cpp20">C++20 (G++ 14.1)</option>
              </optgroup>
              <optgroup label="Core & Object-Oriented">
                <option value="java">Java (OpenJDK 17)</option>
                <option value="python">Python 3 (3.11)</option>
                <option value="python2">Python 2.7</option>
                <option value="csharp">C# (Mono / .NET)</option>
              </optgroup>
              <optgroup label="Web & Scripting Languages">
                <option value="javascript">JavaScript (Node.js 20)</option>
                <option value="typescript">TypeScript (5.6)</option>
                <option value="php">PHP (8.3)</option>
                <option value="ruby">Ruby (3.2)</option>
                <option value="bash">Bash / Shell (5.0)</option>
                <option value="perl">Perl (5.28)</option>
              </optgroup>
              <optgroup label="Systems & Modern Languages">
                <option value="go">Go (Golang 1.23)</option>
                <option value="rust">Rust (1.85)</option>
                <option value="kotlin">Kotlin (JVM 2.1)</option>
                <option value="swift">Swift (5.8)</option>
                <option value="dart">Dart (2.19)</option>
                <option value="scala">Scala (3.4)</option>
                <option value="haskell">Haskell (GHC 8.8)</option>
              </optgroup>
              <optgroup label="Database & Web Preview">
                <option value="sql">SQL (SQLite 3.40)</option>
                <option value="r">R Language (4.4)</option>
                <option value="html">HTML/CSS/JS (Live Web Canvas)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Center: Action Buttons (Run, Stop, Beautify, Copy, Download, Upload, Reset) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-900/40 transition-all disabled:opacity-50"
            title="Run Code (F9 or Ctrl+Enter)"
          >
            {isRunning ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Run</span>
            <kbd className="hidden md:inline-block ml-1 text-[10px] bg-emerald-700/80 px-1 rounded text-emerald-100 font-mono">F9</kbd>
          </button>

          {isRunning && (
            <button
              onClick={() => setIsRunning(false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
              title="Stop execution"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={handleBeautifyCode}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="Auto-indent and format code"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Format</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title={`Download ${activeConfig.fileName}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>

          {/* Upload File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".c,.cpp,.h,.hpp,.java,.py,.js,.ts,.cs,.go,.rs,.kt,.php,.rb,.swift,.sql,.sh,.pl,.r,.dart,.scala,.hs,.html,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            title="Upload source file from disk"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Upload</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition-colors"
            title="Reset code to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Settings, Shortcuts & Layout Switcher */}
        <div className="flex items-center gap-2">
          {/* Shortcuts Info Button */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Layout controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setLayoutMode('horizontal')}
              className={`p-1 rounded ${layoutMode === 'horizontal' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              title="Split Horizontal (Editor top / Console bottom - OnlineGDB layout)"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('vertical')}
              className={`p-1 rounded ${layoutMode === 'vertical' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              title="Split Vertical (Editor left / Console right)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode(layoutMode === 'fullscreen' ? 'horizontal' : 'fullscreen')}
              className={`p-1 rounded ${layoutMode === 'fullscreen' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
              title="Toggle Fullscreen"
            >
              {layoutMode === 'fullscreen' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
              title="Editor Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-3"
                onMouseLeave={() => setShowSettingsMenu(false)}
              >
                <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5">OnlineGDB Settings</div>

                <div>
                  <label className="text-slate-400 block mb-1">Editor Theme</label>
                  <select
                    value={editorTheme}
                    onChange={e => setEditorTheme(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="dark">OnlineGDB Dark (Classic)</option>
                    <option value="monokai">Monokai Dark</option>
                    <option value="vsdark">VS Code Dark</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={12}>12 px (Compact)</option>
                    <option value={14}>14 px (Standard)</option>
                    <option value={16}>16 px (Medium)</option>
                    <option value={18}>18 px (Large)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tab Size</label>
                  <select
                    value={tabSize}
                    onChange={e => setTabSize(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces (Standard)</option>
                    <option value={8}>8 spaces</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className={`flex-1 flex gap-2.5 pt-2.5 overflow-hidden ${
        layoutMode === 'vertical' ? 'flex-row' : 'flex-col'
      }`}>
        {/* Editor Window */}
        <div className={`flex flex-col rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner ${
          layoutMode === 'vertical' ? 'flex-1' : 'h-[56%]'
        }`}>
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded border border-slate-800 font-mono text-emerald-400 font-semibold">
                <FileCode className="w-3.5 h-3.5" />
                <span>{activeConfig.fileName}</span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                {activeConfig.version}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Lines: {lineCount}</span>
              <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
            </div>
          </div>

          {/* Editor Body with Synchronized Line Numbers */}
          <div className={`flex-1 flex relative overflow-hidden font-mono ${themeClasses[editorTheme]}`} style={{ fontSize: `${fontSize}px` }}>
            {/* Line Numbers Gutter */}
            <div
              ref={lineNumbersRef}
              className="w-12 py-3 pr-2 text-right select-none bg-black/40 text-slate-600 border-r border-slate-800/80 overflow-hidden"
              style={{ lineHeight: '1.5rem' }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => { setCode(e.target.value); updateCursorPosition(); }}
              onKeyDown={e => handleCodeEditorKeyDown(e, code, setCode, { tabSize })}
              onScroll={handleScroll}
              onKeyUp={updateCursorPosition}
              onClick={updateCursorPosition}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 h-full p-3 bg-transparent text-inherit resize-none focus:outline-none overflow-y-auto leading-6 whitespace-pre font-mono"
              style={{ tabSize: tabSize }}
            />
          </div>
        </div>

        {/* Bottom I/O Panel (OnlineGDB Terminal & STDIN Tabs) */}
        <div className={`flex flex-col rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl ${
          layoutMode === 'vertical' ? 'flex-1' : 'flex-1 min-h-[220px]'
        }`}>
          {/* I/O Header Tabs */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveIoTab('stdin')}
                className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                  activeIoTab === 'stdin' ? 'bg-slate-950 text-emerald-400 border border-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Standard Input (STDIN)</span>
                {stdinInput && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />}
              </button>

              <button
                onClick={() => setActiveIoTab('args')}
                className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                  activeIoTab === 'args' ? 'bg-slate-950 text-sky-400 border border-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Command Line Args</span>
                {commandLineArgs && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 ml-0.5" />}
              </button>

              <button
                onClick={() => setActiveIoTab('flags')}
                className={`hidden md:flex px-3 py-1 rounded font-semibold transition-colors items-center gap-1.5 ${
                  activeIoTab === 'flags' ? 'bg-slate-950 text-indigo-400 border border-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Compiler Flags</span>
              </button>

              <button
                onClick={() => setActiveIoTab('output')}
                className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                  activeIoTab === 'output' ? 'bg-slate-950 text-amber-400 border border-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Output Console</span>
              </button>

              {language === 'html' && (
                <button
                  onClick={() => setActiveIoTab('preview')}
                  className={`px-3 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                    activeIoTab === 'preview' ? 'bg-slate-950 text-sky-400 border border-slate-800' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live Web Preview</span>
                </button>
              )}
            </div>

            {/* Performance Status Metrics */}
            <div className="flex items-center gap-2 text-[11px] font-mono">
              {executionTime !== null && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>{executionTime} ms</span>
                </div>
              )}

              {exitCode !== null && (
                <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                  exitCode === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  Exit: {exitCode}
                </span>
              )}

              <button
                onClick={() => setConsoleOutput('')}
                className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                title="Clear console output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* I/O Panel Contents */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed bg-[#0a0e14]">
            {activeIoTab === 'stdin' && (
              <div className="h-full flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Enter input values to be fed into STDIN before running:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStdinInput('Venkatesh')}
                      className="text-emerald-400 hover:underline"
                    >
                      Sample Name
                    </button>
                    <button
                      type="button"
                      onClick={() => setStdinInput('10\n20\n30')}
                      className="text-sky-400 hover:underline"
                    >
                      Sample Numbers
                    </button>
                    <button
                      type="button"
                      onClick={() => setStdinInput('')}
                      className="text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={stdinInput}
                  onChange={e => setStdinInput(e.target.value)}
                  placeholder="Enter STDIN inputs here (e.g. text or line-separated numbers like 10\n20)..."
                  className="flex-1 w-full bg-black/80 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            )}

            {activeIoTab === 'args' && (
              <div className="h-full flex flex-col space-y-2">
                <div className="text-[11px] text-slate-400">
                  Provide command line arguments passed into <code className="text-sky-300">argv</code> (separated by spaces):
                </div>
                <input
                  type="text"
                  value={commandLineArgs}
                  onChange={e => setCommandLineArgs(e.target.value)}
                  placeholder="e.g. --verbose --port=8080 input.txt"
                  className="w-full bg-black/80 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-sky-300 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
                <div className="text-[11px] text-slate-500">
                  Arguments will be passed directly into your program's main function arguments.
                </div>
              </div>
            )}

            {activeIoTab === 'flags' && (
              <div className="h-full flex flex-col space-y-2">
                <div className="text-[11px] text-slate-400">
                  Specify compiler optimization flags and standard arguments:
                </div>
                <input
                  type="text"
                  value={compilerFlags}
                  onChange={e => setCompilerFlags(e.target.value)}
                  placeholder="e.g. -O2 -Wall -std=c++20"
                  className="w-full bg-black/80 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <div className="text-[11px] text-slate-500">
                  Flags optimize binary compilation output and enforce strict syntax checks.
                </div>
              </div>
            )}

            {activeIoTab === 'output' && (
              <div className="h-full flex flex-col">
                <pre className={`flex-1 whitespace-pre-wrap font-mono text-xs select-text ${
                  isErrorState ? 'text-rose-300' : 'text-slate-200'
                }`}>
                  {consoleOutput}
                </pre>
              </div>
            )}

            {activeIoTab === 'preview' && (
              <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden border border-slate-700">
                <iframe
                  title="Live Web Preview"
                  srcDoc={code}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">OnlineGDB Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Run Code</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded font-mono font-bold">F9 or Ctrl + Enter</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Indent Code</span>
                <kbd className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Format Code</span>
                <span className="text-amber-400 font-medium">Click "Format" Button</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Clear Output</span>
                <span className="text-rose-400 font-medium">Click Trash Icon</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-300 font-medium">Switch Layout</span>
                <span className="text-sky-400 font-medium">Horizontal / Vertical / Fullscreen</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
