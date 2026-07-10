import AppLayout from "@/components/layout/AppLayout";
import PapersPage from "@/components/papers/PapersPage";

export default function Marks() {
  return (
    <AppLayout title="Mark schemes">
      <PapersPage mode="marks" />
    </AppLayout>
  );
}
