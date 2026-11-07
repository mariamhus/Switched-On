import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX, line } from "d3-shape";
import { layout, maxValue, SOURCES, type Source, type YearRow } from "../lib/story";
import { useLang } from "../lib/i18n";
import { useReducedMotion } from "../lib/useReducedMotion";

export interface Annotation {
  kind: "band" | "point";
  from: number;
  to?: number;
  source?: Source;
  label: string;
  placement?: "above" | "below";
}

export interface View {
  id: string;
  title: string;
  from: number;
  to: number;
  mode: "stack" | "lines";
  unit: "twh" | "share";
  visible: Source[];
  highlight?: Source[];
  yMax?: number;
  annotations?: Annotation[];
}

const MARGIN = { top: 18, right: 112, bottom: 30, left: 44 };
const DURATION = 950;

function anchorFor(anchor: "start" | "end", rtl: boolean): { textAnchor: "start" | "end"; direction?: "rtl" } {
  if (!rtl) return { textAnchor: anchor };
  return { textAnchor: anchor === "start" ? "end" : "start", direction: "rtl" };
}

function niceMax(value: number) {
  return scaleLinear().domain([0, value * 1.08]).nice(5).domain()[1]!;
}

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function encode(view: View, rows: YearRow[]) {
  const result = layout(rows, view.mode, view.unit, view.visible);
  const yMax = view.yMax ?? niceMax(maxValue(result, rows, view.from, view.to));
  const values = [view.from, view.to, yMax];
  for (const source of SOURCES) {
    const visible = view.visible.includes(source);
    const faded = view.highlight && !view.highlight.includes(source);
    values.push(visible ? (faded ? 0.3 : 1) : 0, view.mode === "stack" ? 1 : 0);
    for (const [y0, y1] of result.bands[source]) values.push(y0, y1);
  }
  return values;
}

function useTween(target: number[], reduced: boolean) {
  const [current, setCurrent] = useState(target);
  const [settled, setSettled] = useState(true);
  const live = useRef(target);

  useEffect(() => {
    const start = live.current;
    if (reduced || start.length !== target.length) {
      live.current = target;
      setCurrent(target);
      setSettled(true);
      return;
    }
    setSettled(false);
    let frame = 0;
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - began) / DURATION);
      const k = ease(t);
      const next = target.map((value, index) => start[index]! + (value - start[index]!) * k);
      live.current = next;
      setCurrent(next);
      if (t < 1) frame = requestAnimationFrame(step);
      else setSettled(true);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);

  return { current, settled };
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 640, height: 420 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

