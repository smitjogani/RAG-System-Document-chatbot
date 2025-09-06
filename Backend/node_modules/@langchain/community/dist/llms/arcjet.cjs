"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArcjetRedact = void 0;
const llms_1 = require("@langchain/core/language_models/llms");
class ArcjetRedact extends llms_1.LLM {
    static lc_name() {
        return "ArcjetRedact";
    }
    constructor(options) {
        super(options);
        Object.defineProperty(this, "llm", {
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
        if (options.entities && options.entities.length === 0) {
            throw new Error("no entities configured for redaction");
        }
        this.llm = options.llm;
        this.entities = options.entities;
        this.contextWindowSize = options.contextWindowSize;
        this.detect = options.detect;
        this.replace = options.replace;
    }
    _llmType() {
        return "arcjet_redact";
    }
    async _call(input, options) {
        const ajOptions = {
            entities: this.entities,
            contextWindowSize: this.contextWindowSize,
            detect: this.detect,
            replace: this.replace,
        };
        const { redact } = await Promise.resolve().then(() => __importStar(require("@arcjet/redact")));
        const [redacted, unredact] = await redact(input, ajOptions);
        // Invoke the underlying LLM with the prompt and options
        const result = await this.llm.invoke(redacted, options);
        return unredact(result);
    }
}
exports.ArcjetRedact = ArcjetRedact;
