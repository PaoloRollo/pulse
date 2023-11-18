import { CohereEmbeddings } from 'langchain/embeddings/cohere';

export const generateEmbeddingsCohere = async (documents: string[]) => {
    /* Embed queries */
    const embeddings = new CohereEmbeddings({
        verbose: true,
        apiKey: process.env.COHERE_API_KEY, // In Node.js defaults to process.env.COHERE_API_KEY
        batchSize: 48, // Default value if omitted is 48. Max value is 96
    });
    /* Embed documents */
    return embeddings.embedDocuments(documents);
};
