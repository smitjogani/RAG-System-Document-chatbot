import type { PretrainedOptions, FeatureExtractionPipelineOptions } from "@xenova/transformers";
import { Embeddings, type EmbeddingsParams } from "@langchain/core/embeddings";
/**
 * @deprecated Import from
 * "@langchain/community/embeddings/huggingface_transformers"
 * instead and use the new "@huggingface/transformers" peer dependency.
 */
export interface HuggingFaceTransformersEmbeddingsParams extends EmbeddingsParams {
    /**
     * Model name to use
     * Alias for `model`
     */
    modelName: string;
    /** Model name to use */
    model: string;
    /**
     * Timeout to use when making requests to OpenAI.
     */
    timeout?: number;
    /**
     * The maximum number of documents to embed in a single request.
     */
    batchSize?: number;
    /**
     * Whether to strip new lines from the input text. This is recommended by
     * OpenAI, but may not be suitable for all use cases.
     */
    stripNewLines?: boolean;
    /**
     * Optional parameters for the pretrained model.
     */
    pretrainedOptions?: PretrainedOptions;
    /**
     * Optional parameters for the pipeline.
     */
    pipelineOptions?: FeatureExtractionPipelineOptions;
}
/**
 * @deprecated Import from
 * "@langchain/community/embeddings/huggingface_transformers"
 * instead and use the new "@huggingface/transformers" peer dependency.
 */
export declare class HuggingFaceTransformersEmbeddings extends Embeddings implements HuggingFaceTransformersEmbeddingsParams {
    modelName: string;
    model: string;
    batchSize: number;
    stripNewLines: boolean;
    timeout?: number;
    pretrainedOptions?: PretrainedOptions;
    pipelineOptions?: FeatureExtractionPipelineOptions;
    private pipelinePromise;
    constructor(fields?: Partial<HuggingFaceTransformersEmbeddingsParams>);
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
    private runEmbedding;
}
