export type Curriculum = "IGCSE";
export type PlanTier = "free" | "pro";
export type BillingCycle = "monthly" | "yearly";
export type TaskStatus = "pending" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Profile {
  id: string;
  name: string;
  email: string;
  grade: number | null;
  curriculum: Curriculum | null;
  country: string | null;
  gmail_connected?: boolean;
  classroom_connected?: boolean;
  created_at?: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  exam_date: string | null;
  predicted_grade: string | null;
  created_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at?: string;
}

export interface MockTest {
  id: string;
  user_id: string;
  subject_id: string | null;
  score: number;
  max_score: number;
  feedback: string | null;
  taken_at: string;
}

export interface CollegeProfile {
  id: string;
  user_id: string;
  readiness_score: number;
  strengths: string[];
  gaps: string[];
  action_plan: ActionPlanItem[];
  target_country: string;
  target_universities: string[];
  interests: string[];
  extracurriculars: string[];
  created_at?: string;
}

export interface ActionPlanItem {
  month: string;
  goal: string;
  details: string;
}

export interface Competition {
  id: string;
  user_id: string;
  title: string;
  description: string;
  deadline: string | null;
  url: string;
  category: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  billing_cycle: BillingCycle | null;
  razorpay_id: string | null;
  status: "active" | "cancelled" | "expired" | "trial";
  current_period_end: string | null;
}

export interface UserPaper {
  id: string;
  user_id: string;
  subject: string;
  year: number | null;
  paper_number: string | null;
  pdf_url: string;
  mark_scheme_url: string | null;
  created_at?: string;
}

export interface AiPaper {
  id: string;
  user_id: string;
  subject: string;
  questions: AiQuestion[];
  mark_scheme: AiMarkSchemeItem[];
  difficulty: "easy" | "medium" | "hard";
  created_at?: string;
}

export interface AiQuestion {
  q: number;
  text: string;
  marks: number;
}

export interface AiMarkSchemeItem {
  q: number;
  answer: string;
  marks: number;
}

export interface Flashcard {
  id: string;
  user_id: string;
  subject_id: string | null;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  mastery_level: number;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: "summary" | "study_guide" | "slide_deck" | "mind_map" | "transcript";
  created_at: string;
}

export interface DayPlan {
  day: string;
  tasks: { title: string; subject: string; minutes: number }[];
}
