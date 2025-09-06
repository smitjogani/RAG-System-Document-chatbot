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
exports.AWSLambda = void 0;
const dynamic_js_1 = require("./dynamic.cjs");
/**
 * Class for invoking AWS Lambda functions within the LangChain framework.
 * Extends the DynamicTool class.
 */
class AWSLambda extends dynamic_js_1.DynamicTool {
    get lc_namespace() {
        return [...super.lc_namespace, "aws_lambda"];
    }
    get lc_secrets() {
        return {
            accessKeyId: "AWS_ACCESS_KEY_ID",
            secretAccessKey: "AWS_SECRET_ACCESS_KEY",
        };
    }
    constructor({ name, description, ...rest }) {
        super({
            name,
            description,
            func: async (input) => this._func(input),
        });
        Object.defineProperty(this, "lambdaConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.lambdaConfig = rest;
    }
    /** @ignore */
    async _func(input) {
        const { Client, Invoker } = await LambdaImports();
        const clientConstructorArgs = {};
        if (this.lambdaConfig.region) {
            clientConstructorArgs.region = this.lambdaConfig.region;
        }
        if (this.lambdaConfig.accessKeyId && this.lambdaConfig.secretAccessKey) {
            clientConstructorArgs.credentials = {
                accessKeyId: this.lambdaConfig.accessKeyId,
                secretAccessKey: this.lambdaConfig.secretAccessKey,
            };
        }
        const lambdaClient = new Client(clientConstructorArgs);
        return new Promise((resolve) => {
            const payloadUint8Array = new TextEncoder().encode(JSON.stringify(input));
            const command = new Invoker({
                FunctionName: this.lambdaConfig.functionName,
                InvocationType: "RequestResponse",
                Payload: payloadUint8Array,
            });
            lambdaClient
                .send(command)
                .then((response) => {
                const responseData = JSON.parse(new TextDecoder().decode(response.Payload));
                resolve(responseData.body ? responseData.body : "request completed.");
            })
                .catch((error) => {
                console.error("Error invoking Lambda function:", error);
                resolve("failed to complete request");
            });
        });
    }
}
exports.AWSLambda = AWSLambda;
/**
 * Helper function that imports the necessary AWS SDK modules for invoking
 * the Lambda function. Returns an object that includes the LambdaClient
 * and InvokeCommand classes from the AWS SDK.
 */
async function LambdaImports() {
    try {
        const { LambdaClient, InvokeCommand } = await Promise.resolve().then(() => __importStar(require("@aws-sdk/client-lambda")));
        return {
            Client: LambdaClient,
            Invoker: InvokeCommand,
        };
    }
    catch (e) {
        console.error(e);
        throw new Error("Failed to load @aws-sdk/client-lambda'. Please install it eg. `yarn add @aws-sdk/client-lambda`.");
    }
}
