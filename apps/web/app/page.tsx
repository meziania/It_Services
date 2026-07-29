const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type HealthResponse = {
  status: string;
  dependencies: { database: "up" | "down" };
  timestamp: string;
};

type Offer = {
  id: string;
  platform: string;
  title: string;
  itCategory: string;
  matchScore: number;
  status: string;
  url: string;
};

async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getOffers(): Promise<Offer[]> {
  try {
    const res = await fetch(`${API_URL}/offers`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [health, offers] = await Promise.all([getHealth(), getOffers()]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">ServiceIt-scanner</h1>
          <p className="text-slate-400">
            Freelance IT opportunity scanner — sprint 1 scaffold (Docs2 chapter 16).
          </p>
        </header>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            API status
          </h2>
          {health ? (
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  health.dependencies.database === "up" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span>
                {health.status} — database: {health.dependencies.database}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span>API unreachable at {API_URL}. Is `npm run dev:api` running?</span>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Opportunities ({offers.length})
          </h2>
          {offers.length === 0 ? (
            <p className="text-slate-400">
              No offers yet. Add one via <code>POST {API_URL}/offers</code> or wait for the
              first scraper adapter.
            </p>
          ) : (
            <ul className="space-y-3">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950 p-3"
                >
                  <div>
                    <p className="font-medium">{offer.title}</p>
                    <p className="text-xs text-slate-400">
                      {offer.platform} · {offer.itCategory} · {offer.status}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold">
                    {offer.matchScore}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
