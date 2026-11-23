/**
 * Single source for public site facts used by the footer, legal pages and
 * metadata. Values marked TO CONFIRM must be filled in before the legal
 * pages go live — they render as a visible "[to be confirmed]" until then.
 */
export const SITE: {
  name: string;
  url: string;
  contactEmail: string;
  operator: string | null;
  operatorCity: string | null;
} = {
  name: "StudyRaven",
  url: "https://www.studyravenai.com",
  // Founder choice (23 Nov 2026): keep this address for now. Swap for a role
  // address on the domain (e.g. support@studyravenai.com) once it receives mail.
  contactEmail: "bsingh10@jpischool.com",
  // TO CONFIRM: the person or company legally running StudyRaven (usually the
  // Razorpay merchant account holder), and their city for governing law.
  operator: null,
  operatorCity: null,
};

export const TRADEMARK_NOTE =
  "Cambridge, IGCSE, Pearson Edexcel, IB, PSAT, SAT and Common App are trademarks of their owners. StudyRaven is independent and not endorsed by or affiliated with them.";
