import { RULES } from "../data/rules.js";
import { significantTokens, tokenize } from "./tokenize.js";

const COMPOUND = new Set([
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",
  "<<=",
  ">>=",
  ">>>=",
  "&=",
  "|=",
  "^=",
  "&&=",
  "||=",
  "??=",
]);

const BLACKBOX = new Set([
  "map",
  "filter",
  "reduce",
  "reduceRight",
  "forEach",
  "find",
  "findIndex",
  "some",
  "every",
  "flatMap",
  "flat",
]);

const OBJECT_PREFIX_PUNCT = new Set([
  "=",
  "(",
  "[",
  ",",
  ":",
  "?",
  "&&",
  "||",
  "??",
  "=>",
  "+",
]);

const OBJECT_PREFIX_KEYWORDS = new Set(["return", "typeof", "void", "delete", "throw", "yield"]);

function matchBracket(tokens, openIndex, open, close) {
  let depth = 0;
  for (let i = openIndex; i < tokens.length; i += 1) {
    if (tokens[i].value === open) depth += 1;
    else if (tokens[i].value === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function nextIndexOf(tokens, from, value) {
  for (let i = from; i < tokens.length; i += 1) {
    if (tokens[i].value === value) return i;
  }
  return -1;
}

function forLoopKind(tokens, forIndex) {
  const open = nextIndexOf(tokens, forIndex + 1, "(");
  if (open === -1) return null;
  const close = matchBracket(tokens, open, "(", ")");
  if (close === -1) return null;
  let depth = 0;
  for (let i = open + 1; i < close; i += 1) {
    const value = tokens[i].value;
    if (value === "(" || value === "[" || value === "{") depth += 1;
    else if (value === ")" || value === "]" || value === "}") depth -= 1;
    else if (depth === 0 && (value === "of" || value === "in")) return value;
  }
  return null;
}

function isObjectStart(tokens, index) {
  const prev = tokens[index - 1];
  if (!prev) return false;
  if (prev.type === "punct") return OBJECT_PREFIX_PUNCT.has(prev.value);
  if (prev.type === "keyword") return OBJECT_PREFIX_KEYWORDS.has(prev.value);
  return false;
}

function scanShorthand(tokens, add) {
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i].value !== "{" || !isObjectStart(tokens, i)) continue;
    const close = matchBracket(tokens, i, "{", "}");
    if (close === -1) continue;

    let entryStart = i + 1;
    let depth = 0;

    for (let k = i + 1; k <= close; k += 1) {
      const token = tokens[k];
      const atBoundary = k === close || (token.value === "," && depth === 0);

      if (atBoundary) {
        const first = tokens[entryStart];
        const second = tokens[entryStart + 1];
        if (first && first !== token && second) {
          const isName = first.type === "ident" || first.type === "keyword";
          if (isName && (second.value === "," || second.value === "}")) {
            add(first, "shorthand-prop");
          } else if (isName && second.value === "(") {
            add(first, "shorthand-method");
          }
        }
        entryStart = k + 1;
      }

      if (token.value === "{" || token.value === "(" || token.value === "[") depth += 1;
      else if (token.value === "}" || token.value === ")" || token.value === "]") depth -= 1;
    }
  }
}

export function lintSource(source) {
  const tokens = significantTokens(tokenize(source));
  const violations = [];
  const seen = new Set();

  function add(token, ruleId, shown) {
    if (!token) return;
    const key = String(token.start) + ":" + ruleId;
    if (seen.has(key)) return;
    const rule = RULES[ruleId];
    if (!rule) return;
    seen.add(key);
    violations.push({
      ruleId,
      label: rule.label,
      real: rule.real,
      why: rule.why,
      category: rule.category,
      severity: rule.severity,
      found: shown || token.value,
      line: token.line,
      col: token.col,
      index: token.start,
    });
  }

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const prev = tokens[i - 1];
    const next = tokens[i + 1];

    if (token.type === "template") add(token, "template");

    if (token.type === "keyword") {
      if (token.value === "class" || token.value === "extends" || token.value === "super") {
        add(token, "class");
      }
      if (token.value === "let" || token.value === "const") add(token, "declaration");
      if (token.value === "async" || token.value === "await") add(token, "async");
      if (token.value === "import" || token.value === "export") add(token, "modules");

      if (token.value === "for") {
        const kind = forLoopKind(tokens, i);
        if (kind) add(token, "for-of-in", "for ... " + kind);
      }

      if (token.value === "var" || token.value === "let" || token.value === "const") {
        if (next && (next.value === "{" || next.value === "[")) add(next, "destructure");
      }

      if (token.value === "function") {
        const open = nextIndexOf(tokens, i + 1, "(");
        if (open !== -1) {
          const close = matchBracket(tokens, open, "(", ")");
          if (close !== -1) {
            const firstParam = tokens[open + 1];
            if (firstParam && (firstParam.value === "{" || firstParam.value === "[")) {
              add(firstParam, "destructure");
            }
            let depth = 0;
            for (let k = open + 1; k < close; k += 1) {
              const value = tokens[k].value;
              if (value === "(" || value === "[" || value === "{") depth += 1;
              else if (value === ")" || value === "]" || value === "}") depth -= 1;
              else if (value === "=" && depth === 0) {
                add(tokens[k], "default-param");
                break;
              }
            }
          }
        }
      }
    }

    if (token.type === "punct") {
      if (token.value === "=>") add(token, "arrow");
      else if (token.value === "...") add(token, "spread");
      else if (token.value === "++" || token.value === "--") add(token, "increment");
      else if (token.value === "?.") add(token, "optional");
      else if (token.value === "??") add(token, "nullish");
      else if (token.value === "**") add(token, "exponent");
      if (COMPOUND.has(token.value)) add(token, "compound");
    }

    if (
      token.type === "ident" &&
      prev &&
      prev.value === "." &&
      BLACKBOX.has(token.value) &&
      next &&
      next.value === "("
    ) {
      add(token, "blackbox", token.value + "()");
    }
  }

  scanShorthand(tokens, add);

  violations.sort((a, b) => a.index - b.index);
  return violations;
}

export function summarize(violations) {
  let errors = 0;
  let advice = 0;
  for (let i = 0; i < violations.length; i += 1) {
    if (violations[i].severity === "advice") advice += 1;
    else errors += 1;
  }
  return { errors, advice, total: errors + advice };
}
