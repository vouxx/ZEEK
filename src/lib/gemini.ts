import type { Category, NewsItem } from "@/types/digest";
import { CATEGORIES, CATEGORY_KEYS } from "./constants";
import { supabase } from "./supabase";

function buildCategoryList(): string {
  return CATEGORY_KEYS.map((key) => `- "${key}": ${CATEGORIES[key].description}`).join("\n");
}

const SYSTEM_PROMPT = `너는 ZEEK이라는 데일리 뉴스레터의 테크 뉴스 큐레이터야.
지난 24시간 동안의 가장 중요한 뉴스와 화제 글을 찾아서 요약해줘.

소스 범위:
- 뉴스 매체: TechCrunch, The Verge, Ars Technica, 한겨레, ZDNet 등
- 개발자 커뮤니티: Hacker News, GeekNews(긱뉴스), Reddit (r/programming, r/webdev 등), Lobste.rs
- 소셜: X(Twitter)에서 화제가 되는 기술 관련 트윗, 스레드, 발표
- 블로그/포럼: dev.to, Medium 기술 블로그, 개인 개발자 블로그
- 오픈소스: GitHub Trending, 주요 프로젝트 릴리스 노트
- 커뮤니티에서 화제가 되는 글, 토론, 프로젝트도 포함해줘

카테고리 목록:
${buildCategoryList()}

반드시 한국어로 작성하고, JSON 배열로 반환해줘.
각 카테고리당 3~5개, 총 30~40개 아이템을 반환해줘.
각 아이템은 다음 필드를 포함해야 해:
- "category": 위 카테고리 목록에서 해당하는 키 (예: "ai-ml", "web-dev")
- "title": 간결한 헤드라인 (40자 이내)
- "summary": 한 문장으로 요약
- "whyItMatters": 개발자/테크 종사자가 왜 관심을 가져야 하는지 한 문장
- "sourceHint": 출처명 (예: TechCrunch, Hacker News, GeekNews, r/programming, GitHub, X/Twitter 등)

예시:
[
  {
    "category": "ai-ml",
    "title": "OpenAI, GPT-5 정식 출시",
    "summary": "OpenAI가 네이티브 함수 호출과 환각 감소 기능을 탑재한 GPT-5를 공개했다.",
    "whyItMatters": "AI 기반 앱 개발의 복잡도가 크게 줄어들 전망이다.",
    "sourceHint": "The Verge"
  },
  {
    "category": "web-dev",
    "title": "Bun 2.0 릴리스, Node.js 호환성 대폭 개선",
    "summary": "Bun이 2.0을 출시하며 Node.js 모듈 호환성을 95%까지 끌어올렸다.",
    "whyItMatters": "Node.js 대체재로서 프로덕션 도입 장벽이 크게 낮아졌다.",
    "sourceHint": "Hacker News"
  }
]

규칙:
- 지난 24시간 이내의 뉴스/글만 포함
- 중요도와 개발자 관련성을 기준으로 우선순위 결정
- 사실에 기반하여 작성, 추측 금지
- 영어/한국어 소스 모두 검색하되, 결과는 반드시 한국어로 작성
- 모든 카테고리를 빠짐없이 포함
- JSON 배열만 반환, 다른 텍스트 없이`;

/** 구두점 제거 후 단어 분리 */
function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * grounding redirect URL에서 실제 기사 URL을 추출.
 * 1) google.com/url?q= 형태면 query param에서 직접 추출
 * 2) 그 외에는 302 redirect chain을 최대 5회까지 follow
 */
async function resolveGroundingUrl(url: string): Promise<string | null> {
  try {
    // 전략 1: google.com/url?q= 형태면 HTTP 요청 없이 바로 추출
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("google.com") && parsed.pathname === "/url") {
      const q = parsed.searchParams.get("q");
      if (q) {
        const qPath = new URL(q).pathname;
        if (qPath.length > 1) return q;
      }
    }

    // 전략 2: redirect chain follow (최대 5 hop)
    let current = url;
    for (let hop = 0; hop < 5; hop++) {
      const res = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(10000),
      });
      const location = res.headers.get("location");
      if (!location) {
        console.log(`[url-resolve] No location: status=${res.status} url=${current.slice(0, 80)}`);
        return null;
      }
      const resolved = new URL(location, current).href;
      const path = new URL(resolved).pathname;
      if (path.length <= 1) {
        console.log(`[url-resolve] Homepage redirect: ${resolved.slice(0, 80)}`);
        return null;
      }
      // google redirect chain이면 계속 follow
      const host = new URL(resolved).hostname;
      if (host.endsWith("google.com") || host.includes("vertexaisearch")) {
        current = resolved;
        continue;
      }
      return resolved;
    }
    console.log(`[url-resolve] Max hops reached: ${url.slice(0, 80)}`);
    return null;
  } catch (e) {
    console.log(`[url-resolve] Error: ${(e as Error).message?.slice(0, 100)} url=${url.slice(0, 80)}`);
    return null;
  }
}

