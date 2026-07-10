// Cambridge IGCSE subjects with syllabus codes.
// Used by the onboarding flow and the subjects management page so students
// pick from a canonical list instead of free-typing (which caused typos and
// mismatched codes). Picking a name auto-fills its code.

export type IgcseSubject = { name: string; code: string };

export const IGCSE_SUBJECTS: IgcseSubject[] = [
  { name: "Mathematics", code: "0580" },
  { name: "Additional Mathematics", code: "0606" },
  { name: "English - First Language", code: "0500" },
  { name: "English as a Second Language", code: "0510" },
  { name: "English Literature", code: "0475" },
  { name: "Physics", code: "0625" },
  { name: "Chemistry", code: "0620" },
  { name: "Biology", code: "0610" },
  { name: "Combined Science", code: "0653" },
  { name: "Co-ordinated Sciences", code: "0654" },
  { name: "Computer Science", code: "0478" },
  { name: "Information & Communication Technology", code: "0417" },
  { name: "Economics", code: "0455" },
  { name: "Business Studies", code: "0450" },
  { name: "Accounting", code: "0452" },
  { name: "Geography", code: "0460" },
  { name: "History", code: "0470" },
  { name: "Global Perspectives", code: "0457" },
  { name: "Sociology", code: "0495" },
  { name: "Religious Studies", code: "0490" },
  { name: "French", code: "0520" },
  { name: "Spanish", code: "0530" },
  { name: "German", code: "0525" },
  { name: "Hindi as a Second Language", code: "0549" },
  { name: "Art & Design", code: "0400" },
  { name: "Music", code: "0410" },
  { name: "Drama", code: "0411" },
  { name: "Physical Education", code: "0413" },
  { name: "Design & Technology", code: "0445" },
  { name: "Environmental Management", code: "0680" },
  { name: "Food & Nutrition", code: "0648" },
  { name: "Travel & Tourism", code: "0471" },
];

export const IGCSE_SUBJECT_NAMES = IGCSE_SUBJECTS.map((s) => s.name);

export function codeForSubject(name: string): string {
  return IGCSE_SUBJECTS.find((s) => s.name === name)?.code ?? "";
}
