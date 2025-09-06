import { Tool } from "@langchain/core/tools";
/**
 * The Calculator class is a tool used to evaluate mathematical
 * expressions. It extends the base Tool class.
 * @example
 * ```typescript
 * import { Calculator } from "@langchain/community/tools/calculator";
 *
 * const calculator = new Calculator();
 * const sum = await calculator.invoke("99 + 99");
 * console.log("The sum of 99 and 99 is:", sum);
 * // The sum of 99 and 99 is: 198
 * ```
 */
export declare class Calculator extends Tool {
    static lc_name(): string;
    get lc_namespace(): string[];
    name: string;
    /** @ignore */
    _call(input: string): Promise<string>;
    description: string;
}
