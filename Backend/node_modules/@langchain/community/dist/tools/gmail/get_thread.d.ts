import { z } from "zod";
import { InferInteropZodOutput } from "@langchain/core/utils/types";
import { GmailBaseTool, GmailBaseToolParams } from "./base.js";
export declare class GmailGetThread extends GmailBaseTool {
    name: string;
    schema: z.ZodObject<{
        threadId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        threadId: string;
    }, {
        threadId: string;
    }>;
    description: string;
    constructor(fields?: GmailBaseToolParams);
    _call(arg: InferInteropZodOutput<typeof this.schema>): Promise<string>;
}
export type GetThreadSchema = {
    threadId: string;
};
