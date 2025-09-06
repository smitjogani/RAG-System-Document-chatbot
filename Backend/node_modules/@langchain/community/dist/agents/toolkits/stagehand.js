import { Tool, BaseToolkit as Toolkit, StructuredTool, } from "@langchain/core/tools";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
//  Documentation is here:
//  https://js.langchain.com/docs/integrations/tools/stagehand
class StagehandToolBase extends Tool {
    constructor(stagehandInstance) {
        super();
        Object.defineProperty(this, "stagehand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "localStagehand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.stagehand = stagehandInstance;
    }
    async getStagehand() {
        if (this.stagehand)
            return this.stagehand;
        if (!this.localStagehand) {
            this.localStagehand = new Stagehand({
                env: "LOCAL",
                enableCaching: true,
            });
            await this.localStagehand.init();
        }
        return this.localStagehand;
    }
}
function isErrorWithMessage(error) {
    return (typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string");
}
export class StagehandNavigateTool extends StagehandToolBase {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "stagehand_navigate"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Use this tool to navigate to a specific URL using Stagehand. The input should be a valid URL as a string."
        });
    }
    async _call(input) {
        const stagehand = await this.getStagehand();
        try {
            await stagehand.page.goto(input);
            return `Successfully navigated to ${input}.`;
        }
        catch (error) {
            const message = isErrorWithMessage(error) ? error.message : String(error);
            return `Failed to navigate: ${message}`;
        }
    }
}
export class StagehandActTool extends StagehandToolBase {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "stagehand_act"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Use this tool to perform an action on the current web page using Stagehand. The input should be a string describing the action to perform."
        });
    }
    async _call(input) {
        const stagehand = await this.getStagehand();
        const result = await stagehand.act({ action: input });
        if (result.success) {
            return `Action performed successfully: ${result.message}`;
        }
        else {
            return `Failed to perform action: ${result.message}`;
        }
    }
}
export class StagehandExtractTool extends StructuredTool {
    constructor(stagehandInstance) {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "stagehand_extract"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Use this tool to extract structured information from the current web page using Stagehand. The input should include an 'instruction' string and a 'schema' object representing the extraction schema in JSON Schema format."
        });
        // Define the input schema for the tool
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: z.object({
                instruction: z.string().describe("Instruction on what to extract"),
                schema: z
                    .record(z.any())
                    .describe("Extraction schema in JSON Schema format"),
            })
        });
        Object.defineProperty(this, "stagehand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.stagehand = stagehandInstance;
    }
    async _call(input) {
        const stagehand = await this.getStagehand();
        const { instruction, schema } = input;
        try {
            const result = await stagehand.extract({
                instruction,
                schema, // Assuming Stagehand accepts the schema in JSON Schema format
            });
            return JSON.stringify(result);
        }
        catch (error) {
            const message = isErrorWithMessage(error) ? error.message : String(error);
            return `Failed to extract information: ${message}`;
        }
    }
    async getStagehand() {
        if (this.stagehand)
            return this.stagehand;
        // Initialize local Stagehand instance if not provided
        this.stagehand = new Stagehand({
            env: "LOCAL",
            enableCaching: true,
        });
        await this.stagehand.init();
        return this.stagehand;
    }
}
export class StagehandObserveTool extends StagehandToolBase {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "stagehand_observe"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Use this tool to observe the current web page and retrieve possible actions using Stagehand. The input can be an optional instruction string."
        });
    }
    async _call(input) {
        const stagehand = await this.getStagehand();
        const instruction = input || undefined;
        try {
            const result = await stagehand.observe({ instruction });
            return JSON.stringify(result);
        }
        catch (error) {
            const message = isErrorWithMessage(error) ? error.message : String(error);
            return `Failed to observe: ${message}`;
        }
    }
}
export class StagehandToolkit extends Toolkit {
    constructor(stagehand) {
        super();
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stagehand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.stagehand = stagehand;
        this.tools = this.initializeTools();
    }
    initializeTools() {
        return [
            new StagehandNavigateTool(this.stagehand),
            new StagehandActTool(this.stagehand),
            new StagehandExtractTool(this.stagehand),
            new StagehandObserveTool(this.stagehand),
        ];
    }
    static async fromStagehand(stagehand) {
        return new StagehandToolkit(stagehand);
    }
}
