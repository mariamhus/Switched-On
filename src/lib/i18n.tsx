import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Source } from "./story";

export type Lang = "en" | "ar";

const KEY = "switched-on:lang";

const ui = {
  en: {
    title: "Switched on · Egypt's electricity in data",
    brand: "Switched on",
    skip: "Skip to the story",
    language: "Language",
    switchTo: "عربي",
    theme: "Colour theme",
    light: "Light",
    system: "Match system",
    dark: "Dark",
    by: "A data story by",
    author: "Mariam Hussein",
    twh: "TWh",
    kwh: "kWh",
    million: "million",
    total: "Total",
    legend: "Legend",
    chartHint: "Use the left and right arrow keys to read values by year.",
    sources: { hydro: "Hydro", gas: "Gas", oil: "Oil", wind: "Wind", solar: "Solar" } as Record<Source, string>,
  },
  ar: {
    title: "مفتاح النور · كهرباء مصر بالأرقام",
    brand: "مفتاح النور",
    skip: "انتقل إلى القصة",
    language: "اللغة",
    switchTo: "English",
    theme: "مظهر الألوان",
    light: "فاتح",
    system: "حسب الجهاز",
    dark: "داكن",
    by: "قصة بيانات من إعداد",
    author: "مريم حسين",
    twh: "تيراواط ساعة",
    kwh: "كيلوواط ساعة",
    million: "مليون",
    total: "الإجمالي",
    legend: "مفتاح الألوان",
    chartHint: "استخدم مفتاحي الأسهم يمينًا ويسارًا لقراءة القيم حسب السنة.",
    sources: { hydro: "مائية", gas: "غاز", oil: "نفط", wind: "رياح", solar: "شمسية" } as Record<Source, string>,
  },
};

export type UI = (typeof ui)["en"];

export const PEER_NAMES: Record<string, Record<Lang, string>> = {
  egypt: { en: "Egypt", ar: "مصر" },
  morocco: { en: "Morocco", ar: "المغرب" },
  algeria: { en: "Algeria", ar: "الجزائر" },
  tunisia: { en: "Tunisia", ar: "تونس" },
  jordan: { en: "Jordan", ar: "الأردن" },
  turkey: { en: "Türkiye", ar: "تركيا" },
  "south-africa": { en: "South Africa", ar: "جنوب أفريقيا" },
  africa: { en: "Africa (average)", ar: "أفريقيا (المتوسط)" },
  world: { en: "World (average)", ar: "العالم (المتوسط)" },
};

function formatter(lang: Lang, digits: number) {
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function numbers(lang: Lang) {
  const cache = new Map<number, Intl.NumberFormat>();
  const get = (digits: number) => {
    if (!cache.has(digits)) cache.set(digits, formatter(lang, digits));
    return cache.get(digits)!;
  };
  const n = (value: number, digits = 0) => get(digits).format(value).replace(/‎/g, "");
  return {
    n,
    pct: (value: number, digits = 0) => `${n(value, digits)}%`,
    twh: (value: number, digits = 1) => `${n(value, digits)} ${ui[lang].twh}`,
    kwh: (value: number, digits = 0) => `${n(value, digits)} ${ui[lang].kwh}`,
    times: (value: number, digits = 0) => (lang === "ar" ? `${n(value, digits)} أضعاف` : `${n(value, digits)} times`),
  };
}

interface LangValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (lang: Lang) => void;
  t: UI;
  f: ReturnType<typeof numbers>;
}

const LangContext = createContext<LangValue | null>(null);

function initialLang(): Lang {
  try {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param === "ar" || param === "en") return param;
    const saved = localStorage.getItem(KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    return "en";
  }
  return navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = ui[lang].title;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      return;
    }
  }, [lang]);

  const value = useMemo<LangValue>(() => ({ lang, dir: lang === "ar" ? "rtl" : "ltr", setLang, t: ui[lang], f: numbers(lang) }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside LangProvider");
  return value;
}
