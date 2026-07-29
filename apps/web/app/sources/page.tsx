import { AppShell } from "@/components/layout/app-shell";
import { SourcesTable } from "@/components/sources/sources-table";
import { AddSourceForm } from "@/components/sources/add-source-form";
import { getSources } from "@/lib/api-server";

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <AppShell title="Sources" subtitle="Plateformes scannées et exécutions">
      <div className="space-y-6">
        <AddSourceForm />
        <SourcesTable sources={sources} />
      </div>
    </AppShell>
  );
}
