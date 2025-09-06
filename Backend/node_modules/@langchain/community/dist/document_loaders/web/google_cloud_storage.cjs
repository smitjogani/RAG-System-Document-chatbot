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
exports.GoogleCloudStorageLoader = void 0;
const storage_1 = require("@google-cloud/storage");
const os = __importStar(require("node:os"));
const path = __importStar(require("node:path"));
const fsDefault = __importStar(require("node:fs"));
const base_1 = require("@langchain/core/document_loaders/base");
const unstructured_js_1 = require("../fs/unstructured.cjs");
/**
 * A class that extends the BaseDocumentLoader class. It represents a
 * document loader for loading files from a google cloud storage bucket.
 * @example
 * ```typescript
 * const loader = new GoogleCloudStorageLoader({
 *   bucket: "<my-bucket-name>",
 *   file: "<file-path>",
 *   storageOptions: {
 *     keyFilename: "<key-file-name-path>"
 *   }
 *   unstructuredConfig: {
 *     apiUrl: "<unstructured-API-URL>",
 *     apiKey: "<unstructured-API-key>"
 *   }
 * });
 * const docs = await loader.load();
 * ```
 */
class GoogleCloudStorageLoader extends base_1.BaseDocumentLoader {
    constructor({ fs = fsDefault, file, bucket, unstructuredLoaderOptions, storageOptions, }) {
        super();
        Object.defineProperty(this, "bucket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "file", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "storageOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_fs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "unstructuredLoaderOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._fs = fs;
        this.bucket = bucket;
        this.file = file;
        this.unstructuredLoaderOptions = unstructuredLoaderOptions;
        this.storageOptions = storageOptions;
    }
    async load() {
        const tempDir = this._fs.mkdtempSync(path.join(os.tmpdir(), "googlecloudstoragefileloader-"));
        const filePath = path.join(tempDir, this.file);
        try {
            const storage = new storage_1.Storage(this.storageOptions);
            const bucket = storage.bucket(this.bucket);
            const [buffer] = await bucket.file(this.file).download();
            this._fs.mkdirSync(path.dirname(filePath), { recursive: true });
            this._fs.writeFileSync(filePath, buffer);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            throw new Error(`Failed to download file ${this.file} from google cloud storage bucket ${this.bucket}: ${e.message}`);
        }
        try {
            const unstructuredLoader = new unstructured_js_1.UnstructuredLoader(filePath, this.unstructuredLoaderOptions);
            const docs = await unstructuredLoader.load();
            return docs;
        }
        catch {
            throw new Error(`Failed to load file ${filePath} using unstructured loader.`);
        }
    }
}
exports.GoogleCloudStorageLoader = GoogleCloudStorageLoader;
