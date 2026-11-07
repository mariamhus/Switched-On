import { useState } from "react";
import { data, type Peer } from "../lib/story";
import { PEER_NAMES, useLang } from "../lib/i18n";

type Metric = "perCapita" | "renewables";

function Bars({ metric, order }: { metric: Metric; order: Peer[] }) {
  const { lang, f } = useLang();
  const max = Math.max(...order.map((peer) => peer[metric]));
  const title =
    metric === "perCapita"
      ? lang === "ar"
        ? "نصيب الفرد من الكهرباء، كيلوواط ساعة سنويًا"
        : "Electricity per person, kWh a year"
      : lang === "ar"
        ? "حصة الطاقة المتجددة من الكهرباء"
        : "Share of electricity from renewables";
  const format = (value: number) => (metric === "perCapita" ? f.n(value) : f.pct(value, 1));
  return (
    <figure className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5">
      <figcaption className="font-semibold text-[var(--ink)]">{title}</figcaption>
      <ol className="mt-4 space-y-2.5">
        {order.map((peer) => {
          const egypt = peer.id === "egypt";
          const average = peer.id === "world" || peer.id === "africa";
          const value = peer[metric];
          return (
            <li key={peer.id} className="group grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
              <span className={`truncate ${egypt ? "font-bold text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>{PEER_NAMES[peer.id]?.[lang] ?? peer.label}</span>
              <span className="flex items-center gap-2">
                <span
                  className="h-5 rounded-e-[4px] transition-[width,opacity] duration-700 group-hover:opacity-80"
                  style={{
                    width: `${Math.max(0.6, (value / max) * 82)}%`,
                    background: egypt ? "var(--gas)" : average ? "var(--muted)" : "var(--neutral-bar)",
                  }}
                  aria-hidden="true"
                />
                <span className={`tabular-nums ${egypt ? "font-bold text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>{format(value)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}

export function Peers() {
  const { lang, f } = useLang();
  const ar = lang === "ar";
  const [sort, setSort] = useState<Metric>("perCapita");
  const order = [...data.peers].sort((a, b) => b[sort] - a[sort]);
  const egypt = data.peers.find((peer) => peer.id === "egypt")!;
  const world = data.peers.find((peer) => peer.id === "world")!;
  const morocco = data.peers.find((peer) => peer.id === "morocco")!;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-8" aria-labelledby="peers-title">
      <p className="kicker text-sm font-semibold text-[var(--accent)]">
        06 · {ar ? `مصر بين جيرانها، ${data.peerYear}` : `Egypt next to its neighbours, ${data.peerYear}`}
      </p>
      <h2 id="peers-title" className="mt-2 max-w-3xl font-display text-3xl leading-tight text-[var(--ink)] md:text-4xl">
        {ar ? "نصف المتوسط العالمي، وطريق طويل نحو الطاقة المتجددة" : "Half the world average, and a long way to go on renewables"}
      </h2>
      <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-[var(--ink-2)]">
        {ar ? (
          <>
            <p>
              يستهلك المصري نحو {f.kwh(egypt.perCapita)} من الكهرباء سنويًا، وهو رقم قريب من الجزائر والأردن، ويقارب ضعف استهلاك الفرد في المغرب، ونحو نصف المتوسط العالمي البالغ {f.kwh(world.perCapita)}.
            </p>
            <p>
              وفي الطاقة المتجددة، تأتي حصة مصر البالغة {f.pct(egypt.renewables)} خلف المغرب ({f.pct(morocco.renewables)}) والأردن وتركيا، وخلف المتوسط العالمي البالغ {f.pct(world.renewables)}.
            </p>
          </>
        ) : (
          <>
            <p>
              An Egyptian uses about {f.kwh(egypt.perCapita)} of electricity a year, close to Algeria and Jordan, almost twice as much as someone in Morocco and about half the world average of {f.kwh(world.perCapita)}.
            </p>
            <p>
              On renewables, Egypt's {f.pct(egypt.renewables)} trails Morocco ({f.pct(morocco.renewables)}), Jordan and Türkiye, and the world average of {f.pct(world.renewables)}.
            </p>
          </>
        )}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={ar ? "ترتيب الدول حسب" : "Sort countries by"}>
        <span className="me-1 text-sm text-[var(--ink-2)]">{ar ? "الترتيب حسب" : "Sort by"}</span>
        {(["perCapita", "renewables"] as Metric[]).map((metric) => (
          <button
            key={metric}
            type="button"
            role="radio"
            aria-checked={sort === metric}
            onClick={() => setSort(metric)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${sort === metric ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--page)]" : "border-[var(--hairline)] text-[var(--ink-2)] hover:border-[var(--ink-2)]"}`}
          >
            {metric === "perCapita" ? (ar ? "نصيب الفرد من الكهرباء" : "Electricity per person") : ar ? "حصة الطاقة المتجددة" : "Renewables share"}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Bars metric="perCapita" order={order} />
        <Bars metric="renewables" order={order} />
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">
        {ar
          ? `مصر مميزة باللون البرتقالي، والمتوسطات الإقليمية والعالمية باللون الرمادي. الأرقام لعام ${data.peerYear}، وهو أحدث عام تتوفر فيه بيانات لكل الدول.`
          : `Egypt is highlighted in orange; regional and world averages are in grey. Figures for ${data.peerYear}, the latest year with data for every country.`}
      </p>
    </section>
  );
}
