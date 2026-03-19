import { supabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { Welcome } from "@/emails/Welcome";
import { render } from "@react-email/render";
import { NextRequest } from "next/server";

async function sendWelcomeEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const unsubscribeUrl = `${appUrl}/unsubscribe?token=${token}`;

  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "ZEEK <digest@zeek.dev>",
      to: email,
      subject: "ZEEK에 오신 걸 환영합니다!",
      html: await render(Welcome({ unsubscribeUrl })),
    });
  } catch (e) {
    console.error("Welcome email error:", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "유효하지 않은 이메일입니다" }, { status: 400 });
    }

    if (!email.endsWith("@gmail.com")) {
      return Response.json({ error: "현재 Gmail 주소만 구독 가능합니다" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("Subscriber")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.active) {
        return Response.json({ message: "이미 구독 중입니다" });
      }
      // Re-subscribe
      await supabase
        .from("Subscriber")
        .update({ active: true, unsubscribedAt: null })
        .eq("email", email);
      sendWelcomeEmail(email, existing.token);
      return Response.json({ message: "다시 구독되었습니다!" });
    }

    const { data: subscriber, error } = await supabase
      .from("Subscriber")
      .insert({ email })
      .select()
      .single();

    if (error || !subscriber) {
      throw new Error(`Failed to create subscriber: ${error?.message}`);
    }

    sendWelcomeEmail(email, subscriber.token);
    return Response.json({ message: "구독 완료! 환영 이메일을 보내드렸습니다." });
  } catch (e) {
    console.error("Subscribe error:", e);
    return Response.json({ error: "구독에 실패했습니다" }, { status: 500 });
  }
}
