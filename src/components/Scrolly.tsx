import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { data, facts, SOURCES } from "../lib/story";
import { numbers, useLang, type Lang } from "../lib/i18n";
import { MixChart, type View } from "./MixChart";

const f = facts();

interface Chapter {
  kicker: string;
  heading: string;
  body: ReactNode;
  view: View;
  dark?: boolean;
}

export function chapters(lang: Lang): Chapter[] {
  const x = numbers(lang);
  const ar = lang === "ar";
  const B = ({ children }: { children: ReactNode }) => <strong>{children}</strong>;

  return [
    {
      kicker: ar ? `${f.first.year} إلى 1985` : `${f.first.year} to 1985`,
      heading: ar ? "البداية كانت من النهر" : "It started with the river",
      body: ar ? (
        <>
          <p>
            في عام {f.first.year}، ولّدت سدود مصر على النيل <B>{x.twh(f.first.hydro!)}</B> من الكهرباء. ومع دخول محطة كهرباء السد العالي في أسوان الخدمة، ارتفع الإنتاج إلى <B>{x.twh(f.damPeak.hydro!)}</B> بحلول {f.damPeak.year}، أي نحو {x.n(f.damMultiple)} أضعاف في أقل من عشرين عامًا.
          </p>
          <p>لفترة من الزمن، كان النيل العمود الفقري لشبكة الكهرباء.</p>
        </>
      ) : (
        <>
          <p>
            In {f.first.year}, Egypt's dams on the Nile generated <B>{x.twh(f.first.hydro!)}</B> of electricity. As the Aswan High Dam's power station came online, that climbed to <B>{x.twh(f.damPeak.hydro!)}</B> by {f.damPeak.year}, about {x.n(f.damMultiple)} times more in under twenty years.
          </p>
          <p>For a while, the Nile was the backbone of the grid.</p>
        </>
      ),
      view: {
        id: "river",
        title: ar ? "الكهرباء المولّدة من الطاقة المائية في مصر، تيراواط ساعة" : "Hydroelectric generation in Egypt, TWh",
        from: 1965,
        to: 1985,
        mode: "lines",
        unit: "twh",
        visible: ["hydro"],
        yMax: 12,
        annotations: [{ kind: "point", from: 1970, source: "hydro", label: ar ? "1970: اكتمال السد العالي" : "1970: High Dam completed" }],
      },
    },
    {
      kicker: ar ? `${f.firstMix.year} إلى ${f.last.year}` : `${f.firstMix.year} to ${f.last.year}`,
      heading: ar ? "ثم تجاوز الطلب قدرة النهر" : "Then demand outgrew the river",
      body: ar ? (
        <>
          <p>
            منذ عام {f.firstMix.year}، حين يبدأ السجل الكامل، نما إنتاج مصر من الكهرباء <B>{x.n(f.totalMultiple)} أضعاف</B>، من {x.n(f.firstMix.total!)} إلى {x.n(f.last.total!)} تيراواط ساعة. وزاد عدد السكان لأكثر من الضعف، وصار كل شخص يستهلك {x.n(f.perCapitaMultiple, 1)} أضعاف ما كان يستهلكه من الكهرباء.
          </p>
          <p>
            لكن الطاقة المائية لم تستطع المواكبة، فقد بقيت بين {x.n(f.hydroRange[0], 1)} و{x.n(f.hydroRange[1], 1)} تيراواط ساعة سنويًا. لذلك انخفضت حصة النهر من <B>{x.pct(f.hydroShareFirst)}</B> من كهرباء مصر في {f.firstMix.year} إلى <B>{x.pct(f.hydroShareLast)}</B> في {f.last.year}.
          </p>
        </>
      ) : (
        <>
          <p>
            Since {f.firstMix.year}, when the full record begins, Egypt's electricity output has grown <B>{x.times(f.totalMultiple)}</B>, from {x.n(f.firstMix.total!)} TWh to {x.n(f.last.total!)} TWh. The population more than doubled, and each person now uses {x.n(f.perCapitaMultiple, 1)} times as much electricity.
          </p>
          <p>
            Hydro couldn't follow. It has stayed between {x.n(f.hydroRange[0], 1)} and {x.n(f.hydroRange[1], 1)} TWh a year, so the river that supplied <B>{x.pct(f.hydroShareFirst)}</B> of Egypt's power in {f.firstMix.year} supplied <B>{x.pct(f.hydroShareLast)}</B> in {f.last.year}.
          </p>
        </>
      ),
      view: {
        id: "demand",
        title: ar ? "الكهرباء المولّدة في مصر حسب المصدر، تيراواط ساعة" : "Electricity generated in Egypt by source, TWh",
        from: 1985,
        to: 2025,
        mode: "stack",
        unit: "twh",
        visible: SOURCES,
        highlight: ["hydro"],
      },
    },
    {
      kicker: ar ? "شبكة الغاز" : "The gas grid",
      heading: ar ? "بلد يعمل بالغاز" : "A country that runs on gas",
      body: ar ? (
        <>
          <p>
            سدّت مصر الفجوة بالغاز الطبيعي. فقد شكّل الغاز <B>{x.pct(f.gasShareFirst)}</B> من كهربائها في {f.firstMix.year}، ثم <B>{x.pct(f.gasPeakShare)}</B> في ذروته عام {f.gasPeak.year}، بدعم من حقول بحرية جديدة مثل حقل ظُهر الذي بدأ الإنتاج في نهاية 2017.
          </p>
          <p>
            أما النفط فسار في الاتجاه المعاكس: شكّل {x.pct(f.oilPeakShare)} من المزيج في {f.oilPeak.year}، ثم {x.pct(f.oilLowShare, 1)} فقط بحلول {f.oilLow.year}.
          </p>
        </>
      ) : (
        <>
          <p>
            Egypt filled the gap with natural gas. Gas made <B>{x.pct(f.gasShareFirst)}</B> of its electricity in {f.firstMix.year} and <B>{x.pct(f.gasPeakShare)}</B> at its peak in {f.gasPeak.year}, helped by new offshore fields such as Zohr, which started producing at the end of 2017.
          </p>
          <p>
            Oil went the other way. It made {x.pct(f.oilPeakShare)} of the mix in {f.oilPeak.year} and just {x.pct(f.oilLowShare, 1)} by {f.oilLow.year}.
          </p>
        </>
      ),
      view: {
        id: "gas",
        title: ar ? "حصة كل مصدر من كهرباء مصر، %" : "Share of Egypt's electricity by source, %",
        from: 1985,
        to: 2025,
        mode: "stack",
        unit: "share",
        visible: SOURCES,
        highlight: ["gas", "oil"],
        yMax: 100,
      },
    },
    {
      kicker: ar ? "2023 إلى 2024" : "2023 to 2024",
      heading: ar ? "ثم انطفأت الأنوار" : "Then the lights went out",
      dark: true,
      body: ar ? (
        <>
          <p>للاعتماد على وقود واحد ثمن. فمع استمرار ارتفاع الطلب وتراجع إمدادات الغاز، بدأت مصر في صيف 2023 قطع الكهرباء بالتناوب، فيما عُرف بتخفيف الأحمال. تناوبت الأحياء على انقطاع التيار يوميًا، على مدى صيفين حارّين.</p>
          <p>
            ولجأت محطات الكهرباء إلى حرق مزيد من النفط، فتضاعفت حصته أكثر من ثلاث مرات، من {x.pct(f.oilLowShare, 1)} في {f.oilLow.year} إلى {x.pct(7.5, 1)} في 2023. وتوقف تخفيف الأحمال في يوليو 2024، بعد أن دبّرت الحكومة وقودًا إضافيًا واستوردت الغاز.
          </p>
        </>
      ) : (
        <>
          <p>Relying on one fuel has a cost. As demand kept climbing and gas got scarcer, Egypt began rolling power cuts in summer 2023, known as load shedding. Neighbourhoods took turns losing power every day, through two hot summers.</p>
          <p>
            Power stations burned more oil to cope. Oil's share more than tripled, from {x.pct(f.oilLowShare, 1)} in {f.oilLow.year} to {x.pct(7.5, 1)} in 2023. The cuts ended in July 2024, after the government paid for extra fuel and imported gas.
          </p>
        </>
      ),
      view: {
        id: "lights",
        title: ar ? "حصة الغاز والنفط من كهرباء مصر، %" : "Share of Egypt's electricity from gas and oil, %",
        from: 2012,
        to: 2025,
        mode: "lines",
        unit: "share",
        visible: ["gas", "oil"],
        yMax: 100,
        annotations: [{ kind: "band", from: 2023, to: 2024, label: ar ? "تخفيف الأحمال" : "Load shedding" }],
      },
    },
    {
      kicker: ar ? "2010 إلى 2025" : "2010 to 2025",
      heading: ar ? "وأشرقت الشمس (وهبّت الرياح)" : "Here comes the sun (and the wind)",
      body: ar ? (
        <>
          <p>
            الشمس والرياح هما الجزء الأسرع نموًا في المزيج. فقد ارتفعت الطاقة الشمسية من شبه لا شيء إلى <B>{x.twh(f.solarLast)}</B> في {f.last.year}، جزء كبير منها من مجمع بنبان قرب أسوان، وهو مجمع شمسي بقدرة 1.8 جيجاواط اكتمل في 2019 ويُعد من الأكبر في العالم. ووصلت طاقة الرياح إلى <B>{x.twh(f.windLast)}</B>.
          </p>
          <p>
            معًا شكّلتا {x.pct(f.sunAndWindShareLast)} من كهرباء مصر في {f.last.year}. ومع إضافة النيل، بلغت حصة الطاقة المتجددة <B>{x.pct(f.renewablesLast)}</B>، وهي الأعلى منذ {f.renewablesHigherBefore}.
          </p>
        </>
      ) : (
        <>
          <p>
            Sun and wind are the fastest-growing part of the mix. Solar went from almost nothing to <B>{x.twh(f.solarLast)}</B> in {f.last.year}, much of it from Benban near Aswan, a 1.8 GW solar park finished in 2019 and one of the largest in the world. Wind reached <B>{x.twh(f.windLast)}</B>.
          </p>
          <p>
            Together they made {x.pct(f.sunAndWindShareLast)} of Egypt's electricity in {f.last.year}. Add the Nile and renewables reached <B>{x.pct(f.renewablesLast)}</B>, the highest share since {f.renewablesHigherBefore}.
          </p>
        </>
      ),
      view: {
        id: "sun",
        title: ar ? "توليد الكهرباء من الشمس والرياح في مصر، تيراواط ساعة" : "Solar and wind generation in Egypt, TWh",
        from: 2010,
        to: 2025,
        mode: "lines",
        unit: "twh",
        visible: ["wind", "solar"],
        yMax: 10,
        annotations: [{ kind: "point", from: 2019, source: "solar", label: ar ? "2019: اكتمال بنبان" : "2019: Benban completed", placement: "below" }],
      },
    },
  ];
}

