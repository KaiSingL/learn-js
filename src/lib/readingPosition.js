// localStorage persistence for the reader's position: which lesson and which
// section (a data-reading-anchor id) they were last viewing, so a reload
// lands back where they stopped. Mirrors quizStorage patterns: pure
// functions, injected storage, defensive parsing.
//
// Shape on disk: { v: 1, path: "/lesson/1", anchorId: "lesson-1-concept-3" }
// One entry only — the most recent reading spot overall. Restoration is
// skipped unless the stored path matches the route being opened.

export const READING_STORAGE_KEY = "learnjs.reading.v1";

// In-app navigation (router.navigate) marks the session so a stale reading
// position is never restored after the user moves around; only a real page
// load — reload, reopened tab, fresh link — may restore.
let sessionNavigated = false;

export function markSessionNavigated() {
  sessionNavigated = true;
}

export function canRestore() {
  return sessionNavigated !== true;
}

export function parseReading(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.path !== "string" || parsed.path.length === 0) return null;
    if (typeof parsed.anchorId !== "string" || parsed.anchorId.length === 0) return null;
    return { path: parsed.path, anchorId: parsed.anchorId };
  } catch (err) {
    return null;
  }
}

export function serializeReading(entry) {
  return JSON.stringify({ v: 1, path: entry.path, anchorId: entry.anchorId });
}

export function readReadingStorage(storage) {
  try {
    return parseReading(storage.getItem(READING_STORAGE_KEY));
  } catch (err) {
    return null;
  }
}

export function writeReadingStorage(storage, entry) {
  try {
    storage.setItem(READING_STORAGE_KEY, serializeReading(entry));
    return true;
  } catch (err) {
    return false;
  }
}

export function clearReadingStorage(storage) {
  try {
    storage.removeItem(READING_STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}
