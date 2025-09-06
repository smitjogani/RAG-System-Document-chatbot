"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runViewEvents = void 0;
const prompts_1 = require("@langchain/core/prompts");
const zod_1 = require("zod");
const index_js_1 = require("../prompts/index.cjs");
const get_timezone_offset_in_hours_js_1 = require("../utils/get-timezone-offset-in-hours.cjs");
const eventSchema = zod_1.z.object({
    time_min: zod_1.z.string(),
    time_max: zod_1.z.string(),
    user_timezone: zod_1.z.string(),
    max_results: zod_1.z.number(),
    search_query: zod_1.z.string().optional(),
});
const runViewEvents = async (query, { model, calendar, calendarId }, runManager) => {
    const prompt = new prompts_1.PromptTemplate({
        template: index_js_1.VIEW_EVENTS_PROMPT,
        inputVariables: ["date", "query", "u_timezone", "dayName"],
    });
    if (!model?.withStructuredOutput) {
        throw new Error("Model does not support structured output");
    }
    const viewEventsChain = prompt.pipe(model.withStructuredOutput(eventSchema));
    const date = new Date().toISOString();
    const u_timezone = (0, get_timezone_offset_in_hours_js_1.getTimezoneOffsetInHours)();
    const dayName = new Date().toLocaleString("en-us", { weekday: "long" });
    const output = await viewEventsChain.invoke({
        query,
        date,
        u_timezone,
        dayName,
    }, runManager?.getChild());
    try {
        const response = await calendar.events.list({
            calendarId,
            ...output,
        });
        const curatedItems = response.data && response.data.items
            ? response.data.items.map(({ status, summary, description, start, end, }) => ({
                status,
                summary,
                description,
                start,
                end,
            }))
            : [];
        return `Result for the prompt "${query}": \n${JSON.stringify(curatedItems, null, 2)}`;
    }
    catch (error) {
        return `An error occurred: ${error}`;
    }
};
exports.runViewEvents = runViewEvents;
