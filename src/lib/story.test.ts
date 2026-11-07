import { describe, expect, it } from "vitest";
import { data, facts, layout, maxValue, renewables, row, share, SOURCES, toCsv } from "./story";

describe("dataset", () => {
  it("adds up: the five sources make the total for every year with a mix", () => {
    for (const entry of data.egypt.filter((item) => item.total !== null)) {
      const sum = SOURCES.reduce((total, source) => total + (entry[source] ?? 0), 0);
      expect(Math.abs(sum - entry.total!)).toBeLessThan(0.1);
    }
  });

  it("covers 1965 to 2025 with a full mix from 1985", () => {
    expect(data.egypt[0]!.year).toBe(1965);
    expect(data.egypt.at(-1)!.year).toBe(2025);
    expect(data.egypt.find((item) => item.total !== null)!.year).toBe(1985);
  });
});

describe("facts used in the story", () => {
  const f = facts();

  it("matches the headline numbers", () => {
    expect(f.totalMultiple).toBeCloseTo(8.1, 1);
    expect(Math.round(f.last.perCapita!)).toBe(2076);
    expect(Math.round(f.firstMix.perCapita!)).toBe(596);
    expect(f.populationMultiple).toBeCloseTo(3.9, 1);
  });

  it("tells the river chapter", () => {
    expect(f.damPeak.year).toBe(1982);
    expect(Math.round(f.damMultiple)).toBe(6);
    expect(Math.round(f.hydroShareFirst)).toBe(30);
    expect(Math.round(f.hydroShareLast)).toBe(6);
  });

  it("tells the gas and oil chapters", () => {
    expect(f.gasPeak.year).toBe(2019);
    expect(Math.round(f.gasPeakShare)).toBe(86);
    expect(f.oilPeak.year).toBe(1988);
    expect(Math.round(f.oilPeakShare)).toBe(43);
    expect(f.oilLow.year).toBe(2021);
    expect(f.oilLowShare).toBeCloseTo(2.3, 1);
    expect(f.oilShareLast).toBeCloseTo(7.4, 1);
    expect(share(row(data.egypt, 2023), "oil")).toBeCloseTo(7.5, 1);
  });

  it("tells the sun and wind chapter", () => {
    expect(Math.round(f.renewablesLast)).toBe(13);
    expect(f.renewablesHigherBefore).toBe(2004);
    expect(f.solarLast).toBeCloseTo(7.61);
    expect(f.windLast).toBeCloseTo(9.3);
    expect(Math.round(f.sunAndWindShareLast)).toBe(7);
  });
});

describe("chart layout", () => {
  it("stacks shares to 100%", () => {
    const result = layout(data.egypt, "stack", "share", SOURCES);
    const index = data.egypt.findIndex((item) => item.year === 2025);
    expect(result.bands.solar[index]![1]).toBeCloseTo(100, 5);
  });

  it("keeps hidden sources flat and lines unstacked", () => {
    const result = layout(data.egypt, "lines", "twh", ["solar", "wind"]);
    const index = data.egypt.findIndex((item) => item.year === 2025);
    expect(result.bands.gas[index]).toEqual([0, 0]);
    expect(result.bands.wind[index]).toEqual([0, 9.3]);
    expect(maxValue(result, data.egypt, 2010, 2025)).toBeCloseTo(9.3);
  });

  it("computes renewables and exports CSV", () => {
    expect(renewables(row(data.egypt, 2025))).toBeCloseTo(13.0, 1);
    const csv = toCsv(data.egypt).split("\n");
    expect(csv).toHaveLength(data.egypt.length + 1);
    expect(csv.at(-1)).toBe("2025,118365995,245.71,15.07,195.65,18.08,9.3,7.61,2076");
  });
});
