
import {IOptions as IRedisOptions} from "@appolo/redis";

export interface IOptions  {
    id?: string
    connection?: string;
    keyPrefix?: string;
    maxBuckets?: number
    minBucketInterval?: number
    redisOptions?: IRedisOptions
}






