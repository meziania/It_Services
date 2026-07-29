export function timeAgo(dateInput?: string | null): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;

  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;

  const diffMonth = Math.round(diffD / 30);
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;

  const diffYear = Math.round(diffMonth / 12);
  return `il y a ${diffYear} an${diffYear > 1 ? "s" : ""}`;
}

export function isToday(dateInput?: string | null): boolean {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Docs2/05 "Enable/disable, run manuel, schedule" — the scheduler (see
 * apps/api/src/scheduler) triggers a source once `lastRunAt + frequencyMinutes`
 * is in the past. This mirrors that same math client-side just for display,
 * so the admin can see when to expect the next automatic run.
 */
export function nextRunLabel(lastRunAt: string | null | undefined, frequencyMinutes: number): string {
  if (!lastRunAt) return "Bientôt (jamais exécutée)";
  const last = new Date(lastRunAt);
  if (Number.isNaN(last.getTime())) return "-";

  const dueAt = last.getTime() + frequencyMinutes * 60_000;
  const diffMin = Math.round((dueAt - Date.now()) / 60000);

  if (diffMin <= 0) return "Bientôt";
  if (diffMin < 60) return `dans ${diffMin} min`;

  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `dans ${diffH} h`;

  const diffD = Math.round(diffH / 24);
  return `dans ${diffD} j`;
}

export function formatDate(dateInput?: string | null): string {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
