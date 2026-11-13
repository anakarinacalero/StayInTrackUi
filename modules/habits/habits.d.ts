import * as React from "react";

export type Level = 0 | 1 | 2 | 3 | null;          // 0 missed · 1 min · 2 ok · 3 ideal · null not logged yet
export type HabitColor = "butter" | "rose" | "sky" | "sage";
export interface Targets { min: number; ok: number; ideal: number; }

/** One item of GET /api/habits */
export interface HabitSummary {
  id: string;
  name: string;
  unit: string;
  color?: HabitColor;                 // optional; derived from the id when missing
  targets: Targets;
  lengthDays: number;
  reasons?: string[];
  notes?: { text: string; color: HabitColor }[];   // the first one is shown as the paper note
  createdAt?: string;                 // "YYYY-MM-DD"
  sheetsCount: number;
  lastSheet?: { id: string; startDate: string; endDate: string; days: Level[] } | null;
}

/** One sheet (tracker page) inside GET /api/habits/{id} */
export interface HabitSheetData {
  id: string;
  startDate: string;                  // "YYYY-MM-DD"
  endDate: string;
  targets: Targets;                   // the targets this sheet had
  days: { date: string; level: Level }[];
  note?: string | null;
}

export interface SearchFieldProps { value?: string; onChange?: (value: string) => void; placeholder?: string; label?: string; }
export interface MiniWeekProps { days: (Level | { date: string; level: Level })[]; label: string; }
export interface HabitNoteProps { habit: HabitSummary; onOpen?: (h: HabitSummary) => void; onDelete?: (h: HabitSummary) => void | Promise<void>; }
export interface HabitBoardProps { habits: HabitSummary[]; onOpen?: (h: HabitSummary) => void; onDelete?: (h: HabitSummary) => void | Promise<void>; onCreate?: () => void; query?: string; onQueryChange?: (q: string) => void; }
export interface SheetRowProps { day: { date: string; level: Level }; }
export interface HabitSheetProps { sheet: HabitSheetData; unit: string; expanded?: boolean; onToggle?: () => void; current?: boolean; }
export interface HabitDetailProps { habit: HabitSummary; sheets: HabitSheetData[]; onBack?: () => void; onDelete?: (h: HabitSummary) => void | Promise<void>; onNewSheet?: () => void; today?: string; }

declare global {
  interface Window {
    StayInTrack: Window["StayInTrack"] & {
      SearchField: React.FC<SearchFieldProps>;
      MiniWeek: React.FC<MiniWeekProps>;
      HabitNote: React.FC<HabitNoteProps>;
      HabitBoard: React.FC<HabitBoardProps>;
      SheetRow: React.FC<SheetRowProps>;
      HabitSheet: React.FC<HabitSheetProps>;
      HabitDetail: React.FC<HabitDetailProps>;
      sortSheetsDesc: (s: HabitSheetData[]) => HabitSheetData[];
      sheetSummary: (days: MiniWeekProps["days"]) => { total: number; logged: number; atLeastMin: number; atLeastOk: number; ideal: number; missed: number };
      formatRange: (start: string, end: string) => string;
      habitColor: (h: HabitSummary) => HabitColor;
    };
  }
}
