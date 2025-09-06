/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import { BaseChatModel, } from "@langchain/core/language_models/chat_models";
async function transformTextMessageAsync(message, transformer) {
    if (typeof message.content === "string") {
        message.content = await transformer(message.content);
        return message;
    }
    const redactedContent = await Promise.all(message.content.map(async (m) => {
        if (m.type === "text") {
            return {
                ...m,
                text: await transformer(m.text),
            };
        }
        else {
            return Promise.resolve(m);
        }
    }));
    message.content = redactedContent;
    return message;
}
function transformTextMessage(message, transformer) {
    if (typeof message.content === "string") {
        message.content = transformer(message.content);
        return message;
    }
    const redactedContent = message.content.map((m) => {
        if (m.type === "text") {
            return {
                ...m,
                text: transformer(m.text),
            };
        }
        else {
            return m;
        }
    });
    message.content = redactedContent;
    return message;
}
export class ArcjetRedact extends BaseChatModel {
    static lc_name() {
        return "ArcjetRedact";
    }
    constructor(options) {
        super(options);
        Object.defineProperty(this, "chatModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contextWindowSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "detect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "replace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (options.entities && options.entities.length === 0) {
            throw new Error("no entities configured for redaction");
        }
        this.chatModel = options.chatModel;
        this.entities = options.entities;
        this.contextWindowSize = options.contextWindowSize;
        this.detect = options.detect;
        this.replace = options.replace;
        this.index = 0;
    }
    _createUniqueReplacement(entity) {
        const userReplacement = typeof this.replace !== "undefined" ? this.replace(entity) : undefined;
        if (typeof userReplacement !== "undefined") {
            return userReplacement;
        }
        this.index++;
        if (entity === "email") {
            return `<Redacted email #${this.index}>`;
        }
        if (entity === "phone-number") {
            return `<Redacted phone number #${this.index}>`;
        }
        if (entity === "ip-address") {
            return `<Redacted IP address #${this.index}>`;
        }
        if (entity === "credit-card-number") {
            return `<Redacted credit card number #${this.index}>`;
        }
        return `<Redacted ${entity} #${this.index}>`;
    }
    _llmType() {
        return "arcjet_redact";
    }
    async _generate(messages, options, runManager) {
        const ajOptions = {
            entities: this.entities,
            contextWindowSize: this.contextWindowSize,
            detect: this.detect,
            replace: this._createUniqueReplacement.bind(this),
        };
        const unredactors = [];
        // Support CommonJS
        const { redact } = await import("@arcjet/redact");
        const redacted = await Promise.all(messages.map(async (message) => {
            return await transformTextMessageAsync(message, async (message) => {
                const [redacted, unredact] = await redact(message, ajOptions);
                unredactors.push(unredact);
                return redacted;
            });
        }));
        const response = await this.chatModel._generate(redacted, options, runManager);
        return {
            ...response,
            generations: response.generations.map((resp) => {
                return {
                    ...resp,
                    message: transformTextMessage(resp.message, (message) => {
                        for (const unredact of unredactors) {
                            message = unredact(message);
                        }
                        return message;
                    }),
                };
            }),
        };
    }
}
