import { AsyncCaller, } from "@langchain/core/utils/async_caller";
import { BaseDocumentLoader } from "@langchain/core/document_loaders/base";
import { Document } from "@langchain/core/documents";
export class HTMLWebBaseLoader extends BaseDocumentLoader {
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
        this.caller = new AsyncCaller(rest);
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
        return [new Document({ pageContent: html })];
    }
}
