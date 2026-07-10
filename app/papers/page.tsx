import AppLayout from "@/components/layout/AppLayout";
import PapersPage from "@/components/papers/PapersPage";

export default function Papers() {
  return (
    <AppLayout title="Past papers">
      <PapersPage mode="papers" />
    </AppLayout>
  );
}
