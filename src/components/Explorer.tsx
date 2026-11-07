import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { data, renewables, row, share, SOURCES } from "../lib/story";
import { useLang } from "../lib/i18n";

const rows = data.egypt.filter((entry) => entry.total !== null);
const FIRST = rows[0]!.year;
const LAST = rows[rows.length - 1]!.year;

export function Explorer() {
  const { lang, t, f } = useLang();
  const ar = lang === "ar";
  const [year, setYear] = useState(LAST);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const entry = row(data.egypt, year);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setYear((current) => {
        if (current >= LAST) {
          setPlaying(false);
          return LAST;
        }
        return current + 1;
      });
    }, 450);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing]);

  const perDay = entry.perCapita! / 365;
  const segments = SOURCES.map((source) => ({ source, value: share(entry, source) ?? 0 })).filter((segment) => segment.value > 0);

  return (
    <section className="border-y border-[var(--hairline)] bg-[var(--surface)] transition-colors duration-700" aria-labelledby="explore-title">
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-8">
        <p className="kicker text-sm font-semibold text-[var(--accent)]">07 · {ar ? "استكشف" : "Explore"}</p>
        <h2 id="explore-title" className="mt-2 font-display text-3xl leading-tight text-[var(--ink)] md:text-4xl">
          {ar ? "اختر سنة" : "Pick a year"}
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-[var(--ink-2)]">{ar ? "تنقّل بين أربعة عقود من مزيج الكهرباء في مصر، أو اضغط تشغيل." : "Drag through four decades of Egypt's power mix, or press play."}</p>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (!playing && year >= LAST) setYear(FIRST);
              setPlaying((value) => !value);
            }}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[var(--page)] transition hover:opacity-90"
            aria-label={playing ? (ar ? "إيقاف مؤقت" : "Pause") : ar ? "تشغيل عبر السنوات" : "Play through the years"}
          >
            {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5 translate-x-px" aria-hidden="true" />}
          </button>
          <label className="flex min-w-0 flex-1 flex-col gap-1" dir="ltr">
            <span className="sr-only">{ar ? "السنة" : "Year"}</span>
            <input
              type="range"
              min={FIRST}
              max={LAST}
              step={1}
              value={year}
              onChange={(event) => {
                setPlaying(false);
                setYear(Number(event.target.value));
              }}
              className="year-range w-full"
              aria-valuetext={String(year)}
            />
            <span className="flex justify-between text-xs text-[var(--muted)] tabular-nums">
              <span>{FIRST}</span>
              <span>{LAST}</span>
            </span>
          </label>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <dl className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <dt className="sr-only">{ar ? "السنة" : "Year"}</dt>
              <dd className="font-display text-7xl text-[var(--ink)] tabular-nums" aria-live="polite">
                {year}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--ink-2)]">{ar ? "الكهرباء المولّدة" : "Generated"}</dt>
              <dd className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{f.n(entry.total!, 1)} <span className="text-sm font-normal text-[var(--ink-2)]">{t.twh}</span></dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--ink-2)]">{ar ? "السكان" : "People"}</dt>
              <dd className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{f.n(entry.population! / 1e6, 1)} <span className="text-sm font-normal text-[var(--ink-2)]">{t.million}</span></dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--ink-2)]">{ar ? "نصيب الفرد يوميًا" : "Per person, per day"}</dt>
              <dd className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{f.n(perDay, 1)} <span className="text-sm font-normal text-[var(--ink-2)]">{t.kwh}</span></dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--ink-2)]">{ar ? "الطاقة المتجددة" : "Renewables"}</dt>
              <dd className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{f.pct(renewables(entry)!, 1)}</dd>
            </div>
          </dl>

          <figure>
            <figcaption className="font-semibold text-[var(--ink)]">{ar ? `مصادر كهرباء مصر في ${year}` : `Where Egypt's electricity came from in ${year}`}</figcaption>
            <div className="mt-4 flex h-14 w-full gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label={segments.map((segment) => `${t.sources[segment.source]} ${f.pct(segment.value, 1)}`).join(ar ? "، " : ", ")}>
              {segments.map((segment) => (
                <div
                  key={segment.source}
                  className="flex items-center justify-center text-sm font-semibold transition-[flex-grow] duration-300"
                  style={{ flexGrow: segment.value, flexBasis: 0, background: `var(--${segment.source})`, color: segment.source === "solar" ? "#1b1712" : "#fff" }}
                  title={`${t.sources[segment.source]} ${f.pct(segment.value, 1)}`}
                >
                  {segment.value >= 9 ? f.pct(segment.value) : ""}
                </div>
              ))}
            </div>
            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
              {SOURCES.map((source) => {
                const value = entry[source] ?? 0;
                return (
                  <li key={source} className="flex items-center justify-between gap-2 border-b border-[var(--hairline)] pb-2 text-sm">
                    <span className="flex items-center gap-2 text-[var(--ink-2)]">
                      <span className="inline-block size-2.5 rounded-sm" style={{ background: `var(--${source})` }} aria-hidden="true" />
                      {t.sources[source]}
                    </span>
                    <span className="text-[var(--ink)] tabular-nums">
                      {f.twh(value)} <span className="text-[var(--muted)]">· {f.pct(share(entry, source) ?? 0, 1)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </figure>
        </div>
      </div>
    </section>
  );
}
