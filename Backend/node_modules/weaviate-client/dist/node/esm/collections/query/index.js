var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toBase64FromMedia } from '../../utils/base64.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { WeaviateInvalidInputError } from '../../errors.js';
import { Check } from './check.js';
class QueryManager {
    constructor(check) {
        this.check = check;
    }
    static use(connection, name, dbVersionSupport, consistencyLevel, tenant) {
        return new QueryManager(new Check(connection, name, dbVersionSupport, consistencyLevel, tenant));
    }
    parseReply(reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserialize = yield Deserialize.use(this.check.dbVersionSupport);
            return deserialize.query(reply);
        });
    }
    parseGroupByReply(opts, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserialize = yield Deserialize.use(this.check.dbVersionSupport);
            return Serialize.search.isGroupBy(opts)
                ? deserialize.queryGroupBy(reply)
                : deserialize.query(reply);
        });
    }
    fetchObjectById(id, opts) {
        return this.check
            .fetchObjectById(opts)
            .then(({ search }) => search.withFetch(Serialize.search.fetchObjectById(Object.assign({ id }, opts))))
            .then((reply) => this.parseReply(reply))
            .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
    }
    fetchObjects(opts) {
        return this.check
            .fetchObjects(opts)
            .then(({ search }) => search.withFetch(Serialize.search.fetchObjects(opts)))
            .then((reply) => this.parseReply(reply));
    }
    bm25(query, opts) {
        return this.check
            .bm25(opts)
            .then(({ search }) => search.withBm25(Serialize.search.bm25(query, opts)))
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    hybrid(query, opts) {
        return this.check
            .hybridSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets, supportsVectorsForTargets, supportsVectors, }) => __awaiter(this, void 0, void 0, function* () {
            return ({
                search,
                args: yield Serialize.search.hybrid({
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
            return toBase64FromMedia(image).then((image) => ({
                search,
                args: Serialize.search.nearImage({
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
                    send = (media) => search.withNearAudio(Serialize.search.nearAudio(Object.assign({ audio: media }, args), opts));
                    break;
                case 'depth':
                    send = (media) => search.withNearDepth(Serialize.search.nearDepth(Object.assign({ depth: media }, args), opts));
                    break;
                case 'image':
                    send = (media) => search.withNearImage(Serialize.search.nearImage(Object.assign({ image: media }, args), opts));
                    break;
                case 'imu':
                    send = (media) => search.withNearIMU(Serialize.search.nearIMU(Object.assign({ imu: media }, args), opts));
                    break;
                case 'thermal':
                    send = (media) => search.withNearThermal(Serialize.search.nearThermal(Object.assign({ thermal: media }, args), opts));
                    break;
                case 'video':
                    send = (media) => search.withNearVideo(Serialize.search.nearVideo(Object.assign({ video: media }, args)));
                    break;
                default:
                    throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
            }
            return toBase64FromMedia(media).then(send);
        })
            .then((reply) => this.parseGroupByReply(opts, reply));
    }
    nearObject(id, opts) {
        return this.check
            .nearSearch(opts)
            .then(({ search, supportsTargets, supportsWeightsForTargets }) => ({
            search,
            args: Serialize.search.nearObject({
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
            args: Serialize.search.nearText({
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
                args: yield Serialize.search.nearVector({
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
export default QueryManager.use;
export { queryFactory } from './factories.js';
export { Bm25Operator } from './utils.js';
