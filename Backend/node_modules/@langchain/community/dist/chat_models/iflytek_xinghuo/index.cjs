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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatIflytekXinghuo = void 0;
const ws_1 = __importDefault(require("ws"));
const common_js_1 = require("./common.cjs");
const iflytek_websocket_stream_js_1 = require("../../utils/iflytek_websocket_stream.cjs");
class WebSocketStream extends iflytek_websocket_stream_js_1.BaseWebSocketStream {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    openWebSocket(url, options) {
        return new ws_1.default(url, options.protocols ?? []);
    }
}
/**
 * @example
 * ```typescript
 * const model = new ChatIflytekXinghuo();
 * const response = await model.invoke([new HumanMessage("Nice to meet you!")]);
 * console.log(response);
 * ```
 */
class ChatIflytekXinghuo extends common_js_1.BaseChatIflytekXinghuo {
    async openWebSocketStream(options) {
        const host = "spark-api.xf-yun.com";
        const date = new Date().toUTCString();
        const url = `GET /${this.version}/chat HTTP/1.1`;
        const { createHmac } = await Promise.resolve().then(() => __importStar(require("node:crypto")));
        const hash = createHmac("sha256", this.iflytekApiSecret)
            .update(`host: ${host}\ndate: ${date}\n${url}`)
            .digest("base64");
        const authorization_origin = `api_key="${this.iflytekApiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${hash}"`;
        const authorization = Buffer.from(authorization_origin).toString("base64");
        let authWebSocketUrl = this.apiUrl;
        authWebSocketUrl += `?authorization=${authorization}`;
        authWebSocketUrl += `&host=${encodeURIComponent(host)}`;
        authWebSocketUrl += `&date=${encodeURIComponent(date)}`;
        return new WebSocketStream(authWebSocketUrl, options);
    }
}
exports.ChatIflytekXinghuo = ChatIflytekXinghuo;
