import { JsonOutputParser, StructuredOutputParser, } from "@langchain/core/output_parsers";
const stripThinkTags = (text) => {
    return text.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
};
export class ReasoningStructuredOutputParser extends StructuredOutputParser {
    constructor(schema) {
        super(schema);
    }
    async parse(text) {
        const cleanedText = stripThinkTags(text);
        return super.parse(cleanedText);
    }
}
export class ReasoningJsonOutputParser extends JsonOutputParser {
    async parse(text) {
        const cleanedText = stripThinkTags(text);
        return super.parse(cleanedText);
    }
}
