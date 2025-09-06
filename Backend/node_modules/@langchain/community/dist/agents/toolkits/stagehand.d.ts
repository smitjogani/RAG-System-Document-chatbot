import { Tool, BaseToolkit as Toolkit, StructuredTool, StructuredToolInterface } from "@langchain/core/tools";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
declare abstract class StagehandToolBase extends Tool {
    protected stagehand?: Stagehand;
    private localStagehand?;
    constructor(stagehandInstance?: Stagehand);
    protected getStagehand(): Promise<Stagehand>;
}
export declare class StagehandNavigateTool extends StagehandToolBase {
    name: string;
    description: string;
    _call(input: string): Promise<string>;
}
export declare class StagehandActTool extends StagehandToolBase {
    name: string;
    description: string;
    _call(input: string): Promise<string>;
}
export declare class StagehandExtractTool extends StructuredTool {
    name: string;
    description: string;
    schema: z.ZodObject<{
        instruction: z.ZodString;
        schema: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        schema: Record<string, any>;
        instruction: string;
    }, {
        schema: Record<string, any>;
        instruction: string;
    }>;
    private stagehand?;
    constructor(stagehandInstance?: Stagehand);
    _call(input: {
        instruction: string;
        schema: z.AnyZodObject;
    }): Promise<string>;
    protected getStagehand(): Promise<Stagehand>;
}
export declare class StagehandObserveTool extends StagehandToolBase {
    name: string;
    description: string;
    _call(input: string): Promise<string>;
}
export declare class StagehandToolkit extends Toolkit {
    tools: StructuredToolInterface[];
    stagehand?: Stagehand;
    constructor(stagehand?: Stagehand);
    private initializeTools;
    static fromStagehand(stagehand: Stagehand): Promise<StagehandToolkit>;
}
export {};
