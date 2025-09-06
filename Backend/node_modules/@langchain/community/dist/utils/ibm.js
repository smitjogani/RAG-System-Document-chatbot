/* eslint-disable @typescript-eslint/no-explicit-any */
import { WatsonXAI } from "@ibm-cloud/watsonx-ai";
import { IamAuthenticator, BearerTokenAuthenticator, CloudPakForDataAuthenticator, } from "ibm-cloud-sdk-core";
import { JsonOutputToolsParser, } from "@langchain/core/output_parsers/openai_tools";
import { OutputParserException } from "@langchain/core/output_parsers";
import { z } from "zod";
import { interopSafeParseAsync, } from "@langchain/core/utils/types";
export const authenticateAndSetInstance = ({ watsonxAIApikey, watsonxAIAuthType, watsonxAIBearerToken, watsonxAIUsername, watsonxAIPassword, watsonxAIUrl, disableSSL, version, serviceUrl, }) => {
    if (watsonxAIAuthType === "iam" && watsonxAIApikey) {
        return WatsonXAI.newInstance({
            version,
            serviceUrl,
            authenticator: new IamAuthenticator({
                apikey: watsonxAIApikey,
            }),
        });
    }
    else if (watsonxAIAuthType === "bearertoken" && watsonxAIBearerToken) {
        return WatsonXAI.newInstance({
            version,
            serviceUrl,
            authenticator: new BearerTokenAuthenticator({
                bearerToken: watsonxAIBearerToken,
            }),
        });
    }
    else if (watsonxAIAuthType === "cp4d") {
        // cp4d auth requires username with either Password of ApiKey but not both.
        if (watsonxAIUsername && (watsonxAIPassword || watsonxAIApikey)) {
            const watsonxCPDAuthUrl = watsonxAIUrl ?? serviceUrl;
            return WatsonXAI.newInstance({
                version,
                serviceUrl,
                disableSslVerification: disableSSL,
                authenticator: new CloudPakForDataAuthenticator({
                    username: watsonxAIUsername,
                    password: watsonxAIPassword,
                    url: watsonxCPDAuthUrl.concat("/icp4d-api/v1/authorize"),
                    apikey: watsonxAIApikey,
                    disableSslVerification: disableSSL,
                }),
            });
        }
    }
    else
        return WatsonXAI.newInstance({
            version,
            serviceUrl,
        });
    return undefined;
};
// Mistral enforces a specific pattern for tool call IDs
// Thanks to Mistral for implementing this, I was unable to import which is why this is copied 1:1
const TOOL_CALL_ID_PATTERN = /^[a-zA-Z0-9]{9}$/;
export function _isValidMistralToolCallId(toolCallId) {
    return TOOL_CALL_ID_PATTERN.test(toolCallId);
}
function _base62Encode(num) {
    let numCopy = num;
    const base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numCopy === 0)
        return base62[0];
    const arr = [];
    const base = base62.length;
    while (numCopy) {
        arr.push(base62[numCopy % base]);
        numCopy = Math.floor(numCopy / base);
    }
    return arr.reverse().join("");
}
function _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}
export function _convertToolCallIdToMistralCompatible(toolCallId) {
    if (_isValidMistralToolCallId(toolCallId)) {
        return toolCallId;
    }
    else {
        const hash = _simpleHash(toolCallId);
        const base62Str = _base62Encode(hash);
        if (base62Str.length >= 9) {
            return base62Str.slice(0, 9);
        }
        else {
            return base62Str.padStart(9, "0");
        }
    }
}
export class WatsonxToolsOutputParser extends JsonOutputToolsParser {
    static lc_name() {
        return "WatsonxToolsOutputParser";
    }
    constructor(params) {
        super(params);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "watsonx", "output_parsers"]
        });
        Object.defineProperty(this, "returnId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "keyName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnSingle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "zodSchema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "latestCorrect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        this.zodSchema = params.zodSchema;
    }
    async _validateResult(result) {
        let parsedResult = result;
        if (typeof result === "string") {
            try {
                parsedResult = JSON.parse(result);
            }
            catch (e) {
                throw new OutputParserException(`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(e.message)}`, result);
            }
        }
        else {
            parsedResult = result;
        }
        if (this.zodSchema === undefined) {
            return parsedResult;
        }
        const zodParsedResult = await interopSafeParseAsync(this.zodSchema, parsedResult);
        if (zodParsedResult.success) {
            return zodParsedResult.data;
        }
        else {
            throw new OutputParserException(`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(zodParsedResult.error.issues)}`, JSON.stringify(result, null, 2));
        }
    }
    async parsePartialResult(generations) {
        const tools = generations.flatMap((generation) => {
            const message = generation.message;
            if (!Array.isArray(message.tool_calls)) {
                return [];
            }
            const tool = message.tool_calls;
            return tool;
        });
        if (tools[0] === undefined) {
            if (this.latestCorrect) {
                tools.push(this.latestCorrect);
            }
            else {
                const toolCall = { name: "", args: {} };
                tools.push(toolCall);
            }
        }
        const [tool] = tools;
        tool.name = "";
        this.latestCorrect = tool;
        return tool.args;
    }
}
export function jsonSchemaToZod(obj) {
    if (obj?.properties && obj.type === "object") {
        const shape = {};
        Object.keys(obj.properties).forEach((key) => {
            if (obj.properties) {
                const prop = obj.properties[key];
                let zodType;
                if (prop.type === "string") {
                    zodType = z.string();
                    if (prop?.pattern) {
                        zodType = zodType.regex(prop.pattern, "Invalid pattern");
                    }
                }
                else if (prop.type === "number" ||
                    prop.type === "integer" ||
                    prop.type === "float") {
                    zodType = z.number();
                    if (typeof prop?.minimum === "number") {
                        zodType = zodType.min(prop.minimum, {
                            message: `${key} must be at least ${prop.minimum}`,
                        });
                    }
                    if (prop?.maximum)
                        zodType = zodType.lte(prop.maximum, {
                            message: `${key} must be maximum of ${prop.maximum}`,
                        });
                }
                else if (prop.type === "boolean")
                    zodType = z.boolean();
                else if (prop.type === "array")
                    zodType = z.array(jsonSchemaToZod(prop.items));
                else if (prop.type === "object") {
                    zodType = jsonSchemaToZod(prop);
                }
                else
                    throw new Error(`Unsupported type: ${prop.type}`);
                if (prop.description) {
                    zodType = zodType.describe(prop.description);
                }
                if (!obj.required?.includes(key)) {
                    zodType = zodType.optional();
                }
                shape[key] = zodType;
            }
        });
        return z.object(shape);
    }
    throw new Error("Unsupported root schema type");
}
