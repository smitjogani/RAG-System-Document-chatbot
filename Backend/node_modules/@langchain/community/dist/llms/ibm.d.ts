import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { BaseLLM, BaseLLMParams } from "@langchain/core/language_models/llms";
import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import { RequestCallbacks, ReturnOptionProperties, TextGenLengthPenalty, TextGenParameters, TextTokenizeParameters } from "@ibm-cloud/watsonx-ai/dist/watsonx-ai-ml/vml_v1.js";
import { LLMResult, GenerationChunk } from "@langchain/core/outputs";
import { BaseLanguageModelCallOptions } from "@langchain/core/language_models/base";
import { Neverify, WatsonxAuth, WatsonxDeployedParams, WatsonxParams } from "../types/ibm.js";
/**
 * Input to LLM class.
 */
export interface WatsonxLLMParams {
    maxNewTokens?: number;
    decodingMethod?: TextGenParameters.Constants.DecodingMethod | string;
    lengthPenalty?: TextGenLengthPenalty;
    minNewTokens?: number;
    randomSeed?: number;
    stopSequence?: string[];
    temperature?: number;
    timeLimit?: number;
    topK?: number;
    topP?: number;
    repetitionPenalty?: number;
    truncateInpuTokens?: number;
    returnOptions?: ReturnOptionProperties;
    includeStopSequence?: boolean;
}
export interface WatsonxDeploymentLLMParams {
    idOrName: string;
}
export interface WatsonxCallOptionsLLM extends BaseLanguageModelCallOptions {
    maxRetries?: number;
    parameters?: Partial<WatsonxLLMParams>;
    watsonxCallbacks?: RequestCallbacks;
}
export interface WatsonxInputLLM extends WatsonxParams, BaseLLMParams, WatsonxLLMParams, Neverify<WatsonxDeploymentLLMParams> {
}
export interface WatsonxDeployedInputLLM extends WatsonxDeployedParams, BaseLLMParams, Neverify<WatsonxLLMParams> {
    model?: never;
}
export type WatsonxLLMConstructor = BaseLLMParams & WatsonxLLMParams & Partial<WatsonxParams> & WatsonxDeployedParams;
/**
 * Integration with an LLM.
 */
export declare class WatsonxLLM<CallOptions extends WatsonxCallOptionsLLM = WatsonxCallOptionsLLM> extends BaseLLM<CallOptions> implements WatsonxLLMConstructor {
    static lc_name(): string;
    lc_serializable: boolean;
    streaming: boolean;
    model: string;
    maxRetries: number;
    version: string;
    serviceUrl: string;
    maxNewTokens?: number;
    spaceId?: string;
    projectId?: string;
    idOrName?: string;
    decodingMethod?: TextGenParameters.Constants.DecodingMethod | string;
    lengthPenalty?: TextGenLengthPenalty;
    minNewTokens?: number;
    randomSeed?: number;
    stopSequence?: string[];
    temperature?: number;
    timeLimit?: number;
    topK?: number;
    topP?: number;
    repetitionPenalty?: number;
    truncateInpuTokens?: number;
    returnOptions?: ReturnOptionProperties;
    includeStopSequence?: boolean;
    maxConcurrency?: number;
    watsonxCallbacks?: RequestCallbacks;
    private service;
    constructor(fields: (WatsonxInputLLM | WatsonxDeployedInputLLM) & WatsonxAuth);
    get lc_secrets(): {
        [key: string]: string;
    };
    get lc_aliases(): {
        [key: string]: string;
    };
    invocationParams(options: this["ParsedCallOptions"]): {
        max_new_tokens: number | undefined;
        decoding_method: string | undefined;
        length_penalty: WatsonXAI.TextGenLengthPenalty | undefined;
        min_new_tokens: number | undefined;
        random_seed: number | undefined;
        stop_sequences: string[] | undefined;
        temperature: number | undefined;
        time_limit: number | undefined;
        top_k: number | undefined;
        top_p: number | undefined;
        repetition_penalty: number | undefined;
        truncate_input_tokens: number | undefined;
        return_options: WatsonXAI.ReturnOptionProperties | undefined;
        include_stop_sequence: boolean | undefined;
    } | undefined;
    invocationCallbacks(options: this["ParsedCallOptions"]): WatsonXAI.RequestCallbacks<any> | undefined;
    scopeId(): {
        projectId: string;
        modelId: string;
        spaceId?: undefined;
        idOrName?: undefined;
    } | {
        spaceId: string;
        modelId: string;
        projectId?: undefined;
        idOrName?: undefined;
    } | {
        idOrName: string;
        modelId: string;
        projectId?: undefined;
        spaceId?: undefined;
    } | {
        modelId: string;
        projectId?: undefined;
        spaceId?: undefined;
        idOrName?: undefined;
    };
    listModels(): Promise<string[] | undefined>;
    private generateSingleMessage;
    completionWithRetry<T>(callback: () => T, options?: this["ParsedCallOptions"]): Promise<T>;
    _generate(prompts: string[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<LLMResult>;
    getNumTokens(content: string, options?: TextTokenizeParameters): Promise<number>;
    _streamResponseChunks(prompt: string, options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<GenerationChunk>;
    _llmType(): string;
}
