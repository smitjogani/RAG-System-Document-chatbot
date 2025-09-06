import { ChatOpenAICompletions, } from "@langchain/openai";
import { getEnvironmentVariable } from "@langchain/core/utils/env";
/**
 * Novita chat model implementation
 */
export class ChatNovitaAI extends ChatOpenAICompletions {
    static lc_name() {
        return "ChatNovita";
    }
    _llmType() {
        return "novita";
    }
    get lc_secrets() {
        return {
            novitaApiKey: "NOVITA_API_KEY",
            apiKey: "NOVITA_API_KEY",
        };
    }
    constructor(fields) {
        const novitaApiKey = fields?.apiKey ||
            fields?.novitaApiKey ||
            getEnvironmentVariable("NOVITA_API_KEY");
        if (!novitaApiKey) {
            throw new Error(`Novita API key not found. Please set the NOVITA_API_KEY environment variable or provide the key into "novitaApiKey"`);
        }
        super({
            ...fields,
            model: fields?.model || "gryphe/mythomax-l2-13b",
            apiKey: novitaApiKey,
            configuration: {
                baseURL: "https://api.novita.ai/v3/openai/",
            },
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    getLsParams(options) {
        const params = super.getLsParams(options);
        params.ls_provider = "novita";
        return params;
    }
    toJSON() {
        const result = super.toJSON();
        if ("kwargs" in result &&
            typeof result.kwargs === "object" &&
            result.kwargs != null) {
            delete result.kwargs.openai_api_key;
            delete result.kwargs.configuration;
        }
        return result;
    }
    async completionWithRetry(request, options) {
        delete request.frequency_penalty;
        delete request.presence_penalty;
        delete request.logit_bias;
        delete request.functions;
        if (request.stream === true) {
            return super.completionWithRetry(request, options);
        }
        return super.completionWithRetry(request, options);
    }
}
