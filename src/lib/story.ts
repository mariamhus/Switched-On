import raw from "../data/energy.json";

export type Source = "hydro" | "gas" | "oil" | "wind" | "solar";

export interface YearRow {
  year: number;
  population: number | null;
  total: number | null;
  gas: number | null;
  oil: number | null;
  hydro: number | null;
  solar: number | null;
  wind: number | null;
  perCapita: number | null;
  carbonIntensity: number | null;
}

export interface Peer {
  id: string;
  label: string;
  perCapita: number;
  renewables: number;
  gas: number;
}

export interface Dataset {
  source: string;
  sourceUrl: string;
  peerYear: number;
  egypt: YearRow[];
  peers: Peer[];
}

export const data = raw as Dataset;

export const SOURCES: Source[] = ["hydro", "gas", "oil", "wind", "solar"];

export const SOURCE_LABEL: Record<Source, string> = {
  hydro: "Hydro",
  gas: "Gas",
  oil: "Oil",
  wind: "Wind",
  solar: "Solar",
};

export function row(rows: YearRow[], year: number) {
  const found = rows.find((entry) => entry.year === year);
  if (!found) throw new Error(`No data for ${year}`);
  return found;
}

export function share(entry: YearRow, source: Source) {
  const value = entry[source];
  if (value === null || !entry.total) return null;
  return (value / entry.total) * 100;
}

export function renewables(entry: YearRow) {
  if (!entry.total) return null;
  return (((entry.hydro ?? 0) + (entry.solar ?? 0) + (entry.wind ?? 0)) / entry.total) * 100;
}

export type Band = [number, number];

export interface Layout {
  mode: "stack" | "lines";
  unit: "twh" | "share";
  bands: Record<Source, Band[]>;
}

export function layout(rows: YearRow[], mode: Layout["mode"], unit: Layout["unit"], visible: Source[]): Layout {
  const bands = Object.fromEntries(SOURCES.map((source) => [source, [] as Band[]])) as Record<Source, Band[]>;
  for (const entry of rows) {
    let base = 0;
    for (const source of SOURCES) {
      const rawValue = entry[source];
      const shown = visible.includes(source) && rawValue !== null && (unit === "twh" || entry.total);
      const value = shown ? (unit === "share" ? (rawValue! / entry.total!) * 100 : rawValue!) : 0;
      if (mode === "stack") {
        bands[source].push([base, base + value]);
        base += value;
      } else {
        bands[source].push([0, value]);
      }
    }
  }
  return { mode, unit, bands };
}

export function maxValue(result: Layout, rows: YearRow[], from: number, to: number) {
  let max = 0;
  rows.forEach((entry, index) => {
    if (entry.year < from || entry.year > to) return;
    for (const source of SOURCES) max = Math.max(max, result.bands[source][index]![1]);
  });
  return max;
}

export function facts(rows: YearRow[] = data.egypt) {
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const firstMix = rows.find((entry) => entry.total !== null)!;
  const damPeak = rows.filter((entry) => entry.year <= 1985).reduce((best, entry) => ((entry.hydro ?? 0) > (best.hydro ?? 0) ? entry : best), first);
  const mixRows = rows.filter((entry) => entry.total !== null);
  const gasPeak = mixRows.reduce((best, entry) => (share(entry, "gas")! > share(best, "gas")! ? entry : best), firstMix);
  const oilPeak = mixRows.reduce((best, entry) => (share(entry, "oil")! > share(best, "oil")! ? entry : best), firstMix);
  const oilLow = mixRows.filter((entry) => entry.year >= 2000).reduce((best, entry) => (share(entry, "oil")! < share(best, "oil")! ? entry : best), mixRows[mixRows.length - 1]!);
  const renewablesNow = renewables(last)!;
  const higherBefore = [...mixRows].reverse().find((entry) => entry.year < last.year && renewables(entry)! >= renewablesNow);
  const firstSolar = mixRows.find((entry) => (entry.solar ?? 0) >= 0.5)!;
  const hydroValues = mixRows.map((entry) => entry.hydro ?? 0);

  return {
    first,
    last,
    firstMix,
    damPeak,
    damMultiple: (damPeak.hydro ?? 0) / (first.hydro ?? 1),
    totalMultiple: (last.total ?? 0) / (firstMix.total ?? 1),
    perCapitaMultiple: (last.perCapita ?? 0) / (firstMix.perCapita ?? 1),
    populationMultiple: (last.population ?? 0) / (first.population ?? 1),
    hydroShareFirst: share(firstMix, "hydro")!,
    hydroShareLast: share(last, "hydro")!,
    hydroRange: [Math.min(...hydroValues), Math.max(...hydroValues)] as [number, number],
    gasShareFirst: share(firstMix, "gas")!,
    gasPeak,
    gasPeakShare: share(gasPeak, "gas")!,
    oilPeak,
    oilPeakShare: share(oilPeak, "oil")!,
    oilLow,
    oilLowShare: share(oilLow, "oil")!,
    oilShareLast: share(last, "oil")!,
    renewablesLast: renewablesNow,
    renewablesHigherBefore: higherBefore?.year ?? null,
    firstSolar,
    solarLast: last.solar ?? 0,
    windLast: last.wind ?? 0,
    sunAndWindShareLast: share(last, "solar")! + share(last, "wind")!,
  };
}

export function toCsv(rows: YearRow[]) {
  const header = ["year", "population", "total_twh", "hydro_twh", "gas_twh", "oil_twh", "wind_twh", "solar_twh", "kwh_per_person"];
  const lines = rows.map((entry) => [entry.year, entry.population, entry.total, entry.hydro, entry.gas, entry.oil, entry.wind, entry.solar, entry.perCapita].map((value) => (value === null ? "" : String(value))).join(","));
  return [header.join(","), ...lines].join("\n");
}
