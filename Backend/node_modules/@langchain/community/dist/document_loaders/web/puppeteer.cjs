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
exports.PuppeteerWebBaseLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const base_1 = require("@langchain/core/document_loaders/base");
/**
 * Class that extends the BaseDocumentLoader class and implements the
 * DocumentLoader interface. It represents a document loader for scraping
 * web pages using Puppeteer.
 * @example
 * ```typescript
 * const loader = new PuppeteerWebBaseLoader("https:exampleurl.com", {
 *   launchOptions: {
 *     headless: true,
 *   },
 *   gotoOptions: {
 *     waitUntil: "domcontentloaded",
 *   },
 * });
 * const screenshot = await loader.screenshot();
 * ```
 */
class PuppeteerWebBaseLoader extends base_1.BaseDocumentLoader {
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
        const { launch } = await PuppeteerWebBaseLoader.imports();
        const browser = await launch({
            headless: true,
            defaultViewport: null,
            ignoreDefaultArgs: ["--disable-extensions"],
            ...options?.launchOptions,
        });
        const page = await browser.newPage();
        await page.goto(url, {
            timeout: 180000,
            waitUntil: "domcontentloaded",
            ...options?.gotoOptions,
        });
        const bodyHTML = options?.evaluate
            ? await options?.evaluate(page, browser)
            : await page.evaluate(() => document.body.innerHTML);
        await browser.close();
        return bodyHTML;
    }
    /**
     * Method that calls the _scrape method to perform the scraping of the web
     * page specified by the webPath property.
     * @returns Promise that resolves to the scraped HTML content of the web page.
     */
    async scrape() {
        return PuppeteerWebBaseLoader._scrape(this.webPath, this.options);
    }
    /**
     * Method that calls the scrape method and returns the scraped HTML
     * content as a Document object.
     * @returns Promise that resolves to an array of Document objects.
     */
    async load() {
        const text = await this.scrape();
        const metadata = { source: this.webPath };
        return [new documents_1.Document({ pageContent: text, metadata })];
    }
    /**
     * Static class method used to screenshot a web page and return
     * it as a {@link Document} object where  the pageContent property
     * is the screenshot encoded in base64.
     *
     * @param {string} url
     * @param {PuppeteerWebBaseLoaderOptions} options
     * @returns {Document} A document object containing the screenshot of the page encoded in base64.
     */
    static async _screenshot(url, options) {
        const { launch } = await PuppeteerWebBaseLoader.imports();
        const browser = await launch({
            headless: true,
            defaultViewport: null,
            ignoreDefaultArgs: ["--disable-extensions"],
            ...options?.launchOptions,
        });
        const page = await browser.newPage();
        await page.goto(url, {
            timeout: 180000,
            waitUntil: "domcontentloaded",
            ...options?.gotoOptions,
        });
        const screenshot = await page.screenshot();
        const base64 = screenshot.toString("base64");
        const metadata = { source: url };
        return new documents_1.Document({ pageContent: base64, metadata });
    }
    /**
     * Screenshot a web page and return it as a {@link Document} object where
     * the pageContent property is the screenshot encoded in base64.
     *
     * @returns {Promise<Document>} A document object containing the screenshot of the page encoded in base64.
     */
    async screenshot() {
        return PuppeteerWebBaseLoader._screenshot(this.webPath, this.options);
    }
    /**
     * Static method that imports the necessary Puppeteer modules. It returns
     * a Promise that resolves to an object containing the imported modules.
     * @returns Promise that resolves to an object containing the imported Puppeteer modules.
     */
    static async imports() {
        try {
            // eslint-disable-next-line import/no-extraneous-dependencies
            const { launch } = await Promise.resolve().then(() => __importStar(require("puppeteer")));
            return { launch };
        }
        catch (e) {
            console.error(e);
            throw new Error("Please install puppeteer as a dependency with, e.g. `yarn add puppeteer`");
        }
    }
}
exports.PuppeteerWebBaseLoader = PuppeteerWebBaseLoader;
