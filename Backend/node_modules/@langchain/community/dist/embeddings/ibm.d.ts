import { Embeddings } from "@langchain/core/embeddings";
import { EmbeddingParameters, TextEmbeddingsParams } from "@ibm-cloud/watsonx-ai/dist/watsonx-ai-ml/vml_v1.js";
import { WatsonxAuth, WatsonxParams } from "../types/ibm.js";
export interface WatsonxEmbeddingsParams extends Pick<TextEmbeddingsParams, "headers"> {
    truncateInputTokens?: number;
}
export interface WatsonxInputEmbeddings extends Omit<WatsonxParams, "idOrName"> {
    truncateInputTokens?: number;
}
export declare class WatsonxEmbeddings extends Embeddings implements WatsonxEmbeddingsParams, WatsonxParams {
    model: string;
    serviceUrl: string;
    version: string;
    spaceId?: string;
    projectId?: string;
    truncateInputTokens?: number;
    maxRetries?: number;
    maxConcurrency?: number;
    private service;
    constructor(fields: WatsonxInputEmbeddings & WatsonxAuth);
    scopeId(): {
        projectId: string;
        modelId: string;
        spaceId?: undefined;
    } | {
        spaceId: string | undefined;
        modelId: string;
        projectId?: undefined;
    };
    invocationParams(): EmbeddingParameters;
    listModels(): Promise<string[] | undefined>;
    private embedSingleText;
    embedDocuments(documents: string[]): Promise<number[][]>;
    embedQuery(document: string): Promise<number[]>;
}
