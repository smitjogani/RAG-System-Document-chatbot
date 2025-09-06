"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mem0Memory = exports.mem0MemoryToMessages = exports.condenseMem0MemoryIntoHumanMessage = exports.mem0MemoryContextToSystemPrompt = void 0;
const mem0ai_1 = require("mem0ai");
const memory_1 = require("@langchain/core/memory");
const messages_1 = require("@langchain/core/messages");
const chat_memory_js_1 = require("./chat_memory.cjs");
/**
 * Extracts and formats memory content into a system prompt
 * @param memory Array of Memory objects from mem0ai
 * @returns Formatted system prompt string
 */
const mem0MemoryContextToSystemPrompt = (memory) => {
    if (!memory || !Array.isArray(memory)) {
        return "";
    }
    return memory
        .filter((m) => m?.memory)
        .map((m) => m.memory)
        .join("\n");
};
exports.mem0MemoryContextToSystemPrompt = mem0MemoryContextToSystemPrompt;
/**
 * Condenses memory content into a single HumanMessage with context
 * @param memory Array of Memory objects from mem0ai
 * @returns HumanMessage containing formatted memory context
 */
const condenseMem0MemoryIntoHumanMessage = (memory) => {
    const basePrompt = "These are the memories I have stored. Give more weightage to the question by users and try to answer that first. You have to modify your answer based on the memories I have provided. If the memories are irrelevant you can ignore them. Also don't reply to this section of the prompt, or the memories, they are only for your reference. The MEMORIES of the USER are: \n\n";
    const systemPrompt = (0, exports.mem0MemoryContextToSystemPrompt)(memory);
    return new messages_1.HumanMessage(`${basePrompt}\n${systemPrompt}`);
};
exports.condenseMem0MemoryIntoHumanMessage = condenseMem0MemoryIntoHumanMessage;
/**
 * Converts Mem0 memories to a list of BaseMessages
 * @param memories Array of Memory objects from mem0ai
 * @returns Array of BaseMessage objects
 */
const mem0MemoryToMessages = (memories) => {
    if (!memories || !Array.isArray(memories)) {
        return [];
    }
    const messages = [];
    // Add memories as system message if present
    const memoryContent = memories
        .filter((m) => m?.memory)
        .map((m) => m.memory)
        .join("\n");
    if (memoryContent) {
        messages.push(new messages_1.SystemMessage(memoryContent));
    }
    // Add conversation messages
    memories.forEach((memory) => {
        if (memory.messages) {
            memory.messages.forEach((msg) => {
                const content = typeof msg.content === "string"
                    ? msg.content
                    : JSON.stringify(msg.content);
                if (msg.role === "user") {
                    messages.push(new messages_1.HumanMessage(content));
                }
                else if (msg.role === "assistant") {
                    messages.push(new messages_1.AIMessage(content));
                }
                else if (content) {
                    messages.push(new messages_1.ChatMessage(content, msg.role));
                }
            });
        }
    });
    return messages;
};
exports.mem0MemoryToMessages = mem0MemoryToMessages;
/**
 * Class used to manage the memory of a chat session using the Mem0 service.
 * It handles loading and saving chat history, and provides methods to format
 * the memory content for use in chat models.
 *
 * @example
 * ```typescript
 * const memory = new Mem0Memory({
 *   sessionId: "user123" // or use user_id inside of memoryOptions (recommended),
 *   apiKey: "your-api-key",
 *   memoryOptions: {
 *     user_id: "user123",
 *     run_id: "run123"
 *   },
 * });
 *
 * // Use with a chat model
 * const model = new ChatOpenAI({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0,
 * });
 *
 * const chain = new ConversationChain({ llm: model, memory });
 * ```
 */
