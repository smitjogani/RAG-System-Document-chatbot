"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfluencePagesLoader = void 0;
const html_to_text_1 = require("html-to-text");
const documents_1 = require("@langchain/core/documents");
const base_1 = require("@langchain/core/document_loaders/base");
/**
 * Class representing a document loader for loading pages from Confluence.
 * @example
 * ```typescript
 * const loader = new ConfluencePagesLoader({
 *   baseUrl: "https:
 *   spaceKey: "~EXAMPLE362906de5d343d49dcdbae5dEXAMPLE",
 *   username: "your-username",
 *   accessToken: "your-access-token",
 * });
 * const documents = await loader.load();
 * console.log(documents);
 * ```
 */
class ConfluencePagesLoader extends base_1.BaseDocumentLoader {
    constructor({ baseUrl, spaceKey, username, accessToken, limit = 25, expand = "body.storage,version", personalAccessToken, maxRetries = 5, }) {
        super();
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "spaceKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "username", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "accessToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "limit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * expand parameter for confluence rest api
         * description can be found at https://developer.atlassian.com/server/confluence/expansions-in-the-rest-api/
         */
        Object.defineProperty(this, "expand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "personalAccessToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = baseUrl;
        this.spaceKey = spaceKey;
        this.username = username;
        this.accessToken = accessToken;
        this.limit = limit;
        this.expand = expand;
        this.personalAccessToken = personalAccessToken;
        this.maxRetries = maxRetries;
    }
    /**
     * Returns the authorization header for the request.
     * @returns The authorization header as a string, or undefined if no credentials were provided.
     */
    get authorizationHeader() {
        if (this.personalAccessToken) {
            return `Bearer ${this.personalAccessToken}`;
        }
        else if (this.username && this.accessToken) {
            const authToken = Buffer.from(`${this.username}:${this.accessToken}`).toString("base64");
            return `Basic ${authToken}`;
        }
        return undefined;
    }
    /**
     * Fetches all the pages in the specified space and converts each page to
     * a Document instance.
     * @param options the extra options of the load function
     * @param options.limit The limit parameter to overwrite the size to fetch pages.
     * @param options.start The start parameter to set inital offset to fetch pages.
     * @returns Promise resolving to an array of Document instances.
     */
    async load(options) {
        try {
            const pages = await this.fetchAllPagesInSpace(options?.start, options?.limit);
            return pages.map((page) => this.createDocumentFromPage(page));
        }
        catch (error) {
            console.error("Error:", error);
            return [];
        }
    }
    /**
     * Fetches data from the Confluence API using the provided URL.
     * @param url The URL to fetch data from.
     * @returns Promise resolving to the JSON response from the API.
     */
    async fetchConfluenceData(url) {
        let retryCounter = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            retryCounter += 1;
            try {
                const initialHeaders = {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                };
                const authHeader = this.authorizationHeader;
                if (authHeader) {
                    initialHeaders.Authorization = authHeader;
                }
                const response = await fetch(url, {
                    headers: initialHeaders,
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url} from Confluence: ${response.status}. Retrying...`);
                }
                return await response.json();
            }
            catch (error) {
                if (retryCounter >= this.maxRetries)
                    throw new Error(`Failed to fetch ${url} from Confluence (retry: ${retryCounter}): ${error}`);
            }
        }
    }
    /**
     * Recursively fetches all the pages in the specified space.
     * @param start The start parameter to paginate through the results.
     * @returns Promise resolving to an array of ConfluencePage objects.
     */
    async fetchAllPagesInSpace(start = 0, limit = this.limit) {
        const url = `${this.baseUrl}/rest/api/content?spaceKey=${this.spaceKey}&limit=${limit}&start=${start}&expand=${this.expand}`;
        const data = await this.fetchConfluenceData(url);
        if (data.size === 0) {
            return [];
        }
        const nextPageStart = start + data.size;
        const nextPageResults = await this.fetchAllPagesInSpace(nextPageStart, limit);
        return data.results.concat(nextPageResults);
    }
    /**
     * Creates a Document instance from a ConfluencePage object.
     * @param page The ConfluencePage object to convert.
     * @returns A Document instance.
     */
    createDocumentFromPage(page) {
        const htmlContent = page.body.storage.value;
        // Handle both self-closing and regular macros for attachments and view-file
        const htmlWithoutOtherMacros = htmlContent.replace(/<ac:structured-macro\s+ac:name="(attachments|view-file)"[^>]*(?:\/?>|>.*?<\/ac:structured-macro>)/gs, "[ATTACHMENT]");
        // Extract and preserve code blocks with unique placeholders
        const codeBlocks = [];
        const htmlWithPlaceholders = htmlWithoutOtherMacros.replace(/<ac:structured-macro.*?<ac:parameter ac:name="language">(.*?)<\/ac:parameter>.*?<ac:plain-text-body><!\[CDATA\[([\s\S]*?)\]\]><\/ac:plain-text-body><\/ac:structured-macro>/g, (_, language, code) => {
            const placeholder = `CODE_BLOCK_${codeBlocks.length}`;
            codeBlocks.push({ language, code: code.trim() });
            return `\n${placeholder}\n`;
        });
        // Convert the HTML content to plain text
        let plainTextContent = (0, html_to_text_1.htmlToText)(htmlWithPlaceholders, {
            wordwrap: false,
            preserveNewlines: true,
        });
        // Reinsert code blocks with proper markdown formatting
        codeBlocks.forEach(({ language, code }, index) => {
            const placeholder = `CODE_BLOCK_${index}`;
            plainTextContent = plainTextContent.replace(placeholder, `\`\`\`${language}\n${code}\n\`\`\``);
        });
        // Remove empty lines
        const textWithoutEmptyLines = plainTextContent.replace(/^\s*[\r\n]/gm, "");
        // Rest of the method remains the same...
        return new documents_1.Document({
            pageContent: textWithoutEmptyLines,
            metadata: {
                id: page.id,
                status: page.status,
                title: page.title,
                type: page.type,
                url: `${this.baseUrl}/spaces/${this.spaceKey}/pages/${page.id}`,
                version: page.version?.number,
                updated_by: page.version?.by?.displayName,
                updated_at: page.version?.when,
            },
        });
    }
}
exports.ConfluencePagesLoader = ConfluencePagesLoader;
