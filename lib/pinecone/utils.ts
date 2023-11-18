import { fetchAddressSocialProfiles } from "@/lib/airstack/functions/fetch-user-socials";
import { init } from "@airstack/node";
import {
  getAlreadyReactedPosts, getPostsByAuthors, getPostsByIds, ReactionType
} from "@/lib/db/unified-posts";
import { fetchPoaps } from "@/lib/airstack/functions/fetch-poaps";
import { queryOpenAI } from "@/lib/opeanai";
import { initPineconeIndex, queryPineconeIndex } from "@/lib/pinecone/index";
import { UnifiedPost } from "@/lib/db/types/ex-supabase";

export const generateProfileQueries = async (
    address: string,
    postReactions: {
        contentId: string;
        reaction: ReactionType;
        cleanedText: string;
    }[]
): Promise<string> => {
    init(process.env.AIRSTACK_API_KEY!);
    const userSocials = await fetchAddressSocialProfiles(address);
    const farcasterFid = userSocials.find((s) => s.dappName === 'farcaster')?.profileName ?? null;
    const lensHandle = userSocials.find((s) => s.dappName === 'lens')?.profileName.replace('lens/', '') ?? null;
    const posts =
        farcasterFid || lensHandle
            ? await getPostsByAuthors([farcasterFid as string, lensHandle as string].filter(Boolean), 100)
            : [];
    const poaps = await fetchPoaps(address);
    const content = `Content Posted:\n${posts
        .map((p) => `Text: ${p.cleaned_text}\n`)
        .join('\n\n')}------\n\nPOAPs Collected (aka event attended):\n${poaps
        .map((p) => `Event Name: ${p.poapEvent.eventName}\n Event Description: ${p.poapEvent.description}`)
        .join('\n\n')}------\n\nContent Like: ${postReactions
        .filter((p) => p.reaction === ReactionType.LIKE)
        .map((p) => p.cleanedText)
        .join('---')}\n\nContent Super Liked: ${postReactions
        .filter((p) => p.reaction === ReactionType.FIRE)
        .map((p) => p.cleanedText)
        .join('---')}\n\nContent Disliked/Skipped: ${postReactions
        .filter((p) => p.reaction === ReactionType.SKIP)
        .map((p) => p.cleanedText)
        .join('---')}\n\n`;
    return queryOpenAI(content);
};

export const getPostsForYou = async (privyAddress: string, address: string): Promise<UnifiedPost[]> => {
    const postReactions = await getAlreadyReactedPosts(privyAddress, 500);
    const query = await queryOpenAI(
        await generateProfileQueries(
            address,
            // eslint-disable-next-line camelcase
            postReactions.map((p: { content_id: { content_id: string; cleaned_text: string }; reaction: ReactionType }) => ({
                contentId: p.content_id.content_id,
                reaction: p.reaction,
                cleanedText: p.content_id.cleaned_text,
            }))
        )
    );
    try {
        const pineconeIndex = await initPineconeIndex('posts');
        const result = await queryPineconeIndex(
            pineconeIndex,
            [query.replace(/["'\\]/g, '').trim()],
            postReactions.map(
                // eslint-disable-next-line camelcase
                (p: { content_id: { content_id: string; cleaned_text: string }; reaction: ReactionType }) =>
                    p.content_id.content_id
            )
        );
        if (result?.matches.length > 0) {
            return await getPostsByIds(result.matches.map((r) => r.id));
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
};
