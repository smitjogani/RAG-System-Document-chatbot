"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTParser = exports.NodeHandler = void 0;
const parser_grammar_js_1 = require("./grammar/parser_grammar.cjs");
/**
 * Abstract class for handling nodes in an expression language. Subclasses
 * must implement the `accepts` and `handle` methods.
 */
class NodeHandler {
    constructor(parentHandler) {
        Object.defineProperty(this, "parentHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parentHandler
        });
    }
}
exports.NodeHandler = NodeHandler;
/**
 * Utility class for parsing Abstract Syntax Trees (ASTs). Contains
 * methods for identifying the type of a given node and a method for
 * importing and generating a parser using the Peggy library.
 */
class ASTParser {
    /**
     * Imports and generates a parser using the Peggy library.
     * @returns A Promise that resolves to the parser instance.
     */
    static async importASTParser() {
        try {
            if (!ASTParser.astParseInstance) {
                const { default: peggy } = await Promise.resolve().then(() => __importStar(require("peggy")));
                const parser = peggy.generate(parser_grammar_js_1.GRAMMAR);
                const { parse } = parser;
                ASTParser.astParseInstance = parse;
            }
            return ASTParser.astParseInstance;
        }
        catch (e) {
            throw new Error(`Failed to import peggy. Please install peggy (i.e. "npm install peggy" or "yarn add peggy").`);
        }
    }
    /**
     * Checks if the given node is a Program node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a Program node.
     */
    static isProgram(node) {
        return node.type === "Program";
    }
    /**
     * Checks if the given node is an ExpressionStatement node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is an ExpressionStatement node.
     */
    static isExpressionStatement(node) {
        return node.type === "ExpressionStatement";
    }
    /**
     * Checks if the given node is a CallExpression node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a CallExpression node.
     */
    static isCallExpression(node) {
        return node.type === "CallExpression";
    }
    /**
     * Checks if the given node is a StringLiteral node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a StringLiteral node.
     */
    static isStringLiteral(node) {
        return node.type === "StringLiteral" && typeof node.value === "string";
    }
    /**
     * Checks if the given node is a NumericLiteral node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a NumericLiteral node.
     */
    static isNumericLiteral(node) {
        return node.type === "NumericLiteral" && typeof node.value === "number";
    }
    /**
     * Checks if the given node is a BooleanLiteral node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a BooleanLiteral node.
     */
    static isBooleanLiteral(node) {
        return node.type === "BooleanLiteral" && typeof node.value === "boolean";
    }
    /**
     * Checks if the given node is an Identifier node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is an Identifier node.
     */
    static isIdentifier(node) {
        return node.type === "Identifier";
    }
    /**
     * Checks if the given node is an ObjectExpression node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is an ObjectExpression node.
     */
    static isObjectExpression(node) {
        return node.type === "ObjectExpression";
    }
    /**
     * Checks if the given node is an ArrayExpression node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is an ArrayExpression node.
     */
    static isArrayExpression(node) {
        return node.type === "ArrayExpression";
    }
    /**
     * Checks if the given node is a PropertyAssignment node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a PropertyAssignment node.
     */
    static isPropertyAssignment(node) {
        return node.type === "PropertyAssignment";
    }
    /**
     * Checks if the given node is a MemberExpression node.
     * @param node The node to be checked.
     * @returns A boolean indicating whether the node is a MemberExpression node.
     */
    static isMemberExpression(node) {
        return node.type === "MemberExpression";
    }
}
exports.ASTParser = ASTParser;
