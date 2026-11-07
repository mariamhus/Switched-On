import { Download, Table2 } from "lucide-react";
import { data, renewables, toCsv } from "../lib/story";
import { useLang } from "../lib/i18n";

function download() {
  const blob = new Blob([toCsv(data.egypt)], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "egypt-electricity-1965-2025.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

const SOURCES = [
  { en: "Our World in Data, Energy dataset (Ember and Energy Institute)", ar: "Our World in Data، مجموعة بيانات الطاقة (Ember ومعهد الطاقة)", url: "https://github.com/owid/energy-data" },
  { en: "Benban Solar Park", ar: "مجمع بنبان للطاقة الشمسية", url: "https://en.wikipedia.org/wiki/Benban_Solar_Park" },
  { en: "Human Rights Watch: Egypt's electricity cutbacks (2023)", ar: "هيومن رايتس ووتش: تقليص الكهرباء في مصر (2023)", url: "https://www.hrw.org/news/2023/08/08/egypt-electricity-cutbacks-threaten-rights" },
  { en: "Ahram Online: load shedding to stop in July 2024", ar: "الأهرام أونلاين: وقف تخفيف الأحمال في يوليو 2024", url: "https://english.ahram.org.eg/NewsContent/1/2/527405/Egypt/Society/Egypt-to-stop-loadshedding-power-cuts-on-Sunday-PM.aspx" },
  { en: "Egyptian Streets: LNG shipments to end power cuts (2024)", ar: "إيجيبشن ستريتس: شحنات الغاز المسال لإنهاء الانقطاعات (2024)", url: "https://egyptianstreets.com/2024/07/02/egypt-begins-receiving-lng-shipments-to-end-power-cuts/" },
  { en: "Argus: Egypt's 42% renewables target", ar: "أرجوس: هدف مصر للطاقة المتجددة بنسبة 42%", url: "https://www.argusmedia.com/en/news/2389361-cop-27-egypt-to-advance-42pc-renewables-by-2035-target" },
  { en: "Business Monthly: first El Dabaa unit by 2028", ar: "بزنس مانثلي: أول وحدة في الضبعة بحلول 2028", url: "https://businessmonthlyeg.com/egypt-to-launch-first-el-dabaa-nuclear-unit-by-2028/" },
];

export function Sources() {
  const { lang, f } = useLang();
  const ar = lang === "ar";
  const n = (value: number | null, digits = 1) => (value === null ? "–" : f.n(value, digits));
  const notes = ar
    ? [
        "أرقام الكهرباء هي الإنتاج بالتيراواط ساعة، من مجموعة بيانات الطاقة في Our World in Data، التي تجمع بيانات Ember ومراجعة معهد الطاقة الإحصائية للطاقة العالمية.",
        "قبل 1985 لا تتضمن البيانات سوى الطاقة المائية لمصر، لذلك يبدأ المزيج الكامل من 1985.",
        `الطاقة المتجددة هنا تعني المائية والشمسية والرياح. وتستخدم مقارنات الدول بيانات ${data.peerYear}، أحدث عام تتوفر فيه بيانات لكل الدول المعروضة.`,
        "كل رقم في النص محسوب من البيانات عند بناء الصفحة، وتتحقق منه الاختبارات.",
      ]
    : [
        "Electricity figures are generation in terawatt-hours (TWh), from Our World in Data's energy dataset, which combines Ember and the Energy Institute's Statistical Review of World Energy.",
        "Before 1985 the dataset only has hydro for Egypt, so the full mix starts in 1985.",
        `Renewables means hydro, solar and wind. Country comparisons use ${data.peerYear}, the latest year with data for every country shown.`,
        "Every number in the text is calculated from the data when the page builds, and checked by tests.",
      ];
  const headers = ar
    ? ["السنة", "الإجمالي (تيراواط ساعة)", "مائية", "غاز", "نفط", "رياح", "شمسية", "المتجددة", "كيلوواط ساعة للفرد"]
    : ["Year", "Total TWh", "Hydro", "Gas", "Oil", "Wind", "Solar", "Renewables", "kWh per person"];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8" aria-labelledby="sources-title">
      <div className="grid gap-10 border-t border-[var(--hairline)] pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="sources-title" className="font-display text-2xl text-[var(--ink)]">
            {ar ? "البيانات والمنهجية" : "Data and method"}
          </h2>
          <ul className="mt-4 space-y-3 text-[var(--ink-2)]">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <button type="button" onClick={download} className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--ink)] px-4 py-2 font-semibold text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--page)]">
            <Download className="size-4" aria-hidden="true" />
            {ar ? "تنزيل البيانات (CSV)" : "Download the data (CSV)"}
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-[var(--ink)]">{ar ? "المصادر" : "Sources"}</h3>
          <ul className="mt-3 space-y-2">
            {SOURCES.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer" className="text-[var(--ink-2)] underline decoration-[var(--hairline-strong)] underline-offset-4 hover:text-[var(--ink)] hover:decoration-[var(--ink)]">
                  {ar ? source.ar : source.en}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="mt-10 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]">
        <summary className="flex cursor-pointer items-center gap-2 p-5 font-semibold text-[var(--ink)]">
          <Table2 className="size-5" aria-hidden="true" />
          {ar ? "عرض البيانات في جدول" : "See the data as a table"}
        </summary>
        <div className="max-h-[28rem] overflow-auto border-t border-[var(--hairline)]">
          <table className="w-full min-w-[44rem] text-sm tabular-nums">
            <caption className="sr-only">{ar ? "إنتاج الكهرباء في مصر حسب المصدر، تيراواط ساعة" : "Egypt electricity generation by source, TWh"}</caption>
            <thead className="sticky top-0 bg-[var(--surface)] text-[var(--ink-2)]">
              <tr className="border-b border-[var(--hairline)]">
                {headers.map((label) => (
                  <th key={label} scope="col" className="px-4 py-2.5 text-end font-semibold first:text-start">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data.egypt].reverse().map((entry) => (
                <tr key={entry.year} className="border-b border-[var(--hairline)] text-[var(--ink)] last:border-0">
                  <th scope="row" className="px-4 py-2 text-start font-semibold">
                    {entry.year}
                  </th>
                  <td className="px-4 py-2 text-end">{n(entry.total)}</td>
                  <td className="px-4 py-2 text-end">{n(entry.hydro)}</td>
                  <td className="px-4 py-2 text-end">{n(entry.gas)}</td>
                  <td className="px-4 py-2 text-end">{n(entry.oil)}</td>
                  <td className="px-4 py-2 text-end">{entry.total === null ? "–" : n(entry.wind, 2)}</td>
                  <td className="px-4 py-2 text-end">{entry.total === null ? "–" : n(entry.solar, 2)}</td>
                  <td className="px-4 py-2 text-end">{entry.total === null ? "–" : f.pct(renewables(entry)!, 1)}</td>
                  <td className="px-4 py-2 text-end">{n(entry.perCapita, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
