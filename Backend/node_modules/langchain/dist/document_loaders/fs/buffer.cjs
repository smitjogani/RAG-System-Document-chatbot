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
exports.BufferLoader = void 0;
const env_1 = require("@langchain/core/utils/env");
const base_js_1 = require("../base.cjs");
/**
 * Abstract class that extends the `BaseDocumentLoader` class. It
 * represents a document loader that loads documents from a buffer. The
 * `load()` method is implemented to read the buffer contents and metadata
 * based on the type of `filePathOrBlob`, and then calls the `parse()`
 * method to parse the buffer and return the documents.
 */
class BufferLoader extends base_js_1.BaseDocumentLoader {
    constructor(filePathOrBlob) {
        super();
        Object.defineProperty(this, "filePathOrBlob", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: filePathOrBlob
        });
    }
    /**
     * Method that reads the buffer contents and metadata based on the type of
     * `filePathOrBlob`, and then calls the `parse()` method to parse the
     * buffer and return the documents.
     * @returns Promise that resolves with an array of `Document` objects.
     */
    async load() {
        let buffer;
        let metadata;
        if (typeof this.filePathOrBlob === "string") {
            const { readFile } = await BufferLoader.imports();
            buffer = await readFile(this.filePathOrBlob);
            metadata = { source: this.filePathOrBlob };
        }
        else {
            buffer = await this.filePathOrBlob
                .arrayBuffer()
                .then((ab) => Buffer.from(ab));
            metadata = { source: "blob", blobType: this.filePathOrBlob.type };
        }
        return this.parse(buffer, metadata);
    }
    /**
     * Static method that imports the `readFile` function from the
     * `fs/promises` module in Node.js. It is used to dynamically import the
     * function when needed. If the import fails, it throws an error
     * indicating that the `fs/promises` module is not available in the
     * current environment.
     * @returns Promise that resolves with an object containing the `readFile` function.
     */
    static async imports() {
        try {
            const { readFile } = await Promise.resolve().then(() => __importStar(require("node:fs/promises")));
            return { readFile };
        }
        catch (e) {
            console.error(e);
            throw new Error(`Failed to load fs/promises. TextLoader available only on environment 'node'. It appears you are running environment '${(0, env_1.getEnv)()}'. See https://<link to docs> for alternatives.`);
        }
    }
}
exports.BufferLoader = BufferLoader;
