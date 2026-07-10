export interface PaperSource {
  name: string;
  baseUrl: string;
  buildBrowseUrl: (q: { subject: string; year?: string; paper?: string }) => string;
}

export const SOURCES: PaperSource[] = [
  {
    name: "GCE Guide",
    baseUrl: "https://gceguide.com",
    buildBrowseUrl: ({ subject }) =>
      `https://gceguide.com/igcse/${encodeURIComponent(subject.toLowerCase().replace(/\s+/g, "-"))}/`,
  },
  {
    name: "Papa Cambridge",
    baseUrl: "https://pastpapers.papacambridge.com",
    buildBrowseUrl: ({ subject }) =>
      `https://pastpapers.papacambridge.com/?dir=Cambridge%20IGCSE/${encodeURIComponent(subject)}`,
  },
  {
    name: "Xtremepapers",
    baseUrl: "https://papers.xtremepape.rs",
    buildBrowseUrl: ({ subject }) =>
      `https://papers.xtremepape.rs/CAIE/IGCSE/${encodeURIComponent(subject)}`,
  },
  {
    name: "Dynamic Papers",
    baseUrl: "https://dynamicpapers.com",
    buildBrowseUrl: ({ subject }) =>
      `https://dynamicpapers.com/wp-content/uploads/2017/10/${encodeURIComponent(subject)}/`,
  },
  {
    name: "Save My Exams",
    baseUrl: "https://www.savemyexams.com",
    buildBrowseUrl: ({ subject }) =>
      `https://www.savemyexams.com/igcse/${encodeURIComponent(subject.toLowerCase().replace(/\s+/g, "-"))}/`,
  },
];
