import Sidebar from "./Sidebar";

/**
 * Shared skeleton shown during route transitions. Renders the sidebar shell
 * so the user sees the app frame instantly, with a shimmering placeholder for
 * the content area.
 */
export default function PageSkeleton() {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-8 py-5 border-b border-grayline bg-paper sticky top-0 z-10">
          <div className="h-6 w-32 rounded bg-graylite animate-pulse" />
          <div className="h-8 w-28 rounded bg-graylite animate-pulse" />
        </div>
        <main className="flex-1 px-8 py-8 max-w-7xl w-full mx-auto space-y-4">
          <div className="h-8 w-1/3 rounded bg-graylite animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-graylite animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-graylite animate-pulse"
              />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-graylite animate-pulse mt-6" />
        </main>
      </div>
    </div>
  );
}
