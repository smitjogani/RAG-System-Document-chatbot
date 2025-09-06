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
exports.push = void 0;
exports.pull = pull;
const base_js_1 = require("./base.cjs");
Object.defineProperty(exports, "push", { enumerable: true, get: function () { return base_js_1.basePush; } });
const index_js_1 = require("../load/index.cjs");
/**
 * Pull a prompt from the hub.
 * @param ownerRepoCommit The name of the repo containing the prompt, as well as an optional commit hash separated by a slash.
 * @param options.apiKey LangSmith API key to use when pulling the prompt
 * @param options.apiUrl LangSmith API URL to use when pulling the prompt
 * @param options.includeModel Whether to also instantiate and attach a model instance to the prompt,
 *   if the prompt has associated model metadata. If set to true, invoking the resulting pulled prompt will
 *   also invoke the instantiated model. You must have the appropriate LangChain integration package installed.
 * @returns
 */
async function pull(ownerRepoCommit, options) {
    const promptObject = await (0, base_js_1.basePull)(ownerRepoCommit, options);
    let modelClass;
    if (options?.includeModel) {
        if (Array.isArray(promptObject.manifest.kwargs?.last?.kwargs?.bound?.id)) {
            const modelName = promptObject.manifest.kwargs?.last?.kwargs?.bound?.id.at(-1);
            if (modelName === "ChatOpenAI") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/openai")))).ChatOpenAI;
            }
            else if (modelName === "ChatAnthropic") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/anthropic")))).ChatAnthropic;
            }
            else if (modelName === "ChatAzureOpenAI") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/openai")))).AzureChatOpenAI;
            }
            else if (modelName === "ChatVertexAI") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/google-vertexai")))).ChatVertexAI;
            }
            else if (modelName === "ChatGoogleGenerativeAI") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/google-genai"))))
                    .ChatGoogleGenerativeAI;
            }
            else if (modelName === "ChatBedrockConverse") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/aws")))).ChatBedrockConverse;
            }
            else if (modelName === "ChatMistral") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/mistralai")))).ChatMistralAI;
            }
            else if (modelName === "ChatGroq") {
                modelClass = (await Promise.resolve().then(() => __importStar(require("@langchain/groq")))).ChatGroq;
            }
            else if (modelName !== undefined) {
                console.warn(`Received unknown model name from prompt hub: "${modelName}"`);
            }
        }
    }
    const loadedPrompt = await (0, index_js_1.load)(JSON.stringify(promptObject.manifest), undefined, (0, base_js_1.generateOptionalImportMap)(modelClass), (0, base_js_1.generateModelImportMap)(modelClass));
    return (0, base_js_1.bindOutputSchema)(loadedPrompt);
}
