import Link from "next/link";
import { Briefcase, Sparkles, Flame, Database, Server, Cpu, Activity } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { PlatformBadge, CategoryBadge, ScoreBadge, OfferTypeBadge } from "@/components/ui/domain-badges";
import { getHealth, getOffers, getSources } from "@/lib/api-server";
import { isToday, timeAgo } from "@/lib/format";

export default async function DashboardPage() {
  const [health, offers, sources] = await Promise.all([getHealth(), getOffers(), getSources()]);

  const newToday = offers.filter((o) => isToday(o.createdAt)).length;
  const highPriority = offers.filter((o) => o.matchScore >= 70).length;
  const activeSources = sources.filter((s) => s.active).length;
  const topOffers = [...offers].sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  const recentOffers = [...offers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const dbUp = health?.dependencies?.database === "up";

  return (
    <AppShell title="Dashboard" subtitle="Vue d'ensemble de votre activité">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard icon={Briefcase} label="Total offres" value={offers.length} color="teal" />
        <KpiCard icon={Sparkles} label="Nouvelles aujourd'hui" value={newToday} color="violet" />
        <KpiCard icon={Flame} label="High priority" value={highPriority} hint="score ≥ 70" color="amber" />
        <KpiCard
          icon={Database}
          label="Sources actives"
          value={`${activeSources}/${sources.length}`}
          color="emerald"
        />
        <KpiCard
          icon={Activity}
          label="Santé système"
          value={dbUp ? "100%" : "Dégradé"}
          color={dbUp ? "emerald" : "red"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Top opportunités"
            subtitle="Meilleur score de correspondance"
            action={
              <Link href="/opportunities" className="text-xs font-medium text-teal-400 hover:underline">
                Voir toutes →
              </Link>
            }
          />
          {topOffers.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              Aucune offre pour l'instant. Lance un scraper depuis la page{" "}
              <Link href="/sources" className="text-teal-400 hover:underline">
                Sources
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {topOffers.map((offer, index) => (
                <li key={offer.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-4 text-xs font-medium text-slate-600">{index + 1}</span>
                  <Link
                    href={`/opportunities/${offer.id}`}
                    className="flex-1 truncate text-sm font-medium text-slate-200 hover:text-teal-400 hover:underline"
                  >
                    {offer.title}
                  </Link>
                  <PlatformBadge platform={offer.platform} />
                  <CategoryBadge category={offer.itCategory} />
                  <OfferTypeBadge offerType={offer.offerType} />
                  <span className="hidden w-20 text-right text-xs text-slate-500 sm:block">
                    {timeAgo(offer.publishedAt ?? offer.createdAt)}
                  </span>
                  <ScoreBadge score={offer.matchScore} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Activité récente" />
            {recentOffers.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Aucune activité récente.</p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {recentOffers.map((offer) => (
                  <li key={offer.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
                      <Sparkles size={12} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-300">{offer.title}</p>
                      <p className="text-xs text-slate-500">
                        {offer.platform} · {timeAgo(offer.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Santé système" />
            <ul className="divide-y divide-slate-800 text-sm">
              {[
                { label: "Crawlers", icon: Cpu, ok: sources.length > 0 },
                { label: "API", icon: Server, ok: true },
                { label: "Base de données", icon: Database, ok: dbUp },
                { label: "Queues", icon: Activity, ok: true },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between px-5 py-3">
                  <span className="flex items-center gap-2 text-slate-300">
                    <item.icon size={14} className="text-slate-500" />
                    {item.label}
                  </span>
                  <span
                    className={`text-xs font-medium ${item.ok ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {item.ok ? "Opérationnel" : "Dégradé"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
