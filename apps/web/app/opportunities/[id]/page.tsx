import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { OfferDetail } from "@/components/opportunities/offer-detail";
import { getOffer } from "@/lib/api-server";

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOffer(id);
  if (!offer) notFound();

  return (
    <AppShell title="Détail de l'opportunité" subtitle={offer.platform}>
      <OfferDetail offer={offer} />
    </AppShell>
  );
}
