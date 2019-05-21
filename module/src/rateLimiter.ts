import {define, inject, injectFactoryMethod, singleton} from "appolo";
import {IFrequency, IFrequencies, IOptions, IResult, IResults, ILimits} from "./IOptions";
import {RedisProvider} from "@appolo/redis";
import * as Q from "bluebird";
import * as _ from "lodash";
import {Util} from "./util";

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
    limits: ILimits,
    check: boolean,
    limit: boolean
}


@define()
@singleton()
export class RateLimiter {

    @inject() private moduleOptions: IOptions;
    @inject() private redisProvider: RedisProvider;

    public async frequencyCap(limits: IFrequencies) {

        return this._run({limits, check: false, limit: false})
    }

    public async frequencyCheck(limits: IFrequencies) {

        return this._run({limits, check: true, limit: false})
    }

    public async limitCap(limits: ILimits) {

        return this._run({limits, check: false, limit: true})
    }

    public async limitCheck(limits: ILimits) {

        return this._run({limits, check: true, limit: true})
    }

    private async _run(opts: IRunParams): Promise<IResults> {

        let key = `${this.moduleOptions.keyPrefix}:${opts.limit ? "lmt" : "frq"}:{${opts.limits.key}}`;

        let params = this._prepareSlidingWindowParams(opts);

        let results = await this.redisProvider.runScript<number[][]>("slidingWindow", [key], [JSON.stringify(params)], false);

        let dto = this._prepareResults(params, results);

        return dto;
    }

    private _prepareSlidingWindowParams(opts: IRunParams): ISlidingWindowParams[] {

        let dto: ISlidingWindowParams[] = [];

        for (let i = 0, len = opts.limits.limits.length; i < len; i++) {

            let item = opts.limits.limits[i];

            let [bucketSize, spread] = this._calcBacketSizeAndSpread(item);

            dto.push({
                window: bucketSize,
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
                current: item[0],
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


    private _calcBacketSizeAndSpread(limit: IFrequency): [number, number] {
        let rateLimit: number = 0;

        let bucketSize = Math.floor(limit.interval / 60);

        if (limit.spread) {

            bucketSize = Math.max(bucketSize, Math.floor(limit.interval / limit.limit));

            rateLimit = typeof limit.spread == "boolean" ? Util.toFixed((limit.limit / limit.interval) * bucketSize, 2) : limit.spread;
        }

        return [bucketSize, rateLimit]
    }

    public async clear(key: string) {
        await this.redisProvider.delPattern(`${this.moduleOptions.keyPrefix}*{${key}}*`)
    }

}
