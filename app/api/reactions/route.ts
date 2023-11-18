import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return Response.json({ error: "address is required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  const [{ data: likedPosts }, { data: firePosts }] = await Promise.all([
    supabase
      .from("reactions")
      .select("*, unified_posts(*)")
      .eq("address", address)
      .or("reaction.eq.LIKE"),
    supabase
      .from("reactions")
      .select("*, unified_posts(*)")
      .eq("address", address)
      .or("reaction.eq.FIRE"),
  ]);

  return Response.json(
    {
      reactions: {
        likes: likedPosts,
        fires: firePosts,
      },
    },
    { status: 200 }
  );
}
