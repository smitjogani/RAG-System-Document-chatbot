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
exports.CheerioWebBaseLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const async_caller_1 = require("@langchain/core/utils/async_caller");
const base_1 = require("@langchain/core/document_loaders/base");
/**
 * A class that extends the BaseDocumentLoader and implements the
 * DocumentLoader interface. It represents a document loader for loading
 * web-based documents using Cheerio.
 * @example
 * ```typescript
 * const loader = new CheerioWebBaseLoader("https://exampleurl.com");
 * const docs = await loader.load();
 * console.log({ docs });
 * ```
 */
class CheerioWebBaseLoader extends base_1.BaseDocumentLoader {
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
        Object.defineProperty(this, "selector", {
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
        const { timeout, selector, textDecoder, headers, ...rest } = fields ?? {};
        this.timeout = timeout ?? 10000;
        this.caller = new async_caller_1.AsyncCaller(rest);
        this.selector = selector ?? "body";
        this.textDecoder = textDecoder;
        this.headers = headers;
    }
    /**
     * Fetches web documents from the given array of URLs and loads them using Cheerio.
     * It returns an array of CheerioAPI instances.
     * @param urls An array of URLs to fetch and load.
     * @returns A Promise that resolves to an array of CheerioAPI instances.
     */
    static async scrapeAll(urls, caller, timeout, textDecoder, options) {
        return Promise.all(urls.map((url) => CheerioWebBaseLoader._scrape(url, caller, timeout, textDecoder, options)));
    }
    static async _scrape(url, caller, timeout, textDecoder, options) {
        const { headers, ...cheerioOptions } = options ?? {};
        const { load } = await CheerioWebBaseLoader.imports();
        const response = await caller.call(fetch, url, {
            signal: timeout ? AbortSignal.timeout(timeout) : undefined,
            headers,
        });
        const html = textDecoder?.decode(await response.arrayBuffer()) ??
            (await response.text());
        return load(html, cheerioOptions);
    }
    /**
     * Fetches the web document from the webPath and loads it using Cheerio.
     * It returns a CheerioAPI instance.
     * @returns A Promise that resolves to a CheerioAPI instance.
     */
    async scrape() {
        const options = { headers: this.headers };
        return CheerioWebBaseLoader._scrape(this.webPath, this.caller, this.timeout, this.textDecoder, options);
    }
    /**
     * Extracts the text content from the loaded document using the selector
     * and creates a Document instance with the extracted text and metadata.
     * It returns an array of Document instances.
     * @returns A Promise that resolves to an array of Document instances.
     */
    async load() {
        const $ = await this.scrape();
        const title = $("title").text();
        const text = $(this.selector).text();
        const metadata = { source: this.webPath, title };
        return [new documents_1.Document({ pageContent: text, metadata })];
    }
    /**
     * A static method that dynamically imports the Cheerio library and
     * returns the load function. If the import fails, it throws an error.
     * @returns A Promise that resolves to an object containing the load function from the Cheerio library.
     */
    static async imports() {
        try {
            const { load } = await Promise.resolve().then(() => __importStar(require("cheerio")));
            return { load };
        }
        catch (e) {
            console.error(e);
            throw new Error("Please install cheerio as a dependency with, e.g. `yarn add cheerio`");
        }
    }
}
exports.CheerioWebBaseLoader = CheerioWebBaseLoader;
