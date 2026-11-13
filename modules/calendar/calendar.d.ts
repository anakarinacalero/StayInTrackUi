import * as React from "react";

/** { [weekStart "YYYY-MM-DD"]: number of habits tracked that week } */
export type WeekMarks = Record<string, number>;

export interface CalendarButtonProps {
  onSelectWeek: (weekStart: string) => void;  // e.g. location.href = `week.html?date=${weekStart}`
  marks?: WeekMarks;                           // optional green counters per week
  onMonthChange?: (month: string) => void;     // "YYYY-MM", load marks for that month here
  value?: string;                              // a weekStart to show as already selected
  today?: string;
  weekStartsOn?: 0 | 1;                        // 1 Monday (default), 0 Sunday
  label?: string;                              // default "Calendar"
  variant?: "secondary" | "primary" | "soft" | "ghost";
  title?: string;                              // popup title, default "Pick a week"
}
export interface WeekCalendarProps {
  onSelectWeek: (weekStart: string) => void;
  marks?: WeekMarks;
  onMonthChange?: (month: string) => void;
  value?: string;
  today?: string;
  weekStartsOn?: 0 | 1;
  autoFocus?: boolean;
}

declare global {
  interface Window {
    StayInTrack: Window["StayInTrack"] & {
      CalendarButton: React.FC<CalendarButtonProps>;
      WeekCalendar: React.FC<WeekCalendarProps>;
      calStartOfWeek: (date: string, weekStartsOn?: 0 | 1) => string;
      weekMarks: (ranges: { habitId: string; startDate: string; endDate: string }[], weekStartsOn?: 0 | 1) => WeekMarks;
    };
  }
}
