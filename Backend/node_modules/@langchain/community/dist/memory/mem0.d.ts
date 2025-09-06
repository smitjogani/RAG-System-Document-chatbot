import { MemoryClient } from "mem0ai";
import type { Memory, MemoryOptions, SearchOptions } from "mem0ai";
import { InputValues, OutputValues, MemoryVariables } from "@langchain/core/memory";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { BaseChatMemory, BaseChatMemoryInput } from "./chat_memory.js";
/**
 * Extracts and formats memory content into a system prompt
 * @param memory Array of Memory objects from mem0ai
 * @returns Formatted system prompt string
 */
export declare const mem0MemoryContextToSystemPrompt: (memory: Memory[]) => string;
/**
 * Condenses memory content into a single HumanMessage with context
 * @param memory Array of Memory objects from mem0ai
 * @returns HumanMessage containing formatted memory context
 */
export declare const condenseMem0MemoryIntoHumanMessage: (memory: Memory[]) => HumanMessage;
/**
 * Converts Mem0 memories to a list of BaseMessages
 * @param memories Array of Memory objects from mem0ai
 * @returns Array of BaseMessage objects
 */
export declare const mem0MemoryToMessages: (memories: Memory[]) => BaseMessage[];
/**
 * Interface defining the structure of the input data for the Mem0Client
 */
export interface ClientOptions {
    apiKey: string;
    host?: string;
    organizationName?: string;
    projectName?: string;
    organizationId?: string;
    projectId?: string;
}
/**
 * Interface defining the structure of the input data for the Mem0Memory
 * class. It includes properties like memoryKey, sessionId, and apiKey.
 */
export interface Mem0MemoryInput extends BaseChatMemoryInput {
    sessionId: string;
    apiKey: string;
    humanPrefix?: string;
    aiPrefix?: string;
    memoryOptions?: MemoryOptions | SearchOptions;
    mem0Options?: ClientOptions;
    separateMessages?: boolean;
}
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
export declare class Mem0Memory extends BaseChatMemory implements Mem0MemoryInput {
    memoryKey: string;
    apiKey: string;
    sessionId: string;
    humanPrefix: string;
    aiPrefix: string;
    mem0Client: InstanceType<typeof MemoryClient>;
    memoryOptions: MemoryOptions | SearchOptions;
    mem0Options: ClientOptions;
    separateMessages?: boolean;
    constructor(fields: Mem0MemoryInput);
    get memoryKeys(): string[];
    /**
     * Retrieves memories from the Mem0 service and formats them for use
     * @param values Input values containing optional search query
     * @returns Promise resolving to formatted memory variables
     */
    loadMemoryVariables(values: InputValues): Promise<MemoryVariables>;
    /**
     * Saves the current conversation context to the Mem0 service
     * @param inputValues Input messages to be saved
     * @param outputValues Output messages to be saved
     * @returns Promise resolving when the context has been saved
     */
    saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void>;
    /**
     * Clears all memories for the current session
     * @returns Promise resolving when memories have been cleared
     */
    clear(): Promise<void>;
}
