"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasoningJsonOutputParser = exports.ReasoningStructuredOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const stripThinkTags = (text) => {
    return text.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
};
class ReasoningStructuredOutputParser extends output_parsers_1.StructuredOutputParser {
    constructor(schema) {
        super(schema);
    }
    async parse(text) {
        const cleanedText = stripThinkTags(text);
        return super.parse(cleanedText);
    }
}
exports.ReasoningStructuredOutputParser = ReasoningStructuredOutputParser;
class ReasoningJsonOutputParser extends output_parsers_1.JsonOutputParser {
    async parse(text) {
        const cleanedText = stripThinkTags(text);
        return super.parse(cleanedText);
    }
}
exports.ReasoningJsonOutputParser = ReasoningJsonOutputParser;
