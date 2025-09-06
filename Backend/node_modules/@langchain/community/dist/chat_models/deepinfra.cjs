"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatDeepInfra = exports.ENV_VARIABLE_API_KEY = exports.API_BASE_URL = exports.DEFAULT_MODEL = void 0;
const chat_models_1 = require("@langchain/core/language_models/chat_models");
const messages_1 = require("@langchain/core/messages");
const openai_tools_1 = require("@langchain/core/output_parsers/openai_tools");
const env_1 = require("@langchain/core/utils/env");
const function_calling_1 = require("@langchain/core/utils/function_calling");
exports.DEFAULT_MODEL = "meta-llama/Meta-Llama-3-70B-Instruct";
exports.API_BASE_URL = "https://api.deepinfra.com/v1/openai/chat/completions";
exports.ENV_VARIABLE_API_KEY = "DEEPINFRA_API_TOKEN";
function messageToRole(message) {
    const type = message._getType();
    switch (type) {
        case "ai":
            return "assistant";
        case "human":
            return "user";
        case "system":
            return "system";
        case "tool":
            return "tool";
        default:
            throw new Error(`Unknown message type: ${type}`);
    }
}
function convertMessagesToDeepInfraParams(messages) {
    return messages.map((message) => {
        if (typeof message.content !== "string") {
            throw new Error("Non string message content not supported");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const completionParam = {
            role: messageToRole(message),
            content: message.content,
        };
        if (message.name != null) {
            completionParam.name = message.name;
        }
        if ((0, messages_1.isAIMessage)(message) && !!message.tool_calls?.length) {
            completionParam.tool_calls = message.tool_calls.map(openai_tools_1.convertLangChainToolCallToOpenAI);
            completionParam.content = "";
        }
        else {
            if (message.additional_kwargs.tool_calls != null) {
                completionParam.tool_calls = message.additional_kwargs.tool_calls;
            }
            if (message.tool_call_id != null) {
                completionParam.tool_call_id = message.tool_call_id;
            }
        }
        return completionParam;
    });
}
function deepInfraResponseToChatMessage(message, usageMetadata) {
    switch (message.role) {
        case "assistant": {
            const toolCalls = [];
            const invalidToolCalls = [];
            for (const rawToolCall of message.tool_calls ?? []) {
                try {
                    toolCalls.push((0, openai_tools_1.parseToolCall)(rawToolCall, { returnId: true }));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }
                catch (e) {
                    invalidToolCalls.push((0, openai_tools_1.makeInvalidToolCall)(rawToolCall, e.message));
                }
            }
            return new messages_1.AIMessage({
                content: message.content || "",
                additional_kwargs: { tool_calls: message.tool_calls ?? [] },
                tool_calls: toolCalls,
                invalid_tool_calls: invalidToolCalls,
                usage_metadata: usageMetadata,
            });
        }
        default:
            return new messages_1.ChatMessage(message.content || "", message.role ?? "unknown");
    }
}
class ChatDeepInfra extends chat_models_1.BaseChatModel {
    static lc_name() {
        return "ChatDeepInfra";
    }
    get callKeys() {
        return ["stop", "signal", "options", "tools"];
    }
    constructor(fields = {}) {
        super(fields);
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiUrl", {
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
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.apiKey =
            fields?.apiKey ?? (0, env_1.getEnvironmentVariable)(exports.ENV_VARIABLE_API_KEY);
        if (!this.apiKey) {
            throw new Error("API key is required, set `DEEPINFRA_API_TOKEN` environment variable or pass it as a parameter");
        }
        this.apiUrl = exports.API_BASE_URL;
        this.model = fields.model ?? exports.DEFAULT_MODEL;
        this.temperature = fields.temperature ?? 0;
        this.maxTokens = fields.maxTokens;
    }
    invocationParams(options) {
        if (options?.tool_choice) {
            throw new Error("Tool choice is not supported for ChatDeepInfra currently.");
        }
        return {
            model: this.model,
            stream: false,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            tools: options?.tools,
            stop: options?.stop,
        };
    }
    identifyingParams() {
        return this.invocationParams();
    }
    async _generate(messages, options) {
        const parameters = this.invocationParams(options);
        const messagesMapped = convertMessagesToDeepInfraParams(messages);
        const data = await this.completionWithRetry({ ...parameters, messages: messagesMapped }, false, options?.signal);
        const { prompt_tokens = 0, completion_tokens = 0, total_tokens = 0, } = data.usage ?? {};
        const usageMetadata = {
            input_tokens: prompt_tokens,
            output_tokens: completion_tokens,
            total_tokens,
        };
        const generations = [];
        for (const part of data?.choices ?? []) {
            const text = part.message?.content ?? "";
            const generation = {
                text,
                message: deepInfraResponseToChatMessage(part.message, usageMetadata),
            };
            if (part.finish_reason) {
                generation.generationInfo = { finish_reason: part.finish_reason };
            }
            generations.push(generation);
        }
        return {
            generations,
            llmOutput: {
                tokenUsage: {
                    promptTokens: prompt_tokens,
                    completionTokens: completion_tokens,
                    totalTokens: total_tokens,
                },
            },
        };
    }
    async completionWithRetry(request, stream, signal) {
        const body = {
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            ...request,
            model: this.model,
        };
        const makeCompletionRequest = async () => {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal,
            });
            if (!stream) {
                return response.json();
            }
        };
        return this.caller.call(makeCompletionRequest);
    }
    bindTools(tools, kwargs) {
        return this.withConfig({
            tools: tools.map((tool) => (0, function_calling_1.convertToOpenAITool)(tool)),
            ...kwargs,
        });
    }
    _llmType() {
        return "DeepInfra";
    }
}
exports.ChatDeepInfra = ChatDeepInfra;
