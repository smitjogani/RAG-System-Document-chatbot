import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
export interface ByteDanceDoubaoEmbeddingsParams extends EmbeddingsParams {
    /** Model name to use */
    model: string;
    /**
     * Timeout to use when making requests to ByteDanceDoubao.
     */
    timeout?: number;
    /**
     * The maximum number of documents to embed in a single request. This is
     * limited by the ByteDanceDoubao API to a maximum of 2048.
     */
    batchSize?: number;
    /**
     * Whether to strip new lines from the input text.
     */
    stripNewLines?: boolean;
}
export declare class ByteDanceDoubaoEmbeddings extends Embeddings implements ByteDanceDoubaoEmbeddingsParams {
    model: string;
    batchSize: number;
    stripNewLines: boolean;
    apiKey: string;
    constructor(fields?: Partial<ByteDanceDoubaoEmbeddingsParams> & {
        verbose?: boolean;
        apiKey?: string;
    });
    /**
     * Method to generate embeddings for an array of documents. Splits the
     * documents into batches and makes requests to the ByteDanceDoubao API to generate
     * embeddings.
     * @param texts Array of documents to generate embeddings for.
     * @returns Promise that resolves to a 2D array of embeddings for each document.
     */
    embedDocuments(texts: string[]): Promise<number[][]>;
    /**
     * Method to generate an embedding for a single document. Calls the
     * embeddingWithRetry method with the document as the input.
     * @param text Document to generate an embedding for.
     * @returns Promise that resolves to an embedding for the document.
     */
    embedQuery(text: string): Promise<number[]>;
    /**
     * Method to generate an embedding params.
     * @param texts Array of documents to generate embeddings for.
     * @returns an embedding params.
     */
    private getParams;
    /**
     * Private method to make a request to the OpenAI API to generate
     * embeddings. Handles the retry logic and returns the response from the
     * API.
     * @param request Request to send to the OpenAI API.
     * @returns Promise that resolves to the response from the API.
     */
    private embeddingWithRetry;
}
