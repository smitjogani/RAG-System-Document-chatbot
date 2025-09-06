import { InStatement, InValue } from "@libsql/client";
export type WhereCondition<Metadata extends Record<string, any> = Record<string, any>> = {
    [Key in keyof Metadata]: {
        operator: "=" | ">" | "<" | ">=" | "<=" | "<>" | "LIKE";
        value: InValue;
    } | {
        operator: "IN";
        value: InValue[];
    };
};
type WhereInStatement = Exclude<InStatement, string>;
export declare class SqliteWhereBuilder {
    private conditions;
    constructor(conditions: WhereCondition);
    buildWhereClause(): WhereInStatement;
}
export {};
