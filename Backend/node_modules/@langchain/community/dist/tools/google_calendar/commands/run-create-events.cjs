"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCreateEvent = void 0;
const zod_1 = require("zod");
const prompts_1 = require("@langchain/core/prompts");
const index_js_1 = require("../prompts/index.cjs");
const get_timezone_offset_in_hours_js_1 = require("../utils/get-timezone-offset-in-hours.cjs");
const eventSchema = zod_1.z.object({
    event_summary: zod_1.z.string(),
    event_start_time: zod_1.z.string(),
    event_end_time: zod_1.z.string(),
    event_location: zod_1.z.string().optional(),
    event_description: zod_1.z.string().optional(),
    user_timezone: zod_1.z.string(),
});
const createEvent = async ({ eventSummary, eventStartTime, eventEndTime, userTimezone, eventLocation = "", eventDescription = "", }, calendarId, calendar) => {
    const event = {
        summary: eventSummary,
        location: eventLocation,
        description: eventDescription,
        start: {
            dateTime: eventStartTime,
            timeZone: userTimezone,
        },
        end: {
            dateTime: eventEndTime,
            timeZone: userTimezone,
        },
    };
    try {
        const createdEvent = await calendar.events.insert({
            calendarId,
            requestBody: event,
        });
        return createdEvent;
    }
    catch (error) {
        return {
            error: `An error occurred: ${error}`,
        };
    }
};
const runCreateEvent = async (query, { calendarId, calendar, model }, runManager) => {
    const prompt = new prompts_1.PromptTemplate({
        template: index_js_1.CREATE_EVENT_PROMPT,
        inputVariables: ["date", "query", "u_timezone", "dayName"],
    });
    if (!model?.withStructuredOutput) {
        throw new Error("Model does not support structured output");
    }
    const createEventChain = prompt.pipe(model.withStructuredOutput(eventSchema));
    const date = new Date().toISOString();
    const u_timezone = (0, get_timezone_offset_in_hours_js_1.getTimezoneOffsetInHours)();
    const dayName = new Date().toLocaleString("en-us", { weekday: "long" });
    const output = await createEventChain.invoke({
        query,
        date,
        u_timezone,
        dayName,
    }, runManager?.getChild());
    const [eventSummary, eventStartTime, eventEndTime, eventLocation, eventDescription, userTimezone,] = Object.values(output);
    const event = await createEvent({
        eventSummary,
        eventStartTime,
        eventEndTime,
        userTimezone,
        eventLocation,
        eventDescription,
    }, calendarId, calendar);
    if (!event.error) {
        return `Event created successfully, details: event ${event.data.htmlLink}`;
    }
    return `An error occurred creating the event: ${event.error}`;
};
exports.runCreateEvent = runCreateEvent;