export function MixChart({ view, rows }: { view: View; rows: YearRow[] }) {
  const reduced = useReducedMotion();
  const { t, f, dir } = useLang();
  const rtl = dir === "rtl";
  const target = useMemo(() => encode(view, rows), [view, rows]);
  const { current, settled } = useTween(target, reduced);
  const [box, { width, height }] = useSize<HTMLDivElement>();
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const clip = useId().replace(/:/g, "");

  const compact = width < 520;
  const margin = { ...MARGIN, right: compact ? 86 : MARGIN.right, left: compact ? 36 : MARGIN.left };
  const [from, to, yMax] = current as [number, number, number];
  const x = scaleLinear().domain([from, to]).range([margin.left, width - margin.right]);
  const y = scaleLinear().domain([0, yMax]).range([height - margin.bottom, margin.top]);
  const years = rows.map((entry) => entry.year);
  const bandsStart = 3 + 0;
  const perSource = 2 + rows.length * 2;

  const series = SOURCES.map((source, sourceIndex) => {
    const offset = bandsStart + sourceIndex * perSource;
    const opacity = current[offset]!;
    const stackness = current[offset + 1]!;
    const bands = years.map((year, index) => ({ year, y0: current[offset + 2 + index * 2]!, y1: current[offset + 3 + index * 2]! }));
    return { source, opacity, stackness, bands };
  });

  const inDomain = (year: number) => year >= Math.floor(from) - 1 && year <= Math.ceil(to) + 1;
  const areaPath = area<{ year: number; y0: number; y1: number }>()
    .defined((point) => inDomain(point.year))
    .x((point) => x(point.year))
    .y0((point) => y(point.y0))
    .y1((point) => y(point.y1))
    .curve(curveMonotoneX);
  const topPath = line<{ year: number; y0: number; y1: number }>()
    .defined((point) => inDomain(point.year))
    .x((point) => x(point.year))
    .y((point) => y(point.y1))
    .curve(curveMonotoneX);

  const fmt = (value: number) => (view.unit === "share" ? f.pct(value, 1) : f.twh(value));
  const lastYear = Math.min(view.to, years[years.length - 1]!);
  const lastIndex = years.indexOf(lastYear);

  const labels = (() => {
    if (!settled) return [];
    const list = series
      .filter((item) => view.visible.includes(item.source))
      .map((item) => {
        const band = item.bands[lastIndex]!;
        const value = band.y1 - band.y0;
        const anchor = view.mode === "stack" ? (band.y0 + band.y1) / 2 : band.y1;
        return { source: item.source, value, y: y(anchor), faded: item.opacity < 0.9 };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => a.y - b.y);
    const gap = 17;
    for (let i = 1; i < list.length; i += 1) list[i]!.y = Math.max(list[i]!.y, list[i - 1]!.y + gap);
    const bottom = height - margin.bottom - 4;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const limit = i === list.length - 1 ? bottom : list[i + 1]!.y - gap;
      list[i]!.y = Math.min(list[i]!.y, limit);
    }
    return list;
  })();

  const xTicks = x.ticks(compact ? 4 : 7).filter((tick) => Number.isInteger(tick));
  const yTicks = y.ticks(5);

  function pick(clientX: number) {
    const rect = box.current!.getBoundingClientRect();
    const year = Math.round(x.invert(clientX - rect.left));
    setHoverYear(Math.max(view.from, Math.min(view.to, year)));
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const base = hoverYear ?? view.to;
    const next = base + (event.key === "ArrowRight" ? 1 : -1);
    setHoverYear(Math.max(view.from, Math.min(view.to, next)));
  }

  const hover = hoverYear !== null ? rows.find((entry) => entry.year === hoverYear) : null;
  const hoverIndex = hover ? years.indexOf(hover.year) : -1;

  return (
    <figure className="flex h-full flex-col">
      <figcaption className="mb-2">
        <p className="font-semibold text-[var(--ink)]">{view.title}</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--ink-2)]" aria-label={t.legend}>
          {view.visible.map((source) => (
            <li key={source} className={`flex items-center gap-1.5 ${view.highlight && !view.highlight.includes(source) ? "opacity-60" : "font-semibold text-[var(--ink)]"}`}>
              <span className="inline-block size-2.5 rounded-sm" style={{ background: `var(--${source})` }} aria-hidden="true" />
              {t.sources[source]}
            </li>
          ))}
        </ul>
      </figcaption>
      <div
        ref={box}
        className="relative min-h-0 flex-1 touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] rounded-lg"
        tabIndex={0}
        role="img"
        aria-label={`${view.title}. ${t.chartHint}`}
        dir="ltr"
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => pick(event.clientX)}
        onPointerDown={(event: PointerEvent<HTMLDivElement>) => pick(event.clientX)}
        onPointerLeave={() => setHoverYear(null)}
        onKeyDown={onKey}
        onBlur={() => setHoverYear(null)}
      >
        <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden="true">
          <defs>
            <clipPath id={clip}>
              <rect x={margin.left} y={0} width={Math.max(0, width - margin.left - margin.right)} height={height} />
            </clipPath>
          </defs>
          {yTicks.map((tick) => (
            <g key={tick} transform={`translate(0 ${y(tick)})`}>
              <line x1={margin.left} x2={width - margin.right} stroke={tick === 0 ? "var(--axis)" : "var(--grid)"} />
              <text x={margin.left - 8} dy="0.32em" textAnchor="end" className="fill-[var(--muted)] text-[11px] tabular-nums">
                {f.n(tick)}
                {view.unit === "share" && tick === yTicks[yTicks.length - 1] ? "%" : ""}
              </text>
            </g>
          ))}
          <text x={4} y={margin.top - 8} {...anchorFor("start", rtl)} className="fill-[var(--muted)] text-[11px]">
            {view.unit === "share" ? "" : t.twh}
          </text>
          {xTicks.map((tick) => (
            <text key={tick} x={x(tick)} y={height - margin.bottom + 18} textAnchor="middle" className="fill-[var(--muted)] text-[11px] tabular-nums">
              {tick}
            </text>
          ))}

          {settled &&
            view.annotations
              ?.filter((note) => note.kind === "band")
              .map((note) => (
                <g key={note.label} className="fade-in">
                  <rect x={x(note.from)} y={margin.top} width={Math.max(2, x(note.to ?? note.from) - x(note.from))} height={height - margin.top - margin.bottom} className="fill-[var(--band)]" />
                  <text x={x(note.from) - 6} y={margin.top + 12} {...anchorFor("end", rtl)} className="fill-[var(--ink)] text-[12px] font-semibold">
                    {note.label}
                  </text>
                </g>
              ))}

          <g clipPath={`url(#${clip})`}>
            {series.map((item) =>
              item.opacity > 0.01 ? (
                <g key={item.source} opacity={item.opacity}>
                  <path d={areaPath(item.bands) ?? ""} fill={`var(--${item.source})`} fillOpacity={0.1 + item.stackness * 0.78} />
                  <path d={topPath(item.bands) ?? ""} fill="none" stroke="var(--surface)" strokeWidth={2} strokeOpacity={item.stackness} />
                  <path d={topPath(item.bands) ?? ""} fill="none" stroke={`var(--${item.source})`} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeOpacity={1 - item.stackness} />
                </g>
              ) : null,
            )}
          </g>

          {settled &&
            view.annotations
              ?.filter((note) => note.kind === "point" && note.source)
              .map((note) => {
                const index = years.indexOf(note.from);
                const band = series.find((item) => item.source === note.source)!.bands[index]!;
                const value = view.mode === "stack" ? (band.y0 + band.y1) / 2 : band.y1;
                const cx = x(note.from);
                const cy = y(value);
                const above = note.placement ? note.placement === "above" : cy > margin.top + 40;
                return (
                  <g key={note.label} className="fade-in">
                    <line x1={cx} x2={cx} y1={cy} y2={above ? cy - 30 : cy + 18} stroke="var(--ink-2)" />
                    <circle cx={cx} cy={cy} r={5} fill={`var(--${note.source})`} stroke="var(--surface)" strokeWidth={2} />
                    <text x={cx} y={above ? cy - 36 : cy + 30} {...anchorFor(cx > width * 0.6 ? "end" : "start", rtl)} className="fill-[var(--ink)] text-[12px] font-semibold">
                      {note.label}
                    </text>
                  </g>
                );
              })}

          {labels.map((label) => (
            <g key={label.source} transform={`translate(${width - margin.right + 10} ${label.y})`} className="fade-in" opacity={label.faded ? 0.65 : 1}>
              <rect x={0} y={-5} width={10} height={10} rx={2} fill={`var(--${label.source})`} />
              <text x={15} dy="0.32em" {...anchorFor("start", rtl)} className="fill-[var(--ink)] text-[12px]">
                <tspan className="font-semibold">{t.sources[label.source]}</tspan>
                <tspan className="fill-[var(--ink-2)] tabular-nums"> {view.unit === "share" ? f.pct(label.value) : f.n(label.value, 1)}</tspan>
              </text>
            </g>
          ))}

          {hover && (
            <g>
              <line x1={x(hover.year)} x2={x(hover.year)} y1={margin.top} y2={height - margin.bottom} stroke="var(--ink-2)" strokeWidth={1} />
              {series
                .filter((item) => view.visible.includes(item.source) && item.bands[hoverIndex]!.y1 - item.bands[hoverIndex]!.y0 > 0)
                .map((item) => (
                  <circle key={item.source} cx={x(hover.year)} cy={y(item.bands[hoverIndex]!.y1)} r={4.5} fill={`var(--${item.source})`} stroke="var(--surface)" strokeWidth={2} />
                ))}
            </g>
          )}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-56 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-3 text-sm shadow-lg"
            style={{ left: x(hover.year) > width - 250 ? Math.max(0, x(hover.year) - 236) : x(hover.year) + 12 }}
            dir={dir}
          >
            <p className="font-semibold text-[var(--ink)]">{hover.year}</p>
            {hover.total !== null && <p className="text-xs text-[var(--muted)]">{t.total} {f.twh(hover.total)}</p>}
            <ul className="mt-1.5 space-y-1">
              {[...view.visible].reverse().map((source) => {
                const valueTwh = hover[source];
                if (valueTwh === null) return null;
                const value = view.unit === "share" ? (hover.total ? (valueTwh / hover.total) * 100 : null) : valueTwh;
                if (value === null) return null;
                return (
                  <li key={source} className="flex items-center justify-between gap-2 text-[var(--ink-2)]">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block size-2.5 rounded-sm" style={{ background: `var(--${source})` }} />
                      {t.sources[source]}
                    </span>
                    <span className="font-semibold text-[var(--ink)] tabular-nums">{fmt(value)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </figure>
  );
}
