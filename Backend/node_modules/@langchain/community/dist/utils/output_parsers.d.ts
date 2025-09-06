import { JsonOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { InferInteropZodOutput, InteropZodType } from "@langchain/core/utils/types";
export declare class ReasoningStructuredOutputParser<RunOutput extends InteropZodType> extends StructuredOutputParser<RunOutput> {
    constructor(schema: RunOutput);
    parse(text: string): Promise<InferInteropZodOutput<RunOutput>>;
}
export declare class ReasoningJsonOutputParser<RunOutput extends Record<string, unknown>> extends JsonOutputParser<RunOutput> {
    parse(text: string): Promise<RunOutput>;
}
