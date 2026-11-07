import { Atom, Sun, Target } from "lucide-react";
import { facts } from "../lib/story";
import { useLang } from "../lib/i18n";

const f = facts();
const TARGET = 42;

export function Next() {
  const { lang, f: x } = useLang();
  const ar = lang === "ar";
  const now = f.renewablesLast;
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-8" aria-labelledby="next-title">
      <p className="kicker text-sm font-semibold text-[var(--accent)]">08 · {ar ? "ماذا بعد" : "What comes next"}</p>
      <h2 id="next-title" className="mt-2 max-w-3xl font-display text-3xl leading-tight text-[var(--ink)] md:text-4xl">
        {ar ? "السنوات العشر المقبلة يجب أن تبدو مختلفة تمامًا" : "The next ten years have to look very different"}
      </h2>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--ink-2)]">
        {ar
          ? `تستهدف استراتيجية الطاقة في مصر أن تصل حصة الطاقة المتجددة إلى ${x.pct(TARGET)} من الطاقة بحلول 2035، وقال مسؤولون إن ذلك قد يتحقق قبل الموعد. وفي ${f.last.year}، وفّرت الطاقة المتجددة ${x.pct(now)} من الكهرباء.`
          : `Egypt's energy strategy aims for renewables to supply ${x.pct(TARGET)} of its energy by 2035, and officials have said it could happen sooner. In ${f.last.year}, they supplied ${x.pct(now)} of its electricity.`}
      </p>

      <figure className="mt-8 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6">
        <figcaption className="flex items-center gap-2 font-semibold text-[var(--ink)]">
          <Target className="size-5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
          {ar ? `حصة الطاقة المتجددة من الكهرباء في ${f.last.year}، مقارنة بهدف ${x.pct(TARGET)}` : `Renewables share of electricity, ${f.last.year}, against the ${x.pct(TARGET)} goal`}
        </figcaption>
        <div className="relative mt-10 h-6 rounded-[4px] bg-[var(--grid)]" role="img" aria-label={ar ? `${x.pct(now, 1)} حاليًا، والهدف ${x.pct(TARGET)}` : `${x.pct(now, 1)} now, goal ${x.pct(TARGET)}`}>
          <div className="h-full rounded-e-[4px] bg-[var(--wind)]" style={{ width: `${now}%` }} />
          <div className="absolute -top-2 bottom-[-8px] w-0.5 bg-[var(--ink)]" style={{ insetInlineStart: `${TARGET}%` }} aria-hidden="true" />
          <span className="absolute -top-8 text-sm font-semibold whitespace-nowrap text-[var(--ink)] ltr:-translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${TARGET}%` }}>
            {ar ? "الهدف" : "Goal"} {x.pct(TARGET)}
          </span>
          <span className="absolute top-8 text-sm font-semibold text-[var(--ink)] tabular-nums" style={{ insetInlineStart: 0 }}>
            {x.pct(now, 1)} {ar ? "حاليًا" : "today"}
          </span>
        </div>
        <div className="mt-10 flex justify-between text-xs text-[var(--muted)] tabular-nums">
          <span>{x.pct(0)}</span>
          <span>{x.pct(100)}</span>
        </div>
      </figure>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6">
          <Sun className="size-6 text-[var(--solar)]" aria-hidden="true" />
          <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">{ar ? "مزيد من الشمس والرياح" : "More sun and wind"}</h3>
          <p className="mt-2 leading-relaxed text-[var(--ink-2)]">
            {ar
              ? "يضم مجمع بنبان وحده ألواحًا شمسية بقدرة 1.8 جيجاواط. ويتطلب بلوغ الهدف بناء مجمعات أخرى كثيرة مثله، إلى جانب مزارع رياح كبيرة على خليج السويس، حيث الرياح من الأقوى والأكثر انتظامًا في المنطقة."
              : "Benban alone has 1.8 GW of solar panels. Reaching the goal means building many more parks like it, plus large wind farms along the Gulf of Suez, where the wind is among the strongest and steadiest in the region."}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6">
          <Atom className="size-6 text-[var(--hydro)]" aria-hidden="true" />
          <h3 className="mt-3 text-xl font-semibold text-[var(--ink)]">{ar ? "أول محطة نووية في مصر" : "Egypt's first nuclear plant"}</h3>
          <p className="mt-2 leading-relaxed text-[var(--ink-2)]">
            {ar
              ? `في الضبعة على ساحل البحر المتوسط، يجري بناء أربعة مفاعلات قدرة كل منها ${x.n(1200)} ميجاواط. وتتوقع الحكومة تشغيل أولها في النصف الثاني من 2028. الطاقة النووية ليست متجددة، لكنها منخفضة الكربون ولا تحرق الغاز.`
              : `At El Dabaa on the Mediterranean coast, four ${x.n(1200)} MW reactors are under construction. The government expects the first one to start in the second half of 2028. Nuclear doesn't count as renewable, but it is low-carbon and doesn't burn gas.`}
          </p>
        </article>
      </div>
    </section>
  );
}
