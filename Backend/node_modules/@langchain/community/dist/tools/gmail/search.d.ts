import { gmail_v1 } from "googleapis";
import { z } from "zod";
import { InferInteropZodOutput } from "@langchain/core/utils/types";
import { GmailBaseTool, GmailBaseToolParams } from "./base.js";
export declare class GmailSearch extends GmailBaseTool {
    name: string;
    schema: z.ZodObject<{
        query: z.ZodString;
        maxResults: z.ZodOptional<z.ZodNumber>;
        resource: z.ZodOptional<z.ZodEnum<["messages", "threads"]>>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        maxResults?: number | undefined;
        resource?: "messages" | "threads" | undefined;
    }, {
        query: string;
        maxResults?: number | undefined;
        resource?: "messages" | "threads" | undefined;
    }>;
    description: string;
    constructor(fields?: GmailBaseToolParams);
    _call(arg: InferInteropZodOutput<typeof this.schema>): Promise<string>;
    parseMessages(gmail: gmail_v1.Gmail, messages: gmail_v1.Schema$Message[]): Promise<gmail_v1.Schema$Message[]>;
    parseThreads(gmail: gmail_v1.Gmail, messages: gmail_v1.Schema$Message[]): Promise<gmail_v1.Schema$Thread[]>;
}
export type SearchSchema = {
    query: string;
    maxResults?: number;
    resource?: "messages" | "threads";
};