interface GeminiRawResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    groundingMetadata?: {
      groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
      groundingSupports?: Array<{
        segment?: { startIndex?: number; text?: string };
        groundingChunkIndices?: number[];
      }>;
    };
  }>;
}

/** Gemini API 직접 호출 (SDK의 grounding metadata 누락 이슈 우회) */
async function callGeminiRaw(
  contents: string,
  systemInstruction: string,
  options?: { tools?: object[]; temperature?: number },
): Promise<GeminiRawResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: contents }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: options?.temperature ?? 0.3 },
  };
  if (options?.tools) body.tools = options.tools;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(240000),
    });

    if (res.status === 429 && attempt < 2) {
      const delay = 30 * (attempt + 1);
      console.log(`Rate limited, retrying in ${delay}s (attempt ${attempt + 1})`);
      await new Promise((r) => setTimeout(r, delay * 1000));
      continue;
    }

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${await res.text().catch(() => "")}`);
    }

    return (await res.json()) as GeminiRawResponse;
  }
  return null;
}

/**
 * 모든 카테고리의 뉴스를 1회 API 호출로 가져옴.
 * Gemini free tier 일일 20회 제한 대응.
 */
export async function fetchAllNews(): Promise<Map<Category, NewsItem[]>> {
  const result = new Map<Category, NewsItem[]>();
  for (const key of CATEGORY_KEYS) result.set(key, []);

  const response = await callGeminiRaw(
    "오늘의 주요 뉴스와 커뮤니티 화제 글을 모든 카테고리에 대해 찾아줘.",
    SYSTEM_PROMPT,
    { tools: [{ google_search: {} }], temperature: 0.3 },
  );

  if (!response) return result;

  const candidate = response.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text ?? "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Failed to parse Gemini response:", text.slice(0, 200));
    return result;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      category: string;
      title: string;
      summary: string;
      whyItMatters: string;
      sourceHint: string;
    }>;

    // Grounding metadata에서 URL 수집
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks ?? [];
    const groundingSupports = candidate?.groundingMetadata?.groundingSupports ?? [];

    console.log(`[grounding] chunks: ${groundingChunks.length}, supports: ${groundingSupports.length}, parsed: ${parsed.length}`);

    // support → 아이템 매핑 (2가지 전략 병행)
    const itemChunkMap = new Map<number, Set<number>>();

    // 전략 1: startIndex 기반 위치 매핑
    const rawText = text;
    const itemBoundaries: number[] = parsed.map((item) => {
      const pos = rawText.indexOf(item.title);
      return pos >= 0 ? pos : Infinity;
    });

    for (const support of groundingSupports) {
      if (!support.groundingChunkIndices?.length) continue;
      const startIdx = support.segment?.startIndex ?? 0;

      let itemIdx = 0;
      for (let i = itemBoundaries.length - 1; i >= 0; i--) {
        if (startIdx >= itemBoundaries[i]) {
          itemIdx = i;
          break;
        }
      }

      if (!itemChunkMap.has(itemIdx)) itemChunkMap.set(itemIdx, new Set());
      for (const idx of support.groundingChunkIndices) {
        itemChunkMap.get(itemIdx)!.add(idx);
      }
    }

    // 전략 2: 텍스트 유사도 기반 fallback
    for (let i = 0; i < parsed.length; i++) {
      if (itemChunkMap.has(i)) continue;
      const item = parsed[i];
      const itemWords = extractWords(`${item.title} ${item.summary} ${item.whyItMatters}`);

      for (const support of groundingSupports) {
        if (!support.groundingChunkIndices?.length) continue;
        const supportWords = extractWords(support.segment?.text ?? "").join(" ");
        const matchCount = itemWords.filter((w) => supportWords.includes(w)).length;
        const score = matchCount / Math.max(itemWords.length, 1);

        if (score > 0.2) {
          if (!itemChunkMap.has(i)) itemChunkMap.set(i, new Set());
          for (const idx of support.groundingChunkIndices) {
            itemChunkMap.get(i)!.add(idx);
          }
        }
      }
    }

    // URL 리졸브 (전체 병렬) — 실패 시 Google 검색 링크 fallback
    const resolvedItems = await Promise.all(
      parsed.map(async (item, i) => {
        const chunkIndices = itemChunkMap.get(i);

        if (chunkIndices) {
          const candidates = [...chunkIndices]
            .map((idx) => groundingChunks[idx])
            .filter((c) => c?.web?.uri);

          const results = await Promise.all(
            candidates.map((c) => resolveGroundingUrl(c!.web!.uri!))
          );
          const url = results.find((u) => u !== null);
          if (url) return { ...item, sourceUrl: url };
        }

        // fallback: DuckDuckGo !ducky — 첫 번째 검색 결과로 바로 리다이렉트
        const query = encodeURIComponent(`${item.title} ${item.sourceHint}`);
        return { ...item, sourceUrl: `https://duckduckgo.com/?q=!ducky+${query}` };
      })
    );

    // 카테고리별로 분류 + 중복 URL 제거
    const usedUrls = new Set<string>();

    for (const item of resolvedItems) {
      if (usedUrls.has(item.sourceUrl)) continue;

      const category = item.category as Category;
      if (!result.has(category)) continue;

      usedUrls.add(item.sourceUrl);
      result.get(category)!.push({
        title: item.title,
        summary: item.summary,
        whyItMatters: item.whyItMatters,
        sourceUrl: item.sourceUrl,
        sourceHint: item.sourceHint,
      });
    }

    const verified = resolvedItems.filter((i) => !i.sourceUrl.includes("duckduckgo.com/?q=!")).length;
    console.log(`[all] ${verified}/${parsed.length} verified, ${resolvedItems.length} total`);
    return result;
  } catch (e) {
    console.error("JSON parse error:", e);
    return result;
  }
}

