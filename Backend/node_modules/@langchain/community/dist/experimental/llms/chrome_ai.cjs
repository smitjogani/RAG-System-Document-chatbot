"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromeAI = void 0;
const outputs_1 = require("@langchain/core/outputs");
const stream_1 = require("@langchain/core/utils/stream");
const llms_1 = require("@langchain/core/language_models/llms");
var AILanguageModelInitialPromptRole;
(function (AILanguageModelInitialPromptRole) {
    AILanguageModelInitialPromptRole[AILanguageModelInitialPromptRole["system"] = 0] = "system";
    AILanguageModelInitialPromptRole[AILanguageModelInitialPromptRole["user"] = 1] = "user";
    AILanguageModelInitialPromptRole[AILanguageModelInitialPromptRole["assistant"] = 2] = "assistant";
})(AILanguageModelInitialPromptRole || (AILanguageModelInitialPromptRole = {}));
var AILanguageModelPromptRole;
(function (AILanguageModelPromptRole) {
    AILanguageModelPromptRole[AILanguageModelPromptRole["user"] = 0] = "user";
    AILanguageModelPromptRole[AILanguageModelPromptRole["assistant"] = 1] = "assistant";
})(AILanguageModelPromptRole || (AILanguageModelPromptRole = {}));
/**
 * To use this model you need to have the `Built-in AI Early Preview Program`
 * for Chrome. You can find more information about the program here:
 * @link https://developer.chrome.com/docs/ai/built-in
 *
 * @example
 * ```typescript
 * // Initialize the ChromeAI model.
 * const model = new ChromeAI({
 *   temperature: 0.5, // Optional. Default is 0.5.
 *   topK: 40, // Optional. Default is 40.
 * });
 *
 * // Call the model with a message and await the response.
 * const response = await model.invoke([
 *   new HumanMessage({ content: "My name is John." }),
 * ]);
 * ```
 */
class ChromeAI extends llms_1.LLM {
    static lc_name() {
        return "ChromeAI";
    }
    constructor(inputs) {
        super({
            ...inputs,
        });
        Object.defineProperty(this, "temperature", {
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
        Object.defineProperty(this, "systemPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.temperature = inputs?.temperature ?? this.temperature;
        this.topK = inputs?.topK ?? this.topK;
        this.systemPrompt = inputs?.systemPrompt;
    }
    _llmType() {
        return "chrome_ai";
    }
    /**
     * Initialize the model. This method may be called before invoking the model
     * to set up a chat session in advance.
     */
    async createSession() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aiInstance;
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore Experimental browser-only global
            aiInstance = LanguageModel;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            throw new Error(`Could not initialize ChromeAI instance. Make sure you are running a version of Chrome with the proper experimental flags enabled.\n\nError message: ${e.message}`);
        }
        const availability = await aiInstance.availability();
        if (availability === "no") {
            throw new Error("The AI model is not available.");
        }
        else if (availability === "after-download") {
            throw new Error("The AI model is not yet downloaded.");
        }
        const session = await aiInstance.create({
            systemPrompt: this.systemPrompt,
            topK: this.topK,
            temperature: this.temperature,
        });
        return session;
    }
    async *_streamResponseChunks(prompt, _options, runManager) {
        let session;
        try {
            session = await this.createSession();
            const stream = session.promptStreaming(prompt);
            const iterableStream = 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            stream_1.IterableReadableStream.fromReadableStream(stream);
            let previousContent = "";
            for await (const chunk of iterableStream) {
                const newContent = chunk;
                previousContent += newContent;
                yield new outputs_1.GenerationChunk({
                    text: newContent,
                });
                await runManager?.handleLLMNewToken(newContent);
            }
        }
        finally {
            session?.destroy();
        }
    }
    async _call(prompt, options, runManager) {
        const chunks = [];
        for await (const chunk of this._streamResponseChunks(prompt, options, runManager)) {
            chunks.push(chunk.text);
        }
        return chunks.join("");
    }
}
exports.ChromeAI = ChromeAI;
