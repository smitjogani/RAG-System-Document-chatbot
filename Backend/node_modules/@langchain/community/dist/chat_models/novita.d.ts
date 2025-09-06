import type { BaseChatModelParams, LangSmithParams } from "@langchain/core/language_models/chat_models";
import { type OpenAIClient, type ChatOpenAICallOptions, type OpenAIChatInput, type OpenAICoreRequestOptions, ChatOpenAICompletions } from "@langchain/openai";
type NovitaUnsupportedArgs = "frequencyPenalty" | "presencePenalty" | "logitBias" | "functions";
type NovitaUnsupportedCallOptions = "functions" | "function_call";
export interface ChatNovitaCallOptions extends Omit<ChatOpenAICallOptions, NovitaUnsupportedCallOptions> {
    response_format: {
        type: "json_object";
        schema: Record<string, unknown>;
    };
}
export interface ChatNovitaInput extends Omit<OpenAIChatInput, "openAIApiKey" | NovitaUnsupportedArgs>, BaseChatModelParams {
    /**
     * Novita API key
     * @default process.env.NOVITA_API_KEY
     */
    novitaApiKey?: string;
    /**
     * API key alias
     * @default process.env.NOVITA_API_KEY
     */
    apiKey?: string;
}
/**
 * Novita chat model implementation
 */
export declare class ChatNovitaAI extends ChatOpenAICompletions<ChatNovitaCallOptions> {
    static lc_name(): string;
    _llmType(): string;
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    lc_serializable: boolean;
    constructor(fields?: Partial<Omit<OpenAIChatInput, "openAIApiKey" | NovitaUnsupportedArgs>> & BaseChatModelParams & {
        novitaApiKey?: string;
        apiKey?: string;
    });
    getLsParams(options: this["ParsedCallOptions"]): LangSmithParams;
    toJSON(): import("@langchain/core/load/serializable").Serialized;
    completionWithRetry(request: OpenAIClient.Chat.ChatCompletionCreateParamsStreaming, options?: OpenAICoreRequestOptions): Promise<AsyncIterable<OpenAIClient.Chat.Completions.ChatCompletionChunk>>;
    completionWithRetry(request: OpenAIClient.Chat.ChatCompletionCreateParamsNonStreaming, options?: OpenAICoreRequestOptions): Promise<OpenAIClient.Chat.Completions.ChatCompletion>;
}
export {};
