import { supabase } from "./supabase";
import { getResend } from "./resend";
import { fetchAllNews } from "./gemini";
import { CATEGORY_KEYS, CATEGORIES } from "./constants";
import { DailyDigest } from "@/emails/DailyDigest";
import { render } from "@react-email/render";
import type { CategoryDigest, MonthSummary } from "@/types/digest";
import type { Category } from "@/types/digest";

/** Vercel(UTC) 서버에서도 KST 기준 오늘 날짜를 반환 */
function getTodayKST(): Date {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dateStr = kst.toISOString().slice(0, 10);
  return new Date(dateStr + "T00:00:00.000Z");
}

/** 오늘자 다이제스트 콘텐츠만 생성 (이메일 발송 없음) */
export async function generateDigest() {
  const today = getTodayKST();
  const todayStr = today.toISOString().split("T")[0];

  // Check if already generated today
  const { data: existing } = await supabase
    .from("Digest")
    .select("*, DigestItem(*)")
    .eq("date", todayStr)
    .single();

  if (existing && existing.DigestItem.length > 0) {
    console.log("Digest already exists for today, skipping generation");
    return { ...existing, items: existing.DigestItem };
  }
  // 빈 다이제스트가 있으면 삭제 후 재생성
  if (existing) {
    await supabase.from("Digest").delete().eq("id", existing.id);
  }

  // 1회 API 호출로 모든 카테고리 뉴스 가져오기 (Gemini free tier 20 RPD 대응)
  const newsMap = await fetchAllNews();

  // Store in database
  const { data: digest, error: digestError } = await supabase
    .from("Digest")
    .insert({ date: todayStr })
    .select()
    .single();

  if (digestError || !digest) {
    throw new Error(`Failed to create digest: ${digestError?.message}`);
  }

  const itemsToInsert = CATEGORY_KEYS.flatMap((category) =>
    (newsMap.get(category) ?? []).map((item, index) => ({
      digestId: digest.id,
      category,
      title: item.title,
      summary: item.summary,
      whyItMatters: item.whyItMatters,
      sourceUrl: item.sourceUrl,
      order: index,
    }))
  );

  const { data: items } = await supabase
    .from("DigestItem")
    .insert(itemsToInsert)
    .select();

  console.log(`Digest generated: ${items?.length ?? 0} items`);
  return { ...digest, items: items ?? [] };
}

/** 오늘자 다이제스트의 이메일만 발송 (평일만, 콘텐츠 생성 없이) */
export async function sendTodayDigest() {
  // 평일(월~금)에만 이메일 발송 (KST 기준)
  const kstDay = new Date(Date.now() + 9 * 60 * 60 * 1000).getDay();
  const isWeekday = kstDay >= 1 && kstDay <= 5;
  if (!isWeekday) {
    console.log("Weekend — email skipped");
    return { ok: true, sent: 0, total: 0, skipped: "weekend" };
  }

  const today = getTodayKST();
  const todayStr = today.toISOString().split("T")[0];

  const { data: digest } = await supabase
    .from("Digest")
    .select("*, DigestItem(*)")
    .eq("date", todayStr)
    .single();

  if (!digest) {
    return { ok: false, error: "No digest for today" };
  }

  const { data: subscribers } = await supabase
    .from("Subscriber")
    .select("*")
    .eq("active", true);

  if (!subscribers) {
    return { ok: false, error: "Failed to fetch subscribers" };
  }

  const sortedItems = digest.DigestItem.sort((a: { order: number }, b: { order: number }) => a.order - b.order);

  const categoryDigests: CategoryDigest[] = CATEGORY_KEYS.map((key) => ({
    category: key,
    label: CATEGORIES[key].label,
    items: sortedItems
      .filter((item: { category: string }) => item.category === key)
      .map((item: { title: string; summary: string; whyItMatters: string; sourceUrl: string }) => ({
        title: item.title,
        summary: item.summary,
        whyItMatters: item.whyItMatters,
        sourceUrl: item.sourceUrl,
        sourceHint: "",
      })),
  }));

  const dateStr = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let sent = 0;

  for (const subscriber of subscribers) {
    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ZEEK <digest@zeek.dev>",
        to: subscriber.email,
        subject: `ZEEK Daily — ${dateStr}`,
        html: await render(DailyDigest({
          date: dateStr,
          categories: categoryDigests,
          unsubscribeUrl: `${appUrl}/unsubscribe?token=${subscriber.token}`,
        })),
      });
      sent++;
    } catch (e) {
      console.error(`Failed to send email to ${subscriber.email}:`, e);
    }
  }

  console.log(`Email sent to ${sent}/${subscribers.length} subscribers`);
  return { ok: true, sent, total: subscribers.length };
}

export async function getLatestDigest() {
  const { data } = await supabase
    .from("Digest")
    .select("*, DigestItem(*)")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;
  const items = data.DigestItem.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  return { ...data, items };
}

export async function getDigestByDate(date: Date) {
  const dateStr = date.toISOString().split("T")[0];
  const { data } = await supabase
    .from("Digest")
    .select("*, DigestItem(*)")
    .eq("date", dateStr)
    .single();

  if (!data) return null;
  const items = data.DigestItem.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  return { ...data, items };
}

export async function getArchiveData(): Promise<MonthSummary[]> {
  const { data: digests } = await supabase
    .from("Digest")
    .select("date, DigestItem(category)")
    .order("date", { ascending: false });

  if (!digests) return [];

  const monthMap = new Map<string, MonthSummary>();

  for (const digest of digests) {
    const d = new Date(digest.date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const key = `${year}-${month}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        year,
        month,
        label: new Date(year, month).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
        }),
        digestCount: 0,
        totalItems: 0,
        categoryBreakdown: [],
        dates: [],
      });
    }

    const items = digest.DigestItem as { category: string }[];
    const entry = monthMap.get(key)!;
    entry.digestCount += 1;
    entry.totalItems += items.length;
    entry.dates.push({
      dateStr: d.toISOString().split("T")[0],
      displayStr: d.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
      itemCount: items.length,
    });
  }

  // Category breakdown per month
  for (const digest of digests) {
    const d = new Date(digest.date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const entry = monthMap.get(`${year}-${month}`)!;
    const items = digest.DigestItem as { category: string }[];

    for (const item of items) {
      const existing = entry.categoryBreakdown.find(
        (c) => c.category === item.category
      );
      if (existing) {
        existing.count += 1;
      } else {
        const cat = CATEGORIES[item.category as Category];
        entry.categoryBreakdown.push({
          category: item.category,
          label: cat?.label ?? item.category,
          count: 1,
        });
      }
    }
  }

  // Sort category breakdowns by count desc
  for (const entry of monthMap.values()) {
    entry.categoryBreakdown.sort((a, b) => b.count - a.count);
  }

  // 월간 요약 조회
  const { data: summaries } = await supabase
    .from("MonthlySummary")
    .select("*");

  if (summaries) {
    for (const s of summaries) {
      const entry = monthMap.get(`${s.year}-${s.month}`);
      if (entry) entry.summary = s.content;
    }
  }

  return Array.from(monthMap.values());
}
