import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: "zeek" } }
);

await supabase.from("DigestItem").delete().neq("id", "");
await supabase.from("Digest").delete().neq("id", "");
console.log("Deleted all digests");
process.exit(0);
