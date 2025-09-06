import { z } from "zod";
import { GmailBaseTool } from "./base.js";
import { SEARCH_DESCRIPTION } from "./descriptions.js";
export class GmailSearch extends GmailBaseTool {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "search_gmail"
        });
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: z.object({
                query: z.string(),
                maxResults: z.number().optional(),
                resource: z.enum(["messages", "threads"]).optional(),
            })
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: SEARCH_DESCRIPTION
        });
    }
    async _call(arg) {
        const { query, maxResults = 10, resource = "messages" } = arg;
        try {
            const gmail = await this.getGmailClient();
            const response = await gmail.users.messages.list({
                userId: "me",
                q: query,
                maxResults,
            });
            const { data } = response;
            if (!data) {
                throw new Error("No data returned from Gmail");
            }
            const { messages } = data;
            if (!messages) {
                throw new Error("No messages returned from Gmail");
            }
            if (resource === "messages") {
                const parsedMessages = await this.parseMessages(gmail, messages);
                return `Result for the query ${query}:\n${JSON.stringify(parsedMessages)}`;
            }
            else if (resource === "threads") {
                const parsedThreads = await this.parseThreads(gmail, messages);
                return `Result for the query ${query}:\n${JSON.stringify(parsedThreads)}`;
            }
            throw new Error(`Invalid resource: ${resource}`);
        }
        catch (error) {
            throw new Error(`Error while searching Gmail: ${error}`);
        }
    }
    async parseMessages(gmail, messages) {
        const parsedMessages = await Promise.all(messages.map(async (message) => {
            try {
                const { data } = await gmail.users.messages.get({
                    userId: "me",
                    format: "full",
                    id: message.id ?? "",
                });
                const { payload } = data;
                const { subject, sender, body } = this.parseHeaderAndBody(payload);
                return {
                    id: message.id,
                    threadId: message.threadId,
                    snippet: data.snippet,
                    body,
                    subject,
                    sender,
                };
            }
            catch (error) {
                throw new Error(`Error while fetching message: ${error}`);
            }
        }));
        return parsedMessages;
    }
    async parseThreads(gmail, messages) {
        const parsedThreads = await Promise.all(messages.map(async (message) => {
            try {
                const { data: { messages }, } = await gmail.users.threads.get({
                    userId: "me",
                    format: "full",
                    id: message.threadId ?? "",
                });
                const { subject, sender, body } = this.parseHeaderAndBody(messages?.[0]?.payload);
                return {
                    id: message.threadId,
                    snippet: messages?.[0]?.snippet,
                    body,
                    subject,
                    sender,
                };
            }
            catch (error) {
                throw new Error(`Error while fetching thread: ${error}`);
            }
        }));
        return parsedThreads;
    }
}
