import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
export type ArxivRetrieverOptions = {
    getFullDocuments?: boolean;
    maxSearchResults?: number;
} & BaseRetrieverInput;
/**
 * A retriever that searches arXiv for relevant articles based on a query.
 * It can retrieve either full documents (PDFs) or just summaries.
 */
export declare class ArxivRetriever extends BaseRetriever {
    static lc_name(): string;
    lc_namespace: string[];
    getFullDocuments: boolean;
    maxSearchResults: number;
    constructor(options?: ArxivRetrieverOptions);
    _getRelevantDocuments(query: string): Promise<Document[]>;
}
