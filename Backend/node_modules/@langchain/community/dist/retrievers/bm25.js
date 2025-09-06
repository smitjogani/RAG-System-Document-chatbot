import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { BM25 } from "../utils/@furkantoprak/bm25/BM25.js";
/**
 * A retriever that uses the BM25 algorithm to rank documents based on their
 * similarity to a query. It uses the "okapibm25" package for BM25 scoring.
 * The k parameter determines the number of documents to return for each query.
 */
export class BM25Retriever extends BaseRetriever {
    static lc_name() {
        return "BM25Retriever";
    }
    static fromDocuments(documents, options) {
        return new this({ ...options, docs: documents });
    }
    constructor(options) {
        super(options);
        Object.defineProperty(this, "includeScore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "bm25_retriever"]
        });
        Object.defineProperty(this, "docs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "k", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.docs = options.docs;
        this.k = options.k;
        this.includeScore = options.includeScore ?? this.includeScore;
    }
    preprocessFunc(text) {
        return text.toLowerCase().split(/\s+/);
    }
    async _getRelevantDocuments(query) {
        const processedQuery = this.preprocessFunc(query);
        const documents = this.docs.map((doc) => doc.pageContent);
        const scores = BM25(documents, processedQuery);
        const scoredDocs = this.docs.map((doc, index) => ({
            document: doc,
            score: scores[index],
        }));
        scoredDocs.sort((a, b) => b.score - a.score);
        return scoredDocs.slice(0, this.k).map((item) => {
            if (this.includeScore) {
                return new Document({
                    ...(item.document.id && { id: item.document.id }),
                    pageContent: item.document.pageContent,
                    metadata: {
                        bm25Score: item.score,
                        ...item.document.metadata,
                    },
                });
            }
            else {
                return item.document;
            }
        });
    }
}
