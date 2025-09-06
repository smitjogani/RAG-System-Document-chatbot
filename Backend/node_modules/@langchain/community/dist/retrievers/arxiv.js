import { BaseRetriever } from "@langchain/core/retrievers";
import { searchArxiv, loadDocsFromResults, getDocsFromSummaries, } from "../utils/arxiv.js";
/**
 * A retriever that searches arXiv for relevant articles based on a query.
 * It can retrieve either full documents (PDFs) or just summaries.
 */
export class ArxivRetriever extends BaseRetriever {
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
            const results = await searchArxiv(query, this.maxSearchResults);
            if (this.getFullDocuments) {
                // Fetch and parse PDFs to get full documents
                return await loadDocsFromResults(results);
            }
            else {
                // Use summaries as documents
                return getDocsFromSummaries(results);
            }
        }
        catch (error) {
            throw new Error(`Error retrieving documents from arXiv.`);
        }
    }
}
