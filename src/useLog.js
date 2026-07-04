import { useState, useEffect, useCallback, useRef } from "react";
import {
  isFileSyncSupported,
  getStoredHandle,
  forgetStoredHandle,
  checkPermission,
  requestPermission,
  pickLogFile,
  readEntriesFromFile,
  writeEntriesToFile,
} from "./fileSync.js";

const KEY = "rb-gym-log-v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable (private browsing etc) — fail silently
  }
}

export function useLog() {
  const [entries, setEntries] = useState(read);
  const [fileState, setFileState] = useState({
    supported: isFileSyncSupported(),
    connected: false,
    needsReconnect: false,
    fileName: null,
  });
  const handleRef = useRef(null);

  useEffect(() => write(entries), [entries]);

  // On load, silently reconnect to a previously linked file if permission is still granted.
  useEffect(() => {
    if (!isFileSyncSupported()) return;
    (async () => {
      const handle = await getStoredHandle();
      if (!handle) return;
      handleRef.current = handle;
      const permission = await checkPermission(handle);
      if (permission === "granted") {
        const fileEntries = await readEntriesFromFile(handle);
        if (fileEntries) setEntries(fileEntries);
        setFileState({ supported: true, connected: true, needsReconnect: false, fileName: handle.name });
      } else {
        setFileState({ supported: true, connected: false, needsReconnect: true, fileName: handle.name });
      }
    })();
  }, []);

  // Mirror every change to the linked file.
  useEffect(() => {
    if (!fileState.connected || !handleRef.current) return;
    writeEntriesToFile(handleRef.current, entries).catch(() => {
      setFileState((s) => ({ ...s, connected: false, needsReconnect: true }));
    });
  }, [entries, fileState.connected]);

  const connectFile = useCallback(async () => {
    const handle = await pickLogFile();
    handleRef.current = handle;
    const fileEntries = await readEntriesFromFile(handle);
    if (fileEntries) {
      setEntries(fileEntries);
    } else {
      await writeEntriesToFile(handle, entries);
    }
    setFileState({ supported: true, connected: true, needsReconnect: false, fileName: handle.name });
  }, [entries]);

  const reconnectFile = useCallback(async () => {
    const handle = handleRef.current || (await getStoredHandle());
    if (!handle) return;
    handleRef.current = handle;
    const permission = await requestPermission(handle);
    if (permission === "granted") {
      const fileEntries = await readEntriesFromFile(handle);
      if (fileEntries) setEntries(fileEntries);
      setFileState({ supported: true, connected: true, needsReconnect: false, fileName: handle.name });
    }
  }, []);

  const disconnectFile = useCallback(async () => {
    await forgetStoredHandle();
    handleRef.current = null;
    setFileState({ supported: isFileSyncSupported(), connected: false, needsReconnect: false, fileName: null });
  }, []);

  const addEntry = useCallback((entry) => {
    setEntries((prev) => [
      { id: crypto.randomUUID(), date: new Date().toISOString(), ...entry },
      ...prev,
    ]);
  }, []);

  const removeEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const lastFor = useCallback(
    (exerciseName) => entries.find((e) => e.exerciseName === exerciseName),
    [entries]
  );

  return {
    entries,
    addEntry,
    removeEntry,
    lastFor,
    fileState,
    connectFile,
    reconnectFile,
    disconnectFile,
  };
}
