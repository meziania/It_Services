import { AppShell } from "@/components/layout/app-shell";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { getOffers } from "@/lib/api-server";

export default async function PipelinePage() {
  const offers = await getOffers();

  return (
    <AppShell title="Pipeline" subtitle="Suivi des opportunités par statut">
      <PipelineBoard offers={offers} />
    </AppShell>
  );
}
