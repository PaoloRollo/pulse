import { createClient } from "@supabase/supabase-js";
import { UnifiedPost } from "./types/ex-supabase";

export enum ReactionType {
  SKIP = "SKIP",
  LIKE = "LIKE",
  FIRE = "FIRE"
}
export const getAlreadyReactedPosts = async (
  address: string,
  limit = 100,
  page = 0
): Promise<any> => {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );
  const {data, error} = await supabase
      .from('reactions')
      .select('address,content_id:unified_posts!inner(content_id,cleaned_text),reaction').eq("address", address)
      .range(page * limit, (page + 1) * limit - 1)
      .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ? data.map((d) => d.content_id) : [];
};

export const getPosts = async (
  limit = 100,
  page = 0
): Promise<UnifiedPost[]> => {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );
  const { data, error } = await supabase
    .from("unified_posts")
    .select("*")
    .order("publish_date", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)
    .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ?? [];
};

export const getPostsByAuthors = async (
  fid: string[],
  limit = 100
): Promise<UnifiedPost[]> => {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );
  const { data, error } = await supabase
    .from("unified_posts")
    .select("*")
    .in("author_id", fid)
    .order("publish_date", { ascending: false })
    .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ?? [];
};

export const getPostsByIds = async (
  ids: string[],
  limit = 100
): Promise<UnifiedPost[]> => {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );
  const { data, error } = await supabase
    .from("unified_posts")
    .select("*")
    .in("content_id", ids)
    .order("publish_date", { ascending: false })
    .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ?? [];
};

export const upsertPosts = async (posts: UnifiedPost[]) => {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );
  const { error } = await supabase
    .from("unified_posts")
    .upsert(posts, { ignoreDuplicates: true, onConflict: "content_id" });
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};
