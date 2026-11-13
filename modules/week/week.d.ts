import * as React from "react";

export type Level = 0 | 1 | 2 | 3 | null;   // 0 missed · 1 min · 2 ok · 3 ideal · null not logged yet
export interface WeekDay { date: string; level: Level; inSheet: boolean; } // inSheet false = habit not tracked that day
export interface WeekHabit {
  id: string;
  name: string;
  unit: string;
  color?: "butter" | "rose" | "sky" | "sage";
  targets: { min: number; ok: number; ideal: number };   // of the latest sheet in that week
  targetsChanged?: boolean;                               // true if two sheets with different targets meet in that week
  days: WeekDay[];                                        // exactly 7, from weekStart
  notes?: { sheetId: string; text: string }[];            // notes of the sheets that touch the week
}
/** GET /api/habits/week?date=YYYY-MM-DD */
export interface WeekPayload { weekStart: string; weekEnd: string; habits: WeekHabit[]; }

export interface WeekViewProps {
  week: WeekPayload | null;
  onWeekChange?: (weekStart: string) => void;   // fetch the new week here
  onOpenHabit?: (h: WeekHabit) => void;
  onCreate?: () => void;
  today?: string;
  loading?: boolean;
  weekStartsOn?: 0 | 1;                          // 1 Monday (default), 0 Sunday
}
export interface WeekPickerProps { weekStart: string; onChange?: (weekStart: string) => void; today?: string; weekStartsOn?: 0 | 1; }
export interface WeekGridProps { weekStart: string; habits: WeekHabit[]; today?: string; onOpenHabit?: (h: WeekHabit) => void; }
export interface DayCellProps { day: WeekDay; future?: boolean; }

declare global {
  interface Window {
    StayInTrack: Window["StayInTrack"] & {
      WeekView: React.FC<WeekViewProps>;
      WeekPicker: React.FC<WeekPickerProps>;
      WeekGrid: React.FC<WeekGridProps>;
      WeekLegend: React.FC<{}>;
      DayCell: React.FC<DayCellProps>;
      startOfWeek: (date: string, weekStartsOn?: 0 | 1) => string;
      addDaysISO: (date: string, n: number) => string;
      todayISO: () => string;
      weekDays: (weekStart: string) => string[];
      formatWeek: (weekStart: string) => string;
      buildWeek: (habits: any[], sheetsByHabit: Record<string, any[]>, weekStart: string) => WeekPayload;
    };
  }
}
