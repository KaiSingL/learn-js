// Surgical source serializer for src/data/lessons.js — shared by the studio
// page and scripts/studio.mjs. Pure string processing: no Node APIs, no JSX.
//
// Strategy (see plan/concept-studio/plan.md): never regenerate the whole file
// from values. A tokenizer-aware scanner finds the byte ranges of every lesson
// object and every concept object; edits replace field values in place inside
// a concept's block; reorder/move rebuilds only the affected lesson's
// `concepts: [...]` property from verbatim block text. Everything else — quiz,
// starter, solutions, comments, exact string escapes — is copied untouched.
//
// Trust is earned by roundTrip(): re-emitting every concept block from its
// parsed value must reproduce the file byte-for-byte before any write happens.

var LESSONS_MARKER = "export const LESSONS = [";

function isIdChar(ch) {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "$"
  );
}

function isWs(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

function skipLineComment(s, i) {
  while (i < s.length && s[i] !== "\n") i += 1;
  return i;
}

function skipBlockComment(s, i) {
  i += 2;
  while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) i += 1;
  return i + 2;
}

function skipWsAndComments(s, i) {
  for (;;) {
    var ch = s[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "/" && s[i + 1] === "/") {
      i = skipLineComment(s, i);
      continue;
    }
    if (ch === "/" && s[i + 1] === "*") {
      i = skipBlockComment(s, i);
      continue;
    }
    return i;
  }
}

function skipQuoted(s, i) {
  // s[i] is ' or " — plain string, no interpolation.
  var q = s[i];
  i += 1;
  while (i < s.length) {
    if (s[i] === "\\") {
      i += 2;
      continue;
    }
    if (s[i] === q) return i + 1;
    if (s[i] === "\n") throw new Error("Unterminated string at offset " + i);
    i += 1;
  }
  throw new Error("Unterminated string");
}

function skipTemplateExpr(s, i) {
  // i is just after "${" — scan to the matching "}".
  var depth = 0;
  while (i < s.length) {
    var ch = s[i];
    if (ch === '"' || ch === "'") {
      i = skipQuoted(s, i);
      continue;
    }
    if (ch === "`") {
      i = skipTemplate(s, i);
      continue;
    }
    if (ch === "/" && s[i + 1] === "/") {
      i = skipLineComment(s, i);
      continue;
    }
    if (ch === "/" && s[i + 1] === "*") {
      i = skipBlockComment(s, i);
      continue;
    }
    if (ch === "{" || ch === "[" || ch === "(") {
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}") {
      if (depth === 0) return i + 1;
      depth -= 1;
      i += 1;
      continue;
    }
    if (ch === "]" || ch === ")") {
      depth -= 1;
      i += 1;
      continue;
    }
    i += 1;
  }
  throw new Error("Unterminated ${ expression");
}

function skipTemplate(s, i) {
  // s[i] is "`".
  i += 1;
  while (i < s.length) {
    if (s[i] === "\\") {
      i += 2;
      continue;
    }
    if (s[i] === "`") return i + 1;
    if (s[i] === "$" && s[i + 1] === "{") {
      i = skipTemplateExpr(s, i + 2);
      continue;
    }
    i += 1;
  }
  throw new Error("Unterminated template literal");
}

function skipBracketed(s, i) {
  // s[i] is { or [ — returns index AFTER the matching closer.
  // Only same-type nesting is counted; other bracket kinds are balanced
  // inside, so skipping them is safe. Strings/templates/comments are skipped.
  var open = s[i];
  var close = open === "{" ? "}" : "]";
  var depth = 0;
  var j = i;
  while (j < s.length) {
    var ch = s[j];
    if (ch === '"' || ch === "'") {
      j = skipQuoted(s, j);
      continue;
    }
    if (ch === "`") {
      j = skipTemplate(s, j);
      continue;
    }
    if (ch === "/" && s[j + 1] === "/") {
      j = skipLineComment(s, j);
      continue;
    }
    if (ch === "/" && s[j + 1] === "*") {
      j = skipBlockComment(s, j);
      continue;
    }
    if (ch === open) {
      depth += 1;
      j += 1;
      continue;
    }
    if (ch === close) {
      depth -= 1;
      j += 1;
      if (depth === 0) return j;
      continue;
    }
    j += 1;
  }
  throw new Error("Unbalanced " + open + " starting at offset " + i);
}