export function Scrolly({ onDark }: { onDark: (dark: boolean) => void }) {
  const { lang } = useLang();
  const list = useMemo(() => chapters(lang), [lang]);
  const [active, setActive] = useState(0);
  const steps = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: window.matchMedia("(min-width: 768px)").matches ? "-48% 0px -48% 0px" : "-72% 0px -24% 0px" },
    );
    steps.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onDark(Boolean(list[active]?.dark));
  }, [active, list, onDark]);

  useEffect(() => () => onDark(false), [onDark]);

  const chapter = list[active]!;

  return (
    <section id="story" className="relative mx-auto grid max-w-6xl gap-x-12 px-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:px-8" aria-label={lang === "ar" ? "القصة" : "The story"}>
      <div className="sticky top-0 z-10 -mx-4 h-[56svh] bg-[var(--page)] px-4 pt-4 pb-3 transition-colors duration-700 md:order-2 md:mx-0 md:h-svh md:bg-transparent md:px-0 md:py-[12svh]">
        <div className="h-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-3 transition-colors duration-700 md:p-5">
          <MixChart view={chapter.view} rows={data.egypt} />
        </div>
      </div>
      <div className="md:order-1">
        {list.map((item, index) => (
          <article
            key={item.view.id}
            ref={(element) => {
              steps.current[index] = element;
            }}
            data-step={index}
            className={`flex min-h-[80svh] flex-col justify-center py-10 transition-opacity duration-500 md:min-h-svh ${active === index ? "opacity-100" : "md:opacity-35"}`}
            aria-current={active === index ? "step" : undefined}
          >
            <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-sm transition-colors duration-700 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
              <p className="kicker text-sm font-semibold text-[var(--accent)]">
                {String(index + 1).padStart(2, "0")} · {item.kicker}
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight text-[var(--ink)] md:text-4xl">{item.heading}</h2>
              <div className="prose-story mt-4 space-y-4 text-lg leading-relaxed text-[var(--ink-2)]">{item.body}</div>
            </div>
          </article>
        ))}
        <div className="h-[20svh]" aria-hidden="true" />
      </div>
    </section>
  );
}
