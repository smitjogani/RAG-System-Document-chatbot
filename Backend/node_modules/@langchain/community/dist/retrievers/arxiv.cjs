"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArxivRetriever = void 0;
const retrievers_1 = require("@langchain/core/retrievers");
const arxiv_js_1 = require("../utils/arxiv.cjs");
/**
 * A retriever that searches arXiv for relevant articles based on a query.
 * It can retrieve either full documents (PDFs) or just summaries.
 */
class ArxivRetriever extends retrievers_1.BaseRetriever {
    static lc_name() {
        return "ArxivRetriever";
    }
    constructor(options = {}) {
        super(options);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "arxiv_retriever"]
        });
        Object.defineProperty(this, "getFullDocuments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "maxSearchResults", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        this.getFullDocuments = options.getFullDocuments ?? this.getFullDocuments;
        this.maxSearchResults = options.maxSearchResults ?? this.maxSearchResults;
    }
    async _getRelevantDocuments(query) {
        try {
            const results = await (0, arxiv_js_1.searchArxiv)(query, this.maxSearchResults);
            if (this.getFullDocuments) {
                // Fetch and parse PDFs to get full documents
                return await (0, arxiv_js_1.loadDocsFromResults)(results);
            }
            else {
                // Use summaries as documents
                return (0, arxiv_js_1.getDocsFromSummaries)(results);
            }
        }
        catch (error) {
            throw new Error(`Error retrieving documents from arXiv.`);
        }
    }
}
exports.ArxivRetriever = ArxivRetriever;
