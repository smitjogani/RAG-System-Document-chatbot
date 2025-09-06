import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import { JsonOutputKeyToolsParserParamsInterop, JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import { z } from "zod";
import { ChatGeneration } from "@langchain/core/outputs";
import { ToolCall } from "@langchain/core/messages/tool";
import { InteropZodType } from "@langchain/core/utils/types";
import { WatsonxAuth, WatsonxInit } from "../types/ibm.js";
export declare const authenticateAndSetInstance: ({ watsonxAIApikey, watsonxAIAuthType, watsonxAIBearerToken, watsonxAIUsername, watsonxAIPassword, watsonxAIUrl, disableSSL, version, serviceUrl, }: WatsonxAuth & Omit<WatsonxInit, "authenticator">) => WatsonXAI | undefined;
export declare function _isValidMistralToolCallId(toolCallId: string): boolean;
export declare function _convertToolCallIdToMistralCompatible(toolCallId: string): string;
interface WatsonxToolsOutputParserParams<T extends Record<string, any>> extends JsonOutputKeyToolsParserParamsInterop<T> {
}
export declare class WatsonxToolsOutputParser<T extends Record<string, any> = Record<string, any>> extends JsonOutputToolsParser<T> {
    static lc_name(): string;
    lc_namespace: string[];
    returnId: boolean;
    keyName: string;
    returnSingle: boolean;
    zodSchema?: InteropZodType<T>;
    latestCorrect?: ToolCall;
    constructor(params: WatsonxToolsOutputParserParams<T>);
    protected _validateResult(result: unknown): Promise<T>;
    parsePartialResult(generations: ChatGeneration[]): Promise<T>;
}
export declare function jsonSchemaToZod(obj: WatsonXAI.JsonObject | undefined): z.ZodObject<Record<string, any>, "strip", z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}>;
export {};
