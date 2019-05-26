import {IModuleOptions} from 'appolo/index';

export interface IOptions extends IModuleOptions {
    id?: string
    connection?: string;
    keyPrefix?: string;
    maxBuckets?: number
    minBucketInterval?: number
}






