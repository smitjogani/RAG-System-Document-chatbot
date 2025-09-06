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
exports.DocxLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const buffer_1 = require("langchain/document_loaders/fs/buffer");
/**
 * A class that extends the `BufferLoader` class. It represents a document
 * loader that loads documents from DOCX files.
 * It has a constructor that takes a `filePathOrBlob` parameter representing the path to the word
 * file or a Blob object, and an optional `options` parameter of type
 * `DocxLoaderOptions`
 */
class DocxLoader extends buffer_1.BufferLoader {
    constructor(filePathOrBlob, options) {
        super(filePathOrBlob);
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { type: "docx" }
        });
        if (options) {
            this.options = {
                ...options,
            };
        }
    }
    /**
     * A method that takes a `raw` buffer and `metadata` as parameters and
     * returns a promise that resolves to an array of `Document` instances. It
     * uses the `extractRawText` function from the `mammoth` module or
     * `extract` method from the `word-extractor` module to extract
     * the raw text content from the buffer. If the extracted text content is
     * empty, it returns an empty array. Otherwise, it creates a new
     * `Document` instance with the extracted text content and the provided
     * metadata, and returns it as an array.
     * @param raw The raw buffer from which to extract text content.
     * @param metadata The metadata to be associated with the created `Document` instance.
     * @returns A promise that resolves to an array of `Document` instances.
     */
    async parse(raw, metadata) {
        if (this.options.type === "doc") {
            return this.parseDoc(raw, metadata);
        }
        return this.parseDocx(raw, metadata);
    }
    /**
     * A private method that takes a `raw` buffer and `metadata` as parameters and
     * returns a promise that resolves to an array of `Document` instances. It
     * uses the `extractRawText` function from the `mammoth` module to extract
     * the raw text content from the buffer. If the extracted text content is
     * empty, it returns an empty array. Otherwise, it creates a new
     * `Document` instance with the extracted text content and the provided
     * metadata, and returns it as an array.
     * @param raw The raw buffer from which to extract text content.
     * @param metadata The metadata to be associated with the created `Document` instance.
     * @returns A promise that resolves to an array of `Document` instances.
     */
    async parseDocx(raw, metadata) {
        if (this.options.type === "doc") {
            return this.parseDoc(raw, metadata);
        }
        const { extractRawText } = await DocxLoaderImports();
        const docx = await extractRawText({
            buffer: raw,
        });
        if (!docx.value)
            return [];
        return [
            new documents_1.Document({
                pageContent: docx.value,
                metadata,
            }),
        ];
    }
    /**
     * A private method that takes a `raw` buffer and `metadata` as parameters and
     * returns a promise that resolves to an array of `Document` instances. It
     * uses the `extract` method from the `word-extractor` module to extract
     * the raw text content from the buffer. If the extracted text content is
     * empty, it returns an empty array. Otherwise, it creates a new
     * `Document` instance with the extracted text content and the provided
     * metadata, and returns it as an array.
     * @param raw The raw buffer from which to extract text content.
     * @param metadata The metadata to be associated with the created `Document` instance.
     * @returns A promise that resolves to an array of `Document` instances.
     */
    async parseDoc(raw, metadata) {
        const WordExtractor = await DocLoaderImports();
        const extractor = new WordExtractor();
        const doc = await extractor.extract(raw);
        return [
            new documents_1.Document({
                pageContent: doc.getBody(),
                metadata,
            }),
        ];
    }
}
exports.DocxLoader = DocxLoader;
async function DocxLoaderImports() {
    try {
        const { extractRawText } = await Promise.resolve().then(() => __importStar(require("mammoth")));
        return { extractRawText };
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to load mammoth. Please install it with eg. `npm install mammoth`.");
    }
}
async function DocLoaderImports() {
    try {
        const WordExtractor = await Promise.resolve().then(() => __importStar(require("word-extractor")));
        return WordExtractor.default;
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to load word-extractor. Please install it with eg. `npm install word-extractor`.");
    }
}
