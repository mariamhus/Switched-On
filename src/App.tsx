import { useCallback, useEffect, useState } from "react";
import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { useLang } from "./lib/i18n";
import { Hero } from "./components/Hero";
import { Scrolly } from "./components/Scrolly";
import { Peers } from "./components/Peers";
import { Explorer } from "./components/Explorer";
import { Next } from "./components/Next";
import { Sources } from "./components/Sources";

type Theme = "auto" | "light" | "dark";
const KEY = "switched-on:theme";

function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === "light" || saved === "dark" ? saved : "auto";
    } catch {
      return "auto";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      if (theme === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  const options: [Theme, typeof Sun, string][] = [
    ["light", Sun, t.light],
    ["auto", Monitor, t.system],
    ["dark", Moon, t.dark],
  ];

  return (
    <div className="flex rounded-full border border-[var(--hairline)] bg-[var(--surface)] p-1" role="radiogroup" aria-label={t.theme}>
      {options.map(([value, Icon, label]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={`grid size-8 place-items-center rounded-full transition ${theme === value ? "bg-[var(--ink)] text-[var(--page)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      lang={lang === "ar" ? "en" : "ar"}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink-2)]"
      aria-label={`${t.language}: ${t.switchTo}`}
    >
      <Languages className="size-4" aria-hidden="true" />
      {t.switchTo}
    </button>
  );
}

export function App() {
  const { t } = useLang();
  const [dark, setDark] = useState(false);
  const onDark = useCallback((value: boolean) => setDark(value), []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.setAttribute("data-dim", "true");
    else root.removeAttribute("data-dim");
  }, [dark]);

  return (
    <div className="min-h-svh bg-[var(--page)] text-[var(--ink)] transition-colors duration-700">
      <a href="#story" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-lg focus:bg-[var(--ink)] focus:px-4 focus:py-2 focus:text-[var(--page)]">
        {t.skip}
      </a>
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8" aria-label="Page">
        <span className="font-display text-lg text-[var(--ink)]">{t.brand}</span>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
      <main>
        <Hero />
        <Scrolly onDark={onDark} />
        <Peers />
        <Explorer />
        <Next />
        <Sources />
      </main>
      <footer className="border-t border-[var(--hairline)] py-8 text-center text-sm text-[var(--muted)]">
        {t.by}{" "}
        <a href="https://www.mariam-hussein.website" target="_blank" rel="noreferrer" className="font-semibold text-[var(--ink-2)] underline-offset-4 hover:underline">
          {t.author}
        </a>
      </footer>
    </div>
  );
}
