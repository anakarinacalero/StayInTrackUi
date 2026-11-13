import * as React from "react";
type Tone = "ink" | "blush" | "mustard" | "tan" | "gold" | "rose" | "onsticky" | "onink";
export interface DoodleProps { kind?: "cloud" | "flower" | "plus" | "dot" | "rings" | "squiggle" | "sparkle" | "bulb" | "phone" | "target" | "chart" | "calendar" | "send" | "sprout"; tone?: Tone; size?: number; style?: React.CSSProperties; className?: string; }
export interface DoodleFieldProps { seed?: number; count?: number; kinds?: DoodleProps["kind"][]; children?: React.ReactNode; style?: React.CSSProperties; className?: string; }
export interface NotebookCoverProps { children?: React.ReactNode; style?: React.CSSProperties; className?: string; }
export interface LogoProps { size?: "sm" | "md" | "lg"; onCover?: boolean; }
export interface HandTitleProps { as?: "h1" | "h2" | "h3" | "div"; size?: "xl" | "lg" | "md"; underline?: "mustard" | "blush" | "none"; accent?: string; children?: React.ReactNode; className?: string; }
export interface HighlightProps { children?: React.ReactNode; }
export interface JournalPageProps { pattern?: "dash" | "dot" | "lined" | "blank"; binding?: "disc" | "none"; scallop?: boolean; title?: React.ReactNode; children?: React.ReactNode; style?: React.CSSProperties; className?: string; }
export interface ScallopCardProps { tone?: "paper" | "blush" | "butter" | "cover"; children?: React.ReactNode; style?: React.CSSProperties; className?: string; }
export interface BlobProps { children?: React.ReactNode; style?: React.CSSProperties; className?: string; }
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary" | "soft" | "ghost"; size?: "sm" | "md" | "lg"; }
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; hint?: string; script?: boolean; multiline?: boolean; }
export interface BadgeProps { tone?: "neutral" | "rose" | "butter" | "sage" | "sky"; children?: React.ReactNode; }
export interface ChoiceProps { question: string; value?: boolean | null; onChange?: (v: boolean) => void; yes?: string; no?: string; }
export interface CheckItemProps { checked?: boolean; onChange?: (checked: boolean) => void; priority?: "high" | "mid" | "low"; children?: React.ReactNode; }
export interface NavBarProps { active?: "home" | "suggestions" | "distractors" | "tracker" | "wish" | "helper" | "summary"; onNavigate?: (id: string) => void; user?: string; defaultOpen?: boolean | "tools" | "ai"; /** Menu keys to leave out, e.g. ["ai"]. */ hideMenus?: Array<"tools" | "ai">; }
export interface NumberedTipProps { n: number; done?: boolean; onToggle?: () => void; children?: React.ReactNode; }
export interface StickyNoteProps { color?: "butter" | "rose" | "sky" | "sage"; rotate?: number; pin?: "tape" | "pin" | "none"; children?: React.ReactNode; style?: React.CSSProperties; className?: string; }
export interface HabitRowProps { day: number | string; value?: 0 | 1 | 2 | 3; onChange?: (v: number) => void; labels?: [string, string, string]; }
export interface RuledListProps { title: React.ReactNode; items: React.ReactNode[]; align?: "left" | "center"; }
export interface DecisionTableProps { columns: { question: string; yes: string; no: string }[]; }
export interface StepListProps { steps: string[]; active?: number; }
export interface ChatMessageProps { from?: "ai" | "user"; name?: string; children?: React.ReactNode; }
export interface ChatComposerProps { placeholder?: string; onSend?: (text: string) => void; }
export interface PromptChipProps { icon?: DoodleProps["kind"]; onClick?: () => void; children?: React.ReactNode; }
export interface ThinkingProps {}
export interface InsightCardProps { icon?: DoodleProps["kind"]; tone?: "butter" | "rose" | "sky" | "sage"; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode; }
export interface StatTileProps { label: string; value: React.ReactNode; unit?: string; note?: string; icon?: DoodleProps["kind"]; tone?: "paper" | "sage" | "rose" | "butter"; }
export interface ProgressRowProps { label: string; value: number; total: number; unit?: string; icon?: DoodleProps["kind"]; }
export interface ChartDatum { label: string; value: number; }
export interface BarChartProps { title: string; data: ChartDatum[]; highlight?: string[]; max?: number; unit?: string; labelHead?: string; }
export interface LineChartProps { title: string; data: ChartDatum[]; max?: number; unit?: string; labelHead?: string; }
