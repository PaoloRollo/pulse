import supabase from './index.js';
import { UnifiedPost } from './types/ex-supabase';

export const getAlreadyReactedPosts = async (address: string, limit = 100, page = 0): Promise<string[]> => {
  const { data, error } = await supabase
      .from('reactions')
      .select('address,content_id').eq("address", address)
      .range(page * limit, (page + 1) * limit - 1)
      .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ? data.map(d => d.content_id) : [];
};

export const getPosts = async (limit = 100, page = 0): Promise<UnifiedPost[]> => {
  const { data, error } = await supabase
    .from('unified_posts')
    .select('*')
    .order('publish_date', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)
    .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ?? [];
};

export const getPostsByAuthors = async (fid: string[], limit = 100): Promise<UnifiedPost[]> => {
  const { data, error } = await supabase
    .from('unified_posts')
    .select('*')
    .in('author_id', fid)
    .order('publish_date', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ?? [];
};

export const getPostsByIds = async (ids: string[], limit = 100): Promise<UnifiedPost[]> => {
  const { data, error } = await supabase
    .from('unified_posts')
    .select('*')
    .in('content_id', ids)
    .order('publish_date', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data ?? [];
};

export const upsertPosts = async (posts: UnifiedPost[]) => {
  const { error } = await supabase
    .from('unified_posts')
    .upsert(posts, { ignoreDuplicates: true, onConflict: 'content_id' });
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};
