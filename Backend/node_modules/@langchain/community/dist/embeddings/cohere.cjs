"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohereEmbeddings = void 0;
const env_1 = require("@langchain/core/utils/env");
const embeddings_1 = require("@langchain/core/embeddings");
const chunk_array_1 = require("@langchain/core/utils/chunk_array");
const cohere_ai_1 = require("cohere-ai");
/**
 * A class for generating embeddings using the Cohere API.
 * @example
 * ```typescript
 * // Embed a query using the CohereEmbeddings class
 * const model = new ChatOpenAI({ model: "gpt-4o-mini" });
 * const res = await model.embedQuery(
 *   "What would be a good company name for a company that makes colorful socks?",
 * );
 * console.log({ res });
 * ```
 * @deprecated Use `CohereEmbeddings` from `@langchain/cohere` instead.
 */
class CohereEmbeddings extends embeddings_1.Embeddings {
    /**
     * Constructor for the CohereEmbeddings class.
     * @param fields - An optional object with properties to configure the instance.
     */
    constructor(fields) {
        const fieldsWithDefaults = { maxConcurrency: 2, ...fields };
        super(fieldsWithDefaults);
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "small"
        });
        Object.defineProperty(this, "batchSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 48
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const apiKey = fieldsWithDefaults?.apiKey || (0, env_1.getEnvironmentVariable)("COHERE_API_KEY");
        if (!apiKey) {
            throw new Error("Cohere API key not found");
        }
        this.modelName = fieldsWithDefaults?.modelName ?? this.modelName;
        this.batchSize = fieldsWithDefaults?.batchSize ?? this.batchSize;
        this.apiKey = apiKey;
        this.client = new cohere_ai_1.CohereClient({ token: this.apiKey });
    }
    /**
     * Generates embeddings for an array of texts.
     * @param texts - An array of strings to generate embeddings for.
     * @returns A Promise that resolves to an array of embeddings.
     */
    async embedDocuments(texts) {
        const batches = (0, chunk_array_1.chunkArray)(texts, this.batchSize);
        const batchRequests = batches.map((batch) => this.embeddingWithRetry({
            model: this.modelName,
            texts: batch,
        }));
        const batchResponses = await Promise.all(batchRequests);
        const embeddings = [];
        for (let i = 0; i < batchResponses.length; i += 1) {
            if (batchResponses[i].responseType === "embeddings_floats") {
                const batchResponse = batchResponses[i];
                embeddings.push(...batchResponse.embeddings);
            }
            else {
                throw new Error("Unexpected response type");
            }
        }
        return embeddings;
    }
    /**
     * Generates an embedding for a single text.
     * @param text - A string to generate an embedding for.
     * @returns A Promise that resolves to an array of numbers representing the embedding.
     */
    async embedQuery(text) {
        const result = await this.embeddingWithRetry({
            model: this.modelName,
            texts: [text],
        });
        return result.embeddings[0];
    }
    /**
     * Generates embeddings with retry capabilities.
     * @param request - An object containing the request parameters for generating embeddings.
     * @returns A Promise that resolves to the API response.
     */
    async embeddingWithRetry(request) {
        return this.caller.call(this.client.embed.bind(this.client), request);
    }
}
exports.CohereEmbeddings = CohereEmbeddings;
