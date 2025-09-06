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
exports.WebPDFLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const base_1 = require("@langchain/core/document_loaders/base");
/**
 * A document loader for loading data from PDFs.
 * @example
 * ```typescript
 * const loader = new WebPDFLoader(new Blob());
 * const docs = await loader.load();
 * console.log({ docs });
 * ```
 */
class WebPDFLoader extends base_1.BaseDocumentLoader {
    constructor(blob, { splitPages = true, pdfjs = PDFLoaderImports, parsedItemSeparator = "", } = {}) {
        super();
        Object.defineProperty(this, "blob", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "splitPages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "pdfjs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parsedItemSeparator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.blob = blob;
        this.splitPages = splitPages ?? this.splitPages;
        this.pdfjs = pdfjs;
        this.parsedItemSeparator = parsedItemSeparator;
    }
    /**
     * Loads the contents of the PDF as documents.
     * @returns An array of Documents representing the retrieved data.
     */
    async load() {
        const { getDocument, version } = await this.pdfjs();
        const parsedPdf = await getDocument({
            data: new Uint8Array(await this.blob.arrayBuffer()),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        }).promise;
        const meta = await parsedPdf.getMetadata().catch(() => null);
        const documents = [];
        for (let i = 1; i <= parsedPdf.numPages; i += 1) {
            const page = await parsedPdf.getPage(i);
            const content = await page.getTextContent();
            if (content.items.length === 0) {
                continue;
            }
            // Eliminate excessive newlines
            // Source: https://github.com/albertcui/pdf-parse/blob/7086fc1cc9058545cdf41dd0646d6ae5832c7107/lib/pdf-parse.js#L16
            let lastY;
            const textItems = [];
            for (const item of content.items) {
                if ("str" in item) {
                    if (lastY === item.transform[5] || !lastY) {
                        textItems.push(item.str);
                    }
                    else {
                        textItems.push(`\n${item.str}`);
                    }
                    // eslint-disable-next-line prefer-destructuring
                    lastY = item.transform[5];
                }
            }
            const text = textItems.join(this.parsedItemSeparator);
            documents.push(new documents_1.Document({
                pageContent: text,
                metadata: {
                    pdf: {
                        version,
                        info: meta?.info,
                        metadata: meta?.metadata,
                        totalPages: parsedPdf.numPages,
                    },
                    loc: {
                        pageNumber: i,
                    },
                },
            }));
        }
        if (this.splitPages) {
            return documents;
        }
        if (documents.length === 0) {
            return [];
        }
        return [
            new documents_1.Document({
                pageContent: documents.map((doc) => doc.pageContent).join("\n\n"),
                metadata: {
                    pdf: {
                        version,
                        info: meta?.info,
                        metadata: meta?.metadata,
                        totalPages: parsedPdf.numPages,
                    },
                },
            }),
        ];
        return documents;
    }
}
exports.WebPDFLoader = WebPDFLoader;
async function PDFLoaderImports() {
    try {
        const { default: mod } = await Promise.resolve().then(() => __importStar(require("pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js")));
        const { getDocument, version } = mod;
        return { getDocument, version };
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to load pdf-parse. Please install it with eg. `npm install pdf-parse`.");
    }
}
