import { calendar_v3 } from "googleapis";
import { Tool } from "@langchain/core/tools";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
export interface GoogleCalendarAgentParams {
    credentials?: {
        clientEmail?: string;
        privateKey?: string;
        keyfile?: string;
        subject?: string;
        accessToken?: string | (() => Promise<string>);
        calendarId?: string;
    };
    scopes?: string[];
    model?: BaseLanguageModel;
}
export declare class GoogleCalendarBase extends Tool {
    name: string;
    description: string;
    protected calendarId: string;
    protected llm: BaseLanguageModel;
    protected params: GoogleCalendarAgentParams;
    protected calendar?: calendar_v3.Calendar;
    constructor({ credentials, scopes, model }?: GoogleCalendarAgentParams);
    getModel(): BaseLanguageModel<any, import("@langchain/core/language_models/base").BaseLanguageModelCallOptions>;
    getCalendarClient(): Promise<calendar_v3.Calendar>;
    _call(input: string): Promise<string>;
}
