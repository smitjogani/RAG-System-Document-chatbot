import { google } from "googleapis";
import { StructuredTool } from "@langchain/core/tools";
import { getEnvironmentVariable } from "@langchain/core/utils/env";
export class GmailBaseTool extends StructuredTool {
    constructor({ credentials, scopes } = {
        credentials: {
            clientEmail: getEnvironmentVariable("GMAIL_CLIENT_EMAIL"),
            privateKey: getEnvironmentVariable("GMAIL_PRIVATE_KEY"),
            keyfile: getEnvironmentVariable("GMAIL_KEYFILE"),
            subject: getEnvironmentVariable("GMAIL_SUBJECT"),
        },
        scopes: ["https://mail.google.com/"],
    }) {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Gmail"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "A tool to send and view emails through Gmail"
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gmail", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (!credentials) {
            throw new Error("Missing credentials to authenticate to Gmail");
        }
        if (!credentials.accessToken) {
            if (!credentials.clientEmail) {
                throw new Error("Missing GMAIL_CLIENT_EMAIL to interact with Gmail");
            }
            if (!credentials.privateKey && !credentials.keyfile) {
                throw new Error("Missing GMAIL_PRIVATE_KEY or GMAIL_KEYFILE or accessToken to interact with Gmail");
            }
        }
        this.params = { credentials, scopes };
    }
    async getGmailClient() {
        const { credentials, scopes } = this.params;
        if (credentials?.accessToken) {
            // always return a new instance so that we don't end up using expired access tokens
            const auth = new google.auth.OAuth2();
            const accessToken = typeof credentials.accessToken === "function"
                ? await credentials.accessToken()
                : credentials.accessToken;
            auth.setCredentials({
                // get fresh access token if a function is provided
                access_token: accessToken,
            });
            return google.gmail({ version: "v1", auth });
        }
        // when not using access token its ok to use singleton instance
        if (this.gmail) {
            return this.gmail;
        }
        const auth = new google.auth.JWT(credentials?.clientEmail, credentials?.keyfile, credentials?.privateKey, scopes, credentials?.subject);
        this.gmail = google.gmail({ version: "v1", auth });
        return this.gmail;
    }
    parseHeaderAndBody(payload) {
        if (!payload) {
            return { body: "" };
        }
        const headers = payload.headers || [];
        const subject = headers.find((header) => header.name === "Subject");
        const sender = headers.find((header) => header.name === "From");
        let body = "";
        if (payload.parts) {
            body = payload.parts
                .map((part) => part.mimeType === "text/plain"
                ? this.decodeBody(part.body?.data ?? "")
                : "")
                .join("");
        }
        else if (payload.body?.data) {
            body = this.decodeBody(payload.body.data);
        }
        return { subject, sender, body };
    }
    decodeBody(body) {
        if (body) {
            try {
                // Gmail uses URL-safe base64 encoding, so we need to handle it properly
                // Replace URL-safe characters and decode
                return atob(body.replace(/-/g, "+").replace(/_/g, "/"));
            }
            catch (error) {
                // Keep the original encoded body if decoding fails
                return body;
            }
        }
        return "";
    }
}
