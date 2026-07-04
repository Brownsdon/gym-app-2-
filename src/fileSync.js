const DB_NAME = "rb-gym-file-sync";
const STORE_NAME = "handles";
const HANDLE_KEY = "logFile";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const isFileSyncSupported = () =>
  typeof window !== "undefined" && "showSaveFilePicker" in window;

export async function getStoredHandle() {
  try {
    return (await idbGet(HANDLE_KEY)) || null;
  } catch {
    return null;
  }
}

export async function forgetStoredHandle() {
  try {
    await idbDelete(HANDLE_KEY);
  } catch {
    // ignore
  }
}

export async function checkPermission(handle) {
  try {
    return await handle.queryPermission({ mode: "readwrite" });
  } catch {
    return "denied";
  }
}

export async function requestPermission(handle) {
  try {
    return await handle.requestPermission({ mode: "readwrite" });
  } catch {
    return "denied";
  }
}

export async function pickLogFile() {
  const handle = await window.showSaveFilePicker({
    suggestedName: "gym-log.json",
    types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
  });
  await idbSet(HANDLE_KEY, handle);
  return handle;
}

export async function readEntriesFromFile(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  if (!text.trim()) return null;
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeEntriesToFile(handle, entries) {
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(entries, null, 2));
  await writable.close();
}
