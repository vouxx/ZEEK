import { CATEGORIES, CATEGORY_KEYS } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="px-6 py-6 animate-fade-in">
      {/* 소개 */}
      <div className="mb-8">
        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">About ZEEK</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          매일 쏟아지는 기술 뉴스를 일일이 찾아보기 어렵습니다.
          ZEEK은 AI가 매일 주요 기술 뉴스를 수집하고 요약해서, 웹과 이메일로 전달하는 데일리 뉴스레터입니다.
        </p>
      </div>

      {/* 작동 방식 */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">작동 방식</h2>
        <div className="mt-3 space-y-3">
          {[
            { step: "01", title: "뉴스 수집", desc: "매일 자정, Gemini AI가 Google Search로 지난 24시간의 뉴스와 커뮤니티 화제 글을 수집합니다." },
            { step: "02", title: "AI 큐레이션", desc: "8개 카테고리로 분류하고, 각 뉴스의 핵심 요약과 중요한 이유를 정리합니다." },
            { step: "03", title: "웹 & 이메일", desc: "웹사이트에서 바로 확인하거나, 평일 아침 8시에 이메일로 받아볼 수 있습니다." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <span className="font-mono text-xs font-bold text-neutral-300 dark:text-neutral-600 pt-0.5">{step}</span>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">카테고리</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {CATEGORY_KEYS.map((key) => (
            <div key={key} className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2.5">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{CATEGORIES[key].label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-neutral-400 dark:text-neutral-500 line-clamp-2">
                {CATEGORIES[key].description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 기술 스택 */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">기술 스택</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
            "Gemini AI",
            "Supabase",
            "Resend",
            "Vercel",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
