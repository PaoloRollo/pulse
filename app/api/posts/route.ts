import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  // TODO: add personalized content here
  const address = req.nextUrl.searchParams.get("address");
  const page = req.nextUrl.searchParams.get("page") || "0";
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  const { data } = await supabase
    .from("unified_posts")
    .select("content_id,cleaned_text")
    .limit(100);

  return Response.json({ posts: data }, { status: 200 });
}
