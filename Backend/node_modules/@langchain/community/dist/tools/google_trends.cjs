"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERPGoogleTrendsTool = void 0;
const env_1 = require("@langchain/core/utils/env");
const tools_1 = require("@langchain/core/tools");
/**
 * Tool that queries the Google Trends API. Uses default interest over time.
 */
class SERPGoogleTrendsTool extends tools_1.Tool {
    static lc_name() {
        return "SERPGoogleTrendsTool";
    }
    get lc_secrets() {
        return {
            apiKey: "SERPAPI_API_KEY",
        };
    }
    constructor(fields) {
        super(...arguments);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "google_trends"
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `A wrapper around Google Trends API. Useful for analyzing and retrieving trending search data based on keywords, 
    categories, or regions. Input should be a search query or specific parameters for trends analysis.`
        });
        const apiKey = fields?.apiKey ?? (0, env_1.getEnvironmentVariable)("SERPAPI_API_KEY");
        if (apiKey === undefined) {
            throw new Error(`Google Trends API key not set. You can set it as "SERPAPI_API_KEY" in your environment variables.`);
        }
        this.apiKey = apiKey;
    }
    async _call(query) {
        /**
         * Related queries only accepts one at a time, and multiple
         * queries at once on interest over time (default) is effectively the same as
         * each query one by one.
         *
         * SerpApi caches queries, so the first time will be slower
         * and subsequent identical queries will be very fast.
         */
        if (query.split(",").length > 1) {
            throw new Error("Please do one query at a time");
        }
        const serpapiApiKey = this.apiKey;
        const params = new URLSearchParams({
            engine: "google_trends",
            api_key: serpapiApiKey,
            q: query,
        });
        const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) {
            throw new Error(`Error fetching data from SerpAPI: ${res.statusText}`);
        }
        const clientDict = await res.json();
        const totalResults = clientDict.interest_over_time?.timeline_data ?? [];
        if (totalResults.length === 0) {
            return "No good Trend Result was found";
        }
        const startDate = totalResults[0].date.split(" ");
        const endDate = totalResults[totalResults.length - 1].date.split(" ");
        const values = totalResults.map((result) => result.values[0].extracted_value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
        const percentageChange = ((values[values.length - 1] - values[0]) / (values[0] || 1)) * 100;
        const relatedParams = new URLSearchParams({
            engine: "google_trends",
            api_key: serpapiApiKey,
            data_type: "RELATED_QUERIES",
            q: query,
        });
        const relatedRes = await fetch(`https://serpapi.com/search.json?${relatedParams.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        let rising = [];
        let top = [];
        if (!relatedRes.ok) {
            // Sometimes related queries from SerpAPI will fail, but interest over time will be fine
            console.error(`Error fetching related queries from SerpAPI: ${relatedRes.statusText}`);
        }
        else {
            const relatedDict = await relatedRes.json();
            rising =
                relatedDict.related_queries?.rising?.map((result) => result.query) ?? [];
            top =
                relatedDict.related_queries?.top?.map((result) => result.query) ?? [];
        }
        const doc = [
            `Query: ${query}`,
            `Date From: ${startDate[0]} ${startDate[1]}, ${startDate[2]}`,
            `Date To: ${endDate[0]} ${endDate[1]} ${endDate[2]}`,
            `Min Value: ${minValue}`,
            `Max Value: ${maxValue}`,
            `Average Value: ${avgValue}`,
            `Percent Change: ${percentageChange.toFixed(2)}%`,
            `Trend values: ${values.join(", ")}`,
            `Rising Related Queries: ${rising.join(", ")}`,
            `Top Related Queries: ${top.join(", ")}`,
        ];
        return doc.join("\n\n");
    }
}
exports.SERPGoogleTrendsTool = SERPGoogleTrendsTool;
