import { NextRequest } from "next/server";
import { getPostsForYou } from "@/lib/pinecone/utils";

// export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const walletAddress = req.nextUrl.searchParams.get("walletAddress");

  const posts = await getPostsForYou(address!, walletAddress || address!);

  return Response.json(
    {
      posts: posts.map(({ content_id, cleaned_text }) => ({
        content_id,
        cleaned_text,
      })),
    },
    { status: 200 }
  );
}
