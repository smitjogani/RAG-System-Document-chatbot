"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuggingFaceTransformersEmbeddings = void 0;
const embeddings_1 = require("@langchain/core/embeddings");
const chunk_array_1 = require("@langchain/core/utils/chunk_array");
/**
 * @example
 * ```typescript
 * const model = new HuggingFaceTransformersEmbeddings({
 *   model: "Xenova/all-MiniLM-L6-v2",
 * });
 *
 * // Embed a single query
 * const res = await model.embedQuery(
 *   "What would be a good company name for a company that makes colorful socks?"
 * );
 * console.log({ res });
 *
 * // Embed multiple documents
 * const documentRes = await model.embedDocuments(["Hello world", "Bye bye"]);
 * console.log({ documentRes });
 * ```
 */
class HuggingFaceTransformersEmbeddings extends embeddings_1.Embeddings {
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Xenova/all-MiniLM-L6-v2"
        });
        Object.defineProperty(this, "batchSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 512
        });
        Object.defineProperty(this, "stripNewLines", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pretrainedOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pipelineOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pipelinePromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.model = fields?.model ?? this.model;
        this.stripNewLines = fields?.stripNewLines ?? this.stripNewLines;
        this.timeout = fields?.timeout;
        this.pretrainedOptions = fields?.pretrainedOptions ?? {};
        this.pipelineOptions = {
            pooling: "mean",
            normalize: true,
            ...fields?.pipelineOptions,
        };
    }
    async embedDocuments(texts) {
        const batches = (0, chunk_array_1.chunkArray)(this.stripNewLines ? texts.map((t) => t.replace(/\n/g, " ")) : texts, this.batchSize);
        const batchRequests = batches.map((batch) => this.runEmbedding(batch));
        const batchResponses = await Promise.all(batchRequests);
        const embeddings = [];
        for (let i = 0; i < batchResponses.length; i += 1) {
            const batchResponse = batchResponses[i];
            for (let j = 0; j < batchResponse.length; j += 1) {
                embeddings.push(batchResponse[j]);
            }
        }
        return embeddings;
    }
    async embedQuery(text) {
        const data = await this.runEmbedding([
            this.stripNewLines ? text.replace(/\n/g, " ") : text,
        ]);
        return data[0];
    }
    async runEmbedding(texts) {
        if (!this.pipelinePromise) {
            this.pipelinePromise = (async () => {
                const transformers = await Promise.resolve().then(() => __importStar(require("@huggingface/transformers")));
                const pipeline = transformers.pipeline;
                const result = await pipeline("feature-extraction", this.model, this.pretrainedOptions);
                return result;
            })();
        }
        const pipe = await this.pipelinePromise;
        return this.caller.call(async () => {
            const output = await pipe(texts, this.pipelineOptions);
            return output.tolist();
        });
    }
}
exports.HuggingFaceTransformersEmbeddings = HuggingFaceTransformersEmbeddings;
