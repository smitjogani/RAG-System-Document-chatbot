"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatsonxEmbeddings = void 0;
const embeddings_1 = require("@langchain/core/embeddings");
const async_caller_1 = require("@langchain/core/utils/async_caller");
const ibm_js_1 = require("../utils/ibm.cjs");
class WatsonxEmbeddings extends embeddings_1.Embeddings {
    constructor(fields) {
        const superProps = { maxConcurrency: 2, ...fields };
        super(superProps);
        Object.defineProperty(this, "model", {
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
        Object.defineProperty(this, "version", {
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
        Object.defineProperty(this, "truncateInputTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
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
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.model = fields.model;
        this.version = fields.version;
        this.serviceUrl = fields.serviceUrl;
        this.truncateInputTokens = fields.truncateInputTokens;
        this.maxConcurrency = fields.maxConcurrency;
        this.maxRetries = fields.maxRetries ?? 0;
        if (fields.projectId && fields.spaceId)
            throw new Error("Maximum 1 id type can be specified per instance");
        else if (!fields.projectId && !fields.spaceId)
            throw new Error("No id specified! At least id of 1 type has to be specified");
        this.projectId = fields?.projectId;
        this.spaceId = fields?.spaceId;
        this.serviceUrl = fields?.serviceUrl;
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
    invocationParams() {
        return {
            truncate_input_tokens: this.truncateInputTokens,
        };
    }
    async listModels() {
        const listModelParams = {
            filters: "function_embedding",
        };
        const caller = new async_caller_1.AsyncCaller({
            maxConcurrency: this.maxConcurrency,
            maxRetries: this.maxRetries,
        });
        const listModels = await caller.call(() => this.service.listFoundationModelSpecs(listModelParams));
        return listModels.result.resources?.map((item) => item.model_id);
    }
    async embedSingleText(inputs) {
        const textEmbeddingParams = {
            inputs,
            ...this.scopeId(),
            parameters: this.invocationParams(),
        };
        const caller = new async_caller_1.AsyncCaller({
            maxConcurrency: this.maxConcurrency,
            maxRetries: this.maxRetries,
        });
        const embeddings = await caller.call(() => this.service.embedText(textEmbeddingParams));
        return embeddings.result.results.map((item) => item.embedding);
    }
    async embedDocuments(documents) {
        const data = await this.embedSingleText(documents);
        return data;
    }
    async embedQuery(document) {
        const data = await this.embedSingleText([document]);
        return data[0];
    }
}
exports.WatsonxEmbeddings = WatsonxEmbeddings;
