import { OutputParserException } from "@langchain/core/output_parsers";
import { AgentActionOutputParser } from "../types.js";
/**
 * @example
 * ```typescript
 * const prompt = ChatPromptTemplate.fromMessages([
 *   HumanMessagePromptTemplate.fromTemplate(AGENT_INSTRUCTIONS),
 *   new MessagesPlaceholder("agent_scratchpad"),
 * ]);
 * const runnableAgent = RunnableSequence.from([
 *   ...rest of runnable
 *   prompt,
 *   new ChatAnthropic({ modelName: "claude-2", temperature: 0 }).withConfig({
 *     stop: ["</tool_input>", "</final_answer>"],
 *   }),
 *   new XMLAgentOutputParser(),
 * ]);
 * const result = await executor.invoke({
 *   input: "What is the weather in Honolulu?",
 *   tools: [],
 * });
 * ```
 */
export class XMLAgentOutputParser extends AgentActionOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "xml"]
        });
    }
    static lc_name() {
        return "XMLAgentOutputParser";
    }
    /**
     * Parses the output text from the agent and returns an AgentAction or
     * AgentFinish object.
     * @param text The output text from the agent.
     * @returns An AgentAction or AgentFinish object.
     */
    async parse(text) {
        if (text.includes("</tool>")) {
            const _toolMatch = text.match(/<tool>([^<]*)<\/tool>/);
            const _tool = _toolMatch ? _toolMatch[1] : "";
            const _toolInputMatch = text.match(/<tool_input>([^<]*?)(?:<\/tool_input>|$)/);
            const _toolInput = _toolInputMatch ? _toolInputMatch[1] : "";
            return { tool: _tool, toolInput: _toolInput, log: text };
        }
        else if (text.includes("<final_answer>")) {
            const answerMatch = text.match(/<final_answer>([^<]*?)(?:<\/final_answer>|$)/);
            const answer = answerMatch ? answerMatch[1] : "";
            return { returnValues: { output: answer }, log: text };
        }
        else {
            throw new OutputParserException(`Could not parse LLM output: ${text}`);
        }
    }
    getFormatInstructions() {
        throw new Error("getFormatInstructions not implemented inside OpenAIFunctionsAgentOutputParser.");
    }
}
