import { useEffect, useState } from "react";
import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import { ArrowDown } from "lucide-react";
import { data, facts } from "../lib/story";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useLang } from "../lib/i18n";

const f = facts();

function useCount(target: number, duration = 1400) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);
  return value;
}

function Stat({ label, to, unit, digits = 0, note }: { label: string; to: number; unit: string; digits?: number; note: string }) {
  const value = useCount(to);
  const { f } = useLang();
  return (
    <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5">
      <p className="text-sm text-[var(--ink-2)]">{label}</p>
      <p className="mt-2 font-display text-4xl text-[var(--ink)] tabular-nums md:text-5xl">
        {f.n(value, digits)}
        <span className="ms-1 text-xl text-[var(--ink-2)]">{unit}</span>
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {note}
      </p>
    </div>
  );
}

function Rise() {
  const rows = data.egypt.filter((entry) => entry.total !== null);
  const x = scaleLinear().domain([rows[0]!.year, rows[rows.length - 1]!.year]).range([0, 1000]);
  const y = scaleLinear().domain([0, 260]).range([200, 10]);
  const top = line<(typeof rows)[number]>().x((entry) => x(entry.year)).y((entry) => y(entry.total!)).curve(curveMonotoneX)(rows) ?? "";
  const fill = area<(typeof rows)[number]>().x((entry) => x(entry.year)).y0(200).y1((entry) => y(entry.total!)).curve(curveMonotoneX)(rows) ?? "";
  return (
    <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full md:h-56" aria-hidden="true">
      <defs>
        <linearGradient id="rise" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--gas)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--gas)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#rise)" />
      <path d={top} fill="none" stroke="var(--gas)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" pathLength={1} className="draw-on" />
    </svg>
  );
}

export function Hero() {
  const { lang, f: x, t } = useLang();
  const ar = lang === "ar";
  const people = Math.round(f.last.population! / 1e6);
  return (
    <header className="relative overflow-hidden border-b border-[var(--hairline)] pb-48 md:pb-60">
      <div className="mx-auto max-w-6xl px-4 pt-16 md:px-8 md:pt-24">
        <p className="kicker enter text-sm font-semibold text-[var(--accent)]">
          {ar ? `قصة بيانات · كهرباء مصر من ${f.first.year} إلى ${f.last.year}` : `A data story · Egypt's electricity, ${f.first.year} to ${f.last.year}`}
        </p>
        <h1 className="enter mt-4 max-w-4xl font-display text-6xl leading-[1.05] text-[var(--ink)] md:text-8xl" style={{ animationDelay: "80ms" }}>
          {t.brand}
        </h1>
        <p className="enter mt-6 max-w-2xl text-xl leading-relaxed text-[var(--ink-2)] md:text-2xl" style={{ animationDelay: "160ms" }}>
          {ar
            ? `كيف انتقلت مصر من شبكة كهرباء قائمة على النيل، إلى شبكة تعمل بالغاز، ثم إلى أول دفعة كبيرة نحو الشمس والرياح، وهي تحافظ على الأنوار مضاءة لـ${people} مليون شخص.`
            : `How Egypt went from a grid built on the Nile, to one built on gas, to the first big push for sun and wind, while keeping the lights on for ${people} million people.`}
        </p>
        <div className="enter mt-10 grid gap-4 sm:grid-cols-3" style={{ animationDelay: "240ms" }}>
          <Stat
            label={ar ? "عدد السكان" : "People"}
            to={f.last.population! / 1e6}
            unit={t.million}
            digits={1}
            note={ar ? `في ${f.last.year}، مقابل ${x.n(f.firstMix.population! / 1e6)} مليون في ${f.firstMix.year}` : `In ${f.last.year}, up from ${x.n(f.firstMix.population! / 1e6)} million in ${f.firstMix.year}`}
          />
          <Stat
            label={ar ? "الكهرباء المولّدة" : "Electricity generated"}
            to={f.last.total!}
            unit={t.twh}
            note={ar ? `في ${f.last.year}، مقابل ${x.n(f.firstMix.total!)} في ${f.firstMix.year}` : `In ${f.last.year}, up from ${x.n(f.firstMix.total!)} TWh in ${f.firstMix.year}`}
          />
          <Stat
            label={ar ? "نصيب الفرد من الكهرباء" : "Electricity per person"}
            to={f.last.perCapita!}
            unit={t.kwh}
            note={ar ? `سنويًا في ${f.last.year}، مقابل ${x.n(f.firstMix.perCapita!)} في ${f.firstMix.year}` : `Per year in ${f.last.year}, up from ${x.n(f.firstMix.perCapita!)} kWh in ${f.firstMix.year}`}
          />
        </div>
        <a href="#story" className="enter mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 font-semibold text-[var(--page)] transition hover:opacity-90" style={{ animationDelay: "320ms" }}>
          {ar ? "تابع القصة" : "Scroll the story"}
          <ArrowDown className="size-4" aria-hidden="true" />
        </a>
      </div>
      <Rise />
    </header>
  );
}
