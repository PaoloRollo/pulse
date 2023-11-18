import {fetchAddressSocialProfiles} from "@/lib/airstack/functions/fetch-user-socials";
import {init} from "@airstack/airstack-react";
import {getPostsByAuthors, getPostsByIds} from "@/lib/db/unified-posts";
import {fetchPoaps} from "@/lib/airstack/functions/fetch-poaps";
import {queryOpenAI} from "@/lib/opeanai";
import {initPineconeIndex, queryPineconeIndex} from "@/lib/pinecone/index";
import {UnifiedPost} from "@/lib/db/types/ex-supabase";


export const generateProfileQueries = async (address: string): Promise<string> => {
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
        .join('\n\n')}------\n\nPOAPs Collected (or events attended):\n${poaps
        .map((p) => `Event Name: ${p.poapEvent.eventName}\n Event Description: ${p.poapEvent.description}`)
        .join('\n\n')}`;
    return queryOpenAI(content.substring(0, 10000));
};

export const getPostsForYou = async (address: string, excludeIds: string[] = []): Promise<UnifiedPost[]> => {
    const query = await queryOpenAI(await generateProfileQueries(address));
    try {
        const pineconeIndex = await initPineconeIndex('posts');
        const result = await queryPineconeIndex(pineconeIndex, [query.replace(/["'\\]/g, '').trim()], excludeIds);
        if (result?.matches.length > 0) {
            return await getPostsByIds(result.matches.map((r) => r.id));
        }
        return [];
    } catch (e) {
        console.error(e);
        return [];
    }
};