function skipValue(s, i) {
  // i is at the first char of a property value; returns index after the value.
  var ch = s[i];
  if (ch === '"' || ch === "'") return skipQuoted(s, i);
  if (ch === "`") return skipTemplate(s, i);
  if (ch === "{" || ch === "[") return skipBracketed(s, i);
  while (i < s.length && !isWs(s[i]) && s[i] !== "," && s[i] !== "}" && s[i] !== "]") {
    i += 1;
  }
  return i;
}

// Walks `ident: value` properties at depth 1 of the object spanning
// [objStart, objEnd]. visit(key, keyStart, valueStart, valueEnd).
function walkProperties(s, objStart, objEnd, visit) {
  var i = objStart + 1;
  for (;;) {
    i = skipWsAndComments(s, i);
    if (i >= objEnd || s[i] === "}") return;
    if (s[i] === ",") {
      i += 1;
      continue;
    }
    var keyStart = i;
    var key;
    if (s[i] === '"' || s[i] === "'") {
      var qEnd = skipQuoted(s, i);
      key = s.slice(i + 1, qEnd - 1);
      i = qEnd;
    } else {
      while (i < objEnd && isIdChar(s[i])) i += 1;
      key = s.slice(keyStart, i);
      if (key === "") throw new Error("Expected property name at offset " + i);
    }
    i = skipWsAndComments(s, i);
    if (s[i] !== ":") throw new Error("Expected ':' after property '" + key + "' at offset " + i);
    i = skipWsAndComments(s, i + 1);
    var valueEnd = skipValue(s, i);
    visit(key, keyStart, i, valueEnd);
    i = valueEnd;
  }
}

// ---------------------------------------------------------------------------
// Value parsing / emitting

