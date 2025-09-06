import WatsonxAiMlVml_v1 = require('../watsonx-ai-ml/vml_v1');
declare function convertUtilityToolToWatsonxTool(utilityTool: WatsonxAiMlVml_v1.UtilityAgentTool): WatsonxAiMlVml_v1.TextChatParameterTools;
declare function convertWatsonxToolCallToUtilityToolCall(toolCall: WatsonxAiMlVml_v1.TextChatToolCall, config?: WatsonxAiMlVml_v1.JsonObject): WatsonxAiMlVml_v1.WxUtilityAgentToolsRunRequest;
declare const _default: {
    convertUtilityToolToWatsonxTool: typeof convertUtilityToolToWatsonxTool;
    convertWatsonxToolCallToUtilityToolCall: typeof convertWatsonxToolCallToUtilityToolCall;
};
export = _default;
//# sourceMappingURL=converters.d.ts.map