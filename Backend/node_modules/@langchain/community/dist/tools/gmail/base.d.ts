import { gmail_v1 } from "googleapis";
import { StructuredTool } from "@langchain/core/tools";
export interface GmailBaseToolParams {
    credentials?: {
        clientEmail?: string;
        privateKey?: string;
        keyfile?: string;
        subject?: string;
        accessToken?: string | (() => Promise<string>);
    };
    scopes?: string[];
}
export declare abstract class GmailBaseTool extends StructuredTool {
    name: string;
    description: string;
    protected params: GmailBaseToolParams;
    protected gmail?: gmail_v1.Gmail;
    constructor({ credentials, scopes }?: GmailBaseToolParams);
    getGmailClient(): Promise<gmail_v1.Gmail>;
    parseHeaderAndBody(payload: gmail_v1.Schema$MessagePart | undefined): {
        body: string;
        subject?: undefined;
        sender?: undefined;
    } | {
        subject: gmail_v1.Schema$MessagePartHeader | undefined;
        sender: gmail_v1.Schema$MessagePartHeader | undefined;
        body: string;
    };
    decodeBody(body: string): string;
}
