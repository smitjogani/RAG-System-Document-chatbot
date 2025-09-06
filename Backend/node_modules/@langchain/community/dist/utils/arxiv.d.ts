import { Document } from "@langchain/core/documents";
interface ArxivEntry {
    id: string;
    title: string;
    summary: string;
    published: string;
    updated: string;
    authors: string[];
    pdfUrl: string;
    links: any[];
}
export declare function isArXivIdentifier(query: string): boolean;
export declare function fetchDirectArxivArticle(arxivIds: string): Promise<ArxivEntry[]>;
export declare function fetchArxivResultsByQuery(query: string, start?: number, maxResults?: number): Promise<ArxivEntry[]>;
export declare function searchArxiv(query: string, maxResults?: number): Promise<ArxivEntry[]>;
export declare function fetchAndParsePDF(pdfUrl: string): Promise<string>;
export declare function loadDocsFromResults(results: ArxivEntry[]): Promise<Document[]>;
export declare function getDocsFromSummaries(results: ArxivEntry[]): Document[];
export {};
