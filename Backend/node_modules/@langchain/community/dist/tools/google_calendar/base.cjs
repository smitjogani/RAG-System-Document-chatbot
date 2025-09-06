"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarBase = void 0;
const googleapis_1 = require("googleapis");
const tools_1 = require("@langchain/core/tools");
const env_1 = require("@langchain/core/utils/env");
class GoogleCalendarBase extends tools_1.Tool {
    constructor({ credentials, scopes, model } = {
        credentials: {
            clientEmail: (0, env_1.getEnvironmentVariable)("GOOGLE_CALENDAR_CLIENT_EMAIL"),
            privateKey: (0, env_1.getEnvironmentVariable)("GOOGLE_CALENDAR_PRIVATE_KEY"),
            keyfile: (0, env_1.getEnvironmentVariable)("GOOGLE_CALENDAR_KEYFILE"),
            subject: (0, env_1.getEnvironmentVariable)("GOOGLE_CALENDAR_SUBJECT"),
            calendarId: (0, env_1.getEnvironmentVariable)("GOOGLE_CALENDAR_CALENDAR_ID") || "primary",
        },
        scopes: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
        ],
    }) {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Google Calendar"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "A tool to lookup Google Calendar events and create events in Google Calendar"
        });
        Object.defineProperty(this, "calendarId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!model) {
            throw new Error("Missing llm instance to interact with Google Calendar");
        }
        if (!credentials) {
            throw new Error("Missing credentials to authenticate to Google Calendar");
        }
        if (!credentials.accessToken) {
            if (!credentials.clientEmail) {
                throw new Error("Missing GOOGLE_CALENDAR_CLIENT_EMAIL to interact with Google Calendar");
            }
            if (!credentials.privateKey && !credentials.keyfile) {
                throw new Error("Missing GOOGLE_CALENDAR_PRIVATE_KEY or GOOGLE_CALENDAR_KEYFILE or accessToken to interact with Google Calendar");
            }
        }
        if (!credentials.calendarId) {
            throw new Error("Missing GOOGLE_CALENDAR_CALENDAR_ID to interact with Google Calendar");
        }
        this.params = { credentials, scopes };
        this.calendarId = credentials.calendarId;
        this.llm = model;
    }
    getModel() {
        return this.llm;
    }
    async getCalendarClient() {
        const { credentials, scopes } = this.params;
        if (credentials?.accessToken) {
            // always return a new instance so that we don't end up using expired access tokens
            const auth = new googleapis_1.google.auth.OAuth2();
            const accessToken = typeof credentials.accessToken === "function"
                ? await credentials.accessToken()
                : credentials.accessToken;
            auth.setCredentials({
                // get fresh access token if a function is provided
                access_token: accessToken,
            });
            return googleapis_1.google.calendar({ version: "v3", auth });
        }
        // when not using access token its ok to use singleton instance
        if (this.calendar) {
            return this.calendar;
        }
        const auth = new googleapis_1.google.auth.JWT(credentials?.clientEmail, credentials?.keyfile, credentials?.privateKey, scopes, credentials?.subject);
        this.calendar = googleapis_1.google.calendar({ version: "v3", auth });
        return this.calendar;
    }
    async _call(input) {
        return input;
    }
}
exports.GoogleCalendarBase = GoogleCalendarBase;
