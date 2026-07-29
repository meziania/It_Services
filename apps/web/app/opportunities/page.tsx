import { AppShell } from "@/components/layout/app-shell";
import { OpportunitiesExplorer } from "@/components/opportunities/opportunities-explorer";
import { getOffers } from "@/lib/api-server";

export default async function OpportunitiesPage() {
  const offers = await getOffers();

  return (
    <AppShell title="Opportunités" subtitle={`${offers.length} offres scannées`}>
      <OpportunitiesExplorer offers={offers} />
    </AppShell>
  );
}
