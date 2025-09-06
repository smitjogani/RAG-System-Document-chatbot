"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPerplexity = void 0;
const messages_1 = require("@langchain/core/messages");
const stream_1 = require("@langchain/core/utils/stream");
const chat_models_1 = require("@langchain/core/language_models/chat_models");
const outputs_1 = require("@langchain/core/outputs");
const env_1 = require("@langchain/core/utils/env");
const openai_1 = __importDefault(require("openai"));
const runnables_1 = require("@langchain/core/runnables");
const json_schema_1 = require("@langchain/core/utils/json_schema");
const types_1 = require("@langchain/core/utils/types");
const output_parsers_1 = require("@langchain/core/output_parsers");
const output_parsers_js_1 = require("../utils/output_parsers.cjs");
/**
 * Wrapper around Perplexity large language models that use the Chat endpoint.
 */
class ChatPerplexity extends chat_models_1.BaseChatModel {
    static lc_name() {
        return "ChatPerplexity";
    }
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchDomainFilter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnImages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnRelatedQuestions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchRecencyFilter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "presencePenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "frequencyPenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchMode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reasoningEffort", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchAfterDateFilter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchBeforeDateFilter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "webSearchOptions", {
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
        this.model = fields.model;
        this.temperature = fields?.temperature ?? this.temperature;
        this.maxTokens = fields?.maxTokens;
        this.apiKey =
            fields?.apiKey ?? (0, env_1.getEnvironmentVariable)("PERPLEXITY_API_KEY");
        this.streaming = fields?.streaming ?? this.streaming;
        this.timeout = fields?.timeout;
        this.topP = fields?.topP ?? this.topP;
        this.returnImages = fields?.returnImages ?? this.returnImages;
        this.returnRelatedQuestions =
            fields?.returnRelatedQuestions ?? this.returnRelatedQuestions;
        this.topK = fields?.topK ?? this.topK;
        this.presencePenalty = fields?.presencePenalty ?? this.presencePenalty;
        this.frequencyPenalty = fields?.frequencyPenalty ?? this.frequencyPenalty;
        this.searchDomainFilter =
            fields?.searchDomainFilter ?? this.searchDomainFilter;
        this.searchRecencyFilter =
            fields?.searchRecencyFilter ?? this.searchRecencyFilter;
        this.searchMode = fields?.searchMode;
        this.reasoningEffort = fields?.reasoningEffort;
        this.searchAfterDateFilter = fields?.searchAfterDateFilter;
        this.searchBeforeDateFilter = fields?.searchBeforeDateFilter;
        this.webSearchOptions = fields?.webSearchOptions;
        if (!this.apiKey) {
            throw new Error("Perplexity API key not found");
        }
        this.client = new openai_1.default({
            apiKey: this.apiKey,
            baseURL: "https://api.perplexity.ai",
        });
    }
    _llmType() {
        return "perplexity";
    }
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(options) {
        return {
            model: this.model,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: this.streaming,
            top_p: this.topP,
            return_images: this.returnImages,
            return_related_questions: this.returnRelatedQuestions,
            top_k: this.topK,
            presence_penalty: this.presencePenalty,
            frequency_penalty: this.frequencyPenalty,
            response_format: options?.response_format,
            search_domain_filter: this.searchDomainFilter,
            search_recency_filter: this.searchRecencyFilter,
            search_mode: this.searchMode,
            reasoning_effort: this.reasoningEffort,
            search_after_date_filter: this.searchAfterDateFilter,
            search_before_date_filter: this.searchBeforeDateFilter,
            web_search_options: this.webSearchOptions, // Cast WebSearchOptions to generic type to avoid conflict with OpenAI's WebSearchOptions interface
        };
    }
    /**
     * Convert a message to a format that the model expects
     */
    messageToPerplexityRole(message) {
        if (message._getType() === "human") {
            return {
                role: "user",
                content: message.content.toString(),
            };
        }
        else if (message._getType() === "ai") {
            return {
                role: "assistant",
                content: message.content.toString(),
            };
        }
        else if (message._getType() === "system") {
            return {
                role: "system",
                content: message.content.toString(),
            };
        }
        throw new Error(`Unknown message type: ${message}`);
    }
    async _generate(messages, options, runManager) {
        const tokenUsage = {};
        const messagesList = messages.map((message) => this.messageToPerplexityRole(message));
        if (this.streaming) {
            const stream = this._streamResponseChunks(messages, options, runManager);
            const finalChunks = {};
            for await (const chunk of stream) {
                const index = chunk.generationInfo?.completion ?? 0;
                if (finalChunks[index] === undefined) {
                    finalChunks[index] = chunk;
                }
                else {
                    finalChunks[index] = (0, stream_1.concat)(finalChunks[index], chunk);
                }
            }
            const generations = Object.entries(finalChunks)
                .sort(([aKey], [bKey]) => parseInt(aKey, 10) - parseInt(bKey, 10))
                .map(([_, value]) => value);
            return { generations };
        }
        const response = await this.client.chat.completions.create({
            messages: messagesList,
            ...this.invocationParams(options),
            stream: false,
        });
        const { message } = response.choices[0];
        const generations = [];
        generations.push({
            text: message.content ?? "",
            message: new messages_1.AIMessage({
                content: message.content ?? "",
                additional_kwargs: {
                    citations: response.citations,
                },
            }),
        });
        if (response.usage) {
            tokenUsage.promptTokens = response.usage.prompt_tokens;
            tokenUsage.completionTokens = response.usage.completion_tokens;
            tokenUsage.totalTokens = response.usage.total_tokens;
        }
        return {
            generations,
            llmOutput: {
                tokenUsage,
            },
        };
    }
    async *_streamResponseChunks(messages, options, runManager) {
        const messagesList = messages.map((message) => this.messageToPerplexityRole(message));
        const stream = await this.client.chat.completions.create({
            messages: messagesList,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...this.invocationParams(options),
            stream: true,
        });
        let firstChunk = true;
        for await (const chunk of stream) {
            const choice = chunk.choices[0];
            const { delta } = choice;
            const citations = chunk.citations ?? [];
            if (!delta.content)
                continue;
            let messageChunk;
            if (delta.role === "user") {
                messageChunk = new messages_1.HumanMessageChunk({ content: delta.content });
            }
            else if (delta.role === "assistant") {
                messageChunk = new messages_1.AIMessageChunk({ content: delta.content });
            }
            else if (delta.role === "system") {
                messageChunk = new messages_1.SystemMessageChunk({ content: delta.content });
            }
            else {
                messageChunk = new messages_1.ChatMessageChunk({
                    content: delta.content,
                    role: delta.role ?? "assistant",
                });
            }
            if (firstChunk) {
                messageChunk.additional_kwargs.citations = citations;
                firstChunk = false;
            }
            const generationChunk = new outputs_1.ChatGenerationChunk({
                message: messageChunk,
                text: delta.content,
                generationInfo: {
                    finishReason: choice.finish_reason,
                },
            });
            yield generationChunk;
            // Emit the chunk to the callback manager if provided
            if (runManager) {
                await runManager.handleLLMNewToken(delta.content);
            }
        }
    }
    withStructuredOutput(outputSchema, config) {
        if (config?.strict) {
            throw new Error(`"strict" mode is not supported for this model.`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let schema = outputSchema;
        if ((0, types_1.isInteropZodSchema)(schema)) {
            schema = (0, json_schema_1.toJsonSchema)(schema);
        }
        const name = config?.name;
        const description = schema.description ?? "Format to use when returning your response";
        const method = config?.method ?? "jsonSchema";
        const includeRaw = config?.includeRaw;
        if (method !== "jsonSchema") {
            throw new Error(`Perplexity only supports "jsonSchema" as a structured output method.`);
        }
        const llm = this.withConfig({
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: name ?? "extract",
                    description,
                    schema,
                },
            },
        });
        let outputParser;
        // Check if this is a reasoning model
        const isReasoningModel = this.model.toLowerCase().includes("reasoning");
        if ((0, types_1.isInteropZodSchema)(schema)) {
            if (isReasoningModel) {
                outputParser = new output_parsers_js_1.ReasoningStructuredOutputParser(schema);
            }
            else {
                outputParser = output_parsers_1.StructuredOutputParser.fromZodSchema(schema);
            }
        }
        else {
            if (isReasoningModel) {
                outputParser = new output_parsers_js_1.ReasoningJsonOutputParser(schema);
            }
            else {
                outputParser = new output_parsers_1.JsonOutputParser();
            }
        }
        if (!includeRaw) {
            return llm.pipe(outputParser);
        }
        const parserAssign = runnables_1.RunnablePassthrough.assign({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsed: (input, config) => outputParser.invoke(input.raw, config),
        });
        const parserNone = runnables_1.RunnablePassthrough.assign({
            parsed: () => null,
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [parserNone],
        });
        return runnables_1.RunnableSequence.from([
            {
                raw: llm,
            },
            parsedWithFallback,
        ]);
    }
}
exports.ChatPerplexity = ChatPerplexity;
