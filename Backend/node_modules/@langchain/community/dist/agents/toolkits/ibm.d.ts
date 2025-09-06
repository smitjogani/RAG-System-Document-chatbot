import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import { BaseToolkit, StructuredTool, StructuredToolInterface } from "@langchain/core/tools";
import { InteropZodObject, ZodObjectV3 } from "@langchain/core/utils/types";
import { WatsonxAuth, WatsonxInit } from "../../types/ibm.js";
export interface WatsonxToolParams {
    name: string;
    description: string;
    schema?: Record<string, any>;
    service?: WatsonXAI;
    configSchema?: Record<string, any>;
}
export declare class WatsonxTool extends StructuredTool implements WatsonxToolParams {
    name: string;
    description: string;
    service: WatsonXAI;
    schema: ZodObjectV3;
    configSchema?: InteropZodObject;
    toolConfig?: Record<string, any>;
    constructor(fields: WatsonXAI.TextChatParameterFunction, service: WatsonXAI, configSchema?: WatsonXAI.JsonObject);
    protected _call(inputObject: Record<string, any>): Promise<string>;
    set config(config: Record<string, any>);
}
export declare class WatsonxToolkit extends BaseToolkit {
    tools: WatsonxTool[];
    service: WatsonXAI;
    constructor(fields: WatsonxAuth & WatsonxInit);
    loadTools(): Promise<void>;
    static init(props: WatsonxAuth & WatsonxInit): Promise<WatsonxToolkit>;
    getTools(): StructuredToolInterface[];
    getTool(toolName: string, config?: Record<string, any>): WatsonxTool;
}
