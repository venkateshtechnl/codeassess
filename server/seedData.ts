/**
 * CodeAssess Seed Data
 * Contains full course hierarchies (C, C++, Java, Python), 5 levels each,
 * structured modules, 30+ comprehensive problems with sample and hidden test cases,
 * sample users (Trainer & Students), and trainer learning materials.
 */

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  courseId: 'c' | 'cpp' | 'java' | 'python';
  levelNumber: number; // 1 to 5
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
  starterCode: {
    c?: string;
    cpp?: string;
    java?: string;
    python?: string;
  };
}

export interface Module {
  id: string;
  courseId: 'c' | 'cpp' | 'java' | 'python';
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
  id: 'c' | 'cpp' | 'java' | 'python';
  name: string;
  badge: string;
  iconName: string;
  description: string;
  levels: Level[];
  classroomUrl: string;
}

export interface Material {
  id: string;
  courseId: 'c' | 'cpp' | 'java' | 'python';
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

export const COURSES: Course[] = [
  {
    id: 'java',
    name: 'Java Programming',
    badge: 'Java 21 LTS',
    iconName: 'Coffee',
    description: 'Master object-oriented programming, data structures, and algorithmic problem solving with modern Java.',
    classroomUrl: 'https://classroom.google.com',
    levels: [
      { levelNumber: 1, name: 'Basics & Syntax', description: 'Variables, primitive data types, Scanner I/O, and arithmetic foundations.' },
      { levelNumber: 2, name: 'Operators & Conditionals', description: 'Relational, logical operators, if-else branches, and switch statements.' },
      { levelNumber: 3, name: 'Loops & Problem Solving', description: 'for, while, nested iterations, number analysis, and pyramid patterns.' },
      { levelNumber: 4, name: 'Arrays, Strings & Methods', description: '1D/2D arrays, string manipulation, method modularity, and recursion.' },
      { levelNumber: 5, name: 'OOP & DSA Foundations', description: 'Classes, encapsulation, inheritance, polymorphism, and basic data structures.' }
    ]
  },
  {
    id: 'c',
    name: 'C Programming',
    badge: 'C17 Standard',
    iconName: 'Cpu',
    description: 'Learn procedural fundamentals, memory layout, pointers, and high-performance system programming in C.',
    classroomUrl: 'https://classroom.google.com',
    levels: [
      { levelNumber: 1, name: 'C Syntax & Fundamentals', description: 'Standard I/O with printf/scanf, data types, format specifiers, and arithmetic.' },
      { levelNumber: 2, name: 'Control Flow & Logic', description: 'Decision making, ternary operators, relational checks, and nested branching.' },
      { levelNumber: 3, name: 'Iteration & Number Logic', description: 'While, for loops, prime testing, digit extractions, and ASCII patterns.' },
      { levelNumber: 4, name: 'Arrays, Strings & Pointers', description: 'Contiguous memory, pointer arithmetic, string.h utilities, and functions.' },
      { levelNumber: 5, name: 'Structures & Memory Management', description: 'struct, union, malloc/free heap management, and file operations.' }
    ]
  },
  {
    id: 'cpp',
    name: 'C++ Programming',
    badge: 'C++20 ISO',
    iconName: 'Code',
    description: 'Object-oriented programming, modern STL containers, algorithms, and high-performance competitive coding.',
    classroomUrl: 'https://classroom.google.com',
    levels: [
      { levelNumber: 1, name: 'Modern C++ Foundations', description: 'cin/cout, namespaces, references, auto type deduction, and core math.' },
      { levelNumber: 2, name: 'Branching & Expressions', description: 'Conditional logic, boolean algebra, switch-case, and operator precedence.' },
      { levelNumber: 3, name: 'Loops & Algorithmic Patterns', description: 'Loop constructs, series computation, nested pattern generation, and math algorithms.' },
      { levelNumber: 4, name: 'STL Vectors, Strings & Functions', description: 'std::vector, std::string, passing by reference, recursion, and sorting.' },
      { levelNumber: 5, name: 'Classes, OOP & Advanced STL', description: 'Encapsulation, constructors, operator overloading, maps, sets, and algorithms.' }
    ]
  },
  {
    id: 'python',
    name: 'Python 3',
    badge: 'Python 3.12',
    iconName: 'Terminal',
    description: 'Clean syntax, dynamic typing, list comprehensions, data structures, and pragmatic problem solving.',
    classroomUrl: 'https://classroom.google.com',
    levels: [
      { levelNumber: 1, name: 'Python Basics & I/O', description: 'Dynamic variables, print(), input(), type casting, and string basics.' },
      { levelNumber: 2, name: 'Decisions & Boolean Logic', description: 'if, elif, else, logical and/or/not operators, and membership checks.' },
      { levelNumber: 3, name: 'Loops & Iterables', description: 'for in range(), while loops, break/continue, math logic, and pattern prints.' },
      { levelNumber: 4, name: 'Lists, Dictionaries & Functions', description: 'List methods, comprehensions, dict mapping, tuples, and custom functions.' },
      { levelNumber: 5, name: 'OOP & Pythonic DSA', description: 'Classes, magic methods, recursion, searching algorithms, and stack/queue logic.' }
    ]
  }
];

export const MODULES: Module[] = [
  // Java Modules
  { id: 'java-m1', courseId: 'java', levelNumber: 1, title: 'Input, Output & Variables', description: 'Master Scanner, System.out.println, and primitive arithmetic.' },
  { id: 'java-m2', courseId: 'java', levelNumber: 2, title: 'Conditional Branching', description: 'If-else statements, relational logic, and switch conditions.' },
  { id: 'java-m3', courseId: 'java', levelNumber: 3, title: 'Loops & Number Theory', description: 'For loops, while loops, prime numbers, and digit extraction.' },
  { id: 'java-m4', courseId: 'java', levelNumber: 4, title: 'Arrays & String Operations', description: 'Array iteration, searching, sorting, and string methods.' },
  { id: 'java-m5', courseId: 'java', levelNumber: 5, title: 'OOP Principles & Data Structures', description: 'Classes, objects, constructors, and stack/list problem solving.' },

  // C Modules
  { id: 'c-m1', courseId: 'c', levelNumber: 1, title: 'Basic I/O & Types', description: 'Printf, scanf, format specifiers, and basic math calculations.' },
  { id: 'c-m2', courseId: 'c', levelNumber: 2, title: 'Conditions & Logical Operators', description: 'Relational operations, branching logic, and decision tables.' },
  { id: 'c-m3', courseId: 'c', levelNumber: 3, title: 'Iterative Problem Solving', description: 'While/for loops, mathematical series, and number checks.' },
  { id: 'c-m4', courseId: 'c', levelNumber: 4, title: '1D Arrays & Pointer Basics', description: 'Array traversal, pointer referencing, and string utilities.' },
  { id: 'c-m5', courseId: 'c', levelNumber: 5, title: 'Structures & Algorithmic Logic', description: 'Custom data structures, search algorithms, and modular functions.' },

  // C++ Modules
  { id: 'cpp-m1', courseId: 'cpp', levelNumber: 1, title: 'Streams & Variables', description: 'cin, cout, fast I/O, and primitive manipulations.' },
  { id: 'cpp-m2', courseId: 'cpp', levelNumber: 2, title: 'Branching & Conditions', description: 'Conditional flow, compound conditionals, and switch statements.' },
  { id: 'cpp-m3', courseId: 'cpp', levelNumber: 3, title: 'Iterative Algorithms', description: 'Loop optimizations, pattern generation, and number theory.' },
  { id: 'cpp-m4', courseId: 'cpp', levelNumber: 4, title: 'Vectors & String Manipulation', description: 'std::vector operations, string processing, and sort algorithms.' },
  { id: 'cpp-m5', courseId: 'cpp', levelNumber: 5, title: 'Classes & STL Containers', description: 'Class structures, encapsulation, and container algorithms.' },

  // Python Modules
  { id: 'py-m1', courseId: 'python', levelNumber: 1, title: 'Syntax, Print & Input', description: 'input(), print(sep/end), type conversions, and arithmetic.' },
  { id: 'py-m2', courseId: 'python', levelNumber: 2, title: 'Conditionals & Booleans', description: 'if, elif, else, boolean algebra, and membership tests.' },
  { id: 'py-m3', courseId: 'python', levelNumber: 3, title: 'Loops & Sequences', description: 'for in range, while iterations, digit sums, and series.' },
  { id: 'py-m4', courseId: 'python', levelNumber: 4, title: 'Lists, Strings & Functions', description: 'Slicing, list methods, string manipulation, and custom defs.' },
  { id: 'py-m5', courseId: 'python', levelNumber: 5, title: 'Classes, OOP & Problem Solving', description: 'Object orientation, recursion, and algorithmic techniques.' }
];

export const INITIAL_PROBLEMS: Problem[] = [
  // ================= JAVA LEVEL 1 =================
  {
    id: 'java-p101',
    courseId: 'java',
    levelNumber: 1,
    moduleId: 'java-m1',
    title: 'Sum of Two Numbers',
    difficulty: 'Easy',
    points: 10,
    description: 'Read two integers from standard input and print their arithmetic sum.',
    inputFormat: 'Two space-separated integers A and B on a single line.',
    outputFormat: 'Print the integer sum of A and B.',
    constraints: '-10^9 <= A, B <= 10^9',
    exampleInput: '15 25',
    exampleOutput: '40',
    explanation: '15 + 25 = 40',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong();
        long b = sc.nextLong();
        // Write your solution below
        System.out.println(a + b);
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '15 25', expectedOutput: '40', isHidden: false },
      { id: 'tc2', input: '-10 30', expectedOutput: '20', isHidden: false },
      { id: 'tc3', input: '1000000 2000000', expectedOutput: '3000000', isHidden: true },
      { id: 'tc4', input: '0 0', expectedOutput: '0', isHidden: true }
    ]
  },
  {
    id: 'java-p102',
    courseId: 'java',
    levelNumber: 1,
    moduleId: 'java-m1',
    title: 'Simple Interest Calculator',
    difficulty: 'Easy',
    points: 10,
    description: 'Given principal P, annual interest rate R (in percent), and time T (in years), compute the Simple Interest rounded to 2 decimal places.',
    inputFormat: 'Three space-separated numbers: P (double), R (double), T (double).',
    outputFormat: 'Print the simple interest formatted with 2 decimal places (e.g. 150.00).',
    constraints: '1 <= P <= 10^7, 0 <= R <= 100, 1 <= T <= 50',
    exampleInput: '1000 5 2',
    exampleOutput: '100.00',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        double p = sc.nextDouble();
        double r = sc.nextDouble();
        double t = sc.nextDouble();
        double si = (p * r * t) / 100.0;
        System.out.printf("%.2f\\n", si);
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '1000 5 2', expectedOutput: '100.00', isHidden: false },
      { id: 'tc2', input: '2500 7.5 3', expectedOutput: '562.50', isHidden: false },
      { id: 'tc3', input: '50000 8.25 5', expectedOutput: '20625.00', isHidden: true }
    ]
  },

  // ================= JAVA LEVEL 2 =================
  {
    id: 'java-p201',
    courseId: 'java',
    levelNumber: 2,
    moduleId: 'java-m2',
    title: 'Check Leap Year',
    difficulty: 'Easy',
    points: 10,
    description: 'Determine whether a given year Y is a leap year according to the Gregorian calendar rules. A year is leap if it is divisible by 4, except century years which must be divisible by 400.',
    inputFormat: 'A single positive integer Y representing the year.',
    outputFormat: 'Print "Leap Year" if it is a leap year, otherwise print "Not a Leap Year".',
    constraints: '1 <= Y <= 9999',
    exampleInput: '2024',
    exampleOutput: 'Leap Year',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int year = sc.nextInt();
        boolean isLeap = (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
        if (isLeap) {
            System.out.println("Leap Year");
        } else {
            System.out.println("Not a Leap Year");
        }
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '2024', expectedOutput: 'Leap Year', isHidden: false },
      { id: 'tc2', input: '1900', expectedOutput: 'Not a Leap Year', isHidden: false },
      { id: 'tc3', input: '2000', expectedOutput: 'Leap Year', isHidden: true },
      { id: 'tc4', input: '2023', expectedOutput: 'Not a Leap Year', isHidden: true }
    ]
  },
  {
    id: 'java-p202',
    courseId: 'java',
    levelNumber: 2,
    moduleId: 'java-m2',
    title: 'Greatest of Three Numbers',
    difficulty: 'Easy',
    points: 10,
    description: 'Given three distinct integers A, B, and C, find and output the largest value among them.',
    inputFormat: 'Three space-separated integers A, B, and C.',
    outputFormat: 'Print the maximum integer.',
    constraints: '-10^6 <= A, B, C <= 10^6',
    exampleInput: '45 89 23',
    exampleOutput: '89',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        int c = sc.nextInt();
        int max = Math.max(a, Math.max(b, c));
        System.out.println(max);
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '45 89 23', expectedOutput: '89', isHidden: false },
      { id: 'tc2', input: '-10 -5 -20', expectedOutput: '-5', isHidden: false },
      { id: 'tc3', input: '100 20 50', expectedOutput: '100', isHidden: true }
    ]
  },

  // ================= JAVA LEVEL 3 =================
  {
    id: 'java-p301',
    courseId: 'java',
    levelNumber: 3,
    moduleId: 'java-m3',
    title: 'Check Prime Number',
    difficulty: 'Medium',
    points: 20,
    description: 'Given an integer N, determine if it is a prime number. A prime number is greater than 1 and has no positive divisors other than 1 and itself.',
    inputFormat: 'A single integer N.',
    outputFormat: 'Print "Prime" if N is prime, otherwise print "Not Prime".',
    constraints: '1 <= N <= 10^9',
    exampleInput: '17',
    exampleOutput: 'Prime',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        if (n <= 1) {
            System.out.println("Not Prime");
            return;
        }
        boolean isPrime = true;
        for (long i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
        System.out.println(isPrime ? "Prime" : "Not Prime");
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '17', expectedOutput: 'Prime', isHidden: false },
      { id: 'tc2', input: '4', expectedOutput: 'Not Prime', isHidden: false },
      { id: 'tc3', input: '1', expectedOutput: 'Not Prime', isHidden: true },
      { id: 'tc4', input: '997', expectedOutput: 'Prime', isHidden: true },
      { id: 'tc5', input: '1000000007', expectedOutput: 'Prime', isHidden: true }
    ]
  },
  {
    id: 'java-p302',
    courseId: 'java',
    levelNumber: 3,
    moduleId: 'java-m3',
    title: 'Reverse a Number',
    difficulty: 'Medium',
    points: 20,
    description: 'Given a non-negative integer N, reverse its digits. Leading zeros in the reversed number should be eliminated (e.g. 120 -> 21).',
    inputFormat: 'A single non-negative integer N.',
    outputFormat: 'Print the reversed integer.',
    constraints: '0 <= N <= 2 * 10^9',
    exampleInput: '12345',
    exampleOutput: '54321',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        long rev = 0;
        while (n > 0) {
            rev = rev * 10 + (n % 10);
            n /= 10;
        }
        System.out.println(rev);
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '12345', expectedOutput: '54321', isHidden: false },
      { id: 'tc2', input: '120', expectedOutput: '21', isHidden: false },
      { id: 'tc3', input: '7', expectedOutput: '7', isHidden: true },
      { id: 'tc4', input: '900000', expectedOutput: '9', isHidden: true }
    ]
  },
  {
    id: 'java-p303',
    courseId: 'java',
    levelNumber: 3,
    moduleId: 'java-m3',
    title: 'Fibonacci Series up to N',
    difficulty: 'Medium',
    points: 20,
    description: 'Print the first N terms of the Fibonacci sequence starting from 0 and 1. Terms must be space-separated.',
    inputFormat: 'A single positive integer N.',
    outputFormat: 'Print the first N terms separated by a single space.',
    constraints: '1 <= N <= 40',
    exampleInput: '6',
    exampleOutput: '0 1 1 2 3 5',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            System.out.print(a + (i == n - 1 ? "" : " "));
            long next = a + b;
            a = b;
            b = next;
        }
        System.out.println();
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '6', expectedOutput: '0 1 1 2 3 5', isHidden: false },
      { id: 'tc2', input: '1', expectedOutput: '0', isHidden: false },
      { id: 'tc3', input: '8', expectedOutput: '0 1 1 2 3 5 8 13', isHidden: true }
    ]
  },

  // ================= JAVA LEVEL 4 =================
  {
    id: 'java-p401',
    courseId: 'java',
    levelNumber: 4,
    moduleId: 'java-m4',
    title: 'Find Second Largest in Array',
    difficulty: 'Medium',
    points: 20,
    description: 'Given an array of N integers, find the second largest distinct element. If no second largest distinct element exists, print -1.',
    inputFormat: 'First line: integer N. Second line: N space-separated integers.',
    outputFormat: 'Print the second largest distinct integer or -1.',
    constraints: '1 <= N <= 10^5, -10^9 <= A[i] <= 10^9',
    exampleInput: '5\n12 35 1 10 34',
    exampleOutput: '34',
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        long[] arr = new long[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextLong();
        
        long first = Long.MIN_VALUE, second = Long.MIN_VALUE;
        for (long num : arr) {
            if (num > first) {
                second = first;
                first = num;
            } else if (num < first && num > second) {
                second = num;
            }
        }
        if (second == Long.MIN_VALUE) System.out.println(-1);
        else System.out.println(second);
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '5\n12 35 1 10 34', expectedOutput: '34', isHidden: false },
      { id: 'tc2', input: '3\n10 10 10', expectedOutput: '-1', isHidden: false },
      { id: 'tc3', input: '6\n5 9 2 8 9 4', expectedOutput: '8', isHidden: true }
    ]
  },
  {
    id: 'java-p402',
    courseId: 'java',
    levelNumber: 4,
    moduleId: 'java-m4',
    title: 'Palindrome String Check',
    difficulty: 'Easy',
    points: 10,
    description: 'Check whether a given string is a palindrome (ignoring casing and whitespace).',
    inputFormat: 'A string S on a single line.',
    outputFormat: 'Print "YES" if palindrome, otherwise "NO".',
    constraints: '1 <= |S| <= 10^4',
    exampleInput: 'RaceCar',
    exampleOutput: 'YES',
    starterCode: {
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().replaceAll("\\\\s+", "").toLowerCase();
        int l = 0, r = s.length() - 1;
        boolean ok = true;
        while (l < r) {
            if (s.charAt(l) != s.charAt(r)) {
                ok = false;
                break;
            }
            l++;
            r--;
        }
        System.out.println(ok ? "YES" : "NO");
    }
}`
    },
    testCases: [
      { id: 'tc1', input: 'RaceCar', expectedOutput: 'YES', isHidden: false },
      { id: 'tc2', input: 'Hello World', expectedOutput: 'NO', isHidden: false },
      { id: 'tc3', input: 'a', expectedOutput: 'YES', isHidden: true },
      { id: 'tc4', input: 'Deified', expectedOutput: 'YES', isHidden: true }
    ]
  },

  // ================= JAVA LEVEL 5 =================
  {
    id: 'java-p501',
    courseId: 'java',
    levelNumber: 5,
    moduleId: 'java-m5',
    title: 'Valid Parentheses',
    difficulty: 'Hard',
    points: 30,
    description: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Brackets must close in the correct order with matching open bracket types.',
    inputFormat: 'A single string S containing bracket symbols.',
    outputFormat: 'Print "Valid" if balanced, else "Invalid".',
    constraints: '1 <= |S| <= 10^5',
    exampleInput: '{[()]}',
    exampleOutput: 'Valid',
    starterCode: {
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        Stack<Character> stack = new Stack<>();
        boolean valid = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { valid = false; break; }
                char top = stack.pop();
                if ((c == ')' && top != '(') ||
                    (c == '}' && top != '{') ||
                    (c == ']' && top != '[')) {
                    valid = false;
                    break;
                }
            }
        }
        if (valid && stack.isEmpty()) {
            System.out.println("Valid");
        } else {
            System.out.println("Invalid");
        }
    }
}`
    },
    testCases: [
      { id: 'tc1', input: '{[()]}', expectedOutput: 'Valid', isHidden: false },
      { id: 'tc2', input: '([)]', expectedOutput: 'Invalid', isHidden: false },
      { id: 'tc3', input: '((()', expectedOutput: 'Invalid', isHidden: true },
      { id: 'tc4', input: '()[]{}', expectedOutput: 'Valid', isHidden: true }
    ]
  },

  // ================= C LEVEL 1 to 5 =================
  {
    id: 'c-p101',
    courseId: 'c',
    levelNumber: 1,
    moduleId: 'c-m1',
    title: 'Odd or Even in C',
    difficulty: 'Easy',
    points: 10,
    description: 'Given an integer N, print "Even" if the number is even and "Odd" if the number is odd.',
    inputFormat: 'A single integer N.',
    outputFormat: 'Print "Even" or "Odd".',
    constraints: '-10^9 <= N <= 10^9',
    exampleInput: '42',
    exampleOutput: 'Even',
    starterCode: {
      c: `#include <stdio.h>

int main() {
    long long n;
    if (scanf("%lld", &n) == 1) {
        if (n % 2 == 0) {
            printf("Even\\n");
        } else {
            printf("Odd\\n");
        }
    }
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '42', expectedOutput: 'Even', isHidden: false },
      { id: 'tc2', input: '17', expectedOutput: 'Odd', isHidden: false },
      { id: 'tc3', input: '0', expectedOutput: 'Even', isHidden: true },
      { id: 'tc4', input: '-5', expectedOutput: 'Odd', isHidden: true }
    ]
  },
  {
    id: 'c-p201',
    courseId: 'c',
    levelNumber: 2,
    moduleId: 'c-m2',
    title: 'Quadrant of a Point',
    difficulty: 'Easy',
    points: 10,
    description: 'Given 2D coordinates (X, Y), determine the quadrant: "Q1", "Q2", "Q3", "Q4", "Origin", or "Axis".',
    inputFormat: 'Two space-separated integers X and Y.',
    outputFormat: 'Print the quadrant identifier.',
    constraints: '-10^6 <= X, Y <= 10^6',
    exampleInput: '4 -3',
    exampleOutput: 'Q4',
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    if (x == 0 && y == 0) printf("Origin\\n");
    else if (x == 0 || y == 0) printf("Axis\\n");
    else if (x > 0 && y > 0) printf("Q1\\n");
    else if (x < 0 && y > 0) printf("Q2\\n");
    else if (x < 0 && y < 0) printf("Q3\\n");
    else printf("Q4\\n");
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '4 -3', expectedOutput: 'Q4', isHidden: false },
      { id: 'tc2', input: '-5 -5', expectedOutput: 'Q3', isHidden: false },
      { id: 'tc3', input: '0 0', expectedOutput: 'Origin', isHidden: true },
      { id: 'tc4', input: '10 20', expectedOutput: 'Q1', isHidden: true }
    ]
  },
  {
    id: 'c-p301',
    courseId: 'c',
    levelNumber: 3,
    moduleId: 'c-m3',
    title: 'Factorial of a Number',
    difficulty: 'Medium',
    points: 20,
    description: 'Compute the factorial N! for a non-negative integer N.',
    inputFormat: 'Single non-negative integer N.',
    outputFormat: 'Print N!',
    constraints: '0 <= N <= 20',
    exampleInput: '5',
    exampleOutput: '120',
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    unsigned long long fact = 1;
    for (int i = 2; i <= n; i++) {
        fact *= i;
    }
    printf("%llu\\n", fact);
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '5', expectedOutput: '120', isHidden: false },
      { id: 'tc2', input: '0', expectedOutput: '1', isHidden: false },
      { id: 'tc3', input: '10', expectedOutput: '3628800', isHidden: true }
    ]
  },
  {
    id: 'c-p401',
    courseId: 'c',
    levelNumber: 4,
    moduleId: 'c-m4',
    title: 'Array Elements Inversion Count',
    difficulty: 'Medium',
    points: 20,
    description: 'Given an array of N integers, reverse the array in-place and print the reversed elements separated by spaces.',
    inputFormat: 'First line: N. Second line: N space-separated integers.',
    outputFormat: 'N reversed integers separated by space.',
    constraints: '1 <= N <= 10^4',
    exampleInput: '5\n1 2 3 4 5',
    exampleOutput: '5 4 3 2 1',
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = n - 1; i >= 0; i--) {
        printf("%d%s", a[i], i == 0 ? "" : " ");
    }
    printf("\\n");
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
      { id: 'tc2', input: '3\n10 20 30', expectedOutput: '30 20 10', isHidden: false },
      { id: 'tc3', input: '1\n99', expectedOutput: '99', isHidden: true }
    ]
  },
  {
    id: 'c-p501',
    courseId: 'c',
    levelNumber: 5,
    moduleId: 'c-m5',
    title: 'Binary Search Implementation',
    difficulty: 'Hard',
    points: 30,
    description: 'Given a sorted array of N integers and a target key K, find the 0-based index of K. If not present, print -1.',
    inputFormat: 'Line 1: N and K. Line 2: N sorted space-separated integers.',
    outputFormat: 'Index of K or -1.',
    constraints: '1 <= N <= 10^5, -10^9 <= K, A[i] <= 10^9',
    exampleInput: '5 15\n3 8 15 22 40',
    exampleOutput: '2',
    starterCode: {
      c: `#include <stdio.h>

int main() {
    int n;
    long long k;
    scanf("%d %lld", &n, &k);
    long long a[n];
    for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
    
    int low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (a[mid] == k) {
            ans = mid;
            break;
        } else if (a[mid] < k) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    printf("%d\\n", ans);
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '5 15\n3 8 15 22 40', expectedOutput: '2', isHidden: false },
      { id: 'tc2', input: '4 99\n1 2 3 4', expectedOutput: '-1', isHidden: false },
      { id: 'tc3', input: '6 1\n1 3 5 7 9 11', expectedOutput: '0', isHidden: true }
    ]
  },

  // ================= C++ LEVEL 1 to 5 =================
  {
    id: 'cpp-p101',
    courseId: 'cpp',
    levelNumber: 1,
    moduleId: 'cpp-m1',
    title: 'Temperature Converter (C to F)',
    difficulty: 'Easy',
    points: 10,
    description: 'Convert a temperature given in Celsius C to Fahrenheit F: F = (C * 9/5) + 32. Print result rounded to 1 decimal place.',
    inputFormat: 'Single floating point number C.',
    outputFormat: 'Print temperature in Fahrenheit with 1 decimal place (e.g. 98.6).',
    constraints: '-100 <= C <= 200',
    exampleInput: '37',
    exampleOutput: '98.6',
    starterCode: {
      cpp: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double c;
    if (cin >> c) {
        double f = (c * 9.0 / 5.0) + 32.0;
        cout << fixed << setprecision(1) << f << endl;
    }
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '37', expectedOutput: '98.6', isHidden: false },
      { id: 'tc2', input: '0', expectedOutput: '32.0', isHidden: false },
      { id: 'tc3', input: '100', expectedOutput: '212.0', isHidden: true },
      { id: 'tc4', input: '-40', expectedOutput: '-40.0', isHidden: true }
    ]
  },
  {
    id: 'cpp-p201',
    courseId: 'cpp',
    levelNumber: 2,
    moduleId: 'cpp-m2',
    title: 'Triangle Type Classifier',
    difficulty: 'Easy',
    points: 10,
    description: 'Given three side lengths A, B, and C, classify whether they form an: "Equilateral", "Isosceles", "Scalene", or "Invalid" triangle.',
    inputFormat: 'Three space-separated integers A, B, and C.',
    outputFormat: 'Print the classification string.',
    constraints: '1 <= A, B, C <= 10^4',
    exampleInput: '5 5 5',
    exampleOutput: 'Equilateral',
    starterCode: {
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long a, b, c;
    cin >> a >> b >> c;
    if (a + b <= c || a + c <= b || b + c <= a) {
        cout << "Invalid" << endl;
    } else if (a == b && b == c) {
        cout << "Equilateral" << endl;
    } else if (a == b || b == c || a == c) {
        cout << "Isosceles" << endl;
    } else {
        cout << "Scalene" << endl;
    }
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '5 5 5', expectedOutput: 'Equilateral', isHidden: false },
      { id: 'tc2', input: '5 5 8', expectedOutput: 'Isosceles', isHidden: false },
      { id: 'tc3', input: '3 4 5', expectedOutput: 'Scalene', isHidden: false },
      { id: 'tc4', input: '1 2 10', expectedOutput: 'Invalid', isHidden: true }
    ]
  },
  {
    id: 'cpp-p301',
    courseId: 'cpp',
    levelNumber: 3,
    moduleId: 'cpp-m3',
    title: 'Armstrong Number Check',
    difficulty: 'Medium',
    points: 20,
    description: 'An Armstrong number of k digits is an integer such that the sum of its digits raised to the power k equals the number itself. Determine if N is an Armstrong number.',
    inputFormat: 'A positive integer N.',
    outputFormat: 'Print "Armstrong" or "Not Armstrong".',
    constraints: '1 <= N <= 10^8',
    exampleInput: '153',
    exampleOutput: 'Armstrong',
    starterCode: {
      cpp: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

int main() {
    long long n;
    cin >> n;
    string s = to_string(n);
    int k = s.length();
    long long sum = 0;
    for (char c : s) {
        sum += pow(c - '0', k);
    }
    if (sum == n) cout << "Armstrong" << endl;
    else cout << "Not Armstrong" << endl;
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '153', expectedOutput: 'Armstrong', isHidden: false },
      { id: 'tc2', input: '120', expectedOutput: 'Not Armstrong', isHidden: false },
      { id: 'tc3', input: '370', expectedOutput: 'Armstrong', isHidden: true },
      { id: 'tc4', input: '9474', expectedOutput: 'Armstrong', isHidden: true }
    ]
  },
  {
    id: 'cpp-p401',
    courseId: 'cpp',
    levelNumber: 4,
    moduleId: 'cpp-m4',
    title: 'Sort and Count Inversions using STL',
    difficulty: 'Medium',
    points: 20,
    description: 'Given N integers, sort them in ascending order and print them on one line separated by spaces.',
    inputFormat: 'Line 1: N. Line 2: N space-separated integers.',
    outputFormat: 'Sorted integers separated by space.',
    constraints: '1 <= N <= 10^5',
    exampleInput: '6\n7 2 9 1 5 3',
    exampleOutput: '1 2 3 5 7 9',
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<long long> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    sort(v.begin(), v.end());
    for (int i = 0; i < n; i++) {
        cout << v[i] << (i == n - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '6\n7 2 9 1 5 3', expectedOutput: '1 2 3 5 7 9', isHidden: false },
      { id: 'tc2', input: '3\n3 2 1', expectedOutput: '1 2 3', isHidden: false },
      { id: 'tc3', input: '5\n10 10 10 10 10', expectedOutput: '10 10 10 10 10', isHidden: true }
    ]
  },
  {
    id: 'cpp-p501',
    courseId: 'cpp',
    levelNumber: 5,
    moduleId: 'cpp-m5',
    title: 'Two Sum Target Search',
    difficulty: 'Hard',
    points: 30,
    description: 'Given an array of N integers and a target sum T, determine whether there exist two distinct indices whose elements sum to T.',
    inputFormat: 'Line 1: N and T. Line 2: N space-separated integers.',
    outputFormat: 'Print "YES" if such a pair exists, otherwise "NO".',
    constraints: '2 <= N <= 10^5, -10^9 <= T, A[i] <= 10^9',
    exampleInput: '5 9\n2 7 11 15 3',
    exampleOutput: 'YES',
    starterCode: {
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

int main() {
    int n;
    long long t;
    cin >> n >> t;
    unordered_set<long long> seen;
    bool found = false;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        if (seen.count(t - x)) {
            found = true;
        }
        seen.insert(x);
    }
    cout << (found ? "YES" : "NO") << endl;
    return 0;
}`
    },
    testCases: [
      { id: 'tc1', input: '5 9\n2 7 11 15 3', expectedOutput: 'YES', isHidden: false },
      { id: 'tc2', input: '4 10\n1 2 3 4', expectedOutput: 'NO', isHidden: false },
      { id: 'tc3', input: '3 6\n3 3 1', expectedOutput: 'YES', isHidden: true }
    ]
  },

  // ================= PYTHON LEVEL 1 to 5 =================
  {
    id: 'py-p101',
    courseId: 'python',
    levelNumber: 1,
    moduleId: 'py-m1',
    title: 'Formatted Greeting & Length',
    difficulty: 'Easy',
    points: 10,
    description: 'Given a person\'s name, print "Hello, {name}!" on line 1, and the length of the name on line 2.',
    inputFormat: 'A string representing the name.',
    outputFormat: 'Line 1: Hello, <name>!\nLine 2: Character length of the name.',
    constraints: '1 <= len(name) <= 100',
    exampleInput: 'Venkatesh',
    exampleOutput: 'Hello, Venkatesh!\n9',
    starterCode: {
      python: `name = input().strip()
print(f"Hello, {name}!")
print(len(name))
`
    },
    testCases: [
      { id: 'tc1', input: 'Venkatesh', expectedOutput: 'Hello, Venkatesh!\n9', isHidden: false },
      { id: 'tc2', input: 'Alex', expectedOutput: 'Hello, Alex!\n4', isHidden: false },
      { id: 'tc3', input: 'Coder', expectedOutput: 'Hello, Coder!\n5', isHidden: true }
    ]
  },
  {
    id: 'py-p201',
    courseId: 'python',
    levelNumber: 2,
    moduleId: 'py-m2',
    title: 'Electricity Bill Calculator',
    difficulty: 'Easy',
    points: 10,
    description: 'Calculate electricity charges based on units consumed:\n- First 100 units: $1.50 per unit\n- Next 100 units (101-200): $2.50 per unit\n- Above 200 units: $3.50 per unit\nPrint total bill with 2 decimal places.',
    inputFormat: 'A non-negative integer representing units.',
    outputFormat: 'Total bill formatted to 2 decimals.',
    constraints: '0 <= units <= 10000',
    exampleInput: '150',
    exampleOutput: '275.00',
    starterCode: {
      python: `units = int(input().strip())
bill = 0.0

if units <= 100:
    bill = units * 1.50
elif units <= 200:
    bill = (100 * 1.50) + ((units - 100) * 2.50)
else:
    bill = (100 * 1.50) + (100 * 2.50) + ((units - 200) * 3.50)

print(f"{bill:.2f}")
`
    },
    testCases: [
      { id: 'tc1', input: '150', expectedOutput: '275.00', isHidden: false },
      { id: 'tc2', input: '80', expectedOutput: '120.00', isHidden: false },
      { id: 'tc3', input: '250', expectedOutput: '575.00', isHidden: true }
    ]
  },
  {
    id: 'py-p301',
    courseId: 'python',
    levelNumber: 3,
    moduleId: 'py-m3',
    title: 'Sum of Digits in Python',
    difficulty: 'Medium',
    points: 20,
    description: 'Given an integer N, find the sum of its digits.',
    inputFormat: 'An integer N.',
    outputFormat: 'Print the sum of digits.',
    constraints: '0 <= N <= 10^18',
    exampleInput: '9875',
    exampleOutput: '29',
    starterCode: {
      python: `n = input().strip()
total = sum(int(ch) for ch in n if ch.isdigit())
print(total)
`
    },
    testCases: [
      { id: 'tc1', input: '9875', expectedOutput: '29', isHidden: false },
      { id: 'tc2', input: '1000', expectedOutput: '1', isHidden: false },
      { id: 'tc3', input: '0', expectedOutput: '0', isHidden: true },
      { id: 'tc4', input: '999999999', expectedOutput: '81', isHidden: true }
    ]
  },
  {
    id: 'py-p401',
    courseId: 'python',
    levelNumber: 4,
    moduleId: 'py-m4',
    title: 'Word Frequency Counter',
    difficulty: 'Medium',
    points: 20,
    description: 'Given a space-separated sentence, count the frequency of each unique lowercase word. Print words sorted alphabetically with their count formatted as "word: count".',
    inputFormat: 'A sentence on a single line.',
    outputFormat: 'Each unique word and count on its own line: "<word>: <count>".',
    constraints: '1 <= words <= 1000',
    exampleInput: 'apple banana apple orange banana apple',
    exampleOutput: 'apple: 3\nbanana: 2\norange: 1',
    starterCode: {
      python: `import sys

line = sys.stdin.read().strip()
if line:
    words = line.lower().split()
    counts = {}
    for w in words:
        counts[w] = counts.get(w, 0) + 1
    for w in sorted(counts.keys()):
        print(f"{w}: {counts[w]}")
`
    },
    testCases: [
      { id: 'tc1', input: 'apple banana apple orange banana apple', expectedOutput: 'apple: 3\nbanana: 2\norange: 1', isHidden: false },
      { id: 'tc2', input: 'Code code CODE learn', expectedOutput: 'code: 3\nlearn: 1', isHidden: false },
      { id: 'tc3', input: 'single', expectedOutput: 'single: 1', isHidden: true }
    ]
  },
  {
    id: 'py-p501',
    courseId: 'python',
    levelNumber: 5,
    moduleId: 'py-m5',
    title: 'Check Anagram Strings',
    difficulty: 'Hard',
    points: 30,
    description: 'Given two strings S1 and S2 on separate lines, determine whether they are anagrams of each other (contain the same characters with identical frequencies, case-sensitive).',
    inputFormat: 'Line 1: S1\nLine 2: S2',
    outputFormat: 'Print "Anagram" or "Not Anagram".',
    constraints: '1 <= len(S1), len(S2) <= 10^5',
    exampleInput: 'silent\nlisten',
    exampleOutput: 'Anagram',
    starterCode: {
      python: `import sys

lines = sys.stdin.read().splitlines()
if len(lines) >= 2:
    s1 = lines[0].strip()
    s2 = lines[1].strip()
    if sorted(s1) == sorted(s2):
        print("Anagram")
    else:
        print("Not Anagram")
`
    },
    testCases: [
      { id: 'tc1', input: 'silent\nlisten', expectedOutput: 'Anagram', isHidden: false },
      { id: 'tc2', input: 'hello\nworld', expectedOutput: 'Not Anagram', isHidden: false },
      { id: 'tc3', input: 'triangle\nintegral', expectedOutput: 'Anagram', isHidden: true }
    ]
  }
];

export const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    courseId: 'java',
    levelNumber: 1,
    moduleId: 'java-m1',
    title: 'Java Input & Output Comprehensive Notes',
    description: 'Complete reference guide covering Scanner vs BufferedReader, System.out.printf formatting tokens, and common edge cases with buffer flushing.',
    authorName: 'Venkatesh -TT',
    postedAt: '2026-09-24T10:00:00.000Z',
    attachmentName: 'Java_IO_and_Scanner_Guide.pdf',
    attachmentType: 'pdf',
    attachmentUrl: '#',
    externalLink: 'https://docs.oracle.com/en/java/'
  },
  {
    id: 'mat-2',
    courseId: 'java',
    levelNumber: 2,
    moduleId: 'java-m2',
    title: 'Conditional Branching & Switch Expressions Cheat Sheet',
    description: 'Detailed analysis of short-circuit evaluation (&& and ||), nested if traps, and enhanced switch statements with yield in Java 17/21.',
    authorName: 'Venkatesh -TT',
    postedAt: '2026-09-25T14:30:00.000Z',
    attachmentName: 'Conditionals_Mastery.docx',
    attachmentType: 'doc',
    attachmentUrl: '#'
  },
  {
    id: 'mat-3',
    courseId: 'java',
    levelNumber: 3,
    moduleId: 'java-m3',
    title: 'Number Theory & Loop Optimization for Interviews',
    description: 'Algorithms for O(sqrt(N)) prime checking, fast modular exponentiation, Sieve of Eratosthenes, and reversing numbers safely.',
    authorName: 'Venkatesh -TT',
    postedAt: '2026-09-26T08:15:00.000Z',
    attachmentName: 'Prime_and_Number_Theory.pdf',
    attachmentType: 'pdf',
    attachmentUrl: '#'
  },
  {
    id: 'mat-4',
    courseId: 'c',
    levelNumber: 1,
    moduleId: 'c-m1',
    title: 'C Memory Model & Formatted I/O',
    description: 'Deep dive into stack frame initialization, printf format string security, scanf return values, and buffer overflows.',
    authorName: 'Venkatesh -TT',
    postedAt: '2026-09-23T11:00:00.000Z',
    attachmentName: 'C_Basics_and_Memory.pdf',
    attachmentType: 'pdf'
  },
  {
    id: 'mat-5',
    courseId: 'python',
    levelNumber: 1,
    moduleId: 'py-m1',
    title: 'Pythonic Fundamentals & Type Casting',
    description: 'Understanding Python\'s dynamic type system, memory references, garbage collection, and input processing idioms.',
    authorName: 'Venkatesh -TT',
    postedAt: '2026-09-22T09:00:00.000Z',
    attachmentName: 'Python_Quickstart.pdf',
    attachmentType: 'pdf'
  }
];
