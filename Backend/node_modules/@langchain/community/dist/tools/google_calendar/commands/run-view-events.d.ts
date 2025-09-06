import { calendar_v3 } from "googleapis";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
type RunViewEventParams = {
    calendarId: string;
    calendar: calendar_v3.Calendar;
    model: BaseLanguageModel;
};
declare const runViewEvents: (query: string, { model, calendar, calendarId }: RunViewEventParams, runManager?: CallbackManagerForToolRun) => Promise<string>;
export { runViewEvents };
