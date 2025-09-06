"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatsonxToolkit = exports.WatsonxTool = void 0;
const watsonx_ai_1 = require("@ibm-cloud/watsonx-ai");
const tools_1 = require("@langchain/core/tools");
const types_1 = require("@langchain/core/utils/types");
const ibm_js_1 = require("../../utils/ibm.cjs");
class WatsonxTool extends tools_1.StructuredTool {
    constructor(fields, service, configSchema) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
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
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "configSchema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "toolConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields?.name;
        this.description = fields?.description || "";
        this.schema = (0, ibm_js_1.jsonSchemaToZod)(fields?.parameters);
        this.configSchema = configSchema
            ? (0, ibm_js_1.jsonSchemaToZod)(configSchema)
            : undefined;
        this.service = service;
    }
    async _call(inputObject) {
        const { input } = inputObject;
        const response = await this.service.runUtilityAgentToolByName({
            toolId: this.name,
            wxUtilityAgentToolsRunRequest: {
                input: input ?? inputObject,
                tool_name: this.name,
                config: this.toolConfig,
            },
        });
        const result = response?.result.output;
        return new Promise((resolve) => {
            resolve(result ?? "Sorry, the tool did not work as expected");
        });
    }
    set config(config) {
        if (!this.configSchema) {
            this.toolConfig = config;
            return;
        }
        const result = (0, types_1.interopSafeParse)(this.configSchema, config);
        this.toolConfig = result.data;
    }
}
exports.WatsonxTool = WatsonxTool;
class WatsonxToolkit extends tools_1.BaseToolkit {
    constructor(fields) {
        super();
        Object.defineProperty(this, "tools", {
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
        const { watsonxAIApikey, watsonxAIAuthType, watsonxAIBearerToken, watsonxAIUsername, watsonxAIPassword, watsonxAIUrl, version, disableSSL, serviceUrl, } = fields;
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
    }
    async loadTools() {
        const { result: tools } = await this.service.listUtilityAgentTools();
        this.tools = tools.resources
            .map((tool) => {
            const { function: watsonxTool } = (0, watsonx_ai_1.convertUtilityToolToWatsonxTool)(tool);
            if (watsonxTool)
                return new WatsonxTool(watsonxTool, this.service, tool.config_schema);
            else
                return undefined;
        })
            .filter((item) => item !== undefined);
    }
    static async init(props) {
        const instance = new WatsonxToolkit({ ...props });
        await instance.loadTools();
        return instance;
    }
    getTools() {
        return this.tools;
    }
    getTool(toolName, config) {
        const selectedTool = this.tools.find((item) => item.name === toolName);
        if (!selectedTool)
            throw new Error("Tool with provided name does not exist");
        if (config) {
            selectedTool.config = config;
        }
        return selectedTool;
    }
}
exports.WatsonxToolkit = WatsonxToolkit;
