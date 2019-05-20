import {define, inject, injectFactoryMethod, singleton} from "appolo";
import {ILimit, ILimits, IOptions, IResult, IResults} from "./IOptions";
import {RedisProvider} from "@appolo/redis";
import * as Q from "bluebird";
import * as _ from "lodash";
import {Util} from "./Util";

interface ISlidingWindowParams {
    window: number,
    interval: number,
    limit: number,
    reserve: number,
    spread: string,
    check: boolean
}

@define()
@singleton()
export class RateLimiter {

    @inject() private moduleOptions: IOptions;
    @inject() private redisProvider: RedisProvider;

    public async reserve(limits: ILimits) {


        let key = `${this.moduleOptions.keyPrefix}:{${limits.key}}`;

        let params = this._prepareSlidingWindowParams(limits);

        let results = await this.redisProvider.runScript<number[][]>("slidingWindow", [key], [JSON.stringify(params)], false);

        let dto = this._prepareResults(params, results);

        return dto;
    }

    public async check(limits: ILimit[]) {


    }

    private _prepareResults(params: ISlidingWindowParams[], results: (number | string)[][]): IResults {

        let isValid: boolean = true;

        let dto: IResult[] = [];

        for (let i = 0, len = results.length; i < len; i++) {
            let item = results[i], param = params[i];

            dto.push({
                current: item[0] as number,
                remaining: param.limit - (item[0] as number),
                limit: param.limit,
                rate: (param.interval * parseFloat(item[1] as string)) / param.window,
                isValid: !!item[2],
                reset: item[3] as number,
                retry: item[4] as number
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

    private _prepareSlidingWindowParams(limits: ILimits, check: boolean = false): ISlidingWindowParams[] {
        let dto = _.map(limits.limits, item => {

            let [bucketSize, spread] = this._calcBacketSizeAndSpread(item);

            return {
                window: bucketSize,
                interval: item.interval,
                limit: item.limit,
                reserve: item.reserve || 1,
                spread:spread.toString(),
                check: check

            }
        });

        return dto;
    }

    private _calcBacketSizeAndSpread(limit: ILimit): [number, number] {
        let spread: number = 0;

        let bucketSize = Math.floor(limit.interval / 60);

        if (limit.spread) {

            bucketSize = Math.max(bucketSize, Math.floor(limit.interval / limit.limit));

            spread = limit.spread == "auto" ? Util.toFixed((limit.limit / limit.interval) * bucketSize, 2) : limit.spread
        }

        return [bucketSize, spread]
    }

}
