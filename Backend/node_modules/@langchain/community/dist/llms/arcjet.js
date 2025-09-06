import { LLM, } from "@langchain/core/language_models/llms";
export class ArcjetRedact extends LLM {
    static lc_name() {
        return "ArcjetRedact";
    }
    constructor(options) {
        super(options);
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contextWindowSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "detect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "replace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (options.entities && options.entities.length === 0) {
            throw new Error("no entities configured for redaction");
        }
        this.llm = options.llm;
        this.entities = options.entities;
        this.contextWindowSize = options.contextWindowSize;
        this.detect = options.detect;
        this.replace = options.replace;
    }
    _llmType() {
        return "arcjet_redact";
    }
    async _call(input, options) {
        const ajOptions = {
            entities: this.entities,
            contextWindowSize: this.contextWindowSize,
            detect: this.detect,
            replace: this.replace,
        };
        const { redact } = await import("@arcjet/redact");
        const [redacted, unredact] = await redact(input, ajOptions);
        // Invoke the underlying LLM with the prompt and options
        const result = await this.llm.invoke(redacted, options);
        return unredact(result);
    }
}
