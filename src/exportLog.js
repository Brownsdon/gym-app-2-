// Export/import of the workout log as a plain JSON file. The file body is
// exactly the array stored in localStorage, so a backup can be restored by
// hand if it ever comes to that.

export async function exportEntries(entries) {
  const filename = `gym-log-${new Date().toISOString().slice(0, 10)}.json`;
  const json = JSON.stringify(entries, null, 2);

  // On phones the share sheet is the useful path: AirDrop, Save to Files, etc.
  const file = new File([json], filename, { type: "application/json" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Gym log backup" });
      return "shared";
    } catch (err) {
      if (err.name === "AbortError") return "cancelled";
      // fall through to download
    }
  }

  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "downloaded";
}

export function parseBackup(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("not a backup array");
  return parsed.filter(
    (e) => e && typeof e === "object" && e.id && e.date && e.exerciseName
  );
}
