import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return Response.json({ error: "Token required" }, { status: 400 });
    }

    const { data: subscriber } = await supabase
      .from("Subscriber")
      .select("*")
      .eq("token", token)
      .single();

    if (!subscriber) {
      return Response.json({ error: "Invalid token" }, { status: 404 });
    }

    await supabase
      .from("Subscriber")
      .update({ active: false, unsubscribedAt: new Date().toISOString() })
      .eq("token", token);

    return Response.json({ message: "Unsubscribed successfully" });
  } catch (e) {
    console.error("Unsubscribe error:", e);
    return Response.json({ error: "Unsubscribe failed" }, { status: 500 });
  }
}
