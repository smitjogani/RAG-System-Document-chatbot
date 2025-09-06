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
exports.EPubLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const base_1 = require("@langchain/core/document_loaders/base");
/**
 * A class that extends the `BaseDocumentLoader` class. It represents a
 * document loader that loads documents from EPUB files.
 */
class EPubLoader extends base_1.BaseDocumentLoader {
    constructor(filePath, { splitChapters = true } = {}) {
        super();
        Object.defineProperty(this, "filePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: filePath
        });
        Object.defineProperty(this, "splitChapters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.splitChapters = splitChapters;
    }
    /**
     * A protected method that takes an EPUB object as a parameter and returns
     * a promise that resolves to an array of objects representing the content
     * and metadata of each chapter.
     * @param epub The EPUB object to parse.
     * @returns A promise that resolves to an array of objects representing the content and metadata of each chapter.
     */
    async parse(epub) {
        const { htmlToText } = await HtmlToTextImport();
        const chapters = await Promise.all(epub.flow.map(async (chapter) => {
            if (!chapter.id)
                return null;
            const html = await epub.getChapterRawAsync(chapter.id);
            if (!html)
                return null;
            return {
                html,
                title: chapter.title,
            };
        }));
        return chapters.filter(Boolean).map((chapter) => ({
            pageContent: htmlToText(chapter.html),
            metadata: {
                ...(chapter.title && { chapter: chapter.title }),
            },
        }));
    }
    /**
     * A method that loads the EPUB file and returns a promise that resolves
     * to an array of `Document` instances.
     * @returns A promise that resolves to an array of `Document` instances.
     */
    async load() {
        const { EPub } = await EpubImport();
        const epub = await EPub.createAsync(this.filePath);
        const parsed = await this.parse(epub);
        const metadata = { source: this.filePath };
        if (parsed.length === 0)
            return [];
        return this.splitChapters
            ? parsed.map((chapter) => new documents_1.Document({
                pageContent: chapter.pageContent,
                metadata: {
                    ...metadata,
                    ...chapter.metadata,
                },
            }))
            : [
                new documents_1.Document({
                    pageContent: parsed
                        .map((chapter) => chapter.pageContent)
                        .join("\n\n"),
                    metadata,
                }),
            ];
    }
}
exports.EPubLoader = EPubLoader;
async function EpubImport() {
    const { EPub } = await Promise.resolve().then(() => __importStar(require("epub2"))).catch(() => {
        throw new Error("Failed to load epub2. Please install it with eg. `npm install epub2`.");
    });
    return { EPub };
}
async function HtmlToTextImport() {
    const { htmlToText } = await Promise.resolve().then(() => __importStar(require("html-to-text"))).catch(() => {
        throw new Error("Failed to load html-to-text. Please install it with eg. `npm install html-to-text`.");
    });
    return { htmlToText };
}
