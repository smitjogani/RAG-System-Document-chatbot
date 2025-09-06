/**
 * Adapted from
 * https://github.com/FurkanToprak/OkapiBM25
 *
 * Inlined due to CJS import issues.
 */
/** Gets word count. */
export declare const getWordCount: (corpus: string) => number;
/** Number of occurences of a word in a string. */
export declare const getTermFrequency: (term: string, corpus: string) => number;
/** Inverse document frequency. */
export declare const getIDF: (term: string, documents: string[]) => number;
/** Represents a document; useful when sorting results.
 */
export interface BMDocument {
    /** The document is originally scoreed. */
    document: string;
    /** The score that the document recieves. */
    score: number;
}
/** Constants that are free parameters used in BM25, specifically when generating inverse document frequency. */
export interface BMConstants {
    /** Free parameter. Is 0.75 by default.  */
    b?: number;
    /** Free parameter. Is 1.2 by default. Generally in range [1.2, 2.0] */
    k1?: number;
}
/** If returns positive, the sorting results in secondEl coming before firstEl, else, firstEl comes before secondEL  */
export type BMSorter = (firstEl: BMDocument, secondEl: BMDocument) => number;
/** Implementation of Okapi BM25 algorithm.
 *  @param documents: Collection of documents.
 *  @param keywords: query terms.
 *  @param constants: Contains free parameters k1 and b. b=0.75 and k1=1.2 by default.
 *  @param sort: A function that allows you to sort queries by a given rule. If not provided, returns results corresponding to the original order.
 * If this option is provided, the return type will not be an array of scores but an array of documents with their scores.
 */
export declare function BM25(documents: string[], keywords: string[], constants?: BMConstants, sorter?: BMSorter): number[] | BMDocument[];
