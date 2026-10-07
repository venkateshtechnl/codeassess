import React from 'react';

export interface CodeEditorKeyOptions {
  tabSize?: number;
  autoCloseBrackets?: boolean;
}

/**
 * Handles Tab, Shift+Tab, Enter (smart indentation), Backspace (indent boundary),
 * Auto-dedentation for closing brackets, and Auto-closing quotes/brackets for a code editor textarea.
 */
export function handleCodeEditorKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  code: string,
  onChange: (newCode: string) => void,
  options: CodeEditorKeyOptions = {}
) {
  const tabSize = options.tabSize || 4;
  const indentStr = ' '.repeat(tabSize);
  const textarea = e.currentTarget;
  const { selectionStart, selectionEnd, value } = textarea;

  // Helper to safely apply text updates and keep cursor in sync across React renders
  const applyUpdate = (newValue: string, cursorStart: number, cursorEnd: number = cursorStart) => {
    textarea.value = newValue;
    textarea.setSelectionRange(cursorStart, cursorEnd);
    onChange(newValue);
    // Double ensure in next microtask for React reconciler
    requestAnimationFrame(() => {
      if (document.activeElement === textarea) {
        textarea.setSelectionRange(cursorStart, cursorEnd);
      }
    });
  };

  // 1. TAB & SHIFT+TAB
  if (e.key === 'Tab') {
    e.preventDefault();

    // Multiline selection
    if (selectionStart !== selectionEnd && value.slice(selectionStart, selectionEnd).includes('\n')) {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEndIndex = value.indexOf('\n', selectionEnd);
      const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

      const selectedBlock = value.slice(lineStart, lineEnd);
      const lines = selectedBlock.split('\n');

      let modifiedLines: string[];
      if (e.shiftKey) {
        // Unindent
        modifiedLines = lines.map(line => {
          if (line.startsWith(indentStr)) return line.slice(tabSize);
          if (line.startsWith('\t')) return line.slice(1);
          const match = line.match(/^ +/);
          if (match) return line.slice(Math.min(match[0].length, tabSize));
          return line;
        });
      } else {
        // Indent
        modifiedLines = lines.map(line => indentStr + line);
      }

      const replacement = modifiedLines.join('\n');
      const newValue = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
      applyUpdate(newValue, lineStart, lineStart + replacement.length);
      return;
    }

    // Single line Shift+Tab
    if (e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const linePrefix = value.slice(lineStart, selectionStart);
      if (linePrefix.startsWith(indentStr)) {
        const newValue = value.slice(0, lineStart) + value.slice(lineStart + tabSize);
        const newPos = Math.max(lineStart, selectionStart - tabSize);
        applyUpdate(newValue, newPos, newPos);
      }
      return;
    }

    // Regular Tab: Insert 4 spaces
    const newValue = value.slice(0, selectionStart) + indentStr + value.slice(selectionEnd);
    const newPos = selectionStart + tabSize;
    applyUpdate(newValue, newPos, newPos);
    return;
  }

  // 2. ENTER (Smart Indentation)
  if (e.key === 'Enter') {
    e.preventDefault();

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLineBeforeCursor = value.slice(lineStart, selectionStart);

    // Extract leading spaces/tabs from current line
    const indentMatch = currentLineBeforeCursor.match(/^[ \t]*/);
    let currentIndent = indentMatch ? indentMatch[0] : '';

    const trimmedBefore = currentLineBeforeCursor.trimEnd();
    const charBeforeCursor = trimmedBefore.slice(-1);
    const charAfterCursor = value.slice(selectionStart, selectionStart + 1);

    // Check if line opened a block: '{', ':', '(', '['
    const opensBlock = ['{', ':', '(', '['].includes(charBeforeCursor);

    // Check if cursor is right between matching braces: '{ | }' or '( | )' or '[ | ]'
    const isBetweenBrackets =
      (charBeforeCursor === '{' && charAfterCursor === '}') ||
      (charBeforeCursor === '(' && charAfterCursor === ')') ||
      (charBeforeCursor === '[' && charAfterCursor === ']');

    if (isBetweenBrackets) {
      const innerIndent = currentIndent + indentStr;
      const insert = '\n' + innerIndent + '\n' + currentIndent;
      const newValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
      const targetPos = selectionStart + 1 + innerIndent.length;
      applyUpdate(newValue, targetPos, targetPos);
      return;
    }

    // If current line ends with a block opening character, indent by one level
    let newIndent = currentIndent;
    if (opensBlock) {
      newIndent += indentStr;
    }

    const insert = '\n' + newIndent;
    const newValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
    const targetPos = selectionStart + insert.length;
    applyUpdate(newValue, targetPos, targetPos);
    return;
  }

  // 3. AUTO-DEDENT FOR CLOSING BRACE '}'
  if (e.key === '}' && selectionStart === selectionEnd) {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineBefore = value.slice(lineStart, selectionStart);

    // If line up to cursor is only spaces and at least tabSize spaces, dedent one level
    if (/^[ ]+$/.test(lineBefore) && lineBefore.length >= tabSize) {
      e.preventDefault();
      const dedentedPrefix = lineBefore.slice(tabSize);
      const insert = dedentedPrefix + '}';
      const newValue = value.slice(0, lineStart) + insert + value.slice(selectionStart);
      const targetPos = lineStart + insert.length;
      applyUpdate(newValue, targetPos, targetPos);
      return;
    }
  }

  // 4. BACKSPACE AT INDENT BOUNDARY
  if (e.key === 'Backspace' && selectionStart === selectionEnd) {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const lineBefore = value.slice(lineStart, selectionStart);

    // If cursor is preceded only by spaces on this line, delete entire indent level
    if (lineBefore.length > 0 && /^[ ]+$/.test(lineBefore)) {
      const remainder = lineBefore.length % tabSize;
      const spacesToDelete = remainder === 0 ? tabSize : remainder;

      e.preventDefault();
      const newValue = value.slice(0, selectionStart - spacesToDelete) + value.slice(selectionEnd);
      const targetPos = selectionStart - spacesToDelete;
      applyUpdate(newValue, targetPos, targetPos);
      return;
    }
  }

  // 5. AUTO-CLOSING BRACKETS & QUOTES
  const pairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'"
  };

  // If typing the closing bracket when it's already directly ahead, just step over it
  const closingChars = [')', ']', '}', '"', "'"];
  if (closingChars.includes(e.key) && selectionStart === selectionEnd) {
    const nextChar = value[selectionStart];
    if (nextChar === e.key) {
      e.preventDefault();
      applyUpdate(value, selectionStart + 1, selectionStart + 1);
      return;
    }
  }

  // Auto-pair
  if (pairs[e.key] && selectionStart === selectionEnd) {
    // Only auto-pair quotes if not preceded by word character
    if (e.key === '"' || e.key === "'") {
      const prevChar = value[selectionStart - 1];
      if (prevChar && /[a-zA-Z0-9_]/.test(prevChar)) {
        return; // Don't pair in middle of words
      }
    }

    e.preventDefault();
    const openChar = e.key;
    const closeChar = pairs[openChar];
    const newValue = value.slice(0, selectionStart) + openChar + closeChar + value.slice(selectionEnd);
    const targetPos = selectionStart + 1;
    applyUpdate(newValue, targetPos, targetPos);
  }
}
