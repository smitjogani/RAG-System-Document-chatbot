import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { mapChatMessagesToStoredMessages, mapStoredMessagesToChatMessages, } from "@langchain/core/messages";
export const FILE_HISTORY_DEFAULT_FILE_PATH = ".history/history.json";
let store;
/**
 * Store chat message history using a local JSON file.
 * For demo and development purposes only.
 *
 * @example
 * ```typescript
 *  const model = new ChatOpenAI({
 *   model: "gpt-3.5-turbo",
 *   temperature: 0,
 * });
 * const prompt = ChatPromptTemplate.fromMessages([
 *   [
 *     "system",
 *     "You are a helpful assistant. Answer all questions to the best of your ability.",
 *   ],
 *   ["placeholder", "chat_history"],
 *   ["human", "{input}"],
 * ]);
 *
 * const chain = prompt.pipe(model).pipe(new StringOutputParser());
 * const chainWithHistory = new RunnableWithMessageHistory({
 *   runnable: chain,
 *  inputMessagesKey: "input",
 *  historyMessagesKey: "chat_history",
 *   getMessageHistory: async (sessionId) => {
 *     const chatHistory = new FileSystemChatMessageHistory({
 *       sessionId: sessionId,
 *       userId: "userId",  // Optional
 *     })
 *     return chatHistory;
 *   },
 * });
 * await chainWithHistory.invoke(
 *   { input: "What did I just say my name was?" },
 *   { configurable: { sessionId: "session-id" } }
 * );
 * ```
 */
export class FileSystemChatMessageHistory extends BaseListChatMessageHistory {
    constructor(chatHistoryInput) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "file"]
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "filePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.sessionId = chatHistoryInput.sessionId;
        this.userId = chatHistoryInput.userId ?? "";
        this.filePath = chatHistoryInput.filePath ?? FILE_HISTORY_DEFAULT_FILE_PATH;
    }
    async init() {
        if (store) {
            return;
        }
        try {
            store = await this.loadStore();
        }
        catch (error) {
            console.error("Error initializing FileSystemChatMessageHistory:", error);
            throw error;
        }
    }
    async loadStore() {
        try {
            await fs.access(this.filePath, fs.constants.F_OK);
            const store = await fs.readFile(this.filePath, "utf-8");
            return JSON.parse(store);
        }
        catch (_error) {
            const error = _error;
            if (error.code === "ENOENT") {
                return {};
            }
            throw new Error(`Error loading FileSystemChatMessageHistory store: ${error}`);
        }
    }
    async saveStore() {
        try {
            await fs.mkdir(dirname(this.filePath), { recursive: true });
            await fs.writeFile(this.filePath, JSON.stringify(store));
        }
        catch (error) {
            throw new Error(`Error saving FileSystemChatMessageHistory store: ${error}`);
        }
    }
    async getMessages() {
        await this.init();
        const messages = store[this.userId]?.[this.sessionId]?.messages ?? [];
        return mapStoredMessagesToChatMessages(messages);
    }
    async addMessage(message) {
        await this.init();
        const messages = await this.getMessages();
        messages.push(message);
        const storedMessages = mapChatMessagesToStoredMessages(messages);
        store[this.userId] ??= {};
        store[this.userId][this.sessionId] = {
            ...store[this.userId][this.sessionId],
            messages: storedMessages,
        };
        await this.saveStore();
    }
    async clear() {
        await this.init();
        if (store[this.userId]) {
            delete store[this.userId][this.sessionId];
        }
        await this.saveStore();
    }
    async getContext() {
        await this.init();
        return store[this.userId]?.[this.sessionId]?.context ?? {};
    }
    async setContext(context) {
        await this.init();
        store[this.userId] ??= {};
        store[this.userId][this.sessionId] = {
            ...store[this.userId][this.sessionId],
            context,
        };
        await this.saveStore();
    }
    async clearAllSessions() {
        await this.init();
        delete store[this.userId];
        await this.saveStore();
    }
    async getAllSessions() {
        await this.init();
        const userSessions = store[this.userId]
            ? Object.entries(store[this.userId]).map(([id, session]) => ({
                id,
                context: session.context,
            }))
            : [];
        return userSessions;
    }
}
