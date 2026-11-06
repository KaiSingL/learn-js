// localStorage persistence for quiz answers, mirroring the patterns of
// progress.js: pure functions, injected storage, defensive parsing.
//
// Shape on disk: { v: 1, quizzes: { "<quizId>": { "<questionIndex>": <optionIndex> } } }
// quizId is provided by the caller (e.g. "lesson-1-quiz" or
// "lesson-1-concept-<heading>") and must be stable across reloads.

export const QUIZ_STORAGE_KEY = "learnjs.quiz.v1";

// Dispatched on window when all quiz answers are wiped (sidebar reset), so
// mounted Quiz components re-read their slice instead of showing stale state.
export const QUIZ_RESET_EVENT = "{{SECRET_8sg9w41q}}";

export function emptyQuizState() {
  return {};
}

export function parseQuiz(raw) {
  if (!raw) return emptyQuizState();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyQuizState();
    const source =
      parsed.quizzes && typeof parsed.quizzes === "object" && !Array.isArray(parsed.quizzes)
        ? parsed.quizzes
        : {};
    const quizzes = {};
    const ids = Object.keys(source);
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      const picks = source[id];
      if (!picks || typeof picks !== "object" || Array.isArray(picks)) continue;
      const clean = {};
      const keys = Object.keys(picks);
      let any = false;
      for (let k = 0; k < keys.length; k += 1) {
        const index = keys[k];
        if (!/^\d+$/.test(index)) continue;
        const option = picks[index];
        if (typeof option !== "number" || option < 0 || option !== Math.floor(option)) continue;
        clean[index] = option;
        any = true;
      }
      if (any) quizzes[id] = clean;
    }
    return quizzes;
  } catch (err) {
    return emptyQuizState();
  }
}

export function serializeQuiz(quizzes) {
  return JSON.stringify({ v: 1, quizzes });
}

export function readQuizStorage(storage) {
  try {
    return parseQuiz(storage.getItem(QUIZ_STORAGE_KEY));
  } catch (err) {
    return emptyQuizState();
  }
}

export function writeQuizStorage(storage, quizzes) {
  try {
    storage.setItem(QUIZ_STORAGE_KEY, serializeQuiz(quizzes));
    return true;
  } catch (err) {
    return false;
  }
}

export function clearQuizStorage(storage) {
  try {
    storage.removeItem(QUIZ_STORAGE_KEY);
    return true;
  } catch (err) {
    return false;
  }
}
