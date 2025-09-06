import { calendar_v3 } from "googleapis";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
type RunCreateEventParams = {
    calendarId: string;
    calendar: calendar_v3.Calendar;
    model: BaseLanguageModel;
};
declare const runCreateEvent: (query: string, { calendarId, calendar, model }: RunCreateEventParams, runManager?: CallbackManagerForToolRun) => Promise<string>;
export { runCreateEvent };
