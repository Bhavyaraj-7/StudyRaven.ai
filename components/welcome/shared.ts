// Kept apart from WelcomeFilm.tsx on purpose: anything importing that file
// pulls Remotion into the page bundle. Only the lazy player may import it.
export type WelcomeProps = { name: string; subjects: string[] };

export function firstName(full: string): string {
  const first = full.trim().split(/\s+/)[0] ?? "";
  return first.length > 18 ? first.slice(0, 18) : first;
}
