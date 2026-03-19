import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "zeek" } }
);

const { data: items } = await supabase
  .from("DigestItem")
  .select("title, sourceUrl, category")
  .order("category")
  .order("order");

for (const item of items ?? []) {
  console.log(`[${item.category}] ${item.title}`);
  console.log(`  → ${item.sourceUrl}`);
  console.log();
}
process.exit(0);
