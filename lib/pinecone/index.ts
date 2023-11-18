import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import {generateEmbeddingsCohere} from "@/lib/embeddings";
export const initPineconeIndex = async <T extends RecordMetadata>(name: string) => {
    const pinecone = new Pinecone({
        environment: 'eu-west4-gcp',
        apiKey: process.env.PINECONE_API_KEY as string,
    });
    return pinecone.Index<T>(name);
};

export const queryPineconeIndex = async (pineconeIndex: Index, query: string[], excludeContentIds: string[] = []) => {
    const embeddings = await generateEmbeddingsCohere(query);
    return pineconeIndex.query({
        vector: embeddings.flat().filter(Boolean),
        topK: 25,
        ...excludeContentIds.length > 0 ? {
            filter: {
                content_id: {
                    $nin: excludeContentIds
                }
            }
        }: {}
    });
};