class Mem0Memory extends chat_memory_js_1.BaseChatMemory {
    constructor(fields) {
        if (!fields.apiKey) {
            throw new Error("apiKey is required for Mem0Memory");
        }
        if (!fields.sessionId) {
            throw new Error("sessionId is required for Mem0Memory");
        }
        super({
            returnMessages: fields?.returnMessages ?? false,
            inputKey: fields?.inputKey,
            outputKey: fields?.outputKey,
        });
        Object.defineProperty(this, "memoryKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "history"
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "humanPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Human"
        });
        Object.defineProperty(this, "aiPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AI"
        });
        Object.defineProperty(this, "mem0Client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "memoryOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mem0Options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // Whether to return separate messages for chat history with a SystemMessage containing (facts and summary) or return a single HumanMessage with the entire memory context.
        // Defaults to false (return a single HumanMessage) in order to allow more flexibility with different models.
        Object.defineProperty(this, "separateMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.apiKey = fields.apiKey;
        this.sessionId = fields.sessionId;
        this.humanPrefix = fields.humanPrefix ?? this.humanPrefix;
        this.aiPrefix = fields.aiPrefix ?? this.aiPrefix;
        this.memoryOptions = fields.memoryOptions ?? {};
        this.mem0Options = fields.mem0Options ?? {
            apiKey: this.apiKey,
        };
        this.separateMessages = fields.separateMessages ?? false;
        try {
            this.mem0Client = new mem0ai_1.MemoryClient({
                ...this.mem0Options,
                apiKey: this.apiKey,
            });
        }
        catch (error) {
            console.error("Failed to initialize Mem0Client:", error);
            throw new Error("Failed to initialize Mem0Client. Please check your configuration.");
        }
    }
    get memoryKeys() {
        return [this.memoryKey];
    }
    /**
     * Retrieves memories from the Mem0 service and formats them for use
     * @param values Input values containing optional search query
     * @returns Promise resolving to formatted memory variables
     */
    async loadMemoryVariables(values) {
        const searchType = values.input ? "search" : "get_all";
        let memories = [];
        try {
            if (searchType === "get_all") {
                memories = await this.mem0Client.getAll({
                    user_id: this.sessionId,
                    ...this.memoryOptions,
                });
            }
            else {
                memories = await this.mem0Client.search(values.input, {
                    user_id: this.sessionId,
                    ...this.memoryOptions,
                });
            }
        }
        catch (error) {
            console.error("Error loading memories:", error);
            return this.returnMessages
                ? { [this.memoryKey]: [] }
                : { [this.memoryKey]: "" };
        }
        if (this.returnMessages) {
            return {
                [this.memoryKey]: this.separateMessages
                    ? (0, exports.mem0MemoryToMessages)(memories)
                    : [(0, exports.condenseMem0MemoryIntoHumanMessage)(memories)],
            };
        }
        return {
            [this.memoryKey]: this.separateMessages
                ? (0, messages_1.getBufferString)((0, exports.mem0MemoryToMessages)(memories), this.humanPrefix, this.aiPrefix)
                : (0, exports.condenseMem0MemoryIntoHumanMessage)(memories).content ?? "",
        };
    }
    /**
     * Saves the current conversation context to the Mem0 service
     * @param inputValues Input messages to be saved
     * @param outputValues Output messages to be saved
     * @returns Promise resolving when the context has been saved
     */
    async saveContext(inputValues, outputValues) {
        const input = (0, memory_1.getInputValue)(inputValues, this.inputKey);
        const output = (0, memory_1.getOutputValue)(outputValues, this.outputKey);
        if (!input || !output) {
            console.warn("Missing input or output values, skipping memory save");
            return;
        }
        try {
            const messages = [
                {
                    role: "user",
                    content: `${input}`,
                },
                {
                    role: "assistant",
                    content: `${output}`,
                },
            ];
            await this.mem0Client.add(messages, {
                user_id: this.sessionId,
                ...this.memoryOptions,
            });
        }
        catch (error) {
            console.error("Error saving memory context:", error);
            // Continue execution even if memory save fails
        }
        await super.saveContext(inputValues, outputValues);
    }
    /**
     * Clears all memories for the current session
     * @returns Promise resolving when memories have been cleared
     */
    async clear() {
        try {
            // Note: Implement clear functionality if Mem0Client provides it
            // await this.mem0Client.clear(this.sessionId);
        }
        catch (error) {
            console.error("Error clearing memories:", error);
        }
        await super.clear();
    }
}
exports.Mem0Memory = Mem0Memory;
