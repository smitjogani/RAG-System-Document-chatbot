import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
import { Pinecone, PineconeConfiguration } from "@pinecone-database/pinecone";
export interface PineconeEmbeddingsParams extends EmbeddingsParams {
    model?: string;
    params?: Record<string, string>;
}
export declare class PineconeEmbeddings extends Embeddings implements PineconeEmbeddingsParams {
    client: Pinecone;
    model: string;
    params: Record<string, string>;
    constructor(fields?: Partial<PineconeEmbeddingsParams> & Partial<PineconeConfiguration>);
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
