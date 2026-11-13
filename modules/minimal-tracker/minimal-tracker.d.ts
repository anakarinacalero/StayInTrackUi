import * as React from "react";

export type NoteColor = "butter" | "rose" | "sky" | "sage";
export interface MotivationNoteData { id: string; text: string; color: NoteColor; rotate?: number; }
export interface Targets { unit: string; min: number | string; ok: number | string; ideal: number | string; }

/** What CreateHabitForm sends to onSubmit */
export interface CreateHabitPayload {
  name: string;
  startDate: string;            // "YYYY-MM-DD"
  lengthDays: 7 | 14 | 30;
  unit: string;                 // "min" | "pages" | "glasses" | "times" | "steps" | "km"
  targets: { min: number; ok: number; ideal: number };
  reasons: string[];            // empty strings removed
  reminderTime: string | null;  // "HH:mm" or null
  notes: { text: string; color: NoteColor }[]; // empty notes removed
}

export interface CreateHabitFormProps {
  initial?: Partial<{ name: string; startDate: string; lengthDays: number; targets: Targets; reasons: string[]; reminderTime: string; notes: MotivationNoteData[] }>;
  onSubmit?: (payload: CreateHabitPayload) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}
export interface MotivationBoardProps { notes: MotivationNoteData[]; onChange?: (notes: MotivationNoteData[]) => void; max?: number; phrases?: string[]; title?: string; subtitle?: string; }
export interface MotivationNoteProps { note: MotivationNoteData; onChange?: (note: MotivationNoteData) => void; onDelete?: () => void; autoFocus?: boolean; maxLength?: number; }
export interface TargetFieldsProps { value: Targets; onChange?: (value: Targets) => void; units?: string[]; showError?: boolean; }
export interface TargetPreviewProps { day?: number; targets: Targets; }
export interface ReasonListProps { value?: string[]; onChange?: (value: string[]) => void; max?: number; placeholder?: string; }
export interface ChipGroupProps<T = string | number> { label?: string; id?: string; options: (T | { value: T; label: string })[]; value?: T; onChange?: (value: T) => void; }

declare global {
  interface Window {
    StayInTrack: Window["StayInTrack"] & {
      CreateHabitForm: React.FC<CreateHabitFormProps>;
      MotivationBoard: React.FC<MotivationBoardProps>;
      MotivationNote: React.FC<MotivationNoteProps>;
      TargetFields: React.FC<TargetFieldsProps>;
      TargetPreview: React.FC<TargetPreviewProps>;
      ReasonList: React.FC<ReasonListProps>;
      ChipGroup: React.FC<ChipGroupProps>;
      buildHabitPayload: (form: any) => CreateHabitPayload;
      targetsError: (t: Targets) => string | null;
      MOTIVATION_PHRASES: string[];
      NOTE_COLORS: NoteColor[];
      HABIT_UNITS: string[];
    };
  }
}
