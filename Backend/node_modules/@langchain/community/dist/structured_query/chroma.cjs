"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaTranslator = void 0;
const structured_query_1 = require("@langchain/core/structured_query");
/**
 * Specialized translator for the Chroma vector database. It extends the
 * BasicTranslator class and translates internal query language elements
 * to valid filters. The class defines a subset of allowed logical
 * operators and comparators that can be used in the translation process.
 * @example
 * ```typescript
 * const chromaTranslator = new ChromaTranslator();
 * const selfQueryRetriever = new SelfQueryRetriever({
 *   llm: new ChatOpenAI({ model: "gpt-4o-mini" }),
 *   vectorStore: new Chroma(),
 *   documentContents: "Brief summary of a movie",
 *   attributeInfo: [],
 *   structuredQueryTranslator: chromaTranslator,
 * });
 *
 * const relevantDocuments = await selfQueryRetriever.getRelevantDocuments(
 *   "Which movies are directed by Greta Gerwig?",
 * );
 * ```
 */
class ChromaTranslator extends structured_query_1.BaseTranslator {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "allowedOperators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [structured_query_1.Operators.and, structured_query_1.Operators.or]
        });
        Object.defineProperty(this, "allowedComparators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                structured_query_1.Comparators.eq,
                structured_query_1.Comparators.ne,
                structured_query_1.Comparators.gt,
                structured_query_1.Comparators.gte,
                structured_query_1.Comparators.lt,
                structured_query_1.Comparators.lte,
            ]
        });
    }
    formatFunction(func) {
        if (func in structured_query_1.Comparators) {
            if (this.allowedComparators.length > 0 &&
                this.allowedComparators.indexOf(func) === -1) {
                throw new Error(`Comparator ${func} not allowed. Allowed comparators: ${this.allowedComparators.join(", ")}`);
            }
        }
        else if (func in structured_query_1.Operators) {
            if (this.allowedOperators.length > 0 &&
                this.allowedOperators.indexOf(func) === -1) {
                throw new Error(`Operator ${func} not allowed. Allowed operators: ${this.allowedOperators.join(", ")}`);
            }
        }
        else {
            throw new Error("Unknown comparator or operator");
        }
        return `$${func}`;
    }
    visitOperation(operation) {
        const args = operation.args?.map((arg) => arg.accept(this));
        return {
            [this.formatFunction(operation.operator)]: args,
        };
    }
    visitComparison(comparison) {
        return {
            [comparison.attribute]: {
                [this.formatFunction(comparison.comparator)]: (0, structured_query_1.castValue)(comparison.value),
            },
        };
    }
    visitStructuredQuery(query) {
        let nextArg = {};
        if (query.filter) {
            nextArg = {
                filter: query.filter.accept(this),
            };
        }
        return nextArg;
    }
    mergeFilters(defaultFilter, generatedFilter, mergeType = "and", forceDefaultFilter = false) {
        if ((0, structured_query_1.isFilterEmpty)(defaultFilter) && (0, structured_query_1.isFilterEmpty)(generatedFilter)) {
            return undefined;
        }
        if ((0, structured_query_1.isFilterEmpty)(defaultFilter) || mergeType === "replace") {
            if ((0, structured_query_1.isFilterEmpty)(generatedFilter)) {
                return undefined;
            }
            return generatedFilter;
        }
        if ((0, structured_query_1.isFilterEmpty)(generatedFilter)) {
            if (forceDefaultFilter) {
                return defaultFilter;
            }
            if (mergeType === "and") {
                return undefined;
            }
            return defaultFilter;
        }
        if (mergeType === "and") {
            return {
                $and: [defaultFilter, generatedFilter],
            };
        }
        else if (mergeType === "or") {
            return {
                $or: [defaultFilter, generatedFilter],
            };
        }
        else {
            throw new Error("Unknown merge type");
        }
    }
}
exports.ChromaTranslator = ChromaTranslator;
