"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLWebBaseLoader = void 0;
const async_caller_1 = require("@langchain/core/utils/async_caller");
const base_1 = require("@langchain/core/document_loaders/base");
const documents_1 = require("@langchain/core/documents");
class HTMLWebBaseLoader extends base_1.BaseDocumentLoader {
    constructor(webPath, fields) {
        super();
        Object.defineProperty(this, "webPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: webPath
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "caller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textDecoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { timeout, textDecoder, headers, ...rest } = fields ?? {};
        this.timeout = timeout ?? 10000;
        this.caller = new async_caller_1.AsyncCaller(rest);
        this.textDecoder = textDecoder;
        this.headers = headers;
    }
    async load() {
        const response = await this.caller.call(fetch, this.webPath, {
            signal: this.timeout ? AbortSignal.timeout(this.timeout) : undefined,
            headers: this.headers,
        });
        const html = this.textDecoder?.decode(await response.arrayBuffer()) ??
            (await response.text());
        return [new documents_1.Document({ pageContent: html })];
    }
}
exports.HTMLWebBaseLoader = HTMLWebBaseLoader;
