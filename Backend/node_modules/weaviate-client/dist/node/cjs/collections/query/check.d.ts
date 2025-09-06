import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { GenerativeConfigRuntime } from '../index.js';
import { BaseBm25Options, BaseHybridOptions, BaseNearOptions, FetchObjectByIdOptions, FetchObjectsOptions, NearVectorInputType } from './types.js';
export declare class Check<T, V> {
    private connection;
    private name;
    dbVersionSupport: DbVersionSupport;
    private consistencyLevel?;
    private tenant?;
    constructor(connection: Connection, name: string, dbVersionSupport: DbVersionSupport, consistencyLevel?: ConsistencyLevel, tenant?: string);
    private getSearcher;
    private checkSupportForNamedVectors;
    private checkSupportForBm25AndHybridGroupByQueries;
    private checkSupportForHybridNearTextAndNearVectorSubSearches;
    private checkSupportForMultiTargetSearch;
    private checkSupportForMultiVectorSearch;
    private checkSupportForMultiWeightPerTargetSearch;
    private checkSupportForMultiVectorPerTargetSearch;
    private checkSupportForVectors;
    supportForSingleGroupedGenerative: () => Promise<true>;
    supportForGenerativeConfigRuntime: (generativeConfig?: GenerativeConfigRuntime) => Promise<true>;
    nearSearch: (opts?: BaseNearOptions<any, any, any>) => Promise<{
        search: import("../../grpc/searcher.js").Search;
        supportsTargets: boolean;
        supportsWeightsForTargets: boolean;
    }>;
    nearVector: (vec: NearVectorInputType, opts?: BaseNearOptions<any, any, any>) => Promise<{
        search: import("../../grpc/searcher.js").Search;
        supportsTargets: boolean;
        supportsVectorsForTargets: boolean;
        supportsWeightsForTargets: boolean;
        supportsVectors: boolean;
    }>;
    hybridSearch: (opts?: BaseHybridOptions<any, any, any>) => Promise<{
        search: import("../../grpc/searcher.js").Search;
        supportsTargets: boolean;
        supportsWeightsForTargets: boolean;
        supportsVectorsForTargets: boolean;
        supportsVectors: boolean;
    }>;
    fetchObjects: (opts?: FetchObjectsOptions<any, any>) => Promise<{
        search: import("../../grpc/searcher.js").Search;
    }>;
    fetchObjectById: (opts?: FetchObjectByIdOptions<any, any>) => Promise<{
        search: import("../../grpc/searcher.js").Search;
    }>;
    bm25: (opts?: BaseBm25Options<any, any>) => Promise<{
        search: import("../../grpc/searcher.js").Search;
    }>;
}
