import { useState, useEffect, useCallback } from "react";

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

  useEffect(() => write(entries), [entries]);

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

  return { entries, addEntry, removeEntry, lastFor };
}
