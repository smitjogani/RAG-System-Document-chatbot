"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatsonxRerank = void 0;
const document_compressors_1 = require("@langchain/core/retrievers/document_compressors");
const async_caller_1 = require("@langchain/core/utils/async_caller");
const ibm_js_1 = require("../utils/ibm.cjs");
class WatsonxRerank extends document_compressors_1.BaseDocumentCompressor {
    constructor(fields) {
        super();
        Object.defineProperty(this, "maxRetries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "2024-05-31"
        });
        Object.defineProperty(this, "truncateInputTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "spaceId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "projectId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxConcurrency", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "serviceUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (fields.projectId && fields.spaceId)
            throw new Error("Maximum 1 id type can be specified per instance");
        if (!fields.projectId && !fields.spaceId)
            throw new Error("No id specified! At least id of 1 type has to be specified");
        this.model = fields.model;
        this.serviceUrl = fields.serviceUrl;
        this.version = fields.version;
        this.projectId = fields?.projectId;
        this.spaceId = fields?.spaceId;
        this.maxRetries = fields.maxRetries ?? this.maxRetries;
        this.maxConcurrency = fields.maxConcurrency;
        this.truncateInputTokens = fields.truncateInputTokens;
        this.returnOptions = fields.returnOptions;
        const { watsonxAIApikey, watsonxAIAuthType, watsonxAIBearerToken, watsonxAIUsername, watsonxAIPassword, watsonxAIUrl, disableSSL, version, serviceUrl, } = fields;
        const auth = (0, ibm_js_1.authenticateAndSetInstance)({
            watsonxAIApikey,
            watsonxAIAuthType,
            watsonxAIBearerToken,
            watsonxAIUsername,
            watsonxAIPassword,
            watsonxAIUrl,
            disableSSL,
            version,
            serviceUrl,
        });
        if (auth)
            this.service = auth;
        else
            throw new Error("You have not provided one type of authentication");
    }
    scopeId() {
        if (this.projectId)
            return { projectId: this.projectId, modelId: this.model };
        else
            return { spaceId: this.spaceId, modelId: this.model };
    }
    invocationParams(options) {
        return {
            truncate_input_tokens: options?.truncateInputTokens ?? this.truncateInputTokens,
            return_options: {
                top_n: options?.returnOptions?.topN ?? this.returnOptions?.topN,
                inputs: options?.returnOptions?.inputs ?? this.returnOptions?.inputs,
            },
        };
    }
    async compressDocuments(documents, query) {
        const caller = new async_caller_1.AsyncCaller({
            maxConcurrency: this.maxConcurrency,
            maxRetries: this.maxRetries,
        });
        const inputs = documents.map((document) => ({
            text: document.pageContent,
        }));
        const { result } = await caller.call(() => this.service.textRerank({
            ...this.scopeId(),
            inputs,
            query,
            parameters: {
                truncate_input_tokens: this.truncateInputTokens,
            },
        }));
        const resultDocuments = result.results.map(({ index, score }) => {
            const rankedDocument = documents[index];
            rankedDocument.metadata.relevanceScore = score;
            return rankedDocument;
        });
        return resultDocuments;
    }
    async rerank(documents, query, options) {
        const inputs = documents.map((document) => {
            if (typeof document === "string") {
                return { text: document };
            }
            return { text: document.pageContent };
        });
        const caller = new async_caller_1.AsyncCaller({
            maxConcurrency: this.maxConcurrency,
            maxRetries: this.maxRetries,
        });
        const { result } = await caller.call(() => this.service.textRerank({
            ...this.scopeId(),
            inputs,
            query,
            parameters: this.invocationParams(options),
        }));
        const response = result.results.map((document) => {
            return document?.input
                ? {
                    index: document.index,
                    relevanceScore: document.score,
                    input: document?.input.text,
                }
                : {
                    index: document.index,
                    relevanceScore: document.score,
                };
        });
        return response;
    }
}
exports.WatsonxRerank = WatsonxRerank;
