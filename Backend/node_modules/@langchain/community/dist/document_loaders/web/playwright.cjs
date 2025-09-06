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
exports.PlaywrightWebBaseLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const base_1 = require("@langchain/core/document_loaders/base");
/**
 * Class representing a document loader for scraping web pages using
 * Playwright. Extends the BaseDocumentLoader class and implements the
 * DocumentLoader interface.
 */
class PlaywrightWebBaseLoader extends base_1.BaseDocumentLoader {
    constructor(webPath, options) {
        super();
        Object.defineProperty(this, "webPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: webPath
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.options = options ?? undefined;
    }
    static async _scrape(url, options) {
        const { chromium } = await PlaywrightWebBaseLoader.imports();
        const browser = await chromium.launch({
            headless: true,
            ...options?.launchOptions,
        });
        const page = await browser.newPage();
        const response = await page.goto(url, {
            timeout: 180000,
            waitUntil: "domcontentloaded",
            ...options?.gotoOptions,
        });
        const bodyHTML = options?.evaluate
            ? await options?.evaluate(page, browser, response)
            : await page.content();
        await browser.close();
        return bodyHTML;
    }
    /**
     * Method that calls the _scrape method to perform the scraping of the web
     * page specified by the webPath property. Returns a Promise that resolves
     * to the scraped HTML content of the web page.
     * @returns Promise that resolves to the scraped HTML content of the web page.
     */
    async scrape() {
        return PlaywrightWebBaseLoader._scrape(this.webPath, this.options);
    }
    /**
     * Method that calls the scrape method and returns the scraped HTML
     * content as a Document object. Returns a Promise that resolves to an
     * array of Document objects.
     * @returns Promise that resolves to an array of Document objects.
     */
    async load() {
        const text = await this.scrape();
        const metadata = { source: this.webPath };
        return [new documents_1.Document({ pageContent: text, metadata })];
    }
    /**
     * Static method that imports the necessary Playwright modules. Returns a
     * Promise that resolves to an object containing the imported modules.
     * @returns Promise that resolves to an object containing the imported modules.
     */
    static async imports() {
        try {
            const { chromium } = await Promise.resolve().then(() => __importStar(require("playwright")));
            return { chromium };
        }
        catch (e) {
            console.error(e);
            throw new Error("Please install playwright as a dependency with, e.g. `yarn add playwright`");
        }
    }
}
exports.PlaywrightWebBaseLoader = PlaywrightWebBaseLoader;
