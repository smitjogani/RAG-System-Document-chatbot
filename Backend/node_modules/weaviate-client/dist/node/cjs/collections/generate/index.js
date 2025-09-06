"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generativeParameters = void 0;
const errors_js_1 = require("../../errors.js");
const index_js_1 = require("../../index.js");
const index_js_2 = require("../deserialize/index.js");
const check_js_1 = require("../query/check.js");
const index_js_3 = require("../serialize/index.js");
class GenerateManager {
    constructor(check) {
        this.check = check;
    }
    static use(connection, name, dbVersionSupport, consistencyLevel, tenant) {
        return new GenerateManager(new check_js_1.Check(connection, name, dbVersionSupport, consistencyLevel, tenant));
    }
    parseReply(reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserialize = yield index_js_2.Deserialize.use(this.check.dbVersionSupport);
            return deserialize.generate(reply);
        });
    }
    parseGroupByReply(opts, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserialize = yield index_js_2.Deserialize.use(this.check.dbVersionSupport);
            return index_js_3.Serialize.search.isGroupBy(opts)
                ? deserialize.generateGroupBy(reply)
                : deserialize.generate(reply);
        });
    }
    fetchObjects(generate, opts) {
        return Promise.all([
            this.check.fetchObjects(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search }, supportsSingleGrouped]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, index_js_3.Serialize.search.fetchObjects(opts)), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withFetch(args))
            .then((reply) => this.parseReply(reply));
    }
    bm25(query, generate, opts) {
        return Promise.all([
            this.check.bm25(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search }, supportsSingleGrouped]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, index_js_3.Serialize.search.bm25(query, opts)), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withBm25(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    hybrid(query, generate, opts) {
        return Promise.all([
            this.check.hybridSearch(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets, supportsVectors }, supportsSingleGrouped,]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, (yield index_js_3.Serialize.search.hybrid({
                    query,
                    supportsTargets,
                    supportsVectorsForTargets,
                    supportsWeightsForTargets,
                    supportsVectors,
                }, opts))), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withHybrid(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearImage(image, generate, opts) {
        return Promise.all([
            this.check.nearSearch(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, index_js_3.Serialize.search.nearImage({
                    image: yield (0, index_js_1.toBase64FromMedia)(image),
                    supportsTargets,
                    supportsWeightsForTargets,
                }, opts)), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withNearImage(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearObject(id, generate, opts) {
        return Promise.all([
            this.check.nearSearch(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, index_js_3.Serialize.search.nearObject({
                    id,
                    supportsTargets,
                    supportsWeightsForTargets,
                }, opts)), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withNearObject(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearText(query, generate, opts) {
        return Promise.all([
            this.check.nearSearch(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, index_js_3.Serialize.search.nearText({
                    query,
                    supportsTargets,
                    supportsWeightsForTargets,
                }, opts)), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withNearText(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearVector(vector, generate, opts) {
        return Promise.all([
            this.check.nearVector(vector, opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets, supportsVectors }, supportsSingleGrouped,]) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: Object.assign(Object.assign({}, (yield index_js_3.Serialize.search.nearVector({
                    vector,
                    supportsTargets,
                    supportsVectorsForTargets,
                    supportsWeightsForTargets,
                    supportsVectors,
                }, opts))), { generative: yield index_js_3.Serialize.generative({ supportsSingleGrouped }, generate) }),
            });
        }))
            .then(({ search, args }) => search.withNearVector(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearMedia(media, type, generate, opts) {
        return Promise.all([
            this.check.nearSearch(opts),
            this.check.supportForSingleGroupedGenerative(),
            this.check.supportForGenerativeConfigRuntime(generate.config),
        ])
            .then(([{ search, supportsTargets, supportsWeightsForTargets }, supportsSingleGrouped]) => {
            const args = {
                supportsTargets,
                supportsWeightsForTargets,
            };
            let send;
            switch (type) {
                case 'audio':
                    send = (media, generative) => search.withNearAudio(Object.assign(Object.assign({}, index_js_3.Serialize.search.nearAudio(Object.assign({ audio: media }, args), opts)), { generative }));
                    break;
                case 'depth':
                    send = (media, generative) => search.withNearDepth(Object.assign(Object.assign({}, index_js_3.Serialize.search.nearDepth(Object.assign({ depth: media }, args), opts)), { generative }));
                    break;
                case 'image':
                    send = (media, generative) => search.withNearImage(Object.assign(Object.assign({}, index_js_3.Serialize.search.nearImage(Object.assign({ image: media }, args), opts)), { generative }));
                    break;
                case 'imu':
                    send = (media, generative) => search.withNearIMU(Object.assign(Object.assign({}, index_js_3.Serialize.search.nearIMU(Object.assign({ imu: media }, args), opts)), { generative }));
                    break;
                case 'thermal':
                    send = (media, generative) => search.withNearThermal(Object.assign(Object.assign({}, index_js_3.Serialize.search.nearThermal(Object.assign({ thermal: media }, args), opts)), { generative }));
                    break;
                case 'video':
                    send = (media, generative) => search.withNearVideo(Object.assign(Object.assign({}, index_js_3.Serialize.search.nearVideo(Object.assign({ video: media }, args))), { generative }));
                    break;
                default:
                    throw new errors_js_1.WeaviateInvalidInputError(`Invalid media type: ${type}`);
            }
            return Promise.all([
                (0, index_js_1.toBase64FromMedia)(media),
                index_js_3.Serialize.generative({ supportsSingleGrouped }, generate),
            ]).then(([media, generative]) => send(media, generative));
        })
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
}
exports.default = GenerateManager.use;
var config_js_1 = require("./config.js");
Object.defineProperty(exports, "generativeParameters", { enumerable: true, get: function () { return config_js_1.generativeParameters; } });
