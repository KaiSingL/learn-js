// A small JavaScript tokenizer used by both the syntax highlighter and the
// no-sugar linter. It is deliberately conservative: it never executes code and
// it keeps exact offsets so violations can point at a line and column.

const KEYWORDS = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "get",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "set",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

// Longest match first. The list only needs to cover what the linter and the
// highlighter care about; unknown punctuation falls back to one character.
const PUNCTUATORS = [
  ">>>=",
  "...",
  "===",
  "!==",
  "**=",
  "??=",
  "||=",
  "&&=",
  "<<=",
  ">>=",
  ">>>",
  "=>",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "??",
  "?.",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**",
  "<<",
  ">>",
  "&=",
  "|=",
  "^=",
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ";",
  ",",
  "<",
  ">",
  "+",
  "-",
  "*",
  "%",
  "&",
  "|",
  "^",
  "!",
  "~",
  "?",
  ":",
  "=",
  ".",
  "/",
];

const NUMBER_RE =
  /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?/;
const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*/;

// Tokens that may terminate an expression; a `/` after one of these is
// division, otherwise it starts a regular expression literal.
const EXPRESSION_END = new Set([
  ")",
  "]",
  "}",
  "++",
  "--",
]);

const REGEX_PREFIX_KEYWORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "case",
  "do",
  "else",
  "yield",
  "await",
]);

function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}

function isIdentStart(ch) {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_" ||
    ch === "$"
  );
}

export function tokenize(source) {
  const tokens = [];
  const len = source.length;
  let i = 0;
  let line = 1;
  let col = 1;
  let prevSignificant = null;

  function advance(count) {
    for (let k = 0; k < count; k += 1) {
      if (source[i] === "\n") {
        line += 1;
        col = 1;
      } else {
        col += 1;
      }
      i += 1;
    }
  }

  function push(type, start, startLine, startCol) {
    const token = {
      type,
      value: source.slice(start, i),
      start,
      end: i,
      line: startLine,
      col: startCol,
    };
    tokens.push(token);
    if (type !== "space" && type !== "comment") {
      prevSignificant = token;
    }
    return token;
  }

  function regexAllowed() {
    if (prevSignificant === null) return true;
    if (prevSignificant.type === "keyword") {
      return REGEX_PREFIX_KEYWORDS.has(prevSignificant.value);
    }
    if (prevSignificant.type === "punct") {
      return !EXPRESSION_END.has(prevSignificant.value);
    }
    return false;
  }

  while (i < len) {
    const start = i;
    const startLine = line;
    const startCol = col;
    const ch = source[i];

    // whitespace
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f" || ch === "\v") {
      while (i < len) {
        const c = source[i];
        if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f" || c === "\v") {
          advance(1);
        } else {
          break;
        }
      }
      push("space", start, startLine, startCol);
      continue;
    }

    // comments
    if (ch === "/" && source[i + 1] === "/") {
      while (i < len && source[i] !== "\n") advance(1);
      push("comment", start, startLine, startCol);
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      advance(2);
      while (i < len && !(source[i] === "*" && source[i + 1] === "/")) advance(1);
      if (i < len) advance(2);
      push("comment", start, startLine, startCol);
      continue;
    }

    // strings
    if (ch === '"' || ch === "'") {
      advance(1);
      while (i < len) {
        const c = source[i];
        if (c === "\\") {
          advance(2);
          continue;
        }
        advance(1);
        if (c === ch) break;
      }
      push("string", start, startLine, startCol);
      continue;
    }

    // template literal: kept as one token, which is exactly what the linter
    // wants to flag. The highlighter colours it as a string.
    if (ch === "`") {
      advance(1);
      while (i < len) {
        const c = source[i];
        if (c === "\\") {
          advance(2);
          continue;
        }
        advance(1);
        if (c === "`") break;
      }
      push("template", start, startLine, startCol);
      continue;
    }

    // regular expression literal
    if (ch === "/" && regexAllowed()) {
      advance(1);
      let inClass = false;
      while (i < len) {
        const c = source[i];
        if (c === "\\") {
          advance(2);
          continue;
        }
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          advance(1);
          break;
        } else if (c === "\n") {
          break;
        }
        advance(1);
      }
      while (i < len && /[a-z]/i.test(source[i])) advance(1);
      push("regex", start, startLine, startCol);
      continue;
    }

    // numbers
    if (isDigit(ch) || (ch === "." && isDigit(source[i + 1]))) {
      const match = NUMBER_RE.exec(source.slice(i));
      const text = match ? match[0] : ch;
      advance(text.length);
      push("number", start, startLine, startCol);
      continue;
    }

    // identifiers and keywords
    if (isIdentStart(ch)) {
      const match = IDENT_RE.exec(source.slice(i));
      const text = match ? match[0] : ch;
      advance(text.length);
      push(KEYWORDS.has(text) ? "keyword" : "ident", start, startLine, startCol);
      continue;
    }

    // punctuation
    let matched = null;
    for (let p = 0; p < PUNCTUATORS.length; p += 1) {
      const candidate = PUNCTUATORS[p];
      if (source.startsWith(candidate, i)) {
        matched = candidate;
        break;
      }
    }
    if (matched !== null) {
      advance(matched.length);
      push("punct", start, startLine, startCol);
      continue;
    }

    // anything else (e.g. unicode identifiers) as one character
    advance(1);
    push("punct", start, startLine, startCol);
  }

  return tokens;
}

export function significantTokens(tokens) {
  return tokens.filter((token) => token.type !== "space" && token.type !== "comment");
}

export { KEYWORDS, PUNCTUATORS };
