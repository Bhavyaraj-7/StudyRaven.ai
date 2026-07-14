import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import CommandPalette from "@/components/shared/CommandPalette";

export default function AppLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        {/* pb-24 keeps content clear of the mobile bottom nav */}
        <main className="flex-1 px-4 sm:px-8 py-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <BottomNav />
      <CommandPalette />
    </div>
  );
}
