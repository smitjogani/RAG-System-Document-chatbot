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
exports.Bm25Operator = exports.queryFactory = void 0;
const base64_js_1 = require("../../utils/base64.js");
const index_js_1 = require("../deserialize/index.js");
const index_js_2 = require("../serialize/index.js");
const errors_js_1 = require("../../errors.js");
const check_js_1 = require("./check.js");
class QueryManager {
    constructor(check) {
        this.check = check;
    }
    static use(connection, name, dbVersionSupport, consistencyLevel, tenant) {
        return new QueryManager(new check_js_1.Check(connection, name, dbVersionSupport, consistencyLevel, tenant));
    }
    parseReply(reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserialize = yield index_js_1.Deserialize.use(this.check.dbVersionSupport);
            return deserialize.query(reply);
        });
    }
    parseGroupByReply(opts, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserialize = yield index_js_1.Deserialize.use(this.check.dbVersionSupport);
            return index_js_2.Serialize.search.isGroupBy(opts)
                ? deserialize.queryGroupBy(reply)
                : deserialize.query(reply);
        });
    }
    fetchObjectById(id, opts) {
        return this.check
            .fetchObjectById(opts)
            .then(({ search }) => search.withFetch(index_js_2.Serialize.search.fetchObjectById(Object.assign({ id }, opts))))
            .then((reply) => this.parseReply(reply))
            .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
    }
    fetchObjects(opts) {
        return this.check
            .fetchObjects(opts)
            .then(({ search }) => search.withFetch(index_js_2.Serialize.search.fetchObjects(opts)))
            .then((reply) => this.parseReply(reply));
    }
    bm25(query, opts) {
        return this.check
            .bm25(opts)
            .then(({ search }) => search.withBm25(index_js_2.Serialize.search.bm25(query, opts)))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    hybrid(query, opts) {
        return this.check
            .hybridSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets, supportsVectorsForTargets, supportsVectors, }) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: yield index_js_2.Serialize.search.hybrid({
                    query,
                    supportsTargets,
                    supportsWeightsForTargets,
                    supportsVectorsForTargets,
                    supportsVectors,
                }, opts),
            });
        }))
            .then(({ search, args }) => search.withHybrid(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearImage(image, opts) {
        return this.check
            .nearSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
            return (0, base64_js_1.toBase64FromMedia)(image).then((image) => ({
                search,
                args: index_js_2.Serialize.search.nearImage({
                    image,
                    supportsTargets,
                    supportsWeightsForTargets,
                }, opts),
            }));
        })
            .then(({ search, args }) => search.withNearImage(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearMedia(media, type, opts) {
        return this.check
            .nearSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
            const args = {
                supportsTargets,
                supportsWeightsForTargets,
            };
            let send;
            switch (type) {
                case 'audio':
                    send = (media) => search.withNearAudio(index_js_2.Serialize.search.nearAudio(Object.assign({ audio: media }, args), opts));
                    break;
                case 'depth':
                    send = (media) => search.withNearDepth(index_js_2.Serialize.search.nearDepth(Object.assign({ depth: media }, args), opts));
                    break;
                case 'image':
                    send = (media) => search.withNearImage(index_js_2.Serialize.search.nearImage(Object.assign({ image: media }, args), opts));
                    break;
                case 'imu':
                    send = (media) => search.withNearIMU(index_js_2.Serialize.search.nearIMU(Object.assign({ imu: media }, args), opts));
                    break;
                case 'thermal':
                    send = (media) => search.withNearThermal(index_js_2.Serialize.search.nearThermal(Object.assign({ thermal: media }, args), opts));
                    break;
                case 'video':
                    send = (media) => search.withNearVideo(index_js_2.Serialize.search.nearVideo(Object.assign({ video: media }, args)));
                    break;
                default:
                    throw new errors_js_1.WeaviateInvalidInputError(`Invalid media type: ${type}`);
            }
            return (0, base64_js_1.toBase64FromMedia)(media).then(send);
        })
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearObject(id, opts) {
        return this.check
            .nearSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
            search,
            args: index_js_2.Serialize.search.nearObject({
                id,
                supportsTargets,
                supportsWeightsForTargets,
            }, opts),
        }))
            .then(({ search, args }) => search.withNearObject(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearText(query, opts) {
        return this.check
            .nearSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
            search,
            args: index_js_2.Serialize.search.nearText({
                query,
                supportsTargets,
                supportsWeightsForTargets,
            }, opts),
        }))
            .then(({ search, args }) => search.withNearText(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearVector(vector, opts) {
        return this.check
            .nearVector(vector, opts)
            .then(({ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets, supportsVectors, }) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: yield index_js_2.Serialize.search.nearVector({
                    vector,
                    supportsTargets,
                    supportsVectorsForTargets,
                    supportsWeightsForTargets,
                    supportsVectors,
                }, opts),
            });
        }))
            .then(({ search, args }) => search.withNearVector(args))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
}
exports.default = QueryManager.use;
var factories_js_1 = require("./factories.js");
Object.defineProperty(exports, "queryFactory", { enumerable: true, get: function () { return factories_js_1.queryFactory; } });
var utils_js_1 = require("./utils.js");
Object.defineProperty(exports, "Bm25Operator", { enumerable: true, get: function () { return utils_js_1.Bm25Operator; } });
