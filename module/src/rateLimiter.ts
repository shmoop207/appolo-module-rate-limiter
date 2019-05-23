import {define, inject, injectFactoryMethod, singleton} from "appolo";
import {IFrequency, IFrequencies, IOptions, IResult, IResults, ILimits, ILimit} from "./IOptions";
import {RedisProvider} from "@appolo/redis";
import * as Q from "bluebird";
import * as _ from "lodash";
import {Util} from "./util";
import {WindowCalculator} from "./windowCalculator";

interface ISlidingWindowParams {
    window: number,
    interval: number,
    limit: number,
    reserve: number,
    rateLimit: string,
    check: boolean
    maxWindow?: number
}

interface IRunParams {
    limits: ILimit[],
    key: string,
    check: boolean,
    limit: boolean
}


@define()
@singleton()
export class RateLimiter {

    @inject() private moduleOptions: IOptions;
    @inject() private redisProvider: RedisProvider;
    @inject() private windowCalculator: WindowCalculator;

    public get frequency() {
        return {
            reserve: (key: string, limits: IFrequency[]) => this._run({key, limits, check: false, limit: false}),
            check: (key: string, limits: IFrequency[]) => this._run({key, limits, check: true, limit: false})
        }
    }

    public get limit() {
        return {
            reserve: (key: string, limits: IFrequency[]) => this._run({key, limits, check: false, limit: true}),
            check: (key: string, limits: IFrequency[]) => this._run({key, limits, check: true, limit: true})
        }
    }

    private async _run(opts: IRunParams): Promise<IResults> {

        let key = `${this.moduleOptions.keyPrefix}:${opts.limit ? "lmt" : "frq"}:{${opts.key}}`;

        let params = this._prepareSlidingWindowParams(opts);

        let results = await this.redisProvider.runScript<number[][]>("slidingWindow", [key], [JSON.stringify(params)], false);

        let dto = this._prepareResults(params, results);

        return dto;
    }

    private _prepareSlidingWindowParams(opts: IRunParams): ISlidingWindowParams[] {

        let dto: ISlidingWindowParams[] = [];

        for (let i = 0, len = opts.limits.length; i < len; i++) {

            let item = opts.limits[i];

            let {bucket, spread} = this._calcBucketIntervalAndSpread(item);

            dto.push({
                window: bucket,
                interval: item.interval,
                limit: item.limit,
                reserve: item.reserve || 1,
                rateLimit: spread.toString(),
                check: opts.check,
                maxWindow: opts.limit ? (item.start || Date.now() + item.interval) : 0
            });
        }

        return dto;
    }

    private _prepareResults(params: ISlidingWindowParams[], results: (any)[][]): IResults {

        let isValid: boolean = true;

        let dto: IResult[] = [];

        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];

            dto.push({
                count: item[0],
                bucket: param.window,
                remaining: param.limit - (item[0]),
                limit: param.limit,
                rateLimit: parseFloat(param.rateLimit),
                rate: parseFloat(item[1]),
                isValid: !!item[2],
                reset: item[3],
                retry: item[4]
            });

            if (!item[2]) {
                isValid = false
            }
        }

        return {
            results: dto,
            isValid
        };
    }

    private _calcBucketIntervalAndSpread(frequency: IFrequency): { bucket: number, spread: number } {

        let {interval, limit, spread, bucket} = frequency;

        bucket = this.windowCalculator.calcBucketInterval({interval, limit, spread, bucket});

        spread = this.windowCalculator.calcRateLimit({interval, limit, spread, bucket});

        return {bucket, spread}
    }

    public async clear(key: string) {
        await this.redisProvider.delPattern(`${this.moduleOptions.keyPrefix}*{${key}}*`)
    }

}
