export interface WorkEvent {
  day: string;
  event: string;
}

export interface MonthlyEvents {
  month: string;         // Thai month name e.g. "มกราคม"
  monthIndex: number;    // 1–12 for sorting
  events: WorkEvent[];
}

export interface YearlyWorks {
  year: number;
  months: MonthlyEvents[];
}
