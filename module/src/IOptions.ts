import {IModuleOptions} from 'appolo';
import Timer = NodeJS.Timer;

export interface IOptions extends IModuleOptions {
    id?: string
    connection?: string;
    keyPrefix?: string;
    maxBuckets?: number
    minBucketInterval?: number
}

export interface ILimit extends IFrequency {
    start?: number
}

export interface ILimits {
    key: string,
    limits: ILimit[]
}

export interface IFrequency {

    limit: number
    interval: number
    spread?: number | boolean
    bucket?: number
    reserve?: number

}

export interface IFrequencies {
    key: string,
    limits: IFrequency[]
}

export interface IResult {
    count: number,
    bucket: number,
    remaining: number,
    limit: number,
    rate: number,
    rateLimit: number,
    isValid: boolean,
    reset: number,
    retry: number
}

export interface IResults {
    isValid: boolean,
    results: IResult[]
}
