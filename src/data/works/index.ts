import type { MonthlyEvents, YearlyWorks, WorkEvent } from "./types";
import h1 from "./2024-h1.json";
import h2 from "./2024-h2.json";
import raw2025 from "./2025.json";

/** Canonical Thai month order (key → 1-based index) */
const MONTH_ORDER: Record<string, number> = {
  มกราคม: 1,
  กุมภาพันธ์: 2,
  มีนาคม: 3,
  เมษายน: 4,
  พฤษภาคม: 5,
  มิถุนายน: 6,
  กรกฎาคม: 7,
  สิงหาคม: 8,
  กันยายน: 9,
  ตุลาคม: 10,
  พฤศจิกายน: 11,
  ธันวาคม: 12,
};

function mergeToMonthlyEvents(
  ...sources: Record<string, WorkEvent[]>[]
): MonthlyEvents[] {
  const combined: Record<string, WorkEvent[]> = {};

  for (const src of sources) {
    for (const [month, events] of Object.entries(src)) {
      if (!combined[month]) combined[month] = [];
      combined[month].push(...events);
    }
  }

  return Object.entries(combined)
    .map(([month, events]) => ({
      month,
      monthIndex: MONTH_ORDER[month] ?? 99,
      events,
    }))
    .sort((a, b) => a.monthIndex - b.monthIndex);
}

export const SUPPORTED_YEARS = [2024, 2025, 2026] as const;
export type SupportedYear = (typeof SUPPORTED_YEARS)[number];

const works2024: YearlyWorks = {
  year: 2024,
  months: mergeToMonthlyEvents(
    h1 as Record<string, WorkEvent[]>,
    h2 as Record<string, WorkEvent[]>
  ),
};

const works2025: YearlyWorks = {
  year: 2025,
  months: mergeToMonthlyEvents(raw2025 as Record<string, WorkEvent[]>),
};

/** Returns work data for a given year, or null if no data yet */
export function getWorksByYear(year: number): YearlyWorks | null {
  if (year === 2024) return works2024;
  if (year === 2025) return works2025;
  return null;
}

export type { WorkEvent, MonthlyEvents, YearlyWorks };
