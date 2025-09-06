import { LLM, BaseLLM, type BaseLLMCallOptions } from "@langchain/core/language_models/llms";
import type { ArcjetSensitiveInfoType, RedactOptions } from "@arcjet/redact";
type DetectSensitiveInfoEntities<T> = (tokens: string[]) => Array<ArcjetSensitiveInfoType | T | undefined>;
type ValidEntities<Detect> = Array<undefined extends Detect ? ArcjetSensitiveInfoType : Detect extends DetectSensitiveInfoEntities<infer CustomEntities> ? ArcjetSensitiveInfoType | CustomEntities : never>;
export type { ArcjetSensitiveInfoType, RedactOptions };
export interface ArcjetRedactOptions<Detect> extends BaseLLMCallOptions {
    llm: BaseLLM;
    entities?: ValidEntities<Detect>;
    contextWindowSize?: number;
    detect?: Detect;
    replace?: (entity: ValidEntities<Detect>[number]) => string | undefined;
}
export declare class ArcjetRedact<Detect extends DetectSensitiveInfoEntities<CustomEntities> | undefined, CustomEntities extends string> extends LLM {
    static lc_name(): string;
    llm: BaseLLM;
    entities?: ValidEntities<Detect>;
    contextWindowSize?: number;
    detect?: Detect;
    replace?: (entity: ValidEntities<Detect>[number]) => string | undefined;
    constructor(options: ArcjetRedactOptions<Detect>);
    _llmType(): string;
    _call(input: string, options?: BaseLLMCallOptions): Promise<string>;
}
