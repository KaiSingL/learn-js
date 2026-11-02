export const STORAGE_KEY = "realjs.progress.v2";

export function emptyProgress() {
  return [];
}

export function parseProgress(raw) {
  if (!raw) return emptyProgress();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyProgress();
    const list = Array.isArray(parsed.completed) ? parsed.completed : [];
    const seen = {};
    const completed = [];
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] === null || list[i] === undefined) continue;
      const key = String(list[i]);
      if (key && seen[key] !== true) {
        seen[key] = true;
        completed[completed.length] = key;
      }
    }
    return completed;
  } catch (err) {
    return emptyProgress();
  }
}

export function serializeProgress(completed) {
  return JSON.stringify({ v: 2, completed });
}

export function readStorage(storage) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch (err) {
    return null;
  }
}

export function writeStorage(storage, completed) {
  try {
    storage.setItem(STORAGE_KEY, serializeProgress(completed));
    return true;
  } catch (err) {
    return false;
  }
}

export function countDone(completed, ids) {
  let total = 0;
  for (let i = 0; i < ids.length; i += 1) {
    if (completed.indexOf(String(ids[i])) !== -1) total += 1;
  }
  return total;
}