/**
 * 특정 월의 다이제스트 아이템을 기반으로 월간 요약을 생성하고 DB에 저장.
 * force=true이면 기존 요약을 덮어씀 (이번 달 매일 갱신용).
 */
export async function generateMonthlySummary(year: number, month: number, force = false): Promise<string> {
  if (!force) {
    const { data: existing } = await supabase
      .from("MonthlySummary")
      .select("*")
      .eq("year", year)
      .eq("month", month)
      .single();
    if (existing) return existing.content;
  }

  // 해당 월의 다이제스트 아이템 조회
  const startDate = new Date(Date.UTC(year, month, 1)).toISOString().split("T")[0];
  const endDate = new Date(Date.UTC(year, month + 1, 1)).toISOString().split("T")[0];

  // 해당 월의 Digest ID 조회 후 아이템 가져오기
  const { data: digests } = await supabase
    .from("Digest")
    .select("id")
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: true });

  const digestIds = (digests ?? []).map((d: { id: string }) => d.id);

  const { data: items } = digestIds.length > 0
    ? await supabase
        .from("DigestItem")
        .select("category, title, summary")
        .in("digestId", digestIds)
    : { data: [] as { category: string; title: string; summary: string }[] };

  if (!items || items.length === 0) {
    return "";
  }

  // 카테고리별로 제목 그룹핑하여 프롬프트 구성
  const grouped = new Map<string, string[]>();
  for (const item of items) {
    const label = CATEGORIES[item.category as Category]?.label ?? item.category;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push(`- ${item.title}: ${item.summary}`);
  }

  let input = "";
  for (const [label, titles] of grouped) {
    input += `\n[${label}]\n${titles.join("\n")}\n`;
  }

  const monthLabel = new Date(year, month).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  const response = await callGeminiRaw(
    `다음은 ${monthLabel}에 다뤄진 기술 뉴스 목록이야:\n${input}`,
    `너는 ZEEK 기술 뉴스레터의 월간 요약 작성자야.
주어진 뉴스 목록을 분석해서 해당 월의 핵심 트렌드와 주요 이슈를 3~4문장으로 요약해줘.

규칙:
- 한국어로 작성
- 가장 영향력 있었던 뉴스와 트렌드를 중심으로
- 개발자/테크 종사자 관점에서 의미 있는 흐름을 짚어줘
- 간결하고 읽기 쉬운 문체
- JSON이 아닌 일반 텍스트로 반환`,
    { temperature: 0.3 },
  );

  const content = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  // DB에 저장 (upsert: 있으면 갱신, 없으면 생성)
  const { data: existingRow } = await supabase
    .from("MonthlySummary")
    .select("id")
    .eq("year", year)
    .eq("month", month)
    .single();

  if (existingRow) {
    await supabase
      .from("MonthlySummary")
      .update({ content })
      .eq("id", existingRow.id);
  } else {
    await supabase
      .from("MonthlySummary")
      .insert({ year, month, content });
  }

  console.log(`[monthly-summary] Generated for ${monthLabel}`);
  return content;
}
