import { AIMessage, AIMessageChunk, ChatMessageChunk, HumanMessageChunk, SystemMessageChunk, } from "@langchain/core/messages";
import { concat } from "@langchain/core/utils/stream";
import { BaseChatModel, } from "@langchain/core/language_models/chat_models";
import { ChatGenerationChunk, } from "@langchain/core/outputs";
import { getEnvironmentVariable } from "@langchain/core/utils/env";
import OpenAI from "openai";
import { RunnableSequence, RunnablePassthrough, } from "@langchain/core/runnables";
import { toJsonSchema } from "@langchain/core/utils/json_schema";
import { isInteropZodSchema, } from "@langchain/core/utils/types";
import { JsonOutputParser, StructuredOutputParser, } from "@langchain/core/output_parsers";
import { ReasoningJsonOutputParser, ReasoningStructuredOutputParser, } from "../utils/output_parsers.js";
/**
 * Wrapper around Perplexity large language models that use the Chat endpoint.
 */
export class ChatPerplexity extends BaseChatModel {
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
            fields?.apiKey ?? getEnvironmentVariable("PERPLEXITY_API_KEY");
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
        this.client = new OpenAI({
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
                    finalChunks[index] = concat(finalChunks[index], chunk);
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
            message: new AIMessage({
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
                messageChunk = new HumanMessageChunk({ content: delta.content });
            }
            else if (delta.role === "assistant") {
                messageChunk = new AIMessageChunk({ content: delta.content });
            }
            else if (delta.role === "system") {
                messageChunk = new SystemMessageChunk({ content: delta.content });
            }
            else {
                messageChunk = new ChatMessageChunk({
                    content: delta.content,
                    role: delta.role ?? "assistant",
                });
            }
            if (firstChunk) {
                messageChunk.additional_kwargs.citations = citations;
                firstChunk = false;
            }
            const generationChunk = new ChatGenerationChunk({
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
        if (isInteropZodSchema(schema)) {
            schema = toJsonSchema(schema);
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
        if (isInteropZodSchema(schema)) {
            if (isReasoningModel) {
                outputParser = new ReasoningStructuredOutputParser(schema);
            }
            else {
                outputParser = StructuredOutputParser.fromZodSchema(schema);
            }
        }
        else {
            if (isReasoningModel) {
                outputParser = new ReasoningJsonOutputParser(schema);
            }
            else {
                outputParser = new JsonOutputParser();
            }
        }
        if (!includeRaw) {
            return llm.pipe(outputParser);
        }
        const parserAssign = RunnablePassthrough.assign({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsed: (input, config) => outputParser.invoke(input.raw, config),
        });
        const parserNone = RunnablePassthrough.assign({
            parsed: () => null,
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [parserNone],
        });
        return RunnableSequence.from([
            {
                raw: llm,
            },
            parsedWithFallback,
        ]);
    }
}