function unescapeQuoted(body) {
  var out = "";
  for (var i = 0; i < body.length; i += 1) {
    var ch = body[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    var n = body[i + 1];
    i += 1;
    if (n === "n") out += "\n";
    else if (n === "t") out += "\t";
    else if (n === "r") out += "\r";
    else if (n === "b") out += "\b";
    else if (n === "f") out += "\f";
    else if (n === "v") out += "\v";
    else if (n === "0") out += "\0";
    else if (n === "u") {
      out += String.fromCharCode(parseInt(body.slice(i + 1, i + 5), 16));
      i += 4;
    } else if (n === "x") {
      out += String.fromCharCode(parseInt(body.slice(i + 1, i + 3), 16));
      i += 2;
    } else if (n === "\n") {
      // line continuation — emits nothing
    } else {
      out += n; // covers \\ \" \' \` \$ and any tolerated unknown
    }
  }
  return out;
}

function unescapeTemplate(body) {
  var out = "";
  for (var i = 0; i < body.length; i += 1) {
    var ch = body[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    var n = body[i + 1];
    i += 1;
    if (n === "n") out += "\n";
    else if (n === "t") out += "\t";
    else if (n === "r") out += "\r";
    else if (n === "\\") out += "\\";
    else if (n === "`") out += "`";
    else if (n === "$") out += "$";
    else out += "\\" + n; // unknown escape: keep verbatim
  }
  return out;
}

export function emitQuoted(value) {
  var out = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  return '"' + out + '"';
}

// eol: the file's line ending ("\r\n" for lessons.js). Template values are
// LF-normalized in the engine (ECMAScript line-continuation rule), so emit
// re-expands LF to the file's EOL to reproduce the original bytes.
export function emitTemplate(value, eol) {
  var lineEnd = eol || "\n";
  var out = String(value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${")
    .replace(/\n/g, lineEnd);
  return "`" + out + "`";
}

// ---------------------------------------------------------------------------
// File scanning

function detectEol(source) {
  var idx = source.indexOf("\r\n");
  return idx === -1 ? "\n" : "\r\n";
}

export function scanLessons(source) {
  var mi = source.indexOf(LESSONS_MARKER);
  if (mi === -1) throw new Error("LESSONS array marker not found");
  var arrOpen = mi + LESSONS_MARKER.length - 1; // at '['
  var arrEnd = skipBracketed(source, arrOpen) - 1; // at ']'
  var lessons = [];
  var i = arrOpen + 1;
  for (;;) {
    i = skipWsAndComments(source, i);
    if (source[i] === "]") break;
    if (source[i] === ",") {
      i += 1;
      continue;
    }
    if (source[i] !== "{") throw new Error("Expected lesson object at offset " + i);
    var objEnd = skipBracketed(source, i) - 1;
    var id = null;
    var conceptsValueStart = -1;
    var conceptsValueEnd = -1;
    var conceptsKeyStart = -1;
    walkProperties(source, i, objEnd, function (key, keyStart, valueStart, valueEnd) {
      if (key === "id") id = Number(source.slice(valueStart, valueEnd));
      if (key === "concepts") {
        conceptsKeyStart = keyStart;
        conceptsValueStart = valueStart;
        conceptsValueEnd = valueEnd;
      }
    });
    if (conceptsValueStart === -1) throw new Error("Lesson at offset " + i + " has no concepts array");
    if (source[conceptsValueStart] !== "[") throw new Error("concepts is not an array at offset " + conceptsValueStart);    var concepts = [];
    var j = conceptsValueStart + 1;
    for (;;) {
      j = skipWsAndComments(source, j);
      if (source[j] === "]") break;
      if (source[j] === ",") {
        j += 1;
        continue;
      }
      if (source[j] !== "{") throw new Error("Expected concept object at offset " + j);
      var cEnd = skipBracketed(source, j) - 1;
      concepts.push({ start: j, end: cEnd });
      j = cEnd + 1;
    }
    var propLineStart = source.lastIndexOf("\n", conceptsKeyStart) + 1;
    lessons.push({
      start: i,
      end: objEnd,
      id: id,
      concepts: concepts,
      conceptsPropStart: propLineStart,
      conceptsArrEnd: conceptsValueEnd - 1, // index of the closing ']'
    });
    i = objEnd + 1;
  }
  return { lessons: lessons, eol: detectEol(source) };
}

export function getConceptBlock(source, scan, lessonIdx, conceptIdx) {
  var lesson = scan.lessons[lessonIdx];
  var concept = lesson.concepts[conceptIdx];
  return source.slice(concept.start, concept.end + 1);
}

// Parses the editable fields out of one concept block.
// Returns { heading, text, purpose, code, diagram? } as { raw, value }.
export function parseConceptFields(block) {
  var end = skipBracketed(block, 0) - 1;
  var fields = {};
  walkProperties(block, 0, end, function (key, keyStart, valueStart, valueEnd) {
    var raw = block.slice(valueStart, valueEnd);
    if (key === "heading" || key === "text" || key === "purpose" || key === "diagram") {
      if (raw[0] !== '"') throw new Error("Field '" + key + "' is not a double-quoted string");
      fields[key] = { raw: raw, value: unescapeQuoted(raw.slice(1, -1)) };
    } else if (key === "code") {
      if (raw[0] !== "`") throw new Error("Field 'code' is not a template literal");
      // The engine normalizes CRLF/CR inside template literals to LF in the
      // value, so the parsed value must match what import produces.
      var codeValue = unescapeTemplate(raw.slice(1, -1))
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");
      fields.code = { raw: raw, value: codeValue };
    }
  });
  if (!fields.heading || !fields.text || !fields.purpose || !fields.code) {
    throw new Error("Concept block is missing a required field (heading/text/purpose/code)");
  }
  return fields;
}

// Replaces the given editable field values inside a concept block, in place.
// check / diagram / field order / original escapes elsewhere: untouched.
// eol: the file's line ending — code values are LF-normalized, emit re-expands.
export function rewriteConceptBlock(block, edits, eol) {
  var end = skipBracketed(block, 0) - 1;
  var out = "";
  var last = 0;
  walkProperties(block, 0, end, function (key, keyStart, valueStart, valueEnd) {
    if (!Object.prototype.hasOwnProperty.call(edits, key)) return;
    var value = edits[key];
    var emitted = key === "code" ? emitTemplate(value, eol) : emitQuoted(value);
    out += block.slice(last, valueStart);
    out += emitted;
    last = valueEnd;
  });
  out += block.slice(last);
  return out;
}

// Rebuilds the file with each provided lesson's concepts array replaced.
// perLessonBlocks[i] = array of concept block strings (new order), or null to
// leave lesson i untouched. Blocks are inserted verbatim, so unchanged order
// and unchanged blocks reproduce the original bytes exactly.
export function rebuildSource(source, perLessonBlocks) {
  var scan = scanLessons(source);
  var eol = scan.eol;
  var out = source;
  for (var li = scan.lessons.length - 1; li >= 0; li -= 1) {
    var blocks = perLessonBlocks[li];
    if (!blocks) continue;
    if (blocks.length === 0) throw new Error("Lesson " + scan.lessons[li].id + " would end up with zero concepts");
    var lesson = scan.lessons[li];
    var text =
      "    concepts: [" +
      eol +
      blocks
        .map(function (b) {
          return "      " + b;
        })
        .join("," + eol) +
      "," +
      eol +
      "    ]";
    out = out.slice(0, lesson.conceptsPropStart) + text + out.slice(lesson.conceptsArrEnd + 1);
  }
  return out;
}

// Replaces quiz `tests: "<old>"` values after a heading rename.
// Returns the new source and how many tags were rewritten.
export function replaceQuizTests(source, renames) {
  var out = source;
  var total = 0;
  for (var i = 0; i < renames.length; i += 1) {
    var needle = "tests: " + emitQuoted(renames[i].from);
    var replacement = "tests: " + emitQuoted(renames[i].to);
    var count = out.split(needle).length - 1;
    if (count > 0) {
      out = out.split(needle).join(replacement);
      total += count;
    }
  }
  return { source: out, replaced: total };
}

// The gate: every concept block must survive value → re-emit byte-for-byte,
// and a full rebuild with verbatim blocks must reproduce the file.
export function roundTrip(source) {
  var problems = [];
  var scan;
  try {
    scan = scanLessons(source);
  } catch (err) {
    return { ok: false, problems: [{ reason: "scan failed: " + err.message }], scan: null };
  }
  var verbatim = [];
  for (var li = 0; li < scan.lessons.length; li += 1) {
    var blocks = [];
    for (var ci = 0; ci < scan.lessons[li].concepts.length; ci += 1) {
      var block = getConceptBlock(source, scan, li, ci);
      var label = "lesson " + (scan.lessons[li].id ?? li) + " concept " + (ci + 1);
      try {
        var fields = parseConceptFields(block);
        var rewritten = rewriteConceptBlock(
          block,
          {
            heading: fields.heading.value,
            text: fields.text.value,
            purpose: fields.purpose.value,
            code: fields.code.value,
          },
          scan.eol
        );
        if (rewritten !== block) {
          problems.push({ lesson: scan.lessons[li].id, index: ci, heading: fields.heading.value, reason: label + ": re-emitted block differs" });
        }
      } catch (err) {
        problems.push({ lesson: scan.lessons[li].id, index: ci, heading: "?", reason: label + ": " + err.message });
      }
      blocks.push(block);
    }
    verbatim.push(blocks);
  }
  var rebuilt = rebuildSource(source, verbatim);
  if (rebuilt !== source) {
    problems.push({ reason: "full-file rebuild with verbatim blocks is not byte-identical" });
  }
  return { ok: problems.length === 0, problems: problems, scan: scan };
}
