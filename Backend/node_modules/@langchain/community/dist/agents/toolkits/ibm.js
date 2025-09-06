import { convertUtilityToolToWatsonxTool, } from "@ibm-cloud/watsonx-ai";
import { BaseToolkit, StructuredTool, } from "@langchain/core/tools";
import { interopSafeParse, } from "@langchain/core/utils/types";
import { authenticateAndSetInstance, jsonSchemaToZod, } from "../../utils/ibm.js";
export class WatsonxTool extends StructuredTool {
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
        this.schema = jsonSchemaToZod(fields?.parameters);
        this.configSchema = configSchema
            ? jsonSchemaToZod(configSchema)
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
        const result = interopSafeParse(this.configSchema, config);
        this.toolConfig = result.data;
    }
}
export class WatsonxToolkit extends BaseToolkit {
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
        const auth = authenticateAndSetInstance({
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
            const { function: watsonxTool } = convertUtilityToolToWatsonxTool(tool);
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
