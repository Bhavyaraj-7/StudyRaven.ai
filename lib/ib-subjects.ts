// IB Diploma Programme subjects, grouped by the six DP subject groups.
// Mirrors the shape of lib/igcse-subjects.ts so the same onboarding/subjects
// dropdown consumes it unchanged. IB has no Cambridge-style numeric syllabus
// codes, so `code` carries the group tag (G1–G6) instead — informational, and
// the code field stays editable exactly as it is for IGCSE.

export type IbSubject = { name: string; code: string };

export const IB_SUBJECTS: IbSubject[] = [
  // Group 1 — Studies in Language and Literature
  { name: "English A: Language and Literature", code: "G1" },
  { name: "English A: Literature", code: "G1" },
  { name: "Hindi A: Literature", code: "G1" },
  { name: "Spanish A: Literature", code: "G1" },
  // Group 2 — Language Acquisition
  { name: "English B", code: "G2" },
  { name: "French B", code: "G2" },
  { name: "Spanish B", code: "G2" },
  { name: "French ab initio", code: "G2" },
  { name: "Spanish ab initio", code: "G2" },
  // Group 3 — Individuals and Societies
  { name: "Business Management", code: "G3" },
  { name: "Economics", code: "G3" },
  { name: "Geography", code: "G3" },
  { name: "History", code: "G3" },
  { name: "Global Politics", code: "G3" },
  { name: "Psychology", code: "G3" },
  { name: "Philosophy", code: "G3" },
  { name: "Digital Society", code: "G3" },
  // Group 4 — Sciences
  { name: "Biology", code: "G4" },
  { name: "Chemistry", code: "G4" },
  { name: "Physics", code: "G4" },
  { name: "Computer Science", code: "G4" },
  { name: "Design Technology", code: "G4" },
  { name: "Environmental Systems and Societies", code: "G4" },
  { name: "Sports, Exercise and Health Science", code: "G4" },
  // Group 5 — Mathematics
  { name: "Mathematics: Analysis and Approaches", code: "G5" },
  { name: "Mathematics: Applications and Interpretation", code: "G5" },
  // Group 6 — The Arts
  { name: "Visual Arts", code: "G6" },
  { name: "Music", code: "G6" },
  { name: "Theatre", code: "G6" },
  { name: "Film", code: "G6" },
  { name: "Dance", code: "G6" },
];

export const IB_SUBJECT_NAMES = IB_SUBJECTS.map((s) => s.name);

export function codeForIbSubject(name: string): string {
  return IB_SUBJECTS.find((s) => s.name === name)?.code ?? "";
}
