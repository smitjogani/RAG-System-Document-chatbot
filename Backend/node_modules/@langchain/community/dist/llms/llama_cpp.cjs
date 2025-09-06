"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlamaCpp = void 0;
/* eslint-disable import/no-extraneous-dependencies */
const node_llama_cpp_1 = require("node-llama-cpp");
const llms_1 = require("@langchain/core/language_models/llms");
const outputs_1 = require("@langchain/core/outputs");
const llama_cpp_js_1 = require("../utils/llama_cpp.cjs");
/**
 *  To use this model you need to have the `node-llama-cpp` module installed.
 *  This can be installed using `npm install -S node-llama-cpp` and the minimum
 *  version supported in version 2.0.0.
 *  This also requires that have a locally built version of Llama3 installed.
 */
class LlamaCpp extends llms_1.LLM {
    static lc_name() {
        return "LlamaCpp";
    }
    constructor(inputs) {
        super(inputs);
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trimWhitespaceSuffix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_session", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_jsonSchema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_gbnf", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxTokens = inputs?.maxTokens;
        this.temperature = inputs?.temperature;
        this.topK = inputs?.topK;
        this.topP = inputs?.topP;
        this.trimWhitespaceSuffix = inputs?.trimWhitespaceSuffix;
    }
    /**
     * Initializes the llama_cpp model for usage.
     * @param inputs - the inputs passed onto the model.
     * @returns A Promise that resolves to the LlamaCpp type class.
     */
    static async initialize(inputs) {
        const instance = new LlamaCpp(inputs);
        const llama = await (0, node_llama_cpp_1.getLlama)();
        instance._model = await (0, llama_cpp_js_1.createLlamaModel)(inputs, llama);
        instance._context = await (0, llama_cpp_js_1.createLlamaContext)(instance._model, inputs);
        instance._jsonSchema = await (0, llama_cpp_js_1.createLlamaJsonSchemaGrammar)(inputs?.jsonSchema, llama);
        instance._gbnf = await (0, llama_cpp_js_1.createCustomGrammar)(inputs?.gbnf, llama);
        instance._session = (0, llama_cpp_js_1.createLlamaSession)(instance._context);
        return instance;
    }
    _llmType() {
        return "llama_cpp";
    }
    /** @ignore */
    async _call(prompt, options) {
        try {
            let promptGrammer;
            if (this._jsonSchema !== undefined) {
                promptGrammer = this._jsonSchema;
            }
            else if (this._gbnf !== undefined) {
                promptGrammer = this._gbnf;
            }
            else {
                promptGrammer = undefined;
            }
            const promptOptions = {
                grammar: promptGrammer,
                onToken: options?.onToken,
                maxTokens: this?.maxTokens,
                temperature: this?.temperature,
                topK: this?.topK,
                topP: this?.topP,
                trimWhitespaceSuffix: this?.trimWhitespaceSuffix,
            };
            const completion = await this._session.prompt(prompt, promptOptions);
            if (this._jsonSchema !== undefined && completion !== undefined) {
                return this._jsonSchema.parse(completion);
            }
            return completion;
        }
        catch (e) {
            throw new Error("Error getting prompt completion.");
        }
    }
    async *_streamResponseChunks(prompt, _options, runManager) {
        const promptOptions = {
            temperature: this?.temperature,
            maxTokens: this?.maxTokens,
            topK: this?.topK,
            topP: this?.topP,
        };
        if (this._context.sequencesLeft === 0) {
            this._context = await (0, llama_cpp_js_1.createLlamaContext)(this._model, LlamaCpp.inputs);
        }
        const sequence = this._context.getSequence();
        const tokens = this._model.tokenize(prompt);
        const stream = await this.caller.call(async () => sequence.evaluate(tokens, promptOptions));
        for await (const chunk of stream) {
            yield new outputs_1.GenerationChunk({
                text: this._model.detokenize([chunk]),
                generationInfo: {},
            });
            await runManager?.handleLLMNewToken(this._model.detokenize([chunk]) ?? "");
        }
    }
}
exports.LlamaCpp = LlamaCpp;
